import { readFile } from "fs/promises";

export const dictionary = new Set(
  (await readFile("./dictionary", "utf-8"))
    .split("\n")
    .map((w) => w.toLowerCase()),
);
