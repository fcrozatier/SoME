import pluralize from "pluralize-esm";
import dictText from "./dictionary.txt?raw";

export const dictionary = new Set(dictText.split("\n").map((w) => w.toLowerCase()));

for (const word of dictionary) {
	dictionary.add(pluralize.plural(word));
}
