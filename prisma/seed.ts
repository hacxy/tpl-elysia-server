import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/utils/password.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("开始填充种子数据...");

  const adminPassword = await hashPassword("admin123");
  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: adminPassword,
    },
  });
  console.log(`管理员用户已创建: ${adminUser.username}`);

  console.log("种子数据填充完成！");
  console.log("默认账户: admin / admin123");
}

main()
  .catch((e) => {
    console.error("种子数据填充失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
