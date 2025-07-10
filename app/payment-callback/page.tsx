// app/payment-callback/page.tsx

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failure">("loading");
  const [message, setMessage] = useState("Ödeme durumu kontrol ediliyor...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("failure");
      setMessage("Geçersiz ödeme bilgisi. Token bulunamadı.");
      return;
    }

    // Backend'e token'ı göndererek ödemeyi doğrula
    const verifyPayment = async () => {
      try {
        const response = await fetch("/api/payment-callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (response.ok && result.status === "success") {
          setStatus("success");
          setMessage("Ödemeniz başarıyla alındı. Siparişiniz oluşturuldu.");
        } else {
          setStatus("failure");
          setMessage(result.errorMessage || "Ödeme onayı sırasında bir hata oluştu.");
        }
      } catch (error) {
        setStatus("failure");
        setMessage("Sunucu ile iletişim kurulamadı. Lütfen daha sonra tekrar deneyin.");
      }
    };

    verifyPayment();
  }, [searchParams]);

  const renderStatus = () => {
    switch (status) {
      case "loading":
        return (
          <>
            <Loader className="w-16 h-16 animate-spin text-gray-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Lütfen Bekleyin</CardTitle>
            <p className="text-gray-600 mt-2">{message}</p>
          </>
        );
      case "success":
        return (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-600">Ödeme Başarılı!</CardTitle>
            <p className="text-gray-600 mt-2">{message}</p>
          </>
        );
      case "failure":
        return (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-red-600">Ödeme Başarısız</CardTitle>
            <p className="text-gray-600 mt-2">{message}</p>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center p-8">
        <CardHeader>{renderStatus()}</CardHeader>
        <CardContent>
          <Link href="/">
            <Button>Ana Sayfaya Dön</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}


// Suspense, useSearchParams'in client tarafında çalışmasını garantiler.
export default function PaymentCallbackPage() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <PaymentCallbackContent />
        </Suspense>
    )
}