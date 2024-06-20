import { drizzle } from 'drizzle-orm/d1';
import { memos } from "../../db/schema";
import type { APIContext } from 'astro';

export async function GET({ locals }: APIContext) {
    const db = drizzle(locals.runtime.env.DB as D1Database);
    let memo = await db.select().from(memos);
    
    console.log(memo);
    if(!memo || (Array.isArray(memo) && memo.length === 0)) {
       memo = [{id:1, title:"DUMMY1", content:"content1"},{id:2, title:"DUMMY2", content:"content2"}] 
    }

    return new Response(
        JSON.stringify({
            body: { memos: memo }
        })
    )
}

