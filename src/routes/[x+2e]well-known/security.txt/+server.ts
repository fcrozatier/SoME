import { read } from "$app/server";
import security from "../../../../static/security.txt";

export const GET = () => {
	return read(security);
};
