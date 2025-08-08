import * as auth from "$lib/server/auth.js";
import { client } from "$lib/server/db";
import { type Handle, redirect } from "@sveltejs/kit";

process.on("sveltekit:shutdown", (reason) => {
	console.log("\nclosing db connections, reason", reason);
	client.end();
});

// I'm a teapot
const tea = /(\.php$|\.env|\.xml$|\.git|wordpress|wp-content|wp-admin|credentials|config)/;

export const handle = async function ({ event, resolve }) {
	if (tea.test(event.request.url)) {
		return new Response(null, { status: 418 });
	}

	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	} else {
		const { session, user } = await auth.validateSessionToken(sessionToken);

		if (session) {
			auth.setSessionTokenCookie(event.cookies, sessionToken, session.expiresAt);
		} else {
			auth.deleteSessionTokenCookie(event);
		}

		event.locals.user = user;
		event.locals.session = session;
	}

	return resolve(event);
} satisfies Handle;
