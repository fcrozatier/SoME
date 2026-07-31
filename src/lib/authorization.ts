import { error } from "@sveltejs/kit";

export function assertIsAdmin(
	locals: App.Locals,
): asserts locals is App.Locals & { user: { isAdmin: true } } {
	if (!locals.user?.isAdmin) return error(403);
}
