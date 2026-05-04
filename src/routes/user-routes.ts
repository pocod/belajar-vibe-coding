import { Elysia, t } from "elysia";
import { UserService } from "../services/user-service";

export const userRoutes = new Elysia({ prefix: "/users" })
  .post("/", async ({ body, set }) => {
    try {
      const result = await UserService.register(body);
      return result;
    } catch (error: any) {
      if (error.message === "Email Sudah terdaftar") {
        set.status = 400; // Bad Request atau 409 Conflict
        return { message: error.message };
      }
      
      set.status = 500;
      return { message: "Internal Server Error" };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String(),
    })
  });
