import { DATABASE_URL } from "$env/static/private";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { PostgresErrorCode } from "./postgres_errors";
import * as schema from "./schema";

export const client = postgres(DATABASE_URL, { max: 22 });
export const db = drizzle(client, { schema });

export function isPostgresError(error: unknown, code: PostgresErrorCode, constraintName?: string) {
	return (
		error instanceof postgres.PostgresError &&
		error.code === code &&
		error.constraint_name === constraintName
	);
}

export const DB_CONTRAINTS = {
	EntriesURLUnique: "entries_url_unique",
	UsersEmailUnique: "users_email_unique",
};
