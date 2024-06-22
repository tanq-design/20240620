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

	if (!sessionId) {
		context.locals.user = null;
		context.locals.session = null;
		return next();
	}

	const session = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	}
	if (!session) {
		const sessionCookie = lucia.createSessionCookie(null);
		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	}
	context.locals.session = session;

	return next();
});