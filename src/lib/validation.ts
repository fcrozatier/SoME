import { templateNames } from "$lib/config";
import * as fg from "formgator";
import { z } from "zod";

const uuid4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const uuid = (str: string | null) => !!str && uuid4.test(str);

const SHARP_IMAGE_INPUT_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMG_SIZE = 10 ** 6; // 1MB

export type Failures<K extends fg.ValidationIssue["code"] = fg.ValidationIssue["code"]> = Pick<
	{
		[K in fg.ValidationIssue["code"]]?: Omit<
			fg.ValidationIssue & { code: K },
			"code" | "message"
		> extends Record<string, never>
			? string
			: string | ((data: Omit<fg.ValidationIssue & { code: K }, "code" | "message">) => string);
	},
	K
>;

const validationMessages: Failures = {
	accept: "Invalid file type",
	custom: "Invalid value",
	invalid: "Invalid value",
	max: ({ max }) => `Value must be less than or equal to ${max}.`,
	maxlength: ({ maxlength }) => `Please shorten this text to ${maxlength} characters or less`,
	min: ({ min }) => `Value must be greater than or equal to ${min}.`,
	minlength: ({ minlength }) => `Please lengthen this text to ${minlength} characters or more`,
	pattern: "Please match the requested format",
	required: "Please fill out this field.",
	step: ({ step }) => `Please enter a value in steps of ${step}`,
	type: "Invalid type",
};

export const usernameRegex = /^[\p{Letter}0-9_.\-]{3,32}$/v;

export const UsernameSchema = fg
	.text({ minlength: 3, maxlength: 32, required: true, pattern: usernameRegex }, validationMessages)
	.enrich({ title: "letters, digits, _-." });

export const EmailSchema = fg.email({ required: true, maxlength: 128 }, validationMessages);

// 8 chars, lower, upper and number
export const passwordRegex = /^(?=.{8,})(?=.*\p{Lowercase})(?=.*\p{Uppercase})(?=.*\d).*$/v;

export const PasswordSchema = fg
	.password({ minlength: 8, required: true, pattern: passwordRegex }, validationMessages)
	.enrich({
		title: "8 characters minimum, with lowercase, uppercase and number",
	});

export const NewUserSchema = {
	username: UsernameSchema,
	email: EmailSchema,
	// Add pattern
	password: PasswordSchema,
	isTeacher: fg.radio(["true", "false"], { required: true }).transform((value) => value === "true"),
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
			return z.array(z.tuple([TokenSchema, TokenSchema])).parse(JSON.parse(val));
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

const TitleSchema = fg
	.text(
		{ required: true, minlength: 1, maxlength: 128 },
		{
			required: "Title required",
			minlength: "Title too short",
			maxlength: "Title too long",
		},
	)
	.transform((value) => value.trim());

const DescriptionSchema = fg.textarea(
	{
		required: true,
		minlength: 10,
		maxlength: 5000,
	},
	{
		required: "Description required",
		minlength: "Description too short",
		maxlength: "Description too long",
	},
);

const UrlSchema = fg
	.url(
		{ required: true },
		{
			required: "A link to your entry is required",
			invalid: "Invalid url, please provide the full url with the https:// prefix",
		},
	)
	.refine((str) => !str.includes("playlist"), "Playlists are not allowed");

const ThumbnailSchema = fg
	.file({
		required: false,
		multiple: false,
		accept: SHARP_IMAGE_INPUT_TYPES,
	})
	.refine((file) => !file || file.size < MAX_IMG_SIZE, "Image too big: 1MB max");

export const NewEntrySchema = {
	usernames: fg.multi({ min: 0 }),
	category: fg.select(["video", "non-video"], { required: true }),
	title: TitleSchema,
	description: DescriptionSchema,
	newtag: fg.text({ required: false }),
	tag: fg.multi({ min: 0 }),
	url: UrlSchema,
	thumbnail: ThumbnailSchema,
	rules: fg.checkbox({ required: true }),
	copyright: fg.checkbox({ required: true }),
};

/**
 * Academic math level keywords for tags
 */
export const levels = [
	"elementary-school",
	"middle-school",
	"high-school",
	"undergraduate",
	"graduate",
];
export const invalidTagsMessage = "Pick at least one level from the provided list";

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
