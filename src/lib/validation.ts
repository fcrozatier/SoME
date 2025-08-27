import { PUBLIC_REGISTRATION_START } from "$env/static/public";
import * as fg from "formgator";
import { formfail } from "formgator/sveltekit";
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

export const validateYtCreationDate = async (youtubeId: string) => {
	const url = `https://youtube.com/watch?v=${youtubeId}`;
	const r = await fetch(url, {
		headers: {
			accept:
				"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
			"accept-language": "en-US,en;q=0.9",
			"cache-control": "no-cache",
			pragma: "no-cache",
			priority: "u=0, i",
			"sec-ch-ua": '"Not;A=Brand";v="99", "Brave";v="139", "Chromium";v="139"',
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": '"macOS"',
			"sec-fetch-dest": "document",
			"sec-fetch-mode": "navigate",
			"sec-fetch-site": "none",
			"sec-fetch-user": "?1",
			"sec-gpc": "1",
			"upgrade-insecure-requests": "1",
		},
		body: null,
		method: "GET",
		mode: "cors",
		credentials: "omit",
	});

	if (!r.ok) {
		console.log("[entry]: Failed to fetch the Youtube metadata", url);
		return;
	}

	const html = await r.text();
	const match = html.match(/ytInitialPlayerResponse\s*=\s*\{/);
	if (!match) {
		console.log("[entry]: couldn't parse yt metadata from", url);
		return;
	}

	try {
		const matchLength = match[0].length;
		const matchIndex = match.index!;

		let index = matchIndex + matchLength;
		let open = 1;
		let json = "{";

		// manually ensure balanced braces
		while (open > 0 && index < html.length) {
			const char = html[index];
			if (char === "{") {
				open += 1;
			} else if (char === "}") {
				open -= 1;
			}
			json += char;
			index++;
		}

		// var channel = JSON.parse(json).videoDetails.author;
		var createdAt = JSON.parse(json).microformat.playerMicroformatRenderer.uploadDate;
	} catch (error) {
		if (error instanceof Error) {
			console.log("[entry]: error wile parsing yt metadata", url, error.message);
		}
		return;
	}

	// Check whether content is too old
	if (new Date(createdAt) < new Date(PUBLIC_REGISTRATION_START)) {
		formfail({
			url: `This entry is too old to be eligible. Only recent work can be submitted for SoME. See the rules for more details`,
		});
	}
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
