import { error, redirect } from "@sveltejs/kit";

export function assertIsAdmin(
	locals: App.Locals,
): asserts locals is App.Locals & { user: { isAdmin: true } } {
	if (!locals.user?.isAdmin) return error(403);
}

export function assertIsLoggedIn(locals: App.Locals): asserts locals is App.Locals & { user: {} } {
	if (!locals.user) return redirect(303, "/login");
}
