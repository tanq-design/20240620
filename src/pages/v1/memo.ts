import { drizzle } from 'drizzle-orm/d1';
import { memos } from "../../db/schema";
import type { APIContext } from 'astro';

export async function GET({ locals }: APIContext) {
    const db = drizzle(locals.runtime.env.DB as D1Database);
    const memo = await db.select().from(memos);
    
    console.log(memo);

    return new Response(
        JSON.stringify({
            body: { memos: memo }
        })
    )
}