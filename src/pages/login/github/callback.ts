import { initializeLucia } from "../../../auth";
import { OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize } from "lucia";
import { drizzle } from 'drizzle-orm/d1';
import type { APIContext } from "astro";
import { sessions } from "../../../db/schema";
import { eq } from 'drizzle-orm';
import { GitHub } from "arctic";

export async function GET(context: APIContext): Promise<Response> {
	const lucia = initializeLucia(context.locals.runtime.env.DB as D1Database);
	const github = new GitHub(
		context.locals.runtime.env.GITHUB_CLIENT_ID as string,
		context.locals.runtime.env.GITHUB_CLIENT_SECRET as string
	);

	console.log("github", github);

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
		const githubUserResponse = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});
		const githubUser: GitHubUser = await githubUserResponse.json();

		const envDB = context.locals.runtime.env.DB as D1Database
		const db = drizzle(envDB);
		// @ts-ignore
		const existingUser = await db.select().from(sessions).where(eq(sessions.github_id, githubUser.id));
		console.log("existingUser", existingUser);
		if (Array.isArray(existingUser) && existingUser[0] && existingUser[0].hasOwnProperty('id')) {
			const session = await lucia.createSession(existingUser[0].id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			return context.redirect("/");
		}

		const userId = generateIdFromEntropySize(10); // 16 characters long

		const res = await db.insert(sessions).values({
			id: userId,
			github_id: Number(githubUser.id),
			username: githubUser.login
		});

		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
		return context.redirect("/");
	} catch (e) {
		// the specific error message depends on the provider
		if (e instanceof OAuth2RequestError) {
			// invalid code
			return new Response(null, {
				status: 400
			});
		}
		console.log("catch the error", e);
		return new Response(null, {
			status: 500
		});
	}
}

interface GitHubUser {
	id: string;
	login: string;
}