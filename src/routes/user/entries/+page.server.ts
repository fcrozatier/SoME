import { db } from "$lib/server/db";
import type { SelectEntry } from "$lib/server/db/schema.js";
import { redirect } from "@sveltejs/kit";
import { sql } from "drizzle-orm";

export const load = async ({ locals }) => {
  if (!locals.user) return redirect(302, "/login");

  const userEntries: Pick<
    SelectEntry,
    | "uid"
    | "title"
    | "description"
    | "category"
    | "thumbnail"
    | "url"
    | "createdAt"
  >[] = await db.execute(sql`
      select uid, title, description, category, thumbnail, url, created_at from entries
      inner join user_to_entry
      on entries.uid=user_to_entry.entry_uid
      where user_to_entry.user_uid=${locals.user.uid}
      order by entries.created_at desc
    `);

  return {
    // @ts-ignore add createdAt prop
    userEntries: userEntries.map((e) => ({ ...e, createdAt: e.created_at })),
  };
};
