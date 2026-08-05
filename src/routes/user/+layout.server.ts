import { assertIsLoggedIn } from "$lib/server/authorization.js";

export const load = ({ locals }) => assertIsLoggedIn(locals);
