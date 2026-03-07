import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

export default defineConfig({
    datasource: {
        url: process.env.DATABASE_URL as string
    },
    migrate: {
        async adapter(env) {
            const pool = new Pool({ connectionString: env.DATABASE_URL });
            return new PrismaPg(pool);
        }
    }
});
