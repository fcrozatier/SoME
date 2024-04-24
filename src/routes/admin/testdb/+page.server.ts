import { driver } from '$lib/server/neo4j';
import { Neo4jError } from 'neo4j-driver';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const { agent, protocolVersion } = await driver.getServerInfo();
		return { info: { agent, protocolVersion } };
	} catch (error) {
		if (error instanceof Neo4jError) {
			return { error: true };
		}
	}
};
