import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

// Kullanıcı verilerinin saklanacağı dosyanın yolu
const usersFilePath = path.resolve(process.cwd(), 'data', 'users.json');

// Helper fonksiyonlar
async function readUsers() {
  try {
    await fs.mkdir(path.dirname(usersFilePath), { recursive: true });
    const fileContent = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(usersFilePath, "[]", "utf-8");
      return [];
    }
    throw error;
  }
}

async function writeUsers(data: any[]): Promise<void> {
  await fs.writeFile(usersFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function POST(request: Request) {
  try {
    const { name, email, password, role, ambassadorId } = await request.json();

    if (!name || !email || !password || !role || !ambassadorId) {
      return NextResponse.json({ error: "Eksik bilgi gönderildi." }, { status: 400 });
    }

    const users = await readUsers();

    // E-postanın daha önce kullanılıp kullanılmadığını kontrol et
    const existingUser = users.find((user: any) => user.email === email.toLowerCase());
    if (existingUser) {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kullanılıyor." }, { status: 409 });
    }

    // Şifreyi güvenli bir şekilde hash'le
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: `USR-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      ambassadorId, // Bu kullanıcıyı kaydeden elçinin ID'si
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    users.push(newUser);
    await writeUsers(users);

    // Başarılı cevapta şifreyi geri gönderme
    const { password: _, ...userToReturn } = newUser;

    return NextResponse.json({ success: true, user: userToReturn }, { status: 201 });

  } catch (error) {
    console.error("User registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
