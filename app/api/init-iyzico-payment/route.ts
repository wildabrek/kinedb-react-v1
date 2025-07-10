import { NextResponse } from "next/server"
import Iyzipay from "iyzipay"

// Iyzico ayarlarını environment variables'dan al
const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY!,
  secretKey: process.env.IYZICO_SECRET_KEY!,
  uri: process.env.IYZICO_BASE_URL!,
})

export async function POST(req: Request) {
  try {
    const { buyerInfo, planName, amount } = await req.json()

    // Her istek için benzersiz bir ID oluştur
    const conversationId = `conv_${Date.now()}_${Math.random()}`
    const basketId = `basket_${Date.now()}_${Math.random()}`

    // Iyzico'ya gönderilecek istek nesnesini oluştur
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: conversationId,
      price: amount,
      paidPrice: amount,
      currency: Iyzipay.CURRENCY.TRY,
      basketId: basketId,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      // Ödeme sonrası kullanıcının yönlendirileceği URL
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment-callback`,
      enabledInstallments: [2, 3, 6], // İzin verilen taksitler

      // Alıcı bilgileri (formdan gelen)
      buyer: {
        id: `buyer_${Date.now()}`,
        name: buyerInfo.firstName,
        surname: buyerInfo.lastName,
        gsmNumber: buyerInfo.phone,
        email: buyerInfo.email,
        identityNumber: "74300864791", // Gerçek projede kullanıcıdan alınmalı veya dinamik olmalı
        lastLoginDate: "2025-07-09 11:52:58",
        registrationDate: "2025-07-09 11:52:58",
        registrationAddress: `${buyerInfo.district}, ${buyerInfo.city}`,
        ip: "85.34.78.112", // Gerçek projede istek atan kullanıcının IP'si alınmalı
        city: buyerInfo.city,
        country: "Turkey",
        zipCode: "34732",
      },
      // Fatura ve Kargo Adresleri (örnek olarak aynı bilgiler kullanıldı)
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
      // Sepet Bilgileri
      basketItems: [
        {
          id: `item_${planName}`,
          name: `${planName} Elçi Paketi`,
          category1: "Eğitim",
          category2: "Elçi Programı",
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: amount,
        },
      ],
    }

    // Iyzico'nun callback tabanlı yapısını Promise'e çeviriyoruz
    const result = await new Promise<Iyzipay.CheckOutForm>((resolve, reject) => {
      iyzipay.checkoutForm.create(request, (err, result) => {
        if (err) return reject(err)
        resolve(result)
      })
    })

    // Frontend'e Iyzico'dan gelen sonucu gönder
    return NextResponse.json(result)

  } catch (error: any) {
    console.error("Iyzico payment initialization error:", error)
    return NextResponse.json({ status: "failure", errorMessage: error.message || "Bilinmeyen bir hata oluştu." }, { status: 500 })
  }
}