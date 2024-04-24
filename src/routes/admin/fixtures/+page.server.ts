import type { PageServerLoad } from './$types';
import { driver } from '$lib/server/neo4j';
import { makeCreators } from '$lib/server/fixtures';
import { dev } from '$app/environment';

export const load: PageServerLoad = async () => {
	if (!dev) return;

	const session = driver.session();
	const N = 5; // Number of fixtures in each category
	const creatorsData = makeCreators(N);

	try {
		await session.executeWrite((tx) => {
			return tx.run(
				`
					UNWIND $creatorsData as data
					WITH data
					CREATE (u:User:Creator {email: data.email})-[:CREATED]->(e:Entry {title: data.title, description: data.description, category: data.category, link: data.link, number: toInteger(data.number)})
					SET u.token = randomUUID()
				`,
				{
					creatorsData
				}
			);
		});

		return { success: true };
	} catch (error) {
		console.log("couldn't add fixtures", error);
		return { success: false };
	} finally {
		await session.close();
	}
};
