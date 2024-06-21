import { generateState } from "arctic";
import { GitHub } from "arctic";

import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
	const github = new GitHub(
		context.locals.runtime.env.GITHUB_CLIENT_ID as string,
		context.locals.runtime.env.GITHUB_CLIENT_SECRET as string
	); 

	const state = generateState();
	const url = await github.createAuthorizationURL(state);

	context.cookies.set("github_oauth_state", state, {
		path: "/",
		secure: context.locals.runtime.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	});

	return context.redirect(url.toString());
}