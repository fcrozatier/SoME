import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { normalizeYoutubeLink, phaseOpen, registrationOpen, YOUTUBE_EMBEDDABLE } from '$lib/utils';
import { driver } from '$lib/server/neo4j';
import { Neo4jError } from 'neo4j-driver';
import { RegistrationSchema, validateForm } from '$lib/server/validation';
import { addToMailingList, sendEmail, validateEmail } from '$lib/server/email';
import { dev } from '$app/environment';
import { saveThumbnail } from '$lib/server/s3';
import { PUBLIC_REGISTRATION_START, PUBLIC_VOTE_END } from '$env/static/public';

export const load: PageServerLoad = () => {
	if (!phaseOpen(PUBLIC_REGISTRATION_START, PUBLIC_VOTE_END)) {
		throw error(403, 'The registration phase is not open');
	}
};

export const actions: Actions = {
	default: async ({ request }) => {
		if (!phaseOpen(PUBLIC_REGISTRATION_START, PUBLIC_VOTE_END)) {
			return fail(422, { invalid: true });
		}

		try {
			const validation = await validateForm(request, RegistrationSchema);

			if (!validation.success) {
				return fail(400, validation.error.flatten());
			}

			const users = [{ email: validation.data.email, token: crypto.randomUUID() }];
			if (validation.data.userType === 'creator') {
				const others = validation.data.others;
				others.forEach((x) => users.push({ email: x, token: crypto.randomUUID() }));
			}

			// Email deliverability validation
			if (!dev) {
				const emailValidation = await Promise.all(
					[...users].map(async ({ email }) => await validateEmail(email))
				);
				if (emailValidation.some((x) => x === null)) {
					return fail(400, { invalid: true });
				}
				const undeliverable = emailValidation.find((x) => x?.result !== 'deliverable');
				if (undeliverable) {
					return fail(400, { undeliverable: undeliverable.address });
				}
			}

			// Save data
			const session = driver.session();

			try {
				if (validation.data.userType === 'creator') {
					if (!registrationOpen()) {
						return fail(422, { invalid: true });
					}

					const { thumbnail, link, ...restData } = validation.data;
					const thumbnailKey = Buffer.from(link).toString('base64') + '.webp';
					console.log('thumbnailKey:', thumbnailKey);

					if (!YOUTUBE_EMBEDDABLE.test(link)) {
						if (!thumbnail) {
							return fail(400, { thumbnailRequired: true });
						}
						console.time('thumbnail');
						await saveThumbnail(thumbnail, thumbnailKey);
						console.timeEnd('thumbnail');
					}

					// Normalize youtube links
					let normalizedLink = link;
					if (YOUTUBE_EMBEDDABLE.test(link)) {
						normalizedLink = normalizeYoutubeLink(link);
					}

					const params = {
						users,
						link: normalizedLink,
						...restData,
						group: users.length > 1,
						thumbnailKey
					};

					let update = false;
					const oldEntry = await session.executeWrite((tx) => {
						return tx.run(
							`
							MATCH (n:Entry)
							WHERE n.link = $params.link
							RETURN count(n) = 1 as update
					`,
							{ params }
						);
					});

					if (oldEntry?.records?.length) {
						if (oldEntry.records[0].get('update')) {
							update = true;
						}
					}

					if (update) {
						await session.executeWrite((tx) => {
							return tx.run(
								`
							MATCH (n:Entry)
							WHERE n.link = $params.link
							SET n.category = $params.category
							SET n.title = $params.title
							SET n.description = $params.description
							SET n.thumbnail = $params.thumbnailKey
							RETURN n
					`,
								{ params }
							);
						});

						return { update: true };
					} else {
						await session.executeWrite((tx) => {
							return tx.run(
								`
							MATCH (n:Entry)
							WHERE n.category = $params.category
							WITH count(n) as number
							CREATE (entry:Entry {title: $params.title, description: $params.description, category: $params.category, link: $params.link, group: $params.group, thumbnail: $params.thumbnailKey})
							SET entry.number = number
							WITH *
							UNWIND $params.users AS creator
							MERGE (:User:Creator {email: creator.email, token: creator.token})-[:CREATED]->(entry)
					`,
								{ params }
							);
						});
					}
				} else {
					await session.executeWrite((tx) => {
						return tx.run(
							`
							UNWIND $users AS judge
							CREATE (:User:Judge {email: judge.email, token: judge.token})
					`,
							{
								users
							}
						);
					});
				}

				if (!dev) {
					try {
						for (const user of users) {
							await addToMailingList(user.email, user.token);
							await sendEmail(user.email, 'registration', { token: user.token });
						}
					} catch (e) {
						console.error('Cannot send email', e);
					}
				}
				return {
					success: true,
					user: users.length === 1 ? users[0] : { email: '', token: '' }
				};
			} catch (error) {
				if (
					error instanceof Neo4jError &&
					error.code === 'Neo.ClientError.Schema.ConstraintValidationFailed'
				) {
					console.log(error.message);

					if (error.message.includes('email')) {
						const [firstQuote, lastQuote] = [...error.message.matchAll(/'/g)].map(
							(x) => x.index as number
						);
						const duplicateEmail = error.message.slice(firstQuote + 1, lastQuote);
						return fail(422, { emailExists: duplicateEmail });
					} else if (error.message.includes('link')) {
						return fail(422, { linkExists: true });
					}
				}
				console.log(error);
				return fail(500, { network: true });
			} finally {
				await session.close();
			}
		} catch (error) {
			console.log(error);
			return fail(500, { network: true });
		}
	}
};
