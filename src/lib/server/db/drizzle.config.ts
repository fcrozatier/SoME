import type { Config } from 'drizzle-kit';

export default {
	schema: './src/lib/server/db/schema.ts',
	out: 'drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL
	},
	migrations: {
		table: 'migrations',
		schema: 'public'
	},
	verbose: true,
	strict: true
} satisfies Config;
