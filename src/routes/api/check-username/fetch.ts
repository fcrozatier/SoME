import { debounce } from "@fcrozatier/ts-helpers";

let controller: AbortController | null = null;
export type UsernameStatus = "pending" | "available" | "taken" | "error" | undefined;

const checkUsername = debounce(
	async (
		username: string,
		setStatus: (status: UsernameStatus) => void,
	) => {
		controller = new AbortController();
		const signal = controller.signal;

		try {
			const r = await fetch("/api/check-username", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username }),
				signal,
			});

			const data = (await r.json()) as {
				valid: boolean;
				status: "available" | "taken";
			};

			controller = null;

			if (!data.valid) setStatus("error");
			else return setStatus(data.status);
		} catch (error) {
			if (!(error instanceof DOMException && error.name === "AbortError")) {
				return setStatus("error");
			}
		}
	},
	1000,
);

export async function resetUsernameStatus(
	username: string,
	setStatus: (status: UsernameStatus) => void,
) {
	setStatus("pending");

	if (controller) {
		controller.abort();
	}
	checkUsername(username, setStatus);
}
