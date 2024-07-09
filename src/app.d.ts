declare namespace App {
	// interface Error {}
	interface Locals {
		token?: string;
	}
	// interface PageData {}
	// interface Platform {}
}

declare namespace NodeJS {
	interface ProcessEnv {
		DATABASE_URL: string;
	}
}
