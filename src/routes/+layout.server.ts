export const load = ({ locals }) => {
	return { token: locals.token, isAdmin: locals.isAdmin };
};
