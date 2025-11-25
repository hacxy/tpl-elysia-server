// test/index.test.ts
import { describe, expect, it } from "bun:test";
import { app } from "../src/app";
describe("Elysia", async () => {
  const loginResponse = await app.handle(
    new Request("http://localhost:1118/auth/sign-in", {
      method: "POST",
      body: JSON.stringify({
        username: "admin123",
        password: "admin123",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  );

  const res = await loginResponse.json();
  it("returns a response", async () => {
    const response = await app
      .handle(
        new Request("http://localhost:1118/user/list", {
          headers: {
            Authorization: `Bearer ${res.data.token}`,
          },
        })
      )
      .then(async (res) => await res.json());

    expect(response.code).toBe(200);
    expect(response.message).toBe("ok");
    expect(response.data.list).toBeDefined();
  });
});
