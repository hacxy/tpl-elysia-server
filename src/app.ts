import { Elysia } from "elysia";
import user from "./modules/user";
import auth from "./modules/auth";
import { ip } from "elysia-ip";
import profile from "./modules/profile";
import cors from "@elysiajs/cors";
import { logPlugin } from "./plugins/log";
import { errorHandlerPlugin } from "./plugins/error";
import { openapiPlugin } from "./plugins/openapi";
import { nullFilterPlugin } from "./plugins/null-filter";
import staticPlugin from "@elysiajs/static";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

/**
 * 确保 PUBLIC_DIR 路径存在
 * 如果路径不存在，会自动创建
 */
function ensurePublicDir(): void {
  const publicDir = process.env.PUBLIC_DIR || "public";

  const absolutePath = join(process.cwd(), publicDir);

  console.log(absolutePath);

  if (!existsSync(absolutePath)) {
    try {
      mkdirSync(absolutePath, { recursive: true });
      console.log(`已创建 PUBLIC_DIR 目录: ${absolutePath}`);
    } catch (error) {
      throw new Error(
        `无法创建 PUBLIC_DIR 目录: ${absolutePath}\n错误: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

// 在服务器启动前检查路径
ensurePublicDir();

export const app = new Elysia({ name: "elysia-example" })
  .use(ip())
  .use(cors())
  .use(
    staticPlugin({
      assets: process.env.PUBLIC_DIR,
    })
  )
  .use(logPlugin)
  .use(openapiPlugin)
  .use(errorHandlerPlugin) // 错误处理
  .use(nullFilterPlugin); // 过滤 null 值

app.use(user).use(auth).use(profile);

app.listen(1118);
