import { t } from "elysia";
import { throwValidationError } from "../../common/errors";

export namespace UploadModel {
  export const uploadFileSchema = t.Object({
    file: t.File({
      description: "需要上传的文件",
      format: "image/*",
      error: throwValidationError(),
    }),
    multipleFiles: t.Optional(t.Files()),
  });

  export type uploadFileSchema = typeof uploadFileSchema.static;
}
