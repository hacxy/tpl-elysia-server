import { Elysia } from "elysia";
import auth from "./modules/auth";
import { ip } from "elysia-ip";
import cors from "@elysiajs/cors";
import { logPlugin } from "./plugins/log";
import { openapiPlugin } from "./plugins/openapi";

export const app = new Elysia({ name: "elysia-template" })
  .use(ip())
  .use(cors())
  .use(logPlugin)
  .use(openapiPlugin);

for (const module of auth) {
  app.use(module);
}

app.listen(1118);
