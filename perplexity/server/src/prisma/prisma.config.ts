import { defineConfig } from "@prisma/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import env from "../configs/ENV";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFile);

export default defineConfig({
    schema: resolve(currentDir, "./schema.prisma"),
    datasource: {
        url: env.DATABASE_URL,
    },
});
