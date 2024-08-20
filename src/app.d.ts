declare namespace App {
	// interface Error {}
	interface Locals {
		token?: string;
		isAdmin?: boolean;
		isCreator?: boolean;
	}
	// interface PageData {}
	// interface Platform {}
}

declare namespace NodeJS {
	interface ProcessEnv {
		DATABASE_URL: string;
	}
}
