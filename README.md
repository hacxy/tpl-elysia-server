# Elysia Server Template

轻量级 ElysiaJS 后端服务模板

![Test](https://github.com/hacxy/tpl-elysia-server/actions/workflows/test.yml/badge.svg)

文档： https://elysiajs.com/

## 支持

- [x] JWT 授权校验
- [x] 日志系统
- [x] Prisma 支持 (SQLite + libsql)
- [x] OpenAPI 文档自动生成
- [x] CORS
- [x] 单元测试
- [x] GitHub Actions CI/CD

## 安装 Bun

- 已安装可跳过

```sh
curl -fsSL https://bun.sh/install | bash
```

## 安装依赖

```sh
bun install
```

## 创建 .env 文件

创建 `.env` 文件于项目根目录下

```sh
DATABASE_URL='file:./dev.db'
JWT_SECRET='your-jwt-secret'
```

## 生成 Prisma 客户端

```sh
bunx prisma generate
bunx prisma db push
```

## 开发模式

```sh
bun run dev
```

## API 接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/auth/sign-up` | 用户注册 | 否 |
| POST | `/auth/sign-in` | 用户登录 | 否 |
| GET | `/auth/users` | 用户列表 | 是 |

## 接口文档

启动服务后访问：

- Scalar UI: http://localhost:1118/scalar
- OpenAPI JSON: http://localhost:1118/openapi

## 运行测试

```sh
bun test
```

## 构建

```sh
# macOS ARM
bun run build

# Linux x64
bun run build:linux

# Linux ARM64
bun run build:linux-arm64

# Windows x64
bun run build:windows
```

## Debug

- 安装 VSCode 扩展： Bun for Visual Studio Code
- 打开 `src/app.ts`
- 命令面板中执行: `Bun:Debug File`
