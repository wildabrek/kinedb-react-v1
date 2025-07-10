"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader, AlertCircle, Users, Copy, ArrowLeft, Check, ShoppingCart, PartyPopper, Hourglass } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from "@/contexts/language-context";
import LanguageSwitcher from "@/components/language-switcher";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PackageData { name: string; description: string; price: number; students: number; perStudent: number; total: number; totalTL: number; bgColor: string; borderColor: string; textColor: string; }
interface Application { id: string; status: string; packageName: string; price: number; firstName: string; lastName: string; }
interface BillingData { name: string; address: string; taxOffice: string; taxNumber: string; }

const allPackages: PackageData[] = [
    { name: "Bronze", description: "Başlangıç seviyesi elçi", price: 250, students: 50, perStudent: 7, total: 350, totalTL: 13650, bgColor: "bg-amber-50", borderColor: "border-amber-300", textColor: "text-amber-800" },
    { name: "Silver", description: "Deneyimli elçi", price: 500, students: 200, perStudent: 6, total: 1200, totalTL: 46800, bgColor: "bg-gray-50", borderColor: "border-gray-300", textColor: "text-gray-800" },
    { name: "Gold", description: "Uzman elçi", price: 950, students: 500, perStudent: 5, total: 2500, totalTL: 97500, bgColor: "bg-yellow-50", borderColor: "border-yellow-300", textColor: "text-yellow-800" },
    { name: "Diamond", description: "Elite elçi", price: 1850, students: 1000, perStudent: 4, total: 4000, totalTL: 156000, bgColor: "bg-purple-50", borderColor: "border-purple-300", textColor: "text-purple-800" },
];
const bankInfo = { accountHolder: "SİZİN ŞİRKETİNİZİN VEYA ŞAHSINIZIN ADI SOYADI", iban: "TRXX XXXX XXXX XXXX XXXX XXXX XX" };

export default function PaymentPage() {
    const params = useParams();
    const basvuruId = params.basvuruId as string;
    const { translate: t } = useLanguage();

    const [application, setApplication] = useState<Application | null>(null);
    const [cart, setCart] = useState<PackageData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [billingInfo, setBillingInfo] = useState<BillingData>({ name: '', address: '', taxOffice: '', taxNumber: '' });
    const [isCompleting, setIsCompleting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

    const scrollToTop = () => { window.scrollTo({ top: 0, behavior: "smooth" }); };
    const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { const { name, value } = e.target; setBillingInfo(prev => ({ ...prev, [name]: value })); };
    
    useEffect(() => { if (application) { setBillingInfo(prev => ({...prev, name: `${application.firstName} ${application.lastName}`})); } }, [application]);
    useEffect(() => {
        async function fetchApplication() {
            if (!basvuruId) return;
            try {
                const response = await fetch(`/api/get-application/${basvuruId}`);
                if (!response.ok) { const err = await response.json(); throw new Error(err.message || "Başvuru bilgileri alınamadı."); }
                const data: Application = await response.json();
                setApplication(data);
            } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
        }
        fetchApplication();
    }, [basvuruId]);
    useEffect(() => { if (application?.status === 'approved') { const approvedPackage = allPackages.find(p => p.name === application.packageName); if (approvedPackage) { setCart([approvedPackage]); } } }, [application]);

    const handleSelectPackage = (selectedPackage: PackageData) => { setCart([selectedPackage]); toast({ title: "Paket Seçildi", description: `${selectedPackage.name} paketi ödeme için seçildi.` }); };
    const handleCopyIban = () => { navigator.clipboard.writeText(bankInfo.iban.replace(/\s/g, '')); toast({ title: "IBAN Kopyalandı", description: "Banka IBAN numarası panoya kopyalandı."}); };
    const handleCompletePayment = async () => {
        if (cart.length === 0 || !application) { toast({ title: "Hata", description: "Lütfen bir paket seçin.", variant: "destructive" }); return; }
        if (!billingInfo.name || !billingInfo.address || !billingInfo.taxNumber) { toast({ title: "Eksik Fatura Bilgisi", description: "Lütfen fatura için gerekli alanları doldurun.", variant: "destructive" }); return; }
        setIsCompleting(true);
        try {
            const response = await fetch('/api/ambassador-applications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: application.id, status: `${cart[0].name}-pending`, billingInfo, paymentDeclaredAt: new Date().toISOString() }),
            });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "İşlem tamamlanamadı."); }
            setIsCompleted(true);
        } catch (err: any) { toast({ title: "Hata", description: err.message, variant: "destructive"});
        } finally { setIsCompleting(false); }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader className="w-12 h-12 animate-spin" /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center p-4"><Card className="w-full max-w-md text-center p-6 bg-red-50 border-red-200"><AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4"/><h2 className="text-xl font-semibold text-red-800">Hata</h2><p className="text-red-700">{error}</p></Card></div>;
    if (!application) return <div className="min-h-screen flex items-center justify-center p-4"><Card className="w-full max-w-md text-center p-6"><p>Başvuru bulunamadı.</p></Card></div>;

    if (isCompleted) return <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4"><Card className="w-full max-w-lg text-center p-6"><CardHeader><PartyPopper className="w-16 h-16 text-green-500 mx-auto mb-4" /><CardTitle className="text-2xl">Bildiriminiz Alındı!</CardTitle></CardHeader><CardContent><p className="mb-6 text-gray-700">Ödemeyi yaptığınıza dair bildiriminiz başarıyla tarafımıza ulaşmıştır. Banka hesapları kontrol edildikten sonra üyeliğiniz en kısa sürede aktif edilecektir.</p><Link href="/"><Button><ArrowLeft className="w-4 h-4 mr-2" />Ana Sayfaya Dön</Button></Link></CardContent></Card></div>;
    
    if (application.status !== 'approved') {
        if (application.status.includes('-pending')) {
            const packageName = application.status.split('-')[0];
            return <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4"><Card className="w-full max-w-md text-center p-6 bg-blue-50 border-blue-200"><Hourglass className="w-12 h-12 text-blue-500 mx-auto mb-4"/><h2 className="text-xl font-semibold text-blue-800">Ödeme Onayı Bekleniyor</h2><p className="text-blue-700 mt-2"><span className="font-bold">{packageName}</span> paketi için ödeme yaptığınıza dair bildiriminiz alınmıştır.</p><p className="text-sm text-gray-600 mt-4">Ödemeniz banka hesaplarında doğrulandıktan sonra üyeliğiniz en kısa sürede aktif edilecektir.</p></Card></div>;
        }
        return <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4"><Card className="w-full max-w-md text-center p-6 bg-yellow-50 border-yellow-200"><AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4"/><h2 className="text-xl font-semibold text-yellow-800">Başvuru Beklemede</h2><p className="text-yellow-700">Başvurunuz henüz ilk onayı almamıştır veya reddedilmiştir. Onay durumunda size e-posta ile bilgi verilecektir.</p></Card></div>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/95 backdrop-blur-sm px-4 md:px-6 w-full shadow-sm"><button onClick={scrollToTop} className="flex items-center gap-2"><Image src="/kinekids-logo.png" alt="KineKids Logo" width={32} height={32} /><span className="text-xl font-bold">KineKids</span></button><div className="flex items-center gap-4 ml-auto"><Link href="/"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-2"/>{t("backToHome")}</Button></Link><LanguageSwitcher/></div></header>
            <main className="flex-1 bg-gradient-to-br from-blue-50 to-white">
                <div className="max-w-6xl mx-auto py-12 px-4 space-y-12">
                    <div className="text-center"><h1 className="text-3xl font-bold">Elçilik Başvurusu Ödemesi</h1><p className="text-gray-600 mt-2">Merhaba {application.firstName}, başvurunuz onaylandı! Lütfen ödemenizi tamamlayın.</p></div>
                    <Card className="w-full max-w-2xl mx-auto"><CardHeader><CardTitle>Fatura Bilgileri</CardTitle><CardDescription>Faturanızın doğru düzenlenebilmesi için lütfen aşağıdaki alanları doldurun.</CardDescription></CardHeader><CardContent className="space-y-4"><div><Label htmlFor="billingName">Faturanın Kesileceği İsim / Unvan</Label><Input id="billingName" name="name" value={billingInfo.name} onChange={handleBillingChange} /></div><div><Label htmlFor="billingAddress">Fatura Adresi</Label><Textarea id="billingAddress" name="address" value={billingInfo.address} onChange={handleBillingChange} /></div><div className="grid md:grid-cols-2 gap-4"><div><Label htmlFor="taxOffice">Vergi Dairesi</Label><Input id="taxOffice" name="taxOffice" value={billingInfo.taxOffice} onChange={handleBillingChange} /></div><div><Label htmlFor="taxNumber">Vergi / T.C. No</Label><Input id="taxNumber" name="taxNumber" value={billingInfo.taxNumber} onChange={handleBillingChange} /></div></div></CardContent></Card>
                    <Card className="w-full max-w-2xl mx-auto shadow-lg"><CardHeader><CardTitle>Banka Havalesi / EFT</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-6 items-center"><div className="space-y-4"><div className="p-4 bg-blue-50 rounded-lg"><p className="text-sm">Ödenecek Tutar</p><p className="text-3xl font-bold text-blue-600">{cartTotal} TL</p></div><div><Label className="text-xs">Hesap Sahibi</Label><p className="font-semibold">{bankInfo.accountHolder}</p></div><div><Label className="text-xs">IBAN</Label><div className="flex gap-2"><p className="font-mono flex-grow">{bankInfo.iban}</p><Button variant="outline" size="icon" onClick={handleCopyIban}><Copy className="w-4 h-4" /></Button></div></div><div className="p-4 bg-red-50 border-l-4 border-red-500"><p className="font-bold">ÖNEMLİ</p><p className="text-sm">Açıklama kısmına başvuru numaranızı yazınız: <strong className="cursor-pointer" onClick={() => navigator.clipboard.writeText(application.id)}>{application.id}</strong></p></div></div><div className="text-center"><p className="mb-2 text-sm">IBAN QR Kodu</p><div className="p-4 bg-white border rounded-lg inline-block"><QRCodeSVG value={bankInfo.iban.replace(/\s/g, '')} size={180} /></div></div></CardContent></Card>
                    <div><h2 className="text-2xl font-bold text-center mb-6">Paket Seçimini Değiştir</h2><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">{allPackages.map((pkg) => { const isSelected = cart[0]?.name === pkg.name; return (<Card key={pkg.name} className={`flex flex-col border-2 ${isSelected ? pkg.borderColor+' ring-2' : ''}`}><CardHeader className={`${pkg.bgColor} text-center`}><CardTitle>{pkg.name}</CardTitle><CardDescription>{pkg.description}</CardDescription></CardHeader><CardContent className="p-4 flex-grow flex flex-col justify-between"><div className="my-4"><p className="text-3xl font-bold">{pkg.price} TL</p></div><Button onClick={() => handleSelectPackage(pkg)} variant={isSelected ? "default" : "outline"}>{isSelected ? 'Seçildi' : 'Bu Paketi Seç'}</Button></CardContent></Card>);})}</div></div>
                    <div className="text-center pt-8 border-t"><p className="text-gray-600 mb-4">Ödemeyi gönderdikten sonra aşağıdaki butona basarak işlemi tamamlayın.</p><Button onClick={handleCompletePayment} disabled={isCompleting} size="lg" className="bg-green-600 hover:bg-green-700">{isCompleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> İşleniyor...</> : <><Check className="mr-2 h-4 w-4"/> Ödemeyi Yaptım, Tamamla</>}</Button></div>
                </div>
            </main>
            <footer className="w-full py-8 bg-gray-900 text-white"><div className="container px-4 md:px-6"><div className="flex justify-between items-center"><button onClick={scrollToTop} className="flex items-center gap-2"><Image src="/kinekids-logo.png" alt="KineKids Logo" width={24} height={24} /><span className="text-lg font-bold">KineKids</span></button><p className="text-xs text-gray-400">{t("copyright")}</p></div></div></footer>
        </div>
    );
}
