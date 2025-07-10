// app/api/iyzico-payment-init/route.ts

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";

// Iyzico API Bilgileri
const IYZICO_API_KEY = process.env.IYZICO_API_KEY!;
const IYZICO_SECRET_KEY = process.env.IYZICO_SECRET_KEY!;
const IYZICO_BASE_URL = process.env.IYZICO_BASE_URL!;

// Iyzico için güvenlik başlıklarını (headers) oluşturan fonksiyon
function generateIyzicoHeaders(requestBody: string) {
  const randomString = crypto.randomUUID();

  // Signature oluşturma: API Anahtarı + Rastgele Dize + Gizli Anahtar + İstek Gövdesi
  const signatureData = IYZICO_API_KEY + randomString + IYZICO_SECRET_KEY + requestBody;
  const signature = crypto.createHash('sha1').update(signatureData).digest('base64');

  return {
    "Authorization": `IYZV2 ${IYZICO_API_KEY}:${signature}`,
    "x-iyzi-rnd": randomString,
    "Content-Type": "application/json",
  };
}

export async function POST(req: Request) {
  try {
    const { buyerInfo, cartItems, totalAmount } = await req.json();

    if (!buyerInfo || !cartItems || !totalAmount) {
      return NextResponse.json({ status: "failure", errorMessage: "Eksik istek verisi." }, { status: 400 });
    }

    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";

    const requestPayload = {
      locale: 'tr',
      conversationId: `conv_${Date.now()}`,
      price: totalAmount.toString(),
      paidPrice: totalAmount.toString(),
      currency: 'TRY',
      basketId: `basket_${Date.now()}`,
      paymentGroup: 'PRODUCT',
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment-callback`,
      enabledInstallments: [2, 3, 6],
      buyer: {
        id: `buyer_${Date.now()}`,
        name: buyerInfo.firstName,
        surname: buyerInfo.lastName,
        gsmNumber: buyerInfo.phone,
        email: buyerInfo.email,
        identityNumber: "74300864791",
        lastLoginDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
        registrationDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
        registrationAddress: `${buyerInfo.district}, ${buyerInfo.city}`,
        ip: ip,
        city: buyerInfo.city,
        country: "Turkey",
        zipCode: "34732",
      },
      shippingAddress: {
        contactName: `${buyerInfo.firstName} ${buyerInfo.lastName}`,
        city: buyerInfo.city,
        country: "Turkey",
        address: `${buyerInfo.district}, ${buyerInfo.city}`,
        zipCode: "34732",
      },
      billingAddress: {
        contactName: `${buyerInfo.firstName} ${buyerInfo.lastName}`,
        city: buyerInfo.city,
        country: "Turkey",
        address: `${buyerInfo.district}, ${buyerInfo.city}`,
        zipCode: "34732",
      },
      basketItems: cartItems.map((item: any) => ({
        id: `item_${item.name.replace(/\s+/g, '_')}`,
        name: `${item.name} Elçi Paketi`,
        category1: "Eğitim",
        itemType: 'VIRTUAL',
        price: item.price.toString(),
      })),
    };

    const requestBodyString = JSON.stringify(requestPayload);
    const iyzicoHeaders = generateIyzicoHeaders(requestBodyString);

    // Iyzico API'sine doğrudan fetch ile istek gönder
    const response = await fetch(`${IYZICO_BASE_URL}/payment/iyzipos/checkoutform/initialize/ecom`, {
        method: 'POST',
        headers: iyzicoHeaders,
        body: requestBodyString,
    });

    const result = await response.json();

    if (result.status !== 'success') {
        throw new Error(result.errorMessage || 'Iyzico API hatası.');
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Iyzico Ödeme Başlatma Hatası:", error);
    return NextResponse.json(
      { status: "failure", errorMessage: error.message || "Bilinmeyen bir sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}