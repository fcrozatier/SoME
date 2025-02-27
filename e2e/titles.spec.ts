import { test } from "@playwright/test";
import { writeFile } from "fs/promises";
import { non_videos as n2021 } from "../src/routes/admin/fixtures/2021_non_videos";
import { non_videos as n2022 } from "../src/routes/admin/fixtures/2022_non_videos";

const data = {
	2021: n2021,
	2022: n2022,
};

test("grab titles", async ({ page }) => {
	const year = 2021;
	console.log("year:", year);
	const slice = data[year].slice(127);
	let i = 0;
	for (const entry of slice) {
		i++;
		const url = entry.url;
		let title = "";

		try {
			console.log(`${i}/${slice.length}\turl`, url);
			await page.goto(entry.url, { timeout: 1000 * 30 });
			title = await page.title();

			if (!title) {
				title = await page.getByRole("heading", { level: 2 }).innerText();
			}
			console.log("\t\ttitle:", title);
		} catch (error) {
			console.log("couldn't get the title");
		}

		await writeFile(`./n${year}.js`, `${JSON.stringify({ url, title })},`, {
			encoding: "utf-8",
			flag: "a",
		});
	}
});
