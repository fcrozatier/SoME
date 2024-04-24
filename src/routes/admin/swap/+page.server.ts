import { fail, type Actions } from '@sveltejs/kit';
import { EmailForm, SwapSchema, validateForm } from '$lib/server/validation';
import { driver, type Entry } from '$lib/server/neo4j';
import { normalizeYoutubeLink, toNativeTypes, YOUTUBE_EMBEDDABLE } from '$lib/utils';
import { deleteThumbnail, saveThumbnail } from '$lib/server/s3';
import { voteOpen } from '$lib/utils';
import { Neo4jError } from 'neo4j-driver';

let ID: 'find' | 'swap';

export const actions = {
	find: async ({ request }) => {
		ID = 'find';
		const validation = await validateForm(request, EmailForm);

		if (!validation.success) {
			return fail(400, { ...validation.error.flatten() });
		}

		// Save data
		const session = driver.session();

		try {
			const entry = await session.executeRead((tx) => {
				return tx.run<{ e: Entry }>(
					`
					MATCH (n:Creator)-[:CREATED]->(e:Entry)
					WHERE n.email = $email
					RETURN e
					`,
					{ email: validation.data.email }
				);
			});

			if (entry?.records?.[0]?.length) {
				return { entry: toNativeTypes(entry.records[0].get('e').properties) };
			}
			return fail(400, { creatorNotFound: true });
		} catch (error) {
			console.log(error);
			return fail(500, { invalid: true });
		} finally {
			await session.close();
		}
	},

	swap: async ({ request }) => {
		ID = 'swap';
		const validation = await validateForm(request, SwapSchema);

		if (!validation.success) {
			const { fieldErrors: errors } = validation.error.flatten();
			return fail(400, { ID, errors });
		}

		// Save data
		const session = driver.session();

		try {
			const { thumbnail, link, ...restData } = validation.data;
			const thumbnailKey = Buffer.from(link).toString('base64') + '.webp';
			console.log('thumbnailKey:', thumbnailKey);

			// Normalize youtube links
			let normalizedLink = link;
			if (YOUTUBE_EMBEDDABLE.test(link)) {
				normalizedLink = normalizeYoutubeLink(link);
			}

			const params = {
				link: normalizedLink,
				...restData,
				thumbnailKey
			};

			if (!voteOpen()) {
				// Since the vote is note open
				// We can just edit the node
				await session.executeWrite((tx) => {
					return tx.run(
						`
					MATCH (u:Creator)-[:CREATED]->(n:Entry)
					WHERE u.email = $params.email
					SET n.title = $params.title,
						n.description = $params.description,
						n.category = $params.category,
						n.link = $params.link,
						n.thumbnail = $params.thumbnailKey
					`,
						{ params }
					);
				});
			} else {
				// Create temporary node because of uniqueness constraint
				// Remove feedbacks
				// Remove comparisons and rebind them on temporary node
				// Add other creators
				// Remove old entry
				// Turn temporary node into :Entry
				await session.executeWrite((tx) => {
					return tx.run(
						`
					MATCH (u:Creator)-[:CREATED]->(n:Entry)
					WHERE u.email = $params.email
					CREATE (t:Temp {number: n.number, title: $params.title, description: $params.description, category: $params.category, link: $params.link, thumbnail: $params.thumbnailKey})
					WITH n, t
					LIMIT 1
					OPTIONAL MATCH (f:Feedback)<-[:FEEDBACK]-(n)
					DETACH DELETE f
					WITH n, t
					LIMIT 1
					OPTIONAL MATCH (n)-[r:NOT_ASSIGNED|ASSIGNED|LOSES_TO]-(m:Entry)
					CREATE (t)-[:NOT_ASSIGNED]->(m)
					WITH n, t
					LIMIT 1
					MATCH (c:Creator)-[:CREATED]->(n)
					CREATE (c)-[:CREATED]->(t)
					WITH n, t
					LIMIT 1
					DETACH DELETE n
					SET t:Entry
					REMOVE t:Temp
					`,
						{ params }
					);
				});
			}

			if (thumbnail && thumbnail.size !== 0 && !YOUTUBE_EMBEDDABLE.test(link)) {
				const oldKey = Buffer.from(validation.data.oldLink).toString('base64') + '.webp';
				await deleteThumbnail(oldKey);
				await saveThumbnail(thumbnail, thumbnailKey);
			}
		} catch (error) {
			if (
				error instanceof Neo4jError &&
				error.code === 'Neo.ClientError.Schema.ConstraintValidationFailed'
			) {
				console.log(error.message);

				if (error.message.includes('EntryLinkUnique')) {
					return fail(422, { linkExists: true });
				}
			}
			console.log(error);
			return fail(500, { invalid: true, error_message: error.message });
		} finally {
			await session.close();
		}
	}
} satisfies Actions;
