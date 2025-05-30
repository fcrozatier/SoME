import * as auth from "$lib/server/auth.js";
import { client } from "$lib/server/db";
import { type Handle, redirect } from "@sveltejs/kit";

process.on("sveltekit:shutdown", (reason) => {
	console.log("\nclosing db connections, reason", reason);
	client.end();
});

// I'm a teapot
const tea = /(\.php$|\.env|\.xml$|\.git|wordpress|wp-admin|credentials)/;

export const handle = async function ({ event, resolve }) {
	if (tea.test(event.request.url)) {
		return new Response(null, { status: 418 });
	}

	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event.cookies, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	if (event.url.pathname.includes("/user/") && !event.locals.user) {
		return redirect(302, "/login");
	}

	if (event.url.pathname.includes("/admin/") && !event.locals.user?.isAdmin) {
		return redirect(302, "/admin");
	}

	return await resolve(event);
} satisfies Handle;
