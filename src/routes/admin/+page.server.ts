import { assertIsAdmin } from "$lib/server/authorization";

export const load = ({ locals }) => assertIsAdmin(locals);
