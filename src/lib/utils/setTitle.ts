import { browser } from "$app/environment";
import { SHORT_NAME } from "$lib/config";

export const setTitle = (title: string) => {
	if (browser) {
		document.title = `${title} – ${SHORT_NAME}`;
	}
};
