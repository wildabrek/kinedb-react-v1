import React, { useState, useEffect } from 'react';

const IyzicoPayment = () => {
  const [iyzicoContent, setIyzicoContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Ödeme formunu başlatmak için butona tıklanınca
  const handlePay = async () => {
    setIsLoading(true);
    // 1. Kendi backend'inize istek atın
    const response = await fetch('../api/init-iyzico-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ cartItems, buyerInfo, totalAmount })
    });
    const data = await response.json();

    if (data.status === 'success') {
      // 2. Iyzico'dan gelen HTML içeriğini state'e kaydedin
      setIyzicoContent(data.checkoutFormContent);
    } else {
      alert('Ödeme başlatılamadı.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Iyzico içeriği geldiğinde, içindeki script'i çalıştırmak gerekir.
    // Bu, formun ekranda bir katman olarak açılmasını sağlar.
    if (iyzicoContent) {
      const script = document.createElement('script');
      script.innerHTML = `
        (function (w, d, s, o, f, js, fjs) {
            w['IyziThreedsObject'] = o; w[o] = w[o] || function () { (w[o].q = w[o].q || []).push(arguments) };
            js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
            js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);
        }(window, document, 'script', 'iyzi3ds', 'https://static.iyzipay.com/threedsv2/challenge.js'));
      `;
      document.body.appendChild(script);
    }
  }, [iyzicoContent]);

  return (
    <div>
      <button onClick={handlePay} disabled={isLoading}>
        {isLoading ? 'Yükleniyor...' : 'Iyzico ile Öde'}
      </button>

      {/* Iyzico'dan gelen form içeriğini render etmek için */}
      {iyzicoContent && (
        <div id="iyzipay-checkout-form" className="popup"
             dangerouslySetInnerHTML={{ __html: iyzicoContent }} />
      )}
    </div>
  );
};