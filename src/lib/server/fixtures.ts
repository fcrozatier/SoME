import { categories } from '../config';

const ytFixtures = [
	{
		title: 'Why π is in the normal distribution (beyond integral tricks)',
		description: "Where's the circle? And how does it relate to where e^(-x^2) comes from?",
		link: 'https://www.youtube.com/watch?v=cy8r7WSuT1I'
	},
	{
		title: 'But what is the Central Limit Theorem?',
		description: "A visual introduction to probability's most important theorem",
		link: 'https://www.youtube.com/watch?v=zeJD6dqJ5lo'
	},
	{
		title: 'How to flex',
		description: 'Top 10 ways to flex. ',
		link: 'https://www.youtube.com/watch?v=r6tH55syq0o'
	},
	{
		title: 'But what is a convolution?',
		description: 'Discrete convolutions, from probability to image processing and FFTs',
		link: 'https://www.youtube.com/watch?v=KuXjwB4LzSA'
	},
	{
		title: 'Researchers thought this was a bug (Borwein integrals)',
		description: "A curious pattern of integrals that all equal pi...until they don't.",
		link: 'https://www.youtube.com/watch?v=851U557j6HE'
	},
	{
		title: 'How I built the SoME3 voting system with graph theory',
		description: 'The graph theory behind this website.',
		link: 'https://www.youtube.com/watch?v=XSDBbCaO-kc'
	},
	{
		title: 'Olympiad level counting',
		description:
			'A lesson on generating functions, and clever uses of complex numbers for counting',
		link: 'https://www.youtube.com/watch?v=bOXCLR3Wric'
	}
];

export function makeCreators(n: number) {
	const creators = [];

	for (const [c, category] of categories.entries()) {
		if (category === 'video') {
			for (const [i, entry] of ytFixtures.entries()) {
				creators.push({
					email: `email${c * n + i}@gmail.com`,
					title: entry.title,
					category,
					description: entry.description,
					link: entry.link,
					number: i
				});
			}
		} else {
			for (let i = 0; i < n; i++) {
				creators.push({
					email: `email${(c + 1) * n + i}@gmail.com`,
					title: `title${i}`,
					category,
					description:
						'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolorem sequi ipsum ex dolores, placeat dolor blanditiis est voluptatibus similique ad nobis ab fugit explicabo tempore asperiores aliquid id itaque neque.',
					link: `http://link${c * n + i}.com`,
					number: i
				});
			}
		}
	}

	return creators;
}
