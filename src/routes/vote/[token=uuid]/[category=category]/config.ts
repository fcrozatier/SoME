export const action = {
	skip: 'skip',
	hard_skip: 'hard_skip'
};

export const formAction = (key: keyof typeof action) => {
	return '?/' + action[key];
};
