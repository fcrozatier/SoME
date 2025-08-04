const action = {
	skip: "skip",
};

export const formAction = (key: keyof typeof action) => {
	return "?/" + action[key];
};
