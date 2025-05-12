import { db } from "$lib/server/db/index.js";
import { users } from "$lib/server/db/schema.js";
import { redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const load = async ({ locals }) => {
  if (!locals.user) return redirect(302, "/login");

  const [user] = await db.select({
    email: users.email,
    isTeacher: users.isTeacher,
  }).from(users)
    .where(eq(users.uid, locals.user.uid));

  if (!user) return redirect(302, "/login");

  return {
    user: {
      username: locals.user.username,
      email: user.email,
      isTeacher: !!user.isTeacher,
    },
  };
};
