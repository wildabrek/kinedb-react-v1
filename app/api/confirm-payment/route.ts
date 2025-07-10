import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// JSON dosyasının yolu (diğer API'ler ile aynı olmalı)
const dataFilePath = path.join(process.cwd(), 'data', 'ambassador-applications.json');

async function readApplications() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeApplications(data: any) {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

export async function POST(req: Request) {
  try {
    const { applicationId, packageName, billingInfo } = await req.json();

    if (!applicationId || !packageName || !billingInfo) {
      return NextResponse.json({ message: 'Eksik bilgi gönderildi.' }, { status: 400 });
    }

    const applications = await readApplications();
    const applicationIndex = applications.findIndex((app: any) => app.id === applicationId);

    if (applicationIndex === -1) {
      return NextResponse.json({ message: 'Başvuru bulunamadı.' }, { status: 404 });
    }

    // Başvuruyu güncelle
    const originalApplication = applications[applicationIndex];
    originalApplication.status = `${packageName}-pending`; // Örn: "Gold-pending"
    originalApplication.billingInfo = billingInfo; // Fatura bilgilerini ekle
    originalApplication.paymentDeclaredAt = new Date().toISOString(); // Ödeme bildirim tarihini ekle

    applications[applicationIndex] = originalApplication;

    await writeApplications(applications);

    return NextResponse.json({ success: true, data: originalApplication });

  } catch (error) {
    console.error('Ödeme tamamlama hatası:', error);
    return NextResponse.json({ message: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}