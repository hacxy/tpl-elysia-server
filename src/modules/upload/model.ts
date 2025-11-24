import { t } from "elysia";

export namespace UploadModel {
  export const uploadFileSchema = t.Object({
    file: t.File({
      description: "需要上传的文件",
      format: "image/*",
    }),
    multipleFiles: t.Optional(t.Files()),
  });

  export type uploadFileSchema = typeof uploadFileSchema.static;
}
