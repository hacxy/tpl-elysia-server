import Elysia from "elysia";

/**
 * 递归移除对象中值为 null 的字段
 * @param obj - 要处理的对象
 * @returns 移除 null 值后的新对象
 */
function removeNullFields<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeNullFields) as T;
  }

  if (typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null) {
        result[key] = removeNullFields(value);
      }
    }
    return result as T;
  }

  return obj;
}

/**
 * 判断响应值是否应该跳过 null 过滤
 * @param responseValue - 响应值
 * @returns 是否应该跳过处理
 */
function shouldSkipNullFilter(responseValue: unknown): boolean {
  // 跳过 Response 对象（通常是文件响应或已处理的响应）
  if (responseValue instanceof Response) {
    return true;
  }

  // 跳过二进制数据类型
  if (
    responseValue instanceof Buffer ||
    responseValue instanceof Uint8Array ||
    responseValue instanceof ArrayBuffer ||
    responseValue instanceof Blob
  ) {
    return true;
  }

  // 跳过字符串和数字等原始类型
  if (
    typeof responseValue !== "object" ||
    responseValue === null ||
    responseValue === undefined
  ) {
    return true;
  }

  // 跳过数组（可能是文件内容或数据列表）
  if (Array.isArray(responseValue)) {
    return true;
  }

  // 跳过具有特定属性的对象（可能是文件响应）
  // 检查是否是流对象或具有特定文件相关属性
  if (
    "pipe" in responseValue ||
    "read" in responseValue ||
    "body" in responseValue ||
    "stream" in responseValue
  ) {
    return true;
  }

  // 检查是否是 Elysia 的响应对象（有特定结构）
  // 如果对象有 code 和 message 属性，说明是 API 响应，需要处理
  // 如果对象没有这些属性，可能是其他类型的响应，需要谨慎处理
  const hasApiResponseStructure =
    "code" in responseValue ||
    "message" in responseValue ||
    "data" in responseValue;

  // 如果是 API 响应结构，需要处理 null 过滤
  // 否则跳过（可能是文件或其他特殊响应）
  return !hasApiResponseStructure;
}

/**
 * Null 值过滤插件
 * 自动过滤响应中所有值为 null 的字段
 */
export const nullFilterPlugin = (app: Elysia) => {
  return app.onAfterHandle(({ responseValue }) => {
    // 判断是否应该跳过处理
    if (shouldSkipNullFilter(responseValue)) {
      return responseValue;
    }

    // 只处理普通对象（通常是 API 响应对象）
    return removeNullFields(responseValue);
  });
};
