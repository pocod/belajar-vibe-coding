import { Elysia, t } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .get("/users", async () => {
    return await db.select().from(users);
  })
  .post("/users", async ({ body }) => {
    return await db.insert(users).values(body);
  }, {
    body: t.Object({
      name: t.String()
    })
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
