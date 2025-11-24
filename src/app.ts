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
import upload from "./modules/upload";
import ai from "./modules/ai";

export const app = new Elysia({ name: "elysia-example" })
  .use(ip())
  .use(cors())
  .use(logPlugin)
  .use(openapiPlugin)
  .use(errorHandlerPlugin) // 错误处理
  .use(nullFilterPlugin); // 过滤 null 值

app.use(user).use(auth).use(profile).use(upload).use(ai);

app.listen(1118);
