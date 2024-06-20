import { drizzle } from 'drizzle-orm/d1';
import { memos } from "../../db/schema";
import type { Runtime } from '@astrojs/cloudflare';

interface PostData {
    title: string
    content: string
}

export async function GET({ locals }: { locals: Runtime }) {
    const envDB = locals.runtime.env.DB as D1Database
    const db = drizzle(envDB);
    let memo = await db.select().from(memos);

    if (!memo || (Array.isArray(memo) && memo.length === 0)) {
        memo = [{ id: 1, title: "DUMMY1", content: "content1" }, { id: 2, title: "DUMMY2", content: "content2" }]
    }

    return new Response(
        JSON.stringify({
            body: { memos: memo }
        }), { status: 200 });
}

export async function POST({ request, locals }: { request: Request, locals: Runtime }) {
    const message: PostData = await request.json();

    if (!message) {
        console.log("POST data is empty!");
        return new Response(null, {
            status: 500,
        });
    }

    if (!message.hasOwnProperty('title') || !message.hasOwnProperty('content')) {
        console.log("POST data is invalid!");
        return new Response(null, {
            status: 500,
        });
    }
    
    const title = message.title;
    const content = message.content;
    const envDB = locals.runtime.env.DB as D1Database;

    const db = drizzle(envDB);
    const result = await db.insert(memos).values({ title, content });

    if (!result.success) {
        console.log("DB insert failed!");
        return new Response(null, {
            status: 500,
        });
    }

    return new Response(null, {
        status: 200,
    });
}