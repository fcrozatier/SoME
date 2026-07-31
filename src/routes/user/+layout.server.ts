import { assertIsLoggedIn } from "$lib/authorization.js";

export const load = ({ locals }) => assertIsLoggedIn(locals);
