import rehypeKatex from "rehype-katex";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGFM from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkSmartyPants from "remark-smartypants";
import { unified } from "unified";

export async function parseAndSanitizeMarkdown(markdown: string) {
	const file = await unified()
		.use(remarkParse)
		.use(remarkGFM)
		.use(remarkSmartyPants)
		.use(remarkMath)
		.use(remarkRehype, { allowDangerousHtml: false })
		/**
		 * Allow Katex math syntax through
		 * https://github.com/rehypejs/rehype-sanitize?tab=readme-ov-file#example-math
		 */
		.use(rehypeSanitize, {
			...defaultSchema,
			attributes: {
				...defaultSchema.attributes,
				code: [["className", /^language-./, "math-inline", "math-display"]],
			},
		})
		.use(rehypeKatex, { output: "mathml", trust: false })
		.use(rehypeStringify)
		.process(markdown);

	return String(file);
}
