import { defineConfig } from "drizzle-kit"

export default defineConfig({
    dialect: "sqlite",
    driver: 'd1-http',
    dbCredentials: {
        accountId: process.env.DB_ACCOUNTID!,
        databaseId: process.env.DB_DATABASEID!,
        token: process.env.DB_TOKEN!,
    },
})