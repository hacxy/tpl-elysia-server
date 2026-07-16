import { describe, expect, it, beforeAll } from "bun:test";
import { app } from "../src/app";
import { prisma } from "../src/common/prisima";

let token: string;

beforeAll(async () => {
  await prisma.user.deleteMany();
  await app.handle(
    new Request("http://localhost:1118/auth/sign-up", {
      method: "POST",
      body: JSON.stringify({
        username: "testuser",
        password: "test123456",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  );
});

describe("Auth", () => {
  it("should register a new user", async () => {
    const response = await app
      .handle(
        new Request("http://localhost:1118/auth/sign-up", {
          method: "POST",
          body: JSON.stringify({
            username: "newuser",
            password: "test123456",
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      );

    expect(response.status).toBe(200);
  });

  it("should not register duplicate user", async () => {
    const response = await app
      .handle(
        new Request("http://localhost:1118/auth/sign-up", {
          method: "POST",
          body: JSON.stringify({
            username: "testuser",
            password: "test123456",
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      );

    expect(response.status).toBe(500);
  });

  it("should login with valid credentials", async () => {
    const response = await app
      .handle(
        new Request("http://localhost:1118/auth/sign-in", {
          method: "POST",
          body: JSON.stringify({
            username: "testuser",
            password: "test123456",
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      )
      .then(async (res) => await res.json());

    expect(response.token).toBeDefined();
    token = response.token;
  });

  it("should not login with invalid credentials", async () => {
    const response = await app
      .handle(
        new Request("http://localhost:1118/auth/sign-in", {
          method: "POST",
          body: JSON.stringify({
            username: "testuser",
            password: "wrongpassword",
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      );

    expect(response.status).toBe(500);
  });

  it("should get user list with token", async () => {
    const response = await app
      .handle(
        new Request("http://localhost:1118/auth/users?page=1&pageSize=10", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      )
      .then(async (res) => await res.json());

    expect(response.list).toBeDefined();
    expect(response.total).toBeDefined();
    expect(response.page).toBe(1);
    expect(response.pageSize).toBe(10);
    expect(Array.isArray(response.list)).toBe(true);
    expect(response.list.length).toBeGreaterThan(0);
  });

  it("should not get user list without token", async () => {
    const response = await app
      .handle(
        new Request("http://localhost:1118/auth/users?page=1&pageSize=10")
      );

    expect(response.status).toBe(500);
  });
});