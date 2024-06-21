import { initializeLucia } from "../../../auth";
import { OAuth2RequestError } from "arctic";
import { drizzle } from 'drizzle-orm/d1';
import type { APIContext } from "astro";
import { oursession } from "../../../db/schema";
import { eq } from 'drizzle-orm';
import { GitHub } from "arctic";
import { options } from "@astrojs/check/dist/options";
import type { addAttribute } from "astro/compiler-runtime";
import type { Auth } from "lucia"
import { generateRandomString } from "lucia/utils";

export async function GET(context: APIContext): Promise<Response> {
	const lucia: Lucia = initializeLucia(
		context.locals.runtime.env.DB as D1Database,
		context.locals.runtime.env.PROD,
	);

	const github = new GitHub(
		context.locals.runtime.env.GITHUB_CLIENT_ID as string,
		context.locals.runtime.env.GITHUB_CLIENT_SECRET as string
	);

	const code = context.url.searchParams.get("code");
	const state = context.url.searchParams.get("state");
	const storedState = context.cookies.get("github_oauth_state")?.value ?? null;
	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		const tokens = await github.validateAuthorizationCode(code);

		const githubUser: GitHubUser = await fetch("https://api.github.com/user", {
			headers: {
				Accept: "application/vnd.github+json",
				"User-Agent": "oauth-test",
				Authorization: `Bearer ${tokens.accessToken}`,
			}
		}).then(async (res) => {
			if (!res.ok) {
				console.error(res.status, await res.json());
				throw new Error("failed to get github user");
			}
			return res.json();
		});

		const getUser = async () => {
			const existingUser = await db.select().from(oursession).where(eq(oursession.github_id, githubUser.id));

			if (Array.isArray(existingUser) && existingUser[0] && existingUser[0].hasOwnProperty('id')) {
				return existingUser[0];
			}
			const user = await lucia.createUser({
				attributes: {
					username: githubUser.login
				}
			});
			return user;
		};
		const envDB = context.locals.runtime.env.DB as D1Database
		const db = drizzle(envDB);
		// @ts-ignore
		//const existingUser = await db.select().from(oursession).where(eq(oursession.github_id, githubUser.id));

		const user = await getUser();
		console.log("user", user);

		//console.log("existingUser", existingUser);
		if (user) {
			//const session = await lucia.createSession(existingUser[0].id, {});
			const session = await lucia.createSession({ userId: user.id });
			console.log("session", session);

			const sessionCookie = lucia.createSessionCookie(session);
			/*
			if(sessionCookie.attributes.secure === "false") {
				sessionCookie.attributes.secure = false;
			} else {
				sessionCookie.attributes.secure = true;
			}
			*/
			console.log("session", session);
			console.log("sessionCookie", sessionCookie);
			context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);


			console.log("auth_", context.cookies.get("auth_session")?.value);
			return context.redirect("/");
		}

		const userId = generateRandomString(10); // 16 characters long
		console.log(111111, userId);

		const res = await db.insert(oursession).values({
			id: userId,
			github_id: Number(githubUser.id),
			username: githubUser.login
		});

		const session = await lucia.createSession({ userId: userId });
		const sessionCookie = lucia.createSessionCookie(session.id);

		console.log(999999, session, sessionCookie);

		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
		return context.redirect("/");
	} catch (e) {
		// the specific error message depends on the provider
		if (e instanceof OAuth2RequestError) {
			// invalid code
			console.log("catch the error400", e);
			return new Response(null, {
				status: 400
			});
		}
		console.log("catch the error500", e);
		return new Response(null, {
			status: 500
		});
	}
}

interface GitHubUser {
	id: string;
	login: string;
}