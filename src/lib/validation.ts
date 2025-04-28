import { categories, templateNames } from "$lib/config";
import { z } from "zod";
import * as fg from "formgator";

const uuid4 =
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const uuid = (str: string | null) => !!str && uuid4.test(str);

const SHARP_IMAGE_INPUT_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
];
const MAX_IMG_SIZE = 10 ** 6; // 1MB

export type Failures<
	K extends fg.ValidationIssue["code"] = fg.ValidationIssue["code"],
> = Pick<
	{
		[K in fg.ValidationIssue["code"]]?: Omit<
			fg.ValidationIssue & { code: K },
			"code" | "message"
		> extends Record<string, never> ? string
			:
				| string
				| ((
					data: Omit<fg.ValidationIssue & { code: K }, "code" | "message">,
				) => string);
	},
	K
>;

const validationMessages: Failures = {
	accept: "Invalid file type",
	custom: "Invalid value",
	invalid: "Invalid value",
	max: ({ max }) => `Value must be less than or equal to ${max}.`,
	maxlength: ({ maxlength }) =>
		`Please shorten this text to ${maxlength} characters or less`,
	min: ({ min }) => `Value must be greater than or equal to ${min}.`,
	minlength: ({ minlength }) =>
		`Please lengthen this text to ${minlength} characters or more`,
	pattern: "Please match the requested format",
	required: "Please fill out this field.",
	step: ({ step }) => `Please enter a value in steps of ${step}`,
	type: "Invalid type",
};

export const EmailSchema = fg.email(
	{ required: true, maxlength: 128 },
	validationMessages,
);

export const PasswordSchema = fg.password(
	{ minlength: 8, required: true },
	validationMessages,
);

export const NewUserSchema = {
	username: fg.text({ maxlength: 32, required: true }, validationMessages),
	email: EmailSchema,
	// Add pattern
	password: PasswordSchema,
	rules: fg.checkbox({ required: true }, validationMessages),
};

export const LoginSchema = {
	email: EmailSchema,
	password: PasswordSchema,
};

export const ChangePasswordSchema = {
	email: EmailSchema,
	password: PasswordSchema,
	password2: PasswordSchema,
};

export const TokenSchema = z.string().uuid();

export const FlagForm = z.object({
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

export const FeedbackForm = z.object({
	selection: z.string().transform((val, ctx) => {
		try {
			return z.array(z.tuple([TokenSchema, TokenSchema])).parse(
				JSON.parse(val),
			);
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

const TitleSchema = fg.text({ required: true, minlength: 1, maxlength: 128 }, {
	...validationMessages,
	minlength: "Title too short",
	maxlength: "Title too long",
}).refine((value) => value.trim());

const DescriptionSchema = fg.text({
	required: true,
	minlength: 10,
	maxlength: 5000,
}, {
	...validationMessages,
	minlength: "Description too short",
	maxlength: "Description too long",
});

const UrlSchema = fg.url({ required: true }, {
	invalid: "Invalid url, please provide the full url with the https:// prefix",
}).refine((str) => !str.includes("playlist"), "Playlists are not allowed");

const ThumbnailSchema = fg.file({
	required: false,
	multiple: false,
	accept: SHARP_IMAGE_INPUT_TYPES,
}).refine(
	(file) => !file || file.size < MAX_IMG_SIZE,
	"Image too big: 1MB max",
);

export const CreatorSchema = z.object({
	others: z.string().transform((val, ctx) => {
		try {
			return z.array(z.string().email()).parse(JSON.parse(val));
		} catch {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Invalid email",
			});

			return z.NEVER;
		}
	}),
});

export const NewEntrySchema = {
	usernames: fg.multi({ min: 0 }),
	category: fg.radio(["video", "non-video"], { required: true }),
	title: TitleSchema,
	description: DescriptionSchema,
	link: UrlSchema,
	thumbnail: ThumbnailSchema,
	rules: fg.checkbox({ required: true }),
	copyright: fg.checkbox({ required: true }),
};

export const FeedbackSchema = z
	.string()
	.trim()
	.refine(
		(feedback) => {
			return feedback.length - (feedback.match(/\r\n/g) ?? []).length <= 5000;
		},
		{
			message: "Feedback too long",
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
	reason: z.string().min(1).max(100, { message: "Reason too long" }),
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
