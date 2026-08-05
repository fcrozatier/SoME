import { CURRENT_YEAR, ENTRY_STATE } from "$lib/constants.js";
import { assertIsAdmin } from "$lib/server/authorization.js";
import { db } from "$lib/server/db";
import { type SelectEntry, type SelectFlag, type SelectStrike } from "$lib/server/db/schema";
import { AdminForm, UpdateFlagReason } from "$lib/validation";
import type { Prettify } from "@fcrozatier/ts-helpers";
import { sql } from "drizzle-orm";
import * as fg from "formgator/sveltekit";

export const load = async ({ locals }) => {
	assertIsAdmin(locals);

	const deletedEntries: Prettify<
		Pick<SelectEntry, "uid" | "title" | "url"> & {
			/**
			 * When was the entry created
			 */
			created_at: SelectEntry["createdAt"];
			/**
			 * When was the entry last updated
			 */
			updated_at: SelectEntry["updatedAt"];
			/**
			 * When was the entry deleted
			 */
			deleted_at: SelectEntry["deletedAt"];
		}
	>[] = await db.execute(sql`
				select uid, title, url, created_at, updated_at, deleted_at
				from entries
				where date_part('year', entries.created_at)=${CURRENT_YEAR}
				and deleted_at is not null;
		`);

	const uids = deletedEntries.map((entry) => entry.uid);

	const strikes: Prettify<
		Pick<SelectStrike, "reason" | "note" | "state"> & {
			entry_uid: string;
			/**
			 * When was the strike created
			 */
			created_at: SelectStrike["createdAt"];
		}
	>[] = await db.execute(sql`
				select entry_uid, reason, note, state, created_at
				from strikes
				where entry_uid in ${uids};
		`);

	const flags: Prettify<Pick<SelectFlag, "reason"> & { entry_uid: string }>[] =
		await db.execute(sql`
			select entry_uid, reason
			from flags
			where entry_uid in ${uids};
		`);

	const withStrikes = Object.groupBy(strikes, ({ entry_uid }) => entry_uid);
	const withFlags = Object.groupBy(flags, ({ entry_uid }) => entry_uid);

	return { inactiveEntries: deletedEntries, withFlags, withStrikes };
};

export const actions = {
	reactivate: fg.formgate(AdminForm, async (data, { locals }) => {
		assertIsAdmin(locals);

		await db.execute(sql`
			update entries set active='true' where uid in ${data.selected};
		`);

		return { flag: true };
	}),
	update_reason: fg.formgate(UpdateFlagReason, async (data, { locals }) => {
		assertIsAdmin(locals);

		await db.execute(sql`
			update flags set reason=${data.reason} where (user_uid, entry_uid)=(${data.user_uid}, ${data.entry_uid});
		`);

		return { flag: true };
	}),
};
