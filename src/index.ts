import { Elysia } from "elysia";
import { userRoutes } from "./routes/user-routes";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .group("/api", app => app.use(userRoutes))
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
