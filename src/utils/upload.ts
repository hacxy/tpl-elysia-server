import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";
/**
 * 确保上传目录存在
 */
export function ensureUploadDir(): string {
  const publicDir = process.env.PUBLIC_DIR || "public";
  const uploadsDir = path.join(process.cwd(), publicDir, "uploads");

  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }

  return uploadsDir;
}

/**
 * 生成唯一文件名
 */
export function generateUniqueFileName(originalName: string): string {
  const ext = path.extname(originalName);
  // const name = path.basename(originalName, ext);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}${ext}`;
}
