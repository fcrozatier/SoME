import * as fg from "formgator";
import { z } from "zod";

const uuid4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const uuid = (str: string | null) => !!str && uuid4.test(str);

const validationMessages: fg.Failures = {
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

// Users

const usernameRegex = /^[\p{Letter}0-9_.\-]+$/v;

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

const TeacherSchema = fg
	.radio(["true", "false"], { required: true })
	.transform((value) => value === "true");

export const NewUserSchema = {
	username: UsernameSchema,
	email: EmailSchema,
	password: PasswordSchema,
	isTeacher: TeacherSchema,
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

export const UpdateProfileSchema = {
	username: UsernameSchema,
	isTeacher: TeacherSchema,
	level: fg.multi({ min: 1 }),
	bio: fg.textarea({ required: false, maxlength: 500 }).trim(),
};

export const DeleteProfileSchema = {
	password: PasswordSchema,
};

// Entries

const TitleSchema = fg
	.text(
		{ required: true, minlength: 1, maxlength: 128 },
		{
			required: "Title required",
			minlength: "Title too short",
			maxlength: "Title too long",
		},
	)
	.trim();

const DescriptionSchema = fg
	.textarea(
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
	)
	.trim();

const UrlSchema = fg
	.url(
		{ required: true },
		{
			required: "A link to your entry is required",
			invalid: "Invalid url, please provide the full url with the https:// prefix",
		},
	)
	.refine((str) => !str.includes("playlist"), "Playlists are not allowed");

const SHARP_IMAGE_INPUT_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMG_SIZE = 10 ** 6; // 1MB

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

// Votes

export const FeedbackSchema = fg
	.textarea(
		{
			required: false,
			maxlength: 10_000,
		},
		{ ...validationMessages, maxlength: "Feedback too long" },
	)
	.trim();

const UidSchema = fg.hidden().pipe(z.string().uuid());

export const VoteSchema = {
	score: fg.range({ min: 1, max: 9, step: 0.01 }),
	feedback: FeedbackSchema,
	uid: UidSchema,
};

export const CacheVoteSchema = {
	score: fg.range({ min: 1, max: 9, step: 0.01 }).optional(null),
	feedback: FeedbackSchema,
	uid: UidSchema,
};

export const SkipSchema = {
	uid: UidSchema,
};

export const FlagSchema = {
	score: fg.range({ min: 1, max: 9, step: 0.01 }).optional(),
	feedback: FeedbackSchema,
	uid: UidSchema,
	reason: fg.text(
		{ minlength: 1, maxlength: 100, required: true },
		{
			...validationMessages,
			maxlength: "Reason too long",
		},
	),
	vote: fg.checkbox({ required: false }),
};

// Admin

export const SurveySchema = {
	some: fg.number({ required: true, min: 1, max: 9 }),
	site: fg.number({ required: true, min: 1, max: 9 }),
	feedback: FeedbackSchema,
};

export const AdminDeactivateForm = {
	uid: UidSchema,
};

export const AdminForm = {
	selected: fg.multi().pipe(z.array(z.string().uuid())),
};
