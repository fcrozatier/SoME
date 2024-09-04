import { redirect } from '@sveltejs/kit';

export const load = () => {
	console.log('REDIRECTING previous -> archive');
	return redirect(301, '/archive');
};
