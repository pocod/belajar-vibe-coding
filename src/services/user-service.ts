import { db } from "../db";
import { users, sessions } from "../db/schema";
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

  static async login(data: any) {
    const { email, password } = data;

    // 1. Cari user berdasarkan email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new Error("user tidak ditemukan");
    }

    // 2. Verifikasi password
    const isPasswordValid = await Bun.password.verify(password, user.password);
    if (!isPasswordValid) {
      throw new Error("user tidak ditemukan");
    }

    // 3. Generate token
    const token = crypto.randomUUID();
    
    // 4. Set expires_at (30 hari)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // 5. Simpan session
    await db.insert(sessions).values({
      token,
      userId: user.id,
      expiresAt,
    });

    return {
      message: "token user",
      token,
    };
  }
}
