import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "bun run prisma:seed",
  },
  datasource: {
    url: process.env.DATABASE_URL || "file:./dev.db",
  },
});
