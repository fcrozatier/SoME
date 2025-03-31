declare namespace App {
	// interface Error {}
	interface Locals {
		user: import("$lib/server/auth").SessionValidationResult["user"];
		session: import("$lib/server/auth").SessionValidationResult["session"];
	}
	// interface PageData {}
	// interface Platform {}
}

declare namespace NodeJS {
	interface ProcessEnv {
		DATABASE_URL: string;
	}
}
