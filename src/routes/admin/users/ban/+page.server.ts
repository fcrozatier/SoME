import { ENTRY_STATE, SKIP_STATE, VOTE_STATE } from "$lib/constants.js";
import { assertIsAdmin } from "$lib/server/authorization";
import { db } from "$lib/server/db";
import { bans } from "$lib/server/db/schema.js";
import { sendGenericTemplateEmail } from "$lib/server/email.js";
import { AdminNewBanSchema } from "$lib/validation";
import { sql } from "drizzle-orm";
import { formfail, formgate } from "formgator/sveltekit";

export const actions = {
	default: formgate(AdminNewBanSchema, async (data, { locals }) => {
		assertIsAdmin(locals);

		// Retrieve user
		const [user]: { uid: string; email: string }[] = await db.execute(sql`
      select uid, email from users where username=${data.username};
      `);

		if (!user) {
			return formfail({ username: "Not found" });
		}

		const userUid = user.uid;

		// Create ban
		await db.insert(bans).values({
			userUid,
			...data,
			expiresAt: data.expiresAt ?? "infinity",
		});

		// Delete auth session
		await db.execute(sql`delete from sessions where user_uid=${userUid};`);

		const isPermanent = !data.expiresAt;

		if (isPermanent) {
			// Deactivate entries
			await db.execute(sql`
        update entries set state=${ENTRY_STATE.Inactive}
        where uid in (
          select entry_uid from user_to_entry
          where user_uid=${userUid};
        );
      `);

			// Deactivate votes
			await db.execute(sql`
        update votes set state=${VOTE_STATE.Inactive}
        where user_uid=${userUid};
      `);

			// Deactivate skips
			await db.execute(sql`
        update skips set state=${SKIP_STATE.Inactive}
        where user_uid=${userUid};
      `);
		}

		// Notify
		await sendGenericTemplateEmail({
			to: user.email,
			data: {
				subject: "Account Suspended",
				body: data.message,
			},
		});

		return { success: true };
	}),
};
