import { compare } from 'bcrypt';
import { ADMIN_PASSWORD } from '$env/static/private';
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const adminPassword = cookies.get('password');

	if (adminPassword) {
		const isAdmin = await compare(ADMIN_PASSWORD, adminPassword);
		return { isAdmin };
	}

	throw redirect(302, '/login');
};
