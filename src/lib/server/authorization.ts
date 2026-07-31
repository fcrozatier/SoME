import { error, fail, redirect } from "@sveltejs/kit";
import { sql } from "drizzle-orm";
import { db } from "./db";

export function assertIsAdmin(
	locals: App.Locals,
): asserts locals is App.Locals & { user: { isAdmin: true } } {
	if (!locals.user?.isAdmin) return error(403);
}

export function assertIsLoggedIn(locals: App.Locals): asserts locals is App.Locals & { user: {} } {
	if (!locals.user) return redirect(303, "/login");
}

export async function assertIsCreator({
	userUid,
	entryUid,
}: {
	userUid: string;
	entryUid: string;
}) {
	const isCreator =
		(
			await db.execute(sql`
				select * from user_to_entry
				where user_uid=${userUid} and entry_uid=${entryUid};
			`)
		).count > 0;

	if (!isCreator) {
		return fail(422, { message: "You're not the creator of this entry" });
	}
}
