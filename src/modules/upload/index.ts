import Elysia, { t } from "elysia";
import { requiredAuth } from "../../plugins/jwt";
import { withHeaders } from "@elysiajs/openapi";

const upload = new Elysia({
  prefix: "upload",
  detail: {
    tags: ["文件上传"],
    summary: "上传文件相关接口",
    description: "上传文件相关接口示例",
  },
});

upload.post(
  "/static",
  ({ body }) => {
    const { file } = body as { file: File };
    console.log(file);
  },
  {
    detail: {
      description: "上传文件到静态资源服务器",
      summary: "上传文件示例1",
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: t.Object({
              file: t.File({
                description: "需要上传的文件",
                format: "image/*",
              }),
            }),
          },
        },
      },
    },
  }
);

export default upload;
