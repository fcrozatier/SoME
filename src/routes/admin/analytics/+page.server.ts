import { driver } from '$lib/server/neo4j';
import { error, fail } from '@sveltejs/kit';
import { categories } from '$lib/config';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import type { Integer } from 'neo4j-driver';
import { EdgesSchema } from '$lib/server/validation';

export const load: PageServerLoad = async ({ parent }) => {
	const { isAdmin } = await parent();
	if (!isAdmin) {
		throw error(401, 'Not authorized');
	}

	const session = driver.session();

	try {
		const data = await session.executeRead((tx) => {
			return tx.run<{ what: string; total: Integer }>(
				`
				MATCH (j:Judge)
				RETURN "judges" as what, count(j) as total
				UNION ALL
				MATCH (n:Graph)
				RETURN "graph" as what, count(n) as total
				UNION ALL
				UNWIND $categories as category
				MATCH (m:Entry)
				WHERE m.category = category
				RETURN category as what, count(m) as total
			`,
				{
					categories
				}
			);
		});

		const analytics = new Map();
		for (const row of data.records) {
			analytics.set(row.get('what'), row.get('total').toNumber());
		}

		return { analytics };
	} finally {
		await session.close();
	}
};

export const actions: Actions = {
	pairing: async ({ request }) => {
		const data = await request.formData();

		const edges = data.get('edges');
		if (!edges || typeof edges !== 'string') {
			return fail(400);
		}

		const validation = EdgesSchema.safeParse(JSON.parse(edges));
		if (!validation.success) {
			return fail(400, validation.error.flatten());
		}

		const session = driver.session();

		try {
			// Only add edges if comparison graph has not already been made
			await session.executeWrite((tx) => {
				return tx.run(
					`
					MATCH (g:Graph)
					WITH count(g) = 0 as condition

					CALL apoc.do.when(condition, '
						UNWIND $data as graph
						WITH graph.category as category, graph.edges as edges
						UNWIND edges as edge
						MATCH (n:Entry), (m:Entry)
						WHERE n.category = category
						AND m.category = category
						AND n.number = edge[0]
						AND m.number = edge[1]
						AND n.number < m.number
						MERGE (n)-[:NOT_ASSIGNED]->(m)
					', '', {data: $data}) YIELD value

					RETURN value
		    `,
					{
						data: validation.data
					}
				);
			});
			await session.executeWrite((tx) => {
				return tx.run(
					`
					MERGE (n:Graph)
		    `,
					{
						data: validation.data
					}
				);
			});

			return { success: true };
		} catch (e) {
			console.error(e);
			return fail(400);
		} finally {
			await session.close();
		}
	}
};
