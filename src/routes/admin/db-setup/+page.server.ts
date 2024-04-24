import type { PageServerLoad } from './$types';
import { driver } from '$lib/server/neo4j';
import { categories } from '$lib/config';

export const load: PageServerLoad = async () => {
	const session = driver.session();
	try {
		// Unique constraint
		await session.executeWrite((tx) => {
			return tx.run(`
				CREATE CONSTRAINT UserEmailUnique
				IF NOT EXISTS
				FOR (user:User)
				REQUIRE user.email IS UNIQUE;
      `);
		});

		await session.executeWrite((tx) => {
			return tx.run(`
				CREATE CONSTRAINT EntryLinkUnique
				IF NOT EXISTS
				FOR (entry:Entry)
				REQUIRE entry.link IS UNIQUE;
      `);
		});

		// Indexes
		await session.executeWrite((tx) => {
			return tx.run(`
				CREATE INDEX UserTokenIndex
				IF NOT EXISTS
				FOR (user:User)
				ON user.token;
      `);
		});

		await session.executeWrite((tx) => {
			return tx.run(`
				CREATE INDEX EntryNumberIndex
				IF NOT EXISTS
				FOR (entry:Entry)
				ON entry.number;
      `);
		});

		await session.executeWrite((tx) => {
			return tx.run(`
				CREATE INDEX FeedbackIndex
				IF NOT EXISTS
				FOR (f:Feedback)
				ON f.token;
      `);
		});
		// TODO use Sequence to avoid counting entries (Category node with value)
		// Sequences
		for (const category of categories) {
			await session.executeWrite((tx) => {
				return tx.run(
					`
					MERGE (s:Step {category:$category})
					ON CREATE
						SET s.value = 1
				`,
					{
						category
					}
				);
			});
		}

		// Background job: periodically (hourly) remove stale assigned comparisons (more than 24h old)
		await session.executeWrite((tx) => {
			return tx.run(`
				CALL apoc.periodic.repeat(
				"remove-stale-assignments",
					"MATCH (n1:Entry)-[r:ASSIGNED]->(n2:Entry) WHERE r.timestamp < timestamp() - 1000 * 60 * 60 * 24 DELETE r MERGE (n1)-[:NOT_ASSIGNED]->(n2)",
					60 * 60
				);
      `);
		});

		return { success: true };
	} catch (error) {
		console.log(error);
		return { success: false };
	} finally {
		await session.close();
	}
};
