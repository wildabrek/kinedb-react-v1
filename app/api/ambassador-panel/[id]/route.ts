import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Bu API rotası, dosya sistemine eriştiği için Node.js ortamında çalışmalıdır.
export const runtime = 'nodejs';

// Veri dizininin yolunu tanımla
const dataDir = path.resolve(process.cwd(), 'data', 'ambassadors');

// Yardımcı fonksiyon: Veri dizininin var olduğundan emin ol
async function ensureDirectoryExists() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error("Error ensuring data directory exists:", error);
    // Bu kritik bir hata olduğu için yukarıya fırlatılabilir veya özel olarak ele alınabilir.
    throw new Error("Could not create or access the data directory.");
  }
}

// GET: Elçi panel verisini getir
export async function GET(
  request: Request,
  context: { params: { id: string } } // HATA DÜZELTİLDİ: Fonksiyon imzası güncellendi.
) {
  try {
    const { id } = context.params; // HATA DÜZELTİLDİ: Parametre 'context' üzerinden alınıyor.

    if (!id) {
      return NextResponse.json({ error: 'Ambassador ID is required' }, { status: 400 });
    }

    await ensureDirectoryExists(); // Dizinin varlığını kontrol et
    const filePath = path.join(dataDir, `${id}.json`);

    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // Hata mesajı daha anlaşılır hale getirildi.
      return NextResponse.json(
        { error: `Ambassador panel not found for ID: ${context.params.id}` },
        { status: 404 }
      );
    }

    console.error("Error fetching ambassador panel data:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Elçi panel verisini güncelle
export async function PUT(
  request: Request,
  context: { params: { id: string } } // HATA DÜZELTİLDİ: Fonksiyon imzası güncellendi.
) {
  try {
    const { id } = context.params; // HATA DÜZELTİLDİ: Parametre 'context' üzerinden alınıyor.
    const body = await request.json();

    if (!id) {
        return NextResponse.json({ error: 'Ambassador ID is required' }, { status: 400 });
    }

    await ensureDirectoryExists(); // Dizinin varlığını kontrol et
    const filePath = path.join(dataDir, `${id}.json`);

    let panelData;
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        panelData = JSON.parse(fileContent);
    } catch (readError: any) {
        // Eğer dosya bulunamazsa, yeni bir dosya oluşturmak için boş bir obje ile başla
        if (readError.code === 'ENOENT') {
            panelData = { performance: { pendingEarnings: 0 }, payment: { paymentRequests: [] } };
        } else {
            throw readError; // Diğer okuma hatalarını fırlat
        }
    }


    // Ödeme bilgileri güncellemesi
    if (body.paymentInfo) {
      panelData.payment.paymentInfo = body.paymentInfo;
    }

    // Yeni ödeme talebi oluşturma
    if (body.newPaymentRequest) {
      const amountToRequest = Number(body.newPaymentRequest.amount);
      if (isNaN(amountToRequest) || amountToRequest <= 0) {
        return NextResponse.json({ error: 'Invalid payment request amount' }, { status: 400 });
      }

      if (panelData.performance.pendingEarnings >= amountToRequest) {
        const newRequest = {
          requestId: `REQ-${Date.now()}`,
          amount: amountToRequest,
          requestedAt: new Date().toISOString(),
          status: "pending"
        };
        panelData.payment.paymentRequests.push(newRequest);
        panelData.performance.pendingEarnings -= amountToRequest;
      } else {
        return NextResponse.json({ error: 'Insufficient balance for payment request' }, { status: 400 });
      }
    }

    await fs.writeFile(filePath, JSON.stringify(panelData, null, 2), 'utf-8');
    return NextResponse.json({ success: true, data: panelData });
  } catch (error: any) {
    console.error("Error updating ambassador panel data:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
