import { categories, templateNames } from '$lib/config';
import { z } from 'zod';

const SHARP_IMAGE_INPUT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMG_SIZE = 10 ** 6; // 1MB

export const CategorySchema = z.enum(categories);

const EmailSchema = z.string().email().max(128);

export const EmailForm = z.object({
	email: EmailSchema,
});

export const TokenSchema = z.string().uuid();

const UrlSchema = z
	.string()
	.url({ message: 'Invalid url, please provide the full url with the https:// prefix' })
	.refine((str) => !str.includes('playlist'), { message: 'Playlists are not allowed' });

export const FlagForm = z.object({
	selection: z.string().transform((val, ctx) => {
		try {
			return z.array(z.string().uuid()).parse(JSON.parse(val));
		} catch {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
			});

			return z.NEVER;
		}
	}),
});

export const FeedbackForm = z.object({
	selection: z.string().transform((val, ctx) => {
		try {
			return z.array(TokenSchema).parse(JSON.parse(val));
		} catch {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
			});

			return z.NEVER;
		}
	}),
});

export const PasswordForm = z.object({
	email: z.string(),
	password: z.string(),
});

export const JWTPayloadSchema = z.object({
	isAdmin: z.boolean(),
});

const CheckboxSchema = z.literal('on', {
	errorMap: () => {
		return { message: 'Must be checked' };
	},
});

const JudgeSchema = z.object({
	userType: z.literal('judge'),
	email: EmailSchema,
	rules: CheckboxSchema,
});

const TitleSchema = z
	.string()
	.trim()
	.min(1, { message: 'Title cannot be empty' })
	.max(128, { message: 'Title too long' });

const DescriptionSchema = z
	.string()
	.trim()
	.min(10, { message: 'Description too short' })
	.max(5000, { message: 'Description too long' });

const ThumbnailSchema = z
	.instanceof(File)
	.refine((file) => file.size < MAX_IMG_SIZE, { message: 'Image too big: 1MB max' })
	.refine((file) => SHARP_IMAGE_INPUT_TYPES.includes(file.type), {
		message: 'Must be a jpeg, png, webp or gif image',
	})
	.optional();

export const CreatorSchema = z.object({
	userType: z.literal('creator'),
	email: EmailSchema,
	others: z.string().transform((val, ctx) => {
		try {
			return z.array(z.string().email()).parse(JSON.parse(val));
		} catch {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Invalid email',
			});

			return z.NEVER;
		}
	}),
	category: CategorySchema,
	title: TitleSchema,
	description: DescriptionSchema,
	link: UrlSchema,
	thumbnail: ThumbnailSchema,
	rules: CheckboxSchema,
	copyright: CheckboxSchema,
});

export const RegistrationSchema = z.discriminatedUnion('userType', [JudgeSchema, CreatorSchema]);

export const FeedbackSchema = z
	.string()
	.trim()
	.refine(
		(feedback) => {
			return feedback.length - (feedback.match(/\r\n/g) ?? []).length <= 5000;
		},
		{
			message: 'Feedback too long',
		},
	)
	.optional();

export const VoteSchema = z.object({
	score: z.coerce.number().gte(1).lte(9),
	feedback: FeedbackSchema,
	uid: z.string(),
	tag: z.string(),
});

export const SkipSchema = z.object({
	uid: z.string(),
	tag: z.string(),
});

export const FlagSchema = z.object({
	reason: z.string().min(1).max(100, { message: 'Reason too long' }),
	uid: z.string(),
	tag: z.string(),
});

export const EmailTemplateSchema = z.object({
	template_name: z.enum(templateNames),
});

/**
 * Generic schema validation function to be used in actions
 * @param request A request with formData
 * @param schema The schema to validate the form against. Must be a z.object
 * @returns typed validated data or throws
 */
export async function validateForm<T extends Record<string, unknown>, S>(
	request: Request,
	schema: S extends z.ZodType ? z.ZodType<T> : any,
) {
	const formData = await request.formData();
	const form = Object.fromEntries(formData);
	const validation = schema.safeParse(form);

	return validation;
}
