import { DATABASE_URL } from '$env/static/private';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const client = postgres(DATABASE_URL, { max: 22 });
export const db = drizzle(client, { schema });
