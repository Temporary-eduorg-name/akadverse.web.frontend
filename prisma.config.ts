import "dotenv/config";
import { defineConfig } from "prisma/config";

if (!process.env["DATABASE_PUBLIC_URL"]) throw new Error("DATABASE_PUBLIC_URL is not set in .env");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_PUBLIC_URL"],
  },
});
