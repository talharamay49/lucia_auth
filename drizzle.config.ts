import { defineConfig } from 'drizzle-kit'
export default defineConfig({
    schema: "./app/lib/db/schema.ts",
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env.DB_URL!,
    },
    verbose: true,
    strict: true,
})