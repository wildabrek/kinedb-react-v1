export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// GET: Elçi panel verisini getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Ambassador ID is required' }, { status: 400 });
    }

    const filePath = path.resolve(process.cwd(), 'data', 'ambassadors', `${id}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { error: `Ambassador panel not found for ID: ${error?.path?.split('/').pop()?.replace('.json', '') || 'unknown'}` },
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const filePath = path.resolve(process.cwd(), 'data', 'ambassadors', `${id}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const panelData = JSON.parse(fileContent);

    // Ödeme bilgileri güncellemesi
    if (body.paymentInfo) {
      panelData.payment.paymentInfo = body.paymentInfo;
    }

    // Yeni ödeme talebi oluşturma
    if (body.newPaymentRequest) {
      const amountToRequest = body.newPaymentRequest.amount;
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
        return NextResponse.json({ error: 'Yetersiz bakiye' }, { status: 400 });
      }
    }

    await fs.writeFile(filePath, JSON.stringify(panelData, null, 2), 'utf-8');
    return NextResponse.json({ success: true, data: panelData });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: 'Ambassador panel not found' }, { status: 404 });
    }

    console.error("Error updating ambassador panel data:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
