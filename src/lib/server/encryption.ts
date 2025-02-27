import { IV, SECRET_KEY } from "$env/static/private";
import { createCipheriv, createDecipheriv } from "crypto";

export const encrypt = (plaintext: string) => {
	const cipher = createCipheriv(
		"aes-256-gcm",
		Buffer.from(SECRET_KEY, "base64"),
		Buffer.from(IV, "base64"),
	);

	let cipherText = cipher.update(plaintext, "utf-8", "base64");
	cipherText += cipher.final("base64");
	const tag = cipher.getAuthTag().toString("base64");

	return { cipherText, tag };
};

export const decrypt = (cipherText: string, tag: string) => {
	const decipher = createDecipheriv(
		"aes-256-gcm",
		Buffer.from(SECRET_KEY, "base64"),
		Buffer.from(IV, "base64"),
	);
	decipher.setAuthTag(Buffer.from(tag, "base64"));

	let plaintext = decipher.update(cipherText, "base64", "utf-8");
	plaintext += decipher.final("utf-8");

	return plaintext;
};
