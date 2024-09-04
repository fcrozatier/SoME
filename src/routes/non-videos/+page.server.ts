import { redirect } from '@sveltejs/kit';

export const load = async () => {
	console.log('REDIRECTING non-videos -> archive');
	redirect(301, '/archive');
};
