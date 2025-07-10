// app/api/register-student/route.ts

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Elçi ve öğrenci dosya yolu oluşturucu
function getFilePaths(ambassadorId: string) {
  const basePath = path.resolve(process.cwd(), 'data/ambassadors');
  return {
    studentFilePath: path.join(basePath, `${ambassadorId}-students.json`),
    ambassadorFilePath: path.join(basePath, `${ambassadorId}.json`)
  }
}

async function readJSON(filePath: string): Promise<any> {
  try {
    const file = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(file);
  } catch (error: any) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function writeJSON(filePath: string, data: any): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function updateBadgeProgress(badges: any[], increment: number) {
  return badges.map(badge => {
    const updated = { ...badge, progress: (badge.progress || 0) + increment };
    if (!updated.earned && updated.progress >= parseInt(updated.requirement)) {
      updated.earned = true;
    }
    return updated;
  });
}

function getEarningPerStudent(badges: any[]): number {
  const earned = badges.filter(b => b.earned);
  const hasDiamond = earned.some(b => b.name.includes("Diamond"));
  const hasGold = earned.some(b => b.name.includes("Gold"));
  const hasSilver = earned.some(b => b.name.includes("Silver"));
  const hasBronze = earned.some(b => b.name.includes("Bronze"));

  if (hasDiamond) return 4;
  if (hasGold) return 5;
  if (hasSilver) return 6;
  if (hasBronze) return 7;
  return 5; // varsayılan kazanç
}

export async function POST(request: Request) {
  try {
    const { schoolName, className, ambassadorId } = await request.json();

    if (!schoolName || !className || !ambassadorId) {
      return NextResponse.json({ error: "Eksik bilgi gönderildi." }, { status: 400 });
    }

    const { studentFilePath, ambassadorFilePath } = getFilePaths(ambassadorId);

    const anonymousId = `ANON-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const newStudent = {
      anonymousId,
      schoolName,
      className,
      ambassadorId,
      createdAt: new Date().toISOString(),
      paymentStatus: 'unpaid'
    };

    // 1. Öğrenciyi dosyaya ekle
    const existingStudents = (await readJSON(studentFilePath)) || [];
    existingStudents.push(newStudent);
    await writeJSON(studentFilePath, existingStudents);

    // 2. Elçi performansını güncelle
    const ambassador = await readJSON(ambassadorFilePath);
    if (!ambassador) {
      return NextResponse.json({ error: "Elçi bulunamadı." }, { status: 404 });
    }

    const earning = getEarningPerStudent(ambassador.gamification.badges);

    ambassador.performance.totalStudents += 1;
    ambassador.performance.thisMonthStudents += 1;
    ambassador.performance.totalEarnings += earning;

    ambassador.gamification.badges = updateBadgeProgress(ambassador.gamification.badges, 1);

    await writeJSON(ambassadorFilePath, ambassador);

    return NextResponse.json({ success: true, anonymousId }, { status: 201 });

  } catch (error) {
    console.error("Student registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { ambassadorId, studentId, updatedFields } = await request.json();

    if (!ambassadorId || !studentId || !updatedFields) {
      return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
    }

    const { studentFilePath, ambassadorFilePath } = getFilePaths(ambassadorId);
    const students = await readJSON(studentFilePath);
    if (!students) {
      return NextResponse.json({ error: "Öğrenci dosyası bulunamadı" }, { status: 404 });
    }

    const index = students.findIndex((s: any) => s.anonymousId === studentId);
    if (index === -1) {
      return NextResponse.json({ error: "Öğrenci bulunamadı" }, { status: 404 });
    }

    const prevStatus = students[index].paymentStatus;
    students[index] = { ...students[index], ...updatedFields };
    await writeJSON(studentFilePath, students);

    // Eğer ödeme durumu unpaid -> paid olduysa elçi kazancı artırılır
    if (prevStatus !== "paid" && updatedFields.paymentStatus === "paid") {
      const ambassador = await readJSON(ambassadorFilePath);
      if (!ambassador) {
        return NextResponse.json({ error: "Elçi verisi bulunamadı" }, { status: 404 });
      }

      const earning = getEarningPerStudent(ambassador.gamification.badges);
      ambassador.performance.totalEarnings += earning;

      await writeJSON(ambassadorFilePath, ambassador);
    }

    return NextResponse.json({ success: true, message: "Öğrenci güncellendi" });
  } catch (error) {
    console.error("Öğrenci güncelleme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ambassadorId = searchParams.get("ambassadorId");
    const studentId = searchParams.get("studentId");

    if (!ambassadorId || !studentId) {
      return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
    }

    const { studentFilePath, ambassadorFilePath } = getFilePaths(ambassadorId);

    const students = await readJSON(studentFilePath);
    if (!students) {
      return NextResponse.json({ error: "Öğrenci listesi bulunamadı" }, { status: 404 });
    }

    const index = students.findIndex((s: any) => s.anonymousId === studentId);
    if (index === -1) {
      return NextResponse.json({ error: "Öğrenci bulunamadı" }, { status: 404 });
    }

    students.splice(index, 1);
    await writeJSON(studentFilePath, students);

    // Elçi verilerini güncelle
    const ambassador = await readJSON(ambassadorFilePath);
    if (ambassador) {
      ambassador.performance.totalStudents = Math.max(0, ambassador.performance.totalStudents - 1);
      ambassador.performance.thisMonthStudents = Math.max(0, ambassador.performance.thisMonthStudents - 1);
      ambassador.gamification.badges = updateBadgeProgress(ambassador.gamification.badges, -1);
      await writeJSON(ambassadorFilePath, ambassador);
    }

    return NextResponse.json({ success: true, message: "Öğrenci silindi" });
  } catch (error) {
    console.error("Öğrenci silme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
