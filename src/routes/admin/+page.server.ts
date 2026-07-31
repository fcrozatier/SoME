import { assertIsAdmin } from "$lib/authorizations";

export const load = ({ locals }) => assertIsAdmin(locals);
