import { assertIsAdmin } from "$lib/authorization";

export const load = ({ locals }) => assertIsAdmin(locals);
