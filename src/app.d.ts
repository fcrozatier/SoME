// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Error {}
	interface Locals {
		token: string;
	}
	// interface PageData {}
	// interface Platform {}
}

declare namespace NodeJS {
	interface ProcessEnv {
		DATABASE_URL: string;
	}
}
