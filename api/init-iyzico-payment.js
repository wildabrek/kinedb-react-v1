// /api/init-iyzico-payment.js
const Iyzipay = require('iyzipay');
const express = require('express');

const app = express();
app.use(express.json());

const iyzipay = new Iyzipay({
  apiKey: 'YOUR_IYZICO_API_KEY',     // .env dosyasında saklayın
  secretKey: 'YOUR_IYZICO_SECRET_KEY', // .env dosyasında saklayın
  uri: 'https://sandbox-api.iyzipay.com' // Canlıda 'https://api.iyzipay.com' olacak
});

app.post('/api/init-iyzico-payment', (req, res) => {
  const { cartItems, buyerInfo, totalAmount } = req.body;
  const conversationId = 'CONVERSATION_ID_' + Math.random(); // Her istek için benzersiz olmalı

  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: conversationId,
    price: totalAmount, // Sepetin indirimsiz toplam tutarı
    paidPrice: totalAmount, // Ödenecek nihai tutar
    currency: Iyzipay.CURRENCY.TRY,
    basketId: 'BASKET_' + Math.random(),
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    callbackUrl: 'https://www.sizinsiteniz.com/iyzico-callback', // Ödeme sonrası dönülecek URL
    enabledInstallments: [2, 3, 6, 9], // İzin verilen taksit sayıları

    buyer: { // Alıcı bilgileri
      id: buyerInfo.id,
      name: buyerInfo.firstName,
      surname: buyerInfo.lastName,
      gsmNumber: buyerInfo.phone,
      email: buyerInfo.email,
      identityNumber: '74300864791', // TC kimlik no
      lastLoginDate: '2025-07-09 11:52:58',
      registrationDate: '2023-04-21 15:12:09',
      registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
      ip: req.ip,
      city: 'Istanbul',
      country: 'Turkey',
      zipCode: '34732'
    },
    // ... Diğer adres ve ürün bilgileri Iyzico dokümanlarındaki gibi eklenir.
    basketItems: cartItems.map(item => ({
      id: item.id,
      name: item.name,
      category1: item.category,
      itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
      price: item.price
    }))
  };

  iyzipay.checkoutForm.create(request, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(result); // Bu result içinde 'checkoutFormContent' bulunur
  });
});