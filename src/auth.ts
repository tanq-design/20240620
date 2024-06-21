import { Lucia } from "lucia";
import { D1Adapter } from "@lucia-auth/adapter-sqlite";
import { GitHub } from "arctic";

export const github = new GitHub(
	import.meta.env.AUTH_GITHUB_ID,
	import.meta.env.AUTH_GITHUB_SECRET
);

export function initializeLucia(D1: D1Database) {
	const adapter = new D1Adapter(D1, {
		user: "user",
		session: "session"
	});
	return new Lucia(adapter,{
		sessionCookie: {
			attributes: {
				secure: import.meta.env.PROD
			}
		},
		getUserAttributes: (attributes) => {
			return {
				// attributes has the type of DatabaseUserAttributes
				githubId: attributes.github_id,
				username: attributes.username
			};
		}
	});
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