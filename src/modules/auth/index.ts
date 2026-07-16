import { Elysia, t } from "elysia";
import { jwtPlugin, requiredAuth } from "@/plugins/jwt";
import { createUser, getUserByUsername, getUserList } from "./service";
import { verifyPassword } from "@/utils/password";

const auth = new Elysia({ prefix: "auth" }).use(jwtPlugin);

auth.post(
  "sign-up",
  async ({ body }) => {
    const { username, password } = body;

    if (await getUserByUsername(username)) {
      throw new Error("用户已存在");
    }
    await createUser(username, password);
    return { success: true };
  },
  {
    tags: ["授权"],
    detail: {
      summary: "注册",
      description: "用户注册接口",
    },
    body: t.Object({
      username: t.String({ minLength: 3, maxLength: 20 }),
      password: t.String({ minLength: 6, maxLength: 50 }),
    }),
  }
);

auth.post(
  "/sign-in",
  async ({ jwt, body: { username, password } }) => {
    const user = await getUserByUsername(username);
    if (!user) {
      throw new Error("用户名或密码错误");
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("用户名或密码错误");
    }

    const token = await jwt.sign({
      id: user.id,
      username: user.username,
      exp: "30d",
    });

    return { token };
  },
  {
    tags: ["授权"],
    detail: {
      summary: "登录",
      description: "用户登录授权接口",
    },
    body: t.Object({
      username: t.String({ minLength: 3, maxLength: 20 }),
      password: t.String({ minLength: 6, maxLength: 50 }),
    }),
  }
);

const authWithGuard = new Elysia({ prefix: "auth" })
  .use(requiredAuth)
  .get(
    "/users",
    async ({ query }) => {
      const page = Number(query.page) || 1;
      const pageSize = Number(query.pageSize) || 10;
      return getUserList(page, pageSize);
    },
    {
      tags: ["授权"],
      detail: {
        summary: "用户列表",
        description: "获取用户列表（需要认证）",
      },
      query: t.Object({
        page: t.Optional(t.String({ pattern: "^[0-9]+$" })),
        pageSize: t.Optional(t.String({ pattern: "^[0-9]+$" })),
      }),
    }
  );

export default [auth, authWithGuard];
