import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export class UserService {
  static async register(data: any) {
    const { name, email, password } = data;

    // 1. Cek apakah email sudah terdaftar
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("Email Sudah terdaftar");
    }

    // 2. Hash password (menggunakan fitur bawaan Bun)
    const hashedPassword = await Bun.password.hash(password);

    // 3. Simpan ke database
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });

    return { message: "user berhasil dibuat" };
  }
}
