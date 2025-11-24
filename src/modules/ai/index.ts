import Elysia, { t } from "elysia";
import { jwtPlugin } from "../../plugins/jwt";

const ai = new Elysia({
  prefix: "ai",
  detail: {
    tags: ["AI"],
  },
}).use(jwtPlugin);

ai.get(
  "/chat",
  async function* ({ query }) {
    const response = await fetch(
      "https://api.siliconflow.cn/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-ai/DeepSeek-V3.1-Terminus",
          stream: true,
          messages: [
            {
              role: "system",
              content: "你是一个AI助手，请根据用户的问题给出回答",
            },
            { role: "user", content: query.prompt },
          ],
        }),
      }
    );

    return response;
  },
  {
    query: t.Object({
      prompt: t.String({
        description: "用户输入的提示词",
        examples: ["你好，你是谁？"],
      }),
    }),
    detail: {
      summary: "AI聊天流式响应",
      description: "通过流式方式返回AI助手的回答，支持实时输出响应内容",
      tags: ["AI"],
      responses: {
        200: {
          description: "流式响应成功，返回text/event-stream格式的数据流",
          content: {
            "text/event-stream": {
              schema: {
                type: "string",
                format: "binary",
                description: "SSE格式的流式数据",
              },
            },
          },
        },
      },
    },
  }
);

export default ai;
