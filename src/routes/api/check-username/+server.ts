import { db } from "$lib/server/db";
import { json, type RequestHandler } from "@sveltejs/kit";
import { sql } from "drizzle-orm";
import * as z from "zod";

const usernameSchema = z.object({
	username: z.string(),
});

export const POST: RequestHandler = async function ({ request }) {
	const data = await request.json();
	const validation = usernameSchema.safeParse(data);

	if (!validation.success) {
		return json(
			{
				valid: false,
				reason: "Invalid data",
			},
			{ status: 400 },
		);
	}

	const [user] = await db.execute(sql`
		select username from users
		where username=${validation.data.username};
	`);

	if (user) {
		return json({
			valid: true,
			status: "taken",
		});
	}

	return json({
		valid: true,
		status: "available",
	});
};
