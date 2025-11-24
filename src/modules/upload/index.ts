import Elysia, { t } from "elysia";
import { UploadModel } from "./model";
import path from "node:path";
import { response, responseSchema } from "@/utils/response";
import { BusinessError, ValidationError } from "../../common/errors";
import { ensureUploadDir, generateUniqueFileName } from "../../utils/upload";
import { requiredAuth } from "../../plugins/jwt";

const upload = new Elysia({
  prefix: "upload",
  detail: {
    tags: ["文件上传"],
    summary: "上传文件相关接口",
    description: "上传文件相关接口示例",
  },
}).use(requiredAuth);

upload.post(
  "/static",
  async ({ body, request }) => {
    const { file, multipleFiles } = body as UploadModel.uploadFileSchema;

    if (!(file instanceof File)) {
      throw new ValidationError("文件类型错误");
    }
    if (multipleFiles) {
      for (const file of multipleFiles) {
        if (!(file instanceof File)) {
          throw new ValidationError("文件类型错误");
        }
      }
    }

    if (!file) {
      throw new ValidationError("文件不能为空");
    }

    // 确保上传目录存在
    const uploadsDir = ensureUploadDir();

    // 生成唯一文件名
    const uniqueFileName = generateUniqueFileName(file.name);
    const filePath = path.join(uploadsDir, uniqueFileName);
    try {
      // 保存文件
      await Bun.write(filePath, file);

      // 构建完整的文件URL
      const requestUrl = new URL(request.url);
      const fileUrl = `${requestUrl.protocol}//${requestUrl.host}/public/uploads/${uniqueFileName}`;
      return response.success({
        originName: file.name,
        url: fileUrl,
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
      t.Object({
        originName: t.String({ description: "原始文件名" }),
        url: t.String({ description: "文件URL" }),
      })
    ),
  }
);

export default upload;
