import dictText from "./dictionary.txt?raw";

export const dictionary = new Set(dictText.split("\n").map((w) => w.toLowerCase()));
