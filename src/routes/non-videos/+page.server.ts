import { redirect } from '@sveltejs/kit';

export const load = async () => {
	console.log('REDIRECTING non-videos -> archive');
	return redirect(301, '/archive?category=non-video&year=2023&page=1');
};
