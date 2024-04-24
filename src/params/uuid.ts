import type { ParamMatcher } from '@sveltejs/kit';
import { z } from 'zod';

export const match = ((param) => {
	return z.string().uuid().safeParse(param).success;
}) satisfies ParamMatcher;
