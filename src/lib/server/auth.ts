import {
	hash as argon2Hash,
	type Options,
	verify as argon2Verify,
} from "@node-rs/argon2";
import type { Cookies, RequestEvent } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const ARGON2_OPTIONS: Options = {
	memoryCost: 19456,
	timeCost: 2,
	outputLen: 32,
	parallelism: 1,
};

export const hash = (password: string | Uint8Array) =>
	argon2Hash(password, ARGON2_OPTIONS);

export const verify = (
	hashed: string | Uint8Array,
	password: string | Uint8Array,
) => argon2Verify(hashed, password, ARGON2_OPTIONS);

const sha256 = async (input: string) => {
	const data = new TextEncoder().encode(input);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hash = Array.from(new Uint8Array(hashBuffer))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return hash;
};

export const sessionCookieName = "auth-session";

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(20));
	const token = Buffer.from(bytes).toString("base64");
	return token;
}

export async function createSession(token: string, userUid: string) {
	const sessionId = await sha256(token);
	const session: table.Session = {
		id: sessionId,
		userUid,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30),
	};
	await db.insert(table.sessions).values(session);
	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = await sha256(token);
	const [result] = await db
		.select({
			// Adjust user table here to tweak returned data
			user: {
				uid: table.users.uid,
				username: table.users.username,
				isAdmin: table.users.isAdmin,
			},
			session: table.sessions,
		})
		.from(table.sessions)
		.innerJoin(table.users, eq(table.sessions.userUid, table.users.uid))
		.where(eq(table.sessions.id, sessionId));

	if (!result) {
		return { session: null, user: null };
	}
	const { session, user } = result;

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		await db.delete(table.sessions).where(eq(table.sessions.id, session.id));
		return { session: null, user: null };
	}

	const renewSession =
		Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		await db
			.update(table.sessions)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.sessions.id, session.id));
	}

	return { session, user };
}

export type SessionValidationResult = Awaited<
	ReturnType<typeof validateSessionToken>
>;

export async function invalidateSession(sessionId: string) {
	await db.delete(table.sessions).where(eq(table.sessions.id, sessionId));
}

export function setSessionTokenCookie(
	cookies: Cookies,
	token: string,
	expiresAt: Date,
) {
	cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: "/",
		httpOnly: true,
		secure: true,
		sameSite: "lax",
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: "/",
	});
}
