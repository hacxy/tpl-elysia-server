# Elisya Example

ElysiaJS 使用案例

文档： https://elysiajs.com/

接口文档：https://elysia-example-api.hacxy.cn/openapi

## 支持

- [x] JWT授权校验
- [x] 错误处理
- [x] 统一响应数据结构
- [x] 日志系统
- [x] Prisma支持(Mysql适配器)
- [x] openapi 文档自动生成
- [x] CORS
- [x] 单元测试
- [x] 分页查询示例
- [x] 文件上传接口示例 (腾讯云COS)
- [x] 流式响应接口示例

## 安装 Bun

- 已安装可忽略

```sh
curl -fsSL https://bun.sh/install | bash
```

## 安装依赖

```sh
bun install
```

## 创建.env文件

创建`.env`文件于项目根目录下

```sh
DATABASE_URL='mysql://username:password@localhost:3306/elysia_example?connection_limit=10'
JWT_SECRET='elysia.example.secret'
# 腾讯云COS的secret Id
COS_SECRET_ID=xxxxxxxxxxxx
# 腾讯云COS的 secret key
COS_SECRET_KEY=xxxxxxxxxxxx
# AI服务的key
OPENAI_API_KEY=xxxxxxxxx
```

## 生成Prisma客户端

```sh
bunx prisma generate
```

## 开发模式

```sh
bun run dev
```

## Debug

- 安装VSCode扩展： Bun for Visual Studio Code
- 打开`src/app.ts`
- 安装后，命令面板中会出现两个专属 Bun 的命令。要打开调色板，点击“查看 > 命令面板”，或在 Windows、Linux 上输入 Ctrl+Shift+P，或在 Mac“上输入 Cmd+Shift+P
- 输入 `bun` 搜索，执行: `Bun:Debug File`, 之后可以在代码中添加断点进行调试
