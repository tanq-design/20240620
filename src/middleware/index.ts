import { defineMiddleware } from "astro:middleware";
import { initializeLucia } from "../auth";
import { DEFAULT_SESSION_COOKIE_NAME } from "lucia"

// `context`と`next`は自動的に型付けされます
export const onRequest = defineMiddleware(async (context, next) => {

	const lucia = initializeLucia(
			context.locals.runtime.env.DB as D1Database,
			context.locals.runtime.env.PROD,
		);

	const sessionId = context.cookies.get(DEFAULT_SESSION_COOKIE_NAME)?.value ?? null;

	console.log(DEFAULT_SESSION_COOKIE_NAME, sessionId);

	if (!sessionId) {
		context.locals.user = null;
		context.locals.session = null;
		return next();
	}

	console.log("index.ts111111", sessionId);
	//const { session, user } = await lucia.validateSession(sessionId);
	const session = await lucia.validateSession(sessionId);
	console.log("index.ts2222", session);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		console.log("3333", sessionCookie);
		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	}
	if (!session) {
		//const sessionCookie = lucia.createBlankSessionCookie();
		//console.log("333344444", sessionCookie);
		//context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	}
	context.locals.session = session;
	//context.locals.user = user;
	return next();
});