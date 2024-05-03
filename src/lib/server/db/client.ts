import * as schema from './schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import { DATABASE_URL } from '$env/static/private';
import postgres from 'postgres';

const queryClient = postgres(DATABASE_URL, { max: 22 });
export const db = drizzle(queryClient, { schema });
