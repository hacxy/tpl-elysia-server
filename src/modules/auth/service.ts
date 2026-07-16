import { prisma } from "@/common/prisima";
import { hashPassword } from "@/utils/password";

export const createUser = async (username: string, password: string) => {
  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });
  return user;
};

export const getUserByUsername = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: { username },
  });
  return user;
};

export const getUserList = async (page: number = 1, pageSize: number = 10) => {
  const skip = (page - 1) * pageSize;
  const [list, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: pageSize,
      select: {
        id: true,
        username: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

  return {
    list,
    total,
    page,
    pageSize,
  };
};
