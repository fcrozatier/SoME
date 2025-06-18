import { debounce } from "@fcrozatier/ts-helpers";

let controller: AbortController | null = null;
let usernameStatus: "pending" | "available" | "taken" | "error" | undefined =
  $state(undefined);

export const checkUsername = debounce(async (username: string) => {
  if (controller) {
    controller.abort();
  }

  controller = new AbortController();
  const signal = controller.signal;

  try {
    console.log("checking username");
    usernameStatus = "pending";
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

    if (!data.valid) usernameStatus = "error";
    else usernameStatus = data.status;

    console.log(usernameStatus);
    controller = null;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.log(error.name, error.message);
    } else {
      throw error;
    }
  }
}, 1000);
