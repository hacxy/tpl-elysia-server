import { t } from "elysia";

export namespace AuthModel {
  export const AccountBody = t.Object({
    username: t.String({ minLength: 3, maxLength: 20 }),
    password: t.String({ minLength: 6, maxLength: 50 }),
  });

  export const signInResponse = t.Object({
    token: t.String({
      description: "Token",
      example: "1234567890abcdefghijklmnopqrstuvwxyz",
    }),
  });
}
