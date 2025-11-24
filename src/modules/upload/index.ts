import Elysia, { t } from "elysia";
import { UploadModel } from "./model";
import { response, responseSchema } from "@/utils/response";
import { BusinessError, ValidationError } from "../../common/errors";
import { requiredAuth } from "../../plugins/jwt";
// import { uploadFile, uploadMultipleFiles } from "../../common/cos";

const upload = new Elysia({
  prefix: "upload",
  detail: {
    tags: ["文件上传"],
    summary: "上传文件相关接口",
    description: "上传文件相关接口示例",
  },
}).use(requiredAuth);

upload.post(
  "/cos",
  async ({ body }) => {
    const { file, multipleFiles } = body as UploadModel.uploadFileSchema;
    // 验证文件类型
    if (!(file instanceof File)) {
      throw new ValidationError("文件类型错误");
    }
    if (multipleFiles) {
      for (const f of multipleFiles) {
        console.log(f);
        if (!(f instanceof File)) {
          throw new ValidationError("文件类型错误");
        }
      }
    }

    try {
      // 如果提供了多文件，优先使用多文件上传
      // if (multipleFiles && multipleFiles.length > 0) {
      //   const results = await uploadMultipleFiles(multipleFiles);
      //   return response.success(results);
      // }

      // 单文件上传
      // if (!file) {
      //   throw new ValidationError("文件不能为空");
      // }

      // const url = await uploadFile(file);
      return response.success({
        originName: file.name,
        url: "",
      });
    } catch (error) {
      throw new BusinessError(
        500,
        `文件保存失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
  {
    detail: {
      description: "上传文件到静态资源服务器",
      summary: "上传文件示例1",
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: UploadModel.uploadFileSchema,
          },
        },
      },
    },
    response: responseSchema(
      t.Union([
        t.Object({
          originName: t.String({ description: "原始文件名" }),
          url: t.String({ description: "文件URL" }),
        }),
        t.Array(
          t.Object({
            originName: t.String({ description: "原始文件名" }),
            url: t.String({ description: "文件URL" }),
          })
        ),
      ])
    ),
  }
);

export default upload;
