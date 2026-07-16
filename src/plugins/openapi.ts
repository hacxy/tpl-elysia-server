import openapi from "@elysiajs/openapi";
import Elysia from "elysia";

export const openapiPlugin = (app: Elysia) => {
  return app.use(
    openapi({
      scalar: {
        cdn: "https://unpkg.com/@scalar/api-reference@latest/dist/browser/standalone.js",
      },
      exclude: {
        paths: ["/public/*"],
      },
      documentation: {
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
        tags: [
          {
            name: "授权",
            description: "授权相关接口",
          },
        ],
        info: {
          title: "Elysia Template API",
          version: "1.0.0",
          description: "Elysia 模板项目 API 文档",
        },
      },
    })
  );
};
