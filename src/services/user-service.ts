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

  static async getCurrentUser(token: string) {
    // 1. Cari session yang valid dan join dengan user
    const [result] = await db
      .select({
        user: {
          id: users.id,
          name: users.name,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        expiresAt: sessions.expiresAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.token, token))
      .limit(1);

    if (!result) {
      throw new Error("user tidak ditemukan");
    }

    // 2. Cek apakah session sudah expired
    if (new Date(result.expiresAt) < new Date()) {
      throw new Error("user tidak ditemukan");
    }

    // 3. Return data sesuai spesifikasi
    return {
      data: {
        id: result.user.id,
        name: result.user.name,
        created_at: result.user.createdAt,
        updated_at: result.user.updatedAt,
      },
      message: "user berhasil ditemukan",
    };
  }
}
