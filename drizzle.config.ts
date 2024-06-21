import { defineConfig } from "drizzle-kit"

export default defineConfig({
    dialect: "sqlite",
    dbCredentials: {
        url: ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/65ca7130e9cf8deb45bb702e8057e349446d6fcc7e99deb46213a5f3cabaa0b7.sqlite",
        accountId: process.env.DB_ACCOUNTID!,
        databaseId: process.env.DB_DATABASEID!,
        token: process.env.DB_TOKEN!,
    },
})