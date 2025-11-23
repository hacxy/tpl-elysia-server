import { prisma } from "@/common/prisima";
import { BusinessError, UserExistsError } from "../../common/errors";
import { hashPassword } from "../../utils/password";
import { flattenRelation, paginate } from "../../utils/prisma";
import type { UserModel } from "./model";

export const getUserByUsername = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  return user;
};

export const getUsers = async (query: UserModel.userListQuery) => {
  const { page, pageSize, username } = query;

  const result = await paginate(
    prisma.user,
    { page, pageSize },
    {
      where: username
        ? {
            username: {
              contains: username,
            },
          }
        : undefined,
      include: {
        userRole: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    }
  );

  // 将 userRole.role 提升到第一层为 role
  const finalUsers = result.list
    .map((user) => flattenRelation(user, ["userRole", "role"], "role"))
    .filter((user): user is NonNullable<typeof user> => user !== null);

  return {
    ...result,
    list: finalUsers,
  };
};

export const createUser = async (data: UserModel.userCreateBody) => {
  const { username, password, roleId } = data;
  if (await getUserByUsername(username)) {
    throw new UserExistsError();
  }
  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      userRole: {
        connect: {
          id: roleId,
        },
      },
    },
  });
  return user;
};

export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      userRole: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      },
    },
  });

  // 将 userRole.role 提升到第一层为 role
  return flattenRelation(user, ["userRole", "role"], "role");
};
