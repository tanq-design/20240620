import { lucia } from "lucia";
import { d1 } from "@lucia-auth/adapter-sqlite";

export function initializeLucia(D1: D1Database, PROD : boolean) {
	const adapter = d1(D1,{user:"user", session:"session", key:"key"});
	return lucia({adapter: adapter, env: PROD ? "PROD" : "DEV"});
}

declare module "lucia" {
	interface Register {
		Lucia: ReturnType<typeof initializeLucia>;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	github_id: number;
	username: string;
}