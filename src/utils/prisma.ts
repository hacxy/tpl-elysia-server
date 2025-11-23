/**
 * 将 Prisma 查询结果中的嵌套关系提升到第一层
 *
 * @param data - Prisma 查询结果
 * @param path - 嵌套路径，例如 ["userRole", "role"] 表示 data.userRole.role
 * @param targetKey - 目标键名，例如 "role"
 * @returns 转换后的数据
 *
 * @example
 * ```ts
 * const user = await prisma.user.findUnique({
 *   include: { userRole: { include: { role: true } } }
 * });
 *
 * // 将 userRole.role 提升为 role
 * const flattened = flattenRelation(user, ["userRole", "role"], "role");
 * ```
 */
export function flattenRelation<T extends Record<string, unknown>>(
  data: T | null,
  path: string[],
  targetKey: string
): T | null {
  if (!data) {
    return null;
  }

  let value: unknown = data;
  for (const key of path) {
    if (
      value &&
      typeof value === "object" &&
      key in value &&
      typeof key === "string"
    ) {
      value = (value as Record<string, unknown>)[key];
    } else {
      value = null;
      break;
    }
    if (value === null || value === undefined) {
      break;
    }
  }

  const { [path[0]]: removed, ...rest } = data;
  return {
    ...rest,
    [targetKey]: value || null,
  } as T;
}

/**
 * 分页查询参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * 分页查询结果
 */
export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Prisma findMany 参数类型（使用更宽松的类型以兼容 Prisma 的类型系统）
 */
type FindManyArgs = {
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, unknown>;
  orderBy?: unknown;
  [key: string]: unknown;
};

/**
 * Prisma 模型委托接口
 */
interface PrismaModelDelegate<TFindManyArgs = FindManyArgs> {
  findMany: (args?: TFindManyArgs) => Promise<unknown[]>;
  count: (args?: { where?: Record<string, unknown> }) => Promise<number>;
}

/**
 * 通用的 Prisma 分页查询函数
 *
 * @param model - Prisma 模型委托对象（如 prisma.user）
 * @param params - 分页参数
 * @param findManyArgs - Prisma findMany 的参数（where, include, select 等）
 * @returns 分页查询结果
 *
 * @example
 * ```ts
 * const result = await paginate(prisma.user, { page: 1, pageSize: 10 }, {
 *   where: { username: { contains: 'admin' } },
 *   include: { userRole: true }
 * });
 * ```
 */
export async function paginate<
  TModel extends PrismaModelDelegate<TArgs>,
  TArgs extends FindManyArgs = FindManyArgs,
>(
  model: TModel,
  params: PaginationParams,
  findManyArgs?: TArgs
): Promise<PaginationResult<Awaited<ReturnType<TModel["findMany"]>>[0]>> {
  const { page = 1, pageSize = 10 } = params;

  // 构建查询参数
  const queryArgs = {
    ...(findManyArgs || {}),
    skip: (page - 1) * pageSize,
    take: pageSize,
  } as unknown as TArgs;

  // 构建计数查询参数（只包含 where 条件）
  const countArgs: { where?: Record<string, unknown> } =
    findManyArgs && typeof findManyArgs === "object" && "where" in findManyArgs
      ? { where: findManyArgs.where as Record<string, unknown> }
      : {};

  // 并行执行查询和计数
  const [list, total] = await Promise.all([
    model.findMany(queryArgs),
    model.count(countArgs),
  ]);

  return {
    list,
    total,
    page,
    pageSize,
  };
}
