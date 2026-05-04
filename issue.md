# Task: Implementasi Fitur Login User

## Deskripsi
Implementasikan fitur login user. Tugas ini mencakup pembuatan schema database untuk menyimpan data session, pembuatan fungsi logika bisnis untuk autentikasi (verifikasi email & password), dan pembuatan API endpoint untuk login.

## 1. Schema Database
Buat definisi tabel `sessions` menggunakan Drizzle ORM (pada file `src/db/schema.ts`).
**Tabel:** `sessions`
**Kolom:**
- `id`: int, primary key, auto increment
- `token`: varchar(255)
- `user_id`: int (Foreign Key merujuk ke tabel `users`)
- `expires_at`: datetime
- `created_at`: datetime (default current timestamp)
- `updated_at`: datetime (default current timestamp, on update current timestamp)

*Instruksi:* Tambahkan schema tabel ini beserta relasinya (FK ke tabel users), lalu jalankan perintah migrasi (`generate` dan `push`) agar tabel terbentuk di database MySQL.

## 2. Struktur Folder & File
Pertahankan struktur file yang sudah ada:
- `src/routes/`: Lanjutkan bekerja di `user-routes.ts`.
- `src/services/`: Lanjutkan bekerja di `user-service.ts`.

## 3. Spesifikasi API Login
Tambahkan endpoint API baru untuk login.

- **Endpoint:** `POST /users/login`

**Request Body (JSON):**
```json
{
    "email": "contoh@email.com",
    "password": "password_rahasia"
}
```

**Response Body (Success):**
```json
{
    "message": "token user",
    "token": "string_token_yang_digenerate"
}
```

**Response Body (Error - Jika user tidak ada atau password salah):**
```json
{
    "message": "user tidak ditemukan"
}
```

## 4. Tahapan Implementasi (Langkah demi Langkah)
Ikuti instruksi ini secara berurutan:

1. **Langkah 1: Setup Schema Database (`sessions`)**
   - Buka file `src/db/schema.ts`.
   - Definisikan tabel `sessions` dengan spesifikasi kolom di atas. Gunakan referensi `.references(() => users.id)` untuk kolom `user_id`.
   - Jalankan script push database (misalnya `bun run db:push`) untuk memperbarui skema di database.

2. **Langkah 2: Update Service Layer (`src/services/user-service.ts`)**
   - Tambahkan fungsi statis baru (misalnya `login`) di dalam class `UserService`.
   - Di dalam fungsi tersebut, cari data user di tabel `users` berdasarkan `email` yang dikirim.
   - Jika user tidak ditemukan, throw error dengan pesan `"user tidak ditemukan"`.
   - Jika user ditemukan, verifikasi kecocokan `password` input dengan password hash di database (gunakan `Bun.password.verify` karena saat register menggunakan Bun password).
   - Jika password tidak cocok, throw error yang sama: `"user tidak ditemukan"`.
   - Jika verifikasi sukses, buat (generate) sebuah token unik yang acak (contoh: menggunakan `crypto.randomUUID()`).
   - Tentukan waktu kedaluwarsa token (`expires_at`), misalnya 30 hari dari sekarang.
   - Insert data session baru (menyimpan `token`, `user_id`, dan `expires_at`) ke dalam tabel `sessions`.
   - Kembalikan object sukses yang berisi `message: "token user"` dan token yang baru dibuat.

3. **Langkah 3: Update Route Layer (`src/routes/user-routes.ts`)**
   - Buka `src/routes/user-routes.ts`.
   - Karena instance sudah memiliki prefix `/users`, cukup tambahkan `.post("/login", ...)` di instance tersebut.
   - Tambahkan validasi body (menggunakan `t.Object`) untuk memastikan `email` dan `password` disediakan dengan tipe string.
   - Panggil fungsi `login` dari `UserService` di dalam handler.
   - Bungkus dalam blok try-catch. Jika catch menangkap error dengan pesan `"user tidak ditemukan"`, atur status HTTP ke 401 (Unauthorized) atau 404 (Not Found), lalu kembalikan JSON error sesuai spesifikasi.

4. **Langkah 4: Testing**
   - Jalankan server.
   - Lakukan request login dengan email yang salah. Pastikan kembalian JSON-nya `"user tidak ditemukan"`.
   - Lakukan request login dengan email benar tapi password salah. Pastikan error-nya sama.
   - Lakukan request login sukses. Pastikan mendapatkan JSON token dan data tersimpan di tabel `sessions`.
