import { initializeLucia } from "../../../auth";
import { OAuth2RequestError } from "arctic";
import { drizzle } from 'drizzle-orm/d1';
import type { APIContext } from "astro";
import { oursession } from "../../../db/schema";
import { eq } from 'drizzle-orm';
import { GitHub } from "arctic";
import type { Auth } from "lucia"
import { generateRandomString } from "lucia/utils";

export async function GET(context: APIContext): Promise<Response> {
	const lucia: Auth = initializeLucia(
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
			const envDB = context.locals.runtime.env.DB as D1Database
			const db = drizzle(envDB);
			// @ts-ignore
			const existingUser = await db.select().from(oursession).where(eq(oursession.github_id, githubUser.id));

			if (Array.isArray(existingUser) && existingUser[0] && existingUser[0].hasOwnProperty('id')) {
				return await lucia.getUser(existingUser[0].id);
			}
			const user = await lucia.createUser({
				key: null,
				attributes: {
					username: githubUser.login
				}
			});
			return user;
		};

		const user = await getUser();

		if (user) {
			const session = await lucia.createSession({ userId: user.userId, attributes: {} });

			const sessionCookie = lucia.createSessionCookie(session);
			context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

			return context.redirect("/");
		}

		const userId = generateRandomString(10); // 16 characters long

		await lucia.createUser({ userId: userId, key: null, attributes: {} })
		/*
		const envDB = context.locals.runtime.env.DB as D1Database
		const db = drizzle(envDB);
		await db.insert(oursession).values({
			userId: userId,
			github_id: Number(githubUser.id),
			username: githubUser.login
		});
		*/

		const session = await lucia.createSession({ userId, attributes: {} });
		const sessionCookie = lucia.createSessionCookie(session.id);

		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
		return context.redirect("/");
	} catch (e) {
		// the specific error message depends on the provider
		if (e instanceof OAuth2RequestError) {
			// invalid code
			console.error("catch the error400", e);
			return new Response(null, {
				status: 400
			});
		}
		console.error("catch the error500", e);
		return new Response(null, {
			status: 500
		});
	}
}

interface GitHubUser {
	id: string;
	login: string;
}