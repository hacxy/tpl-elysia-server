import jwt from "@elysiajs/jwt";
import Elysia, { t } from "elysia";
import { prisma } from "@/common/prisima";

export const JwtPayloadSchema = t.Object({
  id: t.Number(),
  username: t.String(),
});

export const jwtPlugin = (app: Elysia) =>
  app.use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
      schema: JwtPayloadSchema,
    })
  );

export const requiredAuth = (app: Elysia) => {
  return app.use(jwtPlugin).derive(async ({ jwt, headers }) => {
    const accessToken = headers.authorization?.split(" ")[1];

    if (!accessToken) {
      throw new Error("未授权");
    }

    const jwtPayload = await jwt.verify(accessToken);
    if (!jwtPayload) {
      throw new Error("授权无效");
    }

    const user = await prisma.user.findUnique({
      where: { id: jwtPayload.id },
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    return {
      user: jwtPayload,
    };
  });
};
