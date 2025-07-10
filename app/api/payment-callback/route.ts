// app/api/payment-callback/route.ts

import { NextResponse } from "next/server";
import Iyzipay from "iyzipay";

// Iyzico Konfigürasyonu (diğer API dosyasındakiyle aynı)
const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY!,
  secretKey: process.env.IYZICO_SECRET_KEY!,
  uri: process.env.IYZICO_BASE_URL!,
});

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ status: "failure", errorMessage: "Eksik token." }, { status: 400 });
    }

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: `conv_verify_${Date.now()}`,
      token: token,
    };

    // Iyzico'dan ödeme detaylarını al
    const result = await new Promise<Iyzipay.Response.CheckoutForm>((resolve, reject) => {
      iyzipay.checkoutForm.retrieve(request, (err, result) => {
        if (err) return reject(err);
        if (!result) return reject(new Error("Iyzico'dan geçerli bir doğrulama yanıtı alınamadı."));
        resolve(result);
      });
    });

    // Ödeme durumunu kontrol et
    if (result.paymentStatus === "SUCCESS") {
      // ---- VERİTABANI İŞLEMLERİ ----
      // Bu noktada siparişi veritabanına kaydedebilir,
      // kullanıcının elçilik durumunu güncelleyebilir
      // veya bir e-posta gönderebilirsiniz.
      // Örnek: console.log(`Başarılı ödeme. Sipariş ID: ${result.basketId}`);
      // -----------------------------

      return NextResponse.json({ status: "success", message: "Ödeme başarıyla doğrulandı." });
    } else {
      return NextResponse.json(
        { status: "failure", errorMessage: `Ödeme başarısız veya beklemede. Durum: ${result.status}, Hata: ${result.errorMessage}` },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error("Iyzico Doğrulama Hatası:", error);
    return NextResponse.json(
      { status: "failure", errorMessage: error.message || "Bilinmeyen bir sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}