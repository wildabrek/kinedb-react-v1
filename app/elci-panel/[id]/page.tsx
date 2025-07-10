"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import {
  Crown, DollarSign, Users, TrendingUp, Copy, Share2, Award, Phone, User, Home,
  MessageCircle, HelpCircle, CheckCircle, Clock, Banknote, CreditCard, Loader2, AlertCircle, FileText
} from "lucide-react"

// Arayüzler
interface PanelData {
  id: string;
  account: { status: string; packageName: string; balance: number; };
  ambassadorInfo: { firstName: string; lastName: string; email: string; phone: string; };
  billingInfo: { name: string; address: string; taxOffice: string; taxNumber: string; };
  performance: { totalStudents: number; totalEarnings: number; pendingEarnings: number; thisMonthStudents: number; };
  payment: { paymentInfo: { method: string; iban: string; paypal: string; }; paymentRequests: any[]; paymentHistory: any[]; };
  engagement: { recentActivities: any[]; monthlyStats: any[]; gradeDistribution: any[]; };
  gamification: { badges: any[]; };
}

interface StudentData {
    anonymousId: string;
    name: string;
    schoolName: string;
    className: string;
    createdAt: string;
    paymentStatus: 'paid' | 'unpaid';
}

export default function ElciPanelPage() {
  const params = useParams();
  const ambassadorId = params.id as string;

  const [panelData, setPanelData] = useState<PanelData | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isRequestingPayment, setIsRequestingPayment] = useState(false);
  const [isPayingForStudent, setIsPayingForStudent] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [ibanInfo, setIbanInfo] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");

  const faqItems = [
    { question: "Ödemeler ne zaman yapılır?", answer: "Ödemeler her ayın ilk haftasında, minimum 50$ tutarında yapılır. Bakiyeniz 50$'ın altındaysa bir sonraki aya aktarılır." },
    { question: "Hangi ödeme yöntemlerini kullanabilirim?", answer: "IBAN (Türk bankası) veya PayPal hesabınıza ödeme yapabiliyoruz. Ödeme bilgilerinizi Ödemeler sekmesinden güncelleyebilirsiniz." },
    { question: "Yeni öğrenci eklediğimde kazancım ne zaman görünür?", answer: "Yeni bir öğrenci kaydı sisteme düştüğünde, kazancınız genellikle 24 saat içinde panelinizdeki 'Bekleyen Ödeme' bakiyenize yansır." },
  ];

  useEffect(() => {
    if (!ambassadorId) return;
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [panelRes, studentsRes] = await Promise.all([
          fetch(`/api/ambassador-panel/${ambassadorId}`),
          fetch(`/api/get-ambassador-students/${ambassadorId}`)
        ]);
        if (!panelRes.ok) throw new Error("Elçi paneli verileri bulunamadı.");
        if (!studentsRes.ok) throw new Error("Öğrenci verileri bulunamadı.");
        const panelData = await panelRes.json();
        const studentsData = await studentsRes.json();
        setPanelData(panelData);
        setStudents(studentsData);
        if (panelData.payment.paymentInfo) {
          setPaymentMethod(panelData.payment.paymentInfo.method);
          setIbanInfo(panelData.payment.paymentInfo.iban);
          setPaypalEmail(panelData.payment.paymentInfo.paypal);
        }
      } catch (err: any) { setError(err.message);
      } finally { setLoading(false); }
    };
    fetchAllData();
  }, [ambassadorId]);

  const combinedTransactions = useMemo(() => {
    if (!panelData) return [];
    const history = (panelData.payment.paymentHistory || []).map(item => ({ id: item.transactionId, date: item.paidAt, amount: item.amount, status: 'Ödendi', method: item.method }));
    const requests = (panelData.payment.paymentRequests || []).map(item => ({ id: item.requestId, date: item.requestedAt, amount: item.amount, status: 'Onay Bekliyor', method: 'Talep Edildi' }));
    const allTransactions = [...history, ...requests];
    allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return allTransactions;
  }, [panelData]);

  const handlePayForStudent = async (studentId: string) => {
    if (!panelData || panelData.account.balance < 9) {
        toast({ title: "Yetersiz Bakiye", description: "Ödeme yapmak için bakiyeniz yeterli değil.", variant: "destructive" });
        return;
    }
    setIsPayingForStudent(studentId);
    try {
        const response = await fetch('/api/pay-for-student', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ambassadorId, studentId })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Ödeme işlemi başarısız oldu.");
        }
        const { updatedPanelData, updatedStudents } = await response.json();
        setPanelData(updatedPanelData);
        setStudents(updatedStudents);
        toast({ title: "Ödeme Başarılı", description: "Öğrenci lisansı başarıyla ödendi.", className: "bg-green-100 text-green-800" });
    } catch (err: any) {
        toast({ title: "Hata", description: err.message, variant: "destructive" });
    } finally {
        setIsPayingForStudent(null);
    }
  };

  const handleSavePaymentInfo = async () => {
    setIsSavingInfo(true);
    try {
        const response = await fetch(`/api/ambassador-panel/${ambassadorId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                paymentInfo: { method: paymentMethod, iban: ibanInfo, paypal: paypalEmail }
            })
        });
        if (!response.ok) throw new Error("Bilgiler kaydedilemedi.");
        const updatedPanelData = await response.json();
        setPanelData(updatedPanelData.data);
        toast({ title: "Başarılı!", description: "Ödeme bilgileriniz güncellendi.", className: "bg-green-100 text-green-800"});
    } catch (err: any) {
        toast({ title: "Hata", description: err.message, variant: "destructive" });
    } finally {
        setIsSavingInfo(false);
    }
  };

  const handlePaymentRequest = async () => {
    if (!panelData || panelData.performance.pendingEarnings < 50) return;
    setIsRequestingPayment(true);
    try {
        const response = await fetch(`/api/ambassador-panel/${ambassadorId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                newPaymentRequest: { amount: panelData.performance.pendingEarnings }
            })
        });
        if (!response.ok) throw new Error("Ödeme talebi oluşturulamadı.");
        const updatedPanelData = await response.json();
        setPanelData(updatedPanelData.data);
        toast({ title: "Talebiniz Alındı", description: "Ödeme talebiniz incelenmek üzere gönderildi." });
    } catch (err: any) {
        toast({ title: "Hata", description: err.message, variant: "destructive" });
    } finally {
        setIsRequestingPayment(false);
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Kopyalandı!", description: message });
  };

  const shareWhatsApp = () => {
    const message = `KineKids'e katılın! Özel davet kodum: ${panelData?.id}\nLink: https://kinekids.com/register?ref=${panelData?.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  const shareFacebook = () => {
     const url = `https://kinekids.com/register?ref=${panelData?.id}`;
     window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-blue-500" /></div>;
  if (error) return <div className="flex h-screen items-center justify-center text-center"><Card className="p-8 bg-red-50 border-red-200"><AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600"/><h2 className="text-xl font-semibold text-red-800">Hata</h2><p className="text-red-700">{error}</p></Card></div>;
  if (!panelData) return <div className="flex h-screen items-center justify-center"><p>Elçi paneli verisi bulunamadı.</p></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4"><Crown className="h-12 w-12 text-amber-500 mr-3" /><h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Elçi Paneli</h1></div>
          <div className="flex items-center justify-center gap-4"><p className="text-xl text-gray-600">Hoş geldiniz, {panelData.ambassadorInfo.firstName} {panelData.ambassadorInfo.lastName}</p><Badge variant="secondary" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">{panelData.account.status === 'active' ? 'Aktif Elçi' : 'Onay Bekliyor'}</Badge></div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-7">
            <TabsTrigger value="dashboard">Ana Sayfa</TabsTrigger>
            <TabsTrigger value="profile">Profilim</TabsTrigger>
            <TabsTrigger value="referral">Davet Linki</TabsTrigger>
            <TabsTrigger value="stats">İstatistikler</TabsTrigger>
            <TabsTrigger value="badges">Rozetler</TabsTrigger>
            <TabsTrigger value="payments">Ödemeler</TabsTrigger>
            <TabsTrigger value="support">Destek</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 pt-6">
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"><Users className="h-8 w-8 mx-auto mb-2 text-blue-600" /><div className="text-2xl font-bold text-gray-800">{panelData.performance.totalStudents}</div><p className="text-gray-600 text-sm">Toplam Öğrenci</p></div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"><DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" /><div className="text-2xl font-bold text-gray-800">${panelData.performance.totalEarnings}</div><p className="text-gray-600 text-sm">Toplam Kazanç</p></div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center"><Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" /><div className="text-2xl font-bold text-gray-800">${panelData.performance.pendingEarnings}</div><p className="text-gray-600 text-sm">Bekleyen Ödeme</p></div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center"><TrendingUp className="h-8 w-8 mx-auto mb-2 text-red-600" /><div className="text-2xl font-bold text-gray-800">{panelData.performance.thisMonthStudents}</div><p className="text-gray-600 text-sm">Bu Ay</p></div>
            </div>
            <Card><CardHeader><CardTitle>Son Aktiviteler</CardTitle></CardHeader><CardContent><div className="space-y-4">{panelData.engagement.recentActivities.length > 0 ? panelData.engagement.recentActivities.map((activity, index) => (<div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div><p className="font-medium">{activity.student}</p><p className="text-sm text-gray-600">{activity.school} • {activity.date}</p></div><Badge variant="secondary" className="bg-green-100 text-green-800">+${activity.earnings}</Badge></div>)) : <p className="text-center text-gray-500 py-4">Henüz aktivite yok.</p>}</div></CardContent></Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-blue-600"/> Kişisel Bilgiler</CardTitle><CardDescription>Bu bilgiler başvuru sırasında verdiğiniz bilgilerdir.</CardDescription></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex justify-between border-b pb-2"><span className="text-gray-500">Ad Soyad</span><span className="font-medium">{panelData.ambassadorInfo.firstName} {panelData.ambassadorInfo.lastName}</span></div><div className="flex justify-between border-b pb-2"><span className="text-gray-500">E-posta</span><span className="font-medium">{panelData.ambassadorInfo.email}</span></div><div className="flex justify-between"><span className="text-gray-500">Telefon</span><span className="font-medium">{panelData.ambassadorInfo.phone}</span></div></CardContent></Card>
                 <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600"/> Fatura Bilgileri</CardTitle><CardDescription>Ödemeleriniz için faturaların düzenleneceği bilgiler.</CardDescription></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex justify-between border-b pb-2"><span className="text-gray-500">İsim / Unvan</span><span className="font-medium">{panelData.billingInfo.name}</span></div><div className="flex justify-between border-b pb-2"><span className="text-gray-500">Adres</span><span className="font-medium text-right max-w-[60%]">{panelData.billingInfo.address}</span></div><div className="flex justify-between border-b pb-2"><span className="text-gray-500">Vergi Dairesi</span><span className="font-medium">{panelData.billingInfo.taxOffice}</span></div><div className="flex justify-between"><span className="text-gray-500">Vergi / T.C. No</span><span className="font-medium">{panelData.billingInfo.taxNumber}</span></div></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="referral" className="space-y-6 pt-6">
            <Card><CardHeader><CardTitle>Davet Bilgileriniz</CardTitle><CardDescription>Öğrencilerinizi davet etmek için bu bilgileri kullanın.</CardDescription></CardHeader><CardContent className="space-y-4"><div><Label>Davet Kodunuz (Elçi ID)</Label><div className="flex gap-2 mt-1"><Input value={panelData.id} readOnly /><Button variant="outline" onClick={() => copyToClipboard(panelData.id, "Davet kodu kopyalandı!")}><Copy className="h-4 w-4" /></Button></div></div><div><Label>Davet Linkiniz</Label><div className="flex gap-2 mt-1"><Input value={`https://kinekids.com/register?ref=${panelData.id}`} readOnly /><Button variant="outline" onClick={() => copyToClipboard(`https://kinekids.com/register?ref=${panelData.id}`, "Davet linki kopyalandı!")}><Copy className="h-4 w-4" /></Button></div></div><div className="flex gap-4 pt-4"><Button onClick={shareWhatsApp} className="bg-green-600 hover:bg-green-700 text-white"><Share2 className="h-4 w-4 mr-2" />WhatsApp'ta Paylaş</Button><Button onClick={shareFacebook} className="bg-blue-600 hover:bg-blue-700 text-white"><Share2 className="h-4 w-4 mr-2" />Facebook'ta Paylaş</Button></div></CardContent></Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6 pt-6">
            <div className="grid md:grid-cols-2 gap-6"><Card><CardHeader><CardTitle>Sınıf Dağılımı</CardTitle></CardHeader><CardContent><div className="space-y-3">{panelData.engagement.gradeDistribution.length > 0 ? panelData.engagement.gradeDistribution.map((grade, index) => (<div key={index}><div className="flex justify-between text-sm mb-1"><span>{grade.grade}</span><span>{grade.count} öğrenci</span></div><Progress value={grade.percentage} className="h-2" /></div>)) : <p className="text-center text-gray-500 py-4">Veri yok.</p>}</div></CardContent></Card><Card><CardHeader><CardTitle>Aylık İstatistikler</CardTitle></CardHeader><CardContent><div className="space-y-3">{panelData.engagement.monthlyStats.length > 0 ? panelData.engagement.monthlyStats.map((stat, index) => (<div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded"><span className="font-medium">{stat.month}</span><Badge variant="secondary">{stat.students} öğrenci</Badge></div>)) : <p className="text-center text-gray-500 py-4">Veri yok.</p>}</div></CardContent></Card></div>
          </TabsContent>

          <TabsContent value="badges" className="space-y-6 pt-6">
            <div className="grid md:grid-cols-2 gap-6">{panelData.gamification.badges.map((badge, index) => (<Card key={index} className={badge.earned ? "border-green-200 bg-green-50" : ""}><CardHeader><div className="flex items-center gap-3"><Award className={`h-8 w-8 ${badge.earned ? "text-amber-500" : "text-gray-400"}`} /><div><CardTitle className={badge.earned ? "text-green-700" : ""}>{badge.name}</CardTitle><CardDescription>{badge.requirement}</CardDescription></div>{badge.earned && <CheckCircle className="h-6 w-6 text-green-600 ml-auto" />}</div></CardHeader><CardContent><div className="space-y-2"><div className="flex justify-between text-sm"><span>İlerleme</span><span>{badge.progress}%</span></div><Progress value={badge.progress} className="h-2" /></div></CardContent></Card>))}</div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6 pt-6">
            <Tabs defaultValue="receive-payment" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="make-payment">Ödeme Yap</TabsTrigger>
                <TabsTrigger value="receive-payment">Ödeme Al</TabsTrigger>
              </TabsList>
              <TabsContent value="make-payment" className="pt-4">
                <Card>
                  <CardHeader><div className="flex justify-between items-center"><div><CardTitle>Öğrenci Lisans Ödemeleri</CardTitle><CardDescription>Mevcut bakiyenizle öğrencilerinizin lisans ödemelerini yapın.</CardDescription></div><div className="text-right"><Label className="text-xs text-gray-500">Kullanılabilir Bakiye</Label><p className="text-2xl font-bold text-green-600">${panelData.account.balance}</p></div></div></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow><TableHead>Öğrenci</TableHead><TableHead>Okul</TableHead><TableHead>Durum</TableHead><TableHead className="text-right">İşlem</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow key={student.anonymousId}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.schoolName} / {student.className}</TableCell>
                            <TableCell><Badge variant={student.paymentStatus === 'paid' ? 'success' : 'destructive'}>{student.paymentStatus === 'paid' ? 'Ödendi' : 'Ödenmedi'}</Badge></TableCell>
                            <TableCell className="text-right">{student.paymentStatus === 'unpaid' ? (<Button size="sm" onClick={() => handlePayForStudent(student.anonymousId)} disabled={isPayingForStudent === student.anonymousId || panelData.account.balance < 9}>{isPayingForStudent === student.anonymousId ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Öde ($9)'}</Button>) : (<span className="text-sm text-green-600 flex items-center justify-end gap-2"><CheckCircle className="h-4 w-4"/>Tamamlandı</span>)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="receive-payment" className="pt-4">
                <div className="space-y-6">
                    <Card><CardHeader><CardTitle>Mevcut Bakiye</CardTitle></CardHeader><CardContent><div className="text-center py-6"><div className="text-4xl font-bold text-green-600 mb-2">${panelData.performance.pendingEarnings}</div><p className="text-gray-600 mb-4">≈ {panelData.performance.pendingEarnings * 39} TL</p><Button onClick={handlePaymentRequest} disabled={panelData.performance.pendingEarnings < 50 || isRequestingPayment} className="bg-green-600 hover:bg-green-700">{isRequestingPayment ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Banknote className="h-4 w-4 mr-2" />}Ödeme Talep Et</Button>{panelData.performance.pendingEarnings < 50 && (<p className="text-sm text-gray-500 mt-2">Minimum ödeme tutarı: $50</p>)}</div></CardContent></Card>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card><CardHeader><CardTitle>Ödeme Yöntemi</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-3"><div className="flex items-center space-x-2"><input type="radio" id="iban" name="payment" value="iban" checked={paymentMethod === "iban"} onChange={(e) => setPaymentMethod(e.target.value)} /><Label htmlFor="iban">IBAN</Label></div>{paymentMethod === "iban" && (<Input placeholder="TR..." value={ibanInfo} onChange={(e) => setIbanInfo(e.target.value)} />)}<div className="flex items-center space-x-2"><input type="radio" id="paypal" name="payment" value="paypal" checked={paymentMethod === "paypal"} onChange={(e) => setPaymentMethod(e.target.value)} /><Label htmlFor="paypal">PayPal</Label></div>{paymentMethod === "paypal" && (<Input placeholder="paypal@email.com" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} />)}</div><Button onClick={handleSavePaymentInfo} disabled={isSavingInfo} className="w-full" variant="outline">{isSavingInfo ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CreditCard className="h-4 w-4 mr-2" />}Bilgileri Kaydet</Button></CardContent></Card>
                        <Card><CardHeader><CardTitle>Ödeme Hareketleri</CardTitle><CardDescription>Tamamlanan ödemeler ve onay bekleyen talepleriniz.</CardDescription></CardHeader><CardContent><div className="space-y-3">{combinedTransactions.length > 0 ? (combinedTransactions.map((transaction) => (<div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg bg-white"><div><p className="font-medium">${transaction.amount}</p><p className="text-sm text-gray-600">{new Date(transaction.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric'})}</p></div><div className="text-right"><Badge variant={transaction.status === "Ödendi" ? "success" : "default"}>{transaction.status}</Badge><p className="text-xs text-gray-500 mt-1">{transaction.method}</p></div></div>))) : (<p className="text-center text-gray-500 py-4">Henüz bir ödeme hareketi yok.</p>)}</div></CardContent></Card>
                    </div>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="support" className="pt-6">
            <Card><CardHeader><CardTitle>Destek ve Sıkça Sorulan Sorular</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-8"><div className="space-y-4"><h3 className="font-semibold">Destek Kanalları</h3><Button className="w-full bg-green-600 hover:bg-green-700 justify-start p-6 text-base"><Phone className="h-5 w-5 mr-3" />WhatsApp Destek</Button><Button className="w-full justify-start p-6 text-base" variant="outline"><MessageCircle className="h-5 w-5 mr-3" />Canlı Sohbet</Button></div><div><Accordion type="single" collapsible className="w-full">{faqItems.map((faq, index) => (<AccordionItem key={index} value={`item-${index + 1}`}><AccordionTrigger>{faq.question}</AccordionTrigger><AccordionContent>{faq.answer}</AccordionContent></AccordionItem>))}</Accordion></div></CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}