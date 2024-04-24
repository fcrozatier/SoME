import { driver } from '$lib/server/neo4j';
import { error, fail } from '@sveltejs/kit';
import { CategorySchema } from '$lib/server/validation';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { isAdmin } = await parent();
	if (!isAdmin) {
		throw error(401, 'Not authorized');
	}
};

export const actions: Actions = {
	rank: async ({ request }) => {
		const formData = await request.formData();
		const category = formData.get('category');
		const validation = CategorySchema.safeParse(category);

		if (!validation.success) {
			console.log('err', validation.error.flatten());
			return fail(400);
		}

		const session = driver.session();

		try {
			// Verify this category contains nodes before projecting
			const nodes = await session.executeRead((tx) => {
				return tx.run(
					`
					MATCH (n:Entry) WHERE n.category = $category RETURN n LIMIT 1
        `,
					{
						category: validation.data
					}
				);
			});

			if (!nodes.records.length) {
				return fail(400, { noNodes: true });
			}

			// Checks whether the subgraph projection already exists
			const projection = await session.executeRead((tx) => {
				return tx.run(`
          CALL gds.graph.exists('network-${validation.data}')
					YIELD graphName, exists
					RETURN exists
        `);
			});

			if (!projection.records[0].get('exists')) {
				// Saves the subgraph of Entries and Votes as 'network' for the PageRank
				await session.executeWrite((tx) => {
					return tx.run(
						`
						CALL gds.graph.project.cypher(
							'network-${validation.data}',
							'MATCH (n:Entry) WHERE n.category = $category RETURN id(n) AS id',
							'MATCH (n1:Entry)-[:LOSES_TO]->(n2:Entry) WHERE n1.category = $category AND n2.category = $category RETURN id(n1) AS source, id(n2) AS target',
							{
								parameters: { category: $category }
							}
						)
					`,
						{ category: validation.data }
					);
				});
			}

			// Performs the PageRank
			const res = await session.executeWrite((tx) => {
				return tx.run(`
          CALL gds.pageRank.stream('network-${validation.data}')
					YIELD nodeId, score
					WITH gds.util.asNode(nodeId) as node, score
					RETURN node.title AS title, node.link as link, score
					ORDER BY score DESC, title ASC
					LIMIT 100
        `);
			});

			const ranking = [];
			for (const row of res.records) {
				ranking.push({
					title: row.get('title') as string,
					link: row.get('link') as string,
					score: row.get('score') as number
				});
			}

			return { ranking };
		} finally {
			await session.close();
		}
	}
};
