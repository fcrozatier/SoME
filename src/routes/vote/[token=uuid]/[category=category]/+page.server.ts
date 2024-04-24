import { driver, type Entry, type User, type UserProperties } from '$lib/server/neo4j';
import type { Integer } from 'neo4j-driver';
import { shuffleTuple, toNativeTypes, voteOpen } from '$lib/utils';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { FlagSchema, validateForm, VoteSchema } from '$lib/server/validation';
import { profanity } from '$lib/server/profanity';
import { PUBLIC_RATE_LIMIT, PUBLIC_VOTE_LIMIT } from '$env/static/public';
import { listFormatter } from '$lib/config';

interface AssignedEntries {
	n1: Entry;
	n2: Entry;
}

export const load: PageServerLoad = async (event) => {
	const { token } = event.params;
	if (!token) {
		throw redirect(302, `/vote/`);
	}
	if (!voteOpen()) {
		throw redirect(302, `/vote/${token}`);
	}
	const { category } = event.params;

	const session = driver.session();

	try {
		// Rate limit number of votes
		const votes = await session.executeRead((tx) => {
			return tx.run<{ votes: Integer; entries: Integer }>(
				`
				MATCH (n:Entry)
				WHERE n.category = $category
				WITH count(n) as entries
				MATCH (n1:Entry)-[r:LOSES_TO]->(n2:Entry)
				WHERE r.userToken = $token
				AND n1.category = $category
				AND n2.category = $category
				RETURN count(r) AS votes, entries
      `,
				{
					token,
					category
				}
			);
		});

		if (votes?.records[0]?.length) {
			const rate =
				votes.records[0].get('votes').toNumber() / votes.records[0].get('entries').toNumber();
			console.log('user vote rate', rate, parseFloat(PUBLIC_VOTE_LIMIT));
			if (rate >= parseFloat(PUBLIC_VOTE_LIMIT)) {
				console.log('stop vote');

				return { stopVote: true };
			}
		}

		// Find already assigned entries
		// in the current category (if any)
		const prev = await session.executeRead((tx) => {
			return tx.run<AssignedEntries>(
				`
				MATCH (n1:Entry)-[r:ASSIGNED]-(n2:Entry)
				WHERE r.userToken = $token AND n1.category = $category AND n2.category = $category
				RETURN n1, n2
				LIMIT 1
      `,
				{
					token,
					category
				}
			);
		});

		if (prev?.records[0]?.length) {
			const row = prev.records[0];
			console.log('show user previously assigned entries');
			// Return previously assigned entries
			return {
				entries: shuffleTuple([
					toNativeTypes(row.get('n1').properties),
					toNativeTypes(row.get('n2').properties)
				])
			};
		}

		// Otherwise try to assign new entries from :NOT_ASSIGNED ones
		// in the current category
		// not created by user
		// not flagged by user
		// not seen twice already
		const notAssigned = await session.executeWrite((tx) => {
			return tx.run<AssignedEntries>(
				`
				MATCH (u:User)
				WHERE u.token = $token
				OPTIONAL MATCH (u)-[:FLAG]->(n:Entry)
				WITH u, n
				MATCH (u1:Creator)-[:CREATED]->(n1:Entry)-[r:NOT_ASSIGNED]->(n2:Entry)<-[:CREATED]-(u2:Creator)
				WHERE n1.category = $category
				AND n2.category = $category
				AND NOT u1 = u
				AND NOT u2 = u
				AND (n IS NULL OR NOT n1 = n)
				AND (n IS NULL OR NOT n2 = n)
				CALL {
						WITH u, n1
						OPTIONAL MATCH p = (u)-[:KNOWS]->(n1)
						WITH count(p) AS knows1
						WHERE knows1 < 2
						RETURN knows1
				}
				CALL {
						WITH u, n2
						OPTIONAL MATCH p = (u)-[:KNOWS]->(n2)
						WITH count(p) AS knows2
						WHERE knows2 < 2
						RETURN knows2
				}
				WITH r, n1, n2
				LIMIT 1
				DELETE r
				CREATE (n1)-[:ASSIGNED {userToken: $token, timestamp: timestamp()}]->(n2)
        RETURN n1, n2
      `,
				{
					token,
					category
				}
			);
		});

		if (notAssigned?.records[0]?.length) {
			const row = notAssigned.records[0];
			console.log('show user a pair of not yet assigned entries');
			// Return new assigned entries
			return {
				entries: shuffleTuple([
					toNativeTypes(row.get('n1').properties),
					toNativeTypes(row.get('n2').properties)
				])
			};
		}

		const random = await session.executeWrite((tx) => {
			return tx.run<AssignedEntries>(
				`
				MATCH (u:User)
				WHERE u.token = $token
				WITH u
				MATCH (a:Entry)<-[:CREATED]-(c:User)
				WHERE a.category=$category
				AND not (u)-[:FLAG]->(a)
				AND NOT c = u
				AND a.flagged IS NULL
				WITH a, rand() as r
				ORDER BY r
				LIMIT 2
				WITH collect(a) as entries
				CALL {
					with entries
					with entries
					WITH entries[0] AS n1, entries[1] as n2
					where not n1 IS  NULL and not n2 is NULL
					CREATE (n1)-[:ASSIGNED {userToken: $token, timestamp: timestamp()}]->(n2)
					RETURN n1, n2
				}
        RETURN n1, n2
      `,
				{
					token,
					category
				}
			);
		});

		if (random?.records[0]?.length) {
			const row = random.records[0];
			console.log('show user random entries');
			// Return new assigned entries
			return {
				entries: shuffleTuple([
					toNativeTypes(row.get('n1').properties),
					toNativeTypes(row.get('n2').properties)
				])
			};
		} else {
			console.log("can't find a random pair for this user");
			return { stopVote: true };
		}

		// If we cannot find a pair of :NOT_ASSIGNED entries to compare, we are past the first round, and now duplicating votes to increase reliability.
		// Try to find entries with only :Step number of relations (:LOSES_TO+:ASSIGNED)
		// in the current category
		// not created by user
		// not flagged by user
		// not already seen by user
		const duplicate = await session.executeWrite((tx) => {
			return tx.run<AssignedEntries>(
				`
				MATCH (s:Step)
				WHERE s.category = $category
				WITH s.value AS step
				MATCH (u:User)
				WHERE u.token = $token
				OPTIONAL MATCH (u)-[:FLAG]->(n:Entry)
				WITH u, n, step
				MATCH (u1:Creator)-[:CREATED]->(n1:Entry)-[:LOSES_TO]-(n2:Entry)<-[:CREATED]-(u2:Creator)
				WHERE n1.category = $category
				AND n2.category = $category
				AND NOT u1 = u
				AND NOT u2 = u
				AND (n IS NULL OR NOT n1 = n)
				AND (n IS NULL OR NOT n2 = n)
				CALL {
						WITH u, n1
						OPTIONAL MATCH p = (u)-[:KNOWS]->(n1)
						WITH count(p) AS knows1
						WHERE knows1 < 2
						RETURN knows1
				}
				CALL {
						WITH u, n2
						OPTIONAL MATCH p = (u)-[:KNOWS]->(n2)
						WITH count(p) AS knows2
						WHERE knows2 < 2
						RETURN knows2
				}
				CALL {
					WITH step, u, n1, n2
					MATCH p = (n1)-[r:LOSES_TO|ASSIGNED]-(n2)
					WITH u, step, collect(r) as relations
					WHERE size(relations) <= step
					AND none(relation IN relations WHERE relation.userToken = u.token)
					RETURN relations
				}
				WITH n1, n2
				LIMIT 1
				CREATE (n1)-[:ASSIGNED {userToken: $token, timestamp: timestamp()}]->(n2)
        RETURN n1, n2
      `,
				{
					token,
					category
				}
			);
		});

		if (duplicate?.records[0]?.length) {
			const row = duplicate.records[0];
			console.log('show user entries that where already compared');
			// Return new assigned entries
			return {
				entries: shuffleTuple([
					toNativeTypes(row.get('n1').properties),
					toNativeTypes(row.get('n2').properties)
				])
			};
		}

		// If we cannot find an entry with s:Step number of relations then the graph is regular,
		// We can increase the step in the category and start again
		const step = await session.executeWrite((tx) => {
			return tx.run<{ step: Integer }>(
				`
				MATCH (s:Step)
				WHERE s.category = $category
				CALL apoc.atomic.add(s, 'value', 1)
				YIELD oldValue, newValue
				RETURN newValue as step
				`,
				{ category }
			);
		});

		// Avoid infinite loop
		if (step?.records?.[0]?.length && step.records[0].get('step').toInt() < 100) {
			console.log('\tINCREMENT step');
			return await load(event);
		} else {
			return { stopVote: true };
		}
	} catch (error) {
		console.log(error);
		throw error;
	} finally {
		await session.close();
	}
};

let id: 'FLAG' | 'VOTE';

export const actions: Actions = {
	flag: async ({ request, locals }) => {
		id = 'FLAG';

		const validation = await validateForm(request, FlagSchema);
		if (!validation.success) {
			console.log(validation.error.flatten());
			return fail(400, { id, flagFail: true });
		}

		const session = driver.session();

		try {
			// Flag entry and remove assignment
			await session.executeWrite((tx) => {
				return tx.run(
					`
				MATCH (u:User)
				WHERE u.token = $token
				WITH u
				MATCH (n1:Entry)-[r:ASSIGNED]-(n2:Entry)
				WHERE n1.link = $link AND r.userToken = $token
				DELETE r
				CREATE (u)-[:FLAG {reason: $reason}]->(n1)
			`,
					{
						link: validation.data.link,
						reason: validation.data.reason,
						token: locals.token
					}
				);
			});
			return { id, flagSuccess: true };
		} catch (error) {
			return fail(400, { id, flagFail: true });
		} finally {
			await session.close();
		}
	},
	vote: async ({ request, locals, params }) => {
		id = 'VOTE';
		const token = locals.token;
		const { category } = params;

		const validation = await validateForm(request, VoteSchema);

		if (!validation.success) {
			const fieldErrors = validation.error.flatten()['fieldErrors'];
			const feedbackErrors = new Set(
				[fieldErrors['feedback-0'], fieldErrors['feedback-1']].filter((x) => x !== undefined).flat()
			) as Set<string>;
			return fail(400, { id, voteFail: true, reason: listFormatter.format([...feedbackErrors]) });
		}

		const entryNumberA = validation.data['entry-0'];
		const entryNumberB = validation.data['entry-1'];
		const feedbackA = validation.data['feedback-0'];
		const feedbackB = validation.data['feedback-1'];
		const choice = validation.data['choice'];

		const session = driver.session();

		try {
			// Should the arrow go from A to B ?
			const AToB = choice === entryNumberB;
			const losingEntryNumber = AToB ? entryNumberA : entryNumberB;
			const winningEntryNumber = AToB ? entryNumberB : entryNumberA;
			const losingFeedback = AToB ? feedbackA : feedbackB;
			const winningFeedback = AToB ? feedbackB : feedbackA;

			// Find explicit language
			const losingExplicit = losingFeedback?.split(' ').some((w) => profanity.includes(w)) ?? false;
			const winningExplicit =
				winningFeedback?.split(' ').some((w) => profanity.includes(w)) ?? false;

			// Rate limit: as least PUBLIC_RATE_LIMIT minutes between two votes
			const user = await session.executeRead((tx) => {
				return tx.run<{ u: User }>(
					`
				MATCH (u:User)
				WHERE u.token = $token
				RETURN u
			`,
					{
						token
					}
				);
			});

			if (!user?.records?.length) {
				console.log('vote fail');
				return fail(400, { id, voteFail: true });
			} else {
				const row = user.records[0];
				const u = toNativeTypes(row.get('u').properties) as UserProperties;

				if (u.lastVote) {
					const now = Date.now();
					const lastVote = Date.parse(u.lastVote);

					if (now - lastVote < 1000 * 60 * parseInt(PUBLIC_RATE_LIMIT)) {
						console.log('rate limit fail');
						return fail(422, { id, rateLimitError: true });
					}
				}
			}

			// Make sure vote was assigned, take vote into account and remove assignment
			await session.executeWrite((tx) => {
				return tx.run(
					`
				MATCH (u:User)
				WHERE u.token = $token
				WITH u
				MATCH (e1:Entry)-[a:ASSIGNED]-(e2:Entry)
				WHERE e1.number = $losingEntryNumber AND e1.category = $category
				AND e2.number = $winningEntryNumber AND e2.category = $category
				AND a.userToken = $token
				DELETE a
				CREATE (u)-[:KNOWS]->(e1)-[r:LOSES_TO {userToken: $token, timestamp: timestamp()}]->(e2)<-[:KNOWS]-(u)
				WITH e1, e2

				CALL apoc.do.when($losingFeedback <> '', '
					CREATE (f1:Feedback)<-[:FEEDBACK]-(e)
					SET f1.value = value
					SET f1.explicit = explicit
					SET f1.token = apoc.create.uuid()
					RETURN f1
				', '', {value: $losingFeedback, explicit: $losingExplicit, e: e1 }) YIELD value

				CALL apoc.do.when($winningFeedback <> '', '
					CREATE (f2:Feedback)<-[:FEEDBACK]-(e)
					SET f2.value = $winningFeedback
					SET f2.explicit = $winningExplicit
					SET f2.token = apoc.create.uuid()
					RETURN f2
				', '', {winningFeedback: $winningFeedback, winningExplicit: $winningExplicit, e: e2 }) YIELD value AS value2

				WITH *
				MATCH (u:User)
				WHERE u.token = $token
				SET u.lastVote = datetime()
			`,
					{
						category,
						token,
						losingEntryNumber,
						winningEntryNumber,
						losingFeedback,
						winningFeedback,
						losingExplicit,
						winningExplicit
					}
				);
			});

			console.log('success');
			return { id, voteSuccess: true };
		} catch (error) {
			console.log(error);
			return fail(400, { id, voteFail: true });
		} finally {
			await session.close();
		}
	}
};
