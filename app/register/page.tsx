"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, User, UserPlus, School, Users } from "lucide-react"
import Link from "next/link"
import { z } from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

// Şema ve Tipler
const userSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
  role: z.enum(["teacher", "school_administrator"]),
});

const studentSchema = z.object({
    studentName: z.string().min(2, "Öğrenci adı en az 2 karakter olmalıdır"),
    schoolName: z.string().min(3, "Okul adı zorunludur"),
    className: z.string().min(1, "Sınıf bilgisi zorunludur"),
});

type UserFormData = z.infer<typeof userSchema>;
type StudentFormData = z.infer<typeof studentSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ambassadorId, setAmbassadorId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("user");
  const [isLoading, setIsLoading] = useState(false);

  const [userFormData, setUserFormData] = useState<UserFormData>({
    name: "", email: "", password: "", role: "teacher"
  });
  const [studentFormData, setStudentFormData] = useState<StudentFormData>({
    studentName: "", schoolName: "", className: ""
  });
  const [errors, setErrors] = useState<any>({});

  // URL'den elçi referans kodunu al
  useEffect(() => {
    const refId = searchParams.get('ref');
    if (refId) {
      setAmbassadorId(refId);
      toast({ title: "Elçi Daveti", description: `Elçi ${refId} aracılığıyla kayıt oluyorsunuz.` });
    } else {
      toast({ title: "Uyarı", description: "Bu sayfa sadece bir elçi davet linki ile kullanılabilir.", variant: "destructive" });
    }
  }, [searchParams]);

  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStudentFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudentFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ambassadorId) {
      toast({ title: "Hata", description: "Elçi referans kodu bulunamadı.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setErrors({});

    try {
      if (activeTab === 'user') {
        // --- YETKİLİ KULLANICI (ÖĞRETMEN/MÜDÜR) KAYDI ---
        const validation = userSchema.safeParse(userFormData);
        if (!validation.success) {
          const newErrors: any = {};
          validation.error.errors.forEach(err => { newErrors[err.path[0]] = err.message; });
          setErrors(newErrors);
          throw new Error("Lütfen formdaki hataları düzeltin.");
        }

        // Bu API'nin oluşturulması gerekir.
        const response = await fetch('/api/register-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...userFormData, ambassadorId })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Kullanıcı kaydı başarısız.");
        }
        toast({ title: "Kayıt Başarılı!", description: "Kullanıcı hesabı oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz.", className: "bg-green-100 text-green-800" });
        router.push('/login');

      } else if (activeTab === 'student') {
        // --- ÖĞRENCİ KAYDI (KVKK UYUMLU) ---
        const validation = studentSchema.safeParse(studentFormData);
        if (!validation.success) {
          const newErrors: any = {};
          validation.error.errors.forEach(err => { newErrors[err.path[0]] = err.message; });
          setErrors(newErrors);
          throw new Error("Lütfen formdaki hataları düzeltin.");
        }

        // Bu API'nin oluşturulması gerekir.
        const response = await fetch('/api/register-student', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // Sunucuya sadece kişisel olmayan veriler gönderilir
                schoolName: studentFormData.schoolName,
                className: studentFormData.className,
                ambassadorId: ambassadorId
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Öğrenci kaydı başarısız.");
        }

        const { anonymousId } = await response.json();

        // Kişisel veri (isim) sadece tarayıcının localStorage'ına kaydedilir.
        const existingStudents = JSON.parse(localStorage.getItem('kinekids_students') || '{}');
        existingStudents[anonymousId] = { name: studentFormData.studentName, class: studentFormData.className };
        localStorage.setItem('kinekids_students', JSON.stringify(existingStudents));

        toast({ title: "Öğrenci Kaydedildi!", description: `${studentFormData.studentName} başarıyla sisteme eklendi.`, className: "bg-green-100 text-green-800" });
        // Formu temizle
        setStudentFormData({ studentName: "", schoolName: "", className: "" });
      }
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Elçi Kayıt Portalı</CardTitle>
          <CardDescription>
            {ambassadorId ? `Elçi ${ambassadorId} aracılığıyla yeni bir kayıt oluşturun.` : "Geçerli bir davet linki gerekli."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user"><UserPlus className="w-4 h-4 mr-2"/>Yetkili Kaydı</TabsTrigger>
              <TabsTrigger value="student"><Users className="w-4 h-4 mr-2"/>Öğrenci Kaydı</TabsTrigger>
            </TabsList>

            {/* YETKİLİ KAYIT FORMU */}
            <TabsContent value="user" className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input id="name" name="name" value={userFormData.name} onChange={handleUserFormChange} className={errors.name ? "border-red-500" : ""}/>
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input id="email" name="email" type="email" value={userFormData.email} onChange={handleUserFormChange} className={errors.email ? "border-red-500" : ""}/>
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Şifre</Label>
                  <Input id="password" name="password" type="password" value={userFormData.password} onChange={handleUserFormChange} className={errors.password ? "border-red-500" : ""}/>
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Rol</Label>
                    <Select onValueChange={(value) => setUserFormData(prev => ({ ...prev, role: value as "teacher" | "school_administrator" }))} defaultValue="teacher">
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="teacher">Öğretmen</SelectItem>
                            <SelectItem value="school_administrator">Okul Müdürü</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || !ambassadorId}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />} Yetkiliyi Kaydet
                </Button>
              </form>
            </TabsContent>

            {/* ÖĞRENCİ KAYIT FORMU */}
            <TabsContent value="student" className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Öğrenci Adı Soyadı</Label>
                  <Input id="studentName" name="studentName" value={studentFormData.studentName} onChange={handleStudentFormChange} className={errors.studentName ? "border-red-500" : ""}/>
                  {errors.studentName && <p className="text-sm text-red-500">{errors.studentName}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="schoolName">Okul Adı</Label>
                  <Input id="schoolName" name="schoolName" value={studentFormData.schoolName} onChange={handleStudentFormChange} className={errors.schoolName ? "border-red-500" : ""}/>
                  {errors.schoolName && <p className="text-sm text-red-500">{errors.schoolName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="className">Sınıf / Şube</Label>
                  <Input id="className" name="className" placeholder="Örn: 3-B" value={studentFormData.className} onChange={handleStudentFormChange} className={errors.className ? "border-red-500" : ""}/>
                  {errors.className && <p className="text-sm text-red-500">{errors.className}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || !ambassadorId}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />} Öğrenciyi Kaydet
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-gray-500 text-center w-full">KVKK ve FERPA gereği, öğrenci kişisel verileri sunucularımızda saklanmaz.</p>
        </CardFooter>
      </Card>
    </div>
  )
}
