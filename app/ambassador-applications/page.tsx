"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  Building2,
  MapPin,
  BookOpenText,
  AlertCircle,
  Eye,
  CheckCircle,
  XCircle,
  UserCheck,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import type { AmbassadorApplication } from "@/types/ambassador"

export default function AmbassadorApplicationsPage() {
  const [applications, setApplications] = useState<AmbassadorApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedApplication, setSelectedApplication] = useState<AmbassadorApplication | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const fetchApplications = async () => {
    setLoading(true)
    setError(null)
    try {
      const url =
        filterStatus === "all" ? "/api/ambassador-applications" : `/api/ambassador-applications?status=${filterStatus}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      if (result.success) {
        setApplications(result.data)
      } else {
        throw new Error(result.error || "Failed to fetch applications")
      }
    } catch (err: any) {
      console.error("Error fetching applications:", err)
      setError(err.message || "Başvurular yüklenirken bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [filterStatus])

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.school.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [applications, searchTerm])

  const getStatusBadgeVariant = (status: string) => {
    if (status.includes("-pending")) return "default"
    if (status === "active") return "success"
    switch (status) {
      case "pending": return "secondary"
      case "approved": return "success"
      case "rejected": return "destructive"
      default: return "outline"
    }
  }

  const renderStatusText = (status: string) => {
    if (status.includes("-pending")) {
      const packageName = status.split('-')[0]
      const capitalizedPackage = packageName.charAt(0).toUpperCase() + packageName.slice(1)
      return `Onay Bekleniyor (${capitalizedPackage})`
    }
    switch (status) {
      case "pending": return "Beklemede"
      case "approved": return "Ön Onaylı"
      case "rejected": return "Reddedildi"
      case "active": return "Aktif Üye"
      default: return status
    }
  }

  const formatDateTime = (isoString: string) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString)
    return date.toLocaleString("tr-TR", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  const handleViewApplication = (application: AmbassadorApplication) => {
    setSelectedApplication(application)
    setIsDialogOpen(true)
  }

  const handleInitialReview = async (id: string, newStatus: "approved" | "rejected") => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/ambassador-applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus, reviewedBy: "Admin" }),
      })
      if (!response.ok) throw new Error("Durum güncellenemedi.");
      const result = await response.json();
      toast({ title: "Durum Güncellendi", description: `Başvuru "${renderStatusText(newStatus)}" olarak işaretlendi.`});
      setApplications((prev) => prev.map((app) => (app.id === id ? result.data : app)));
      if (selectedApplication?.id === id) setSelectedApplication(result.data);
    } catch (err: any) {
      toast({ title: "Hata", description: err.message, variant: "destructive" });
    } finally {
      setIsUpdating(false)
    }
  }

  const handleFinalActivation = async (applicationId: string) => {
    setIsUpdating(true);
    try {
        const response = await fetch('/api/approve-ambassador', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Panel oluşturulamadı.");
        }
        toast({
            title: "Elçi Aktif Edildi!",
            description: `${applicationId} için elçi paneli başarıyla oluşturuldu.`,
            className: "bg-green-100 text-green-800"
        });
        const newStatus = 'active';
        const updatedApp = { ...selectedApplication!, status: newStatus, reviewedAt: new Date().toISOString() };
        setApplications((prev) => prev.map((app) => (app.id === applicationId ? updatedApp : app)));
        setSelectedApplication(updatedApp);
    } catch (err: any) {
        toast({ title: "Hata", description: err.message, variant: "destructive" });
    } finally {
        setIsUpdating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-7xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpenText className="w-7 h-7" />
            Elçi Başvuruları
          </CardTitle>
          <CardDescription>
            KineKids elçi programına yapılan tüm başvuruları buradan görüntüleyebilir ve yönetebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Ad, soyad, e-posta veya okul ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Duruma göre filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="pending">Beklemede</SelectItem>
                <SelectItem value="approved">Ön Onaylı</SelectItem>
                <SelectItem value="rejected">Reddedildi</SelectItem>
                <SelectItem value="active">Aktif Üyeler</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchApplications} disabled={loading} className="w-full sm:w-auto">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Yenile
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="h-10 w-10 animate-spin text-blue-500" /><p className="ml-3 text-gray-600">Başvurular yükleniyor...</p></div>
          ) : error ? (
            <div className="text-center text-red-500 p-8"><AlertCircle className="w-12 h-12 mx-auto mb-4" /><p className="text-lg font-semibold">Hata:</p><p>{error}</p><Button onClick={fetchApplications} className="mt-4">Tekrar Dene</Button></div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center text-gray-500 p-8"><p className="text-lg font-semibold">Hiç başvuru bulunamadı.</p><p>Filtreleri veya arama terimini değiştirmeyi deneyin.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Ad Soyad</TableHead><TableHead>İletişim</TableHead><TableHead>Okul/Konum</TableHead><TableHead>Durum</TableHead><TableHead>Başvuru Tarihi</TableHead><TableHead className="text-right">İşlemler</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium text-xs truncate max-w-[150px]">{app.id}</TableCell>
                      <TableCell>{app.firstName} {app.lastName}</TableCell>
                      <TableCell><div className="flex items-center gap-1 text-sm"><Mail className="w-3 h-3" /> {app.email}</div><div className="flex items-center gap-1 text-sm"><Phone className="w-3 h-3" /> {app.phone}</div></TableCell>
                      <TableCell><div className="flex items-center gap-1 text-sm"><Building2 className="w-3 h-3" /> {app.school}</div><div className="flex items-center gap-1 text-sm"><MapPin className="w-3 h-3" /> {app.city}, {app.district}</div></TableCell>
                      <TableCell><Badge variant={getStatusBadgeVariant(app.status)}>{renderStatusText(app.status)}</Badge></TableCell>
                      <TableCell className="text-sm">{formatDateTime(app.submittedAt)}</TableCell>
                      <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => handleViewApplication(app)} className="h-8 px-2"><Eye className="w-4 h-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader><DialogTitle className="text-2xl flex items-center gap-2"><BookOpenText className="w-6 h-6" />Başvuru Detayı</DialogTitle><DialogDescription>ID: {selectedApplication.id} | Başvuru Tarihi: {formatDateTime(selectedApplication.submittedAt)}</DialogDescription></DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div><h3 className="text-sm font-medium text-gray-500">Kişisel Bilgiler</h3><div className="mt-2 p-3 bg-gray-50 rounded-md"><p className="text-lg font-semibold">{selectedApplication.firstName} {selectedApplication.lastName}</p><div className="flex items-center gap-1 mt-1"><Mail className="w-4 h-4 text-gray-500" /><span>{selectedApplication.email}</span></div><div className="flex items-center gap-1 mt-1"><Phone className="w-4 h-4 text-gray-500" /><span>{selectedApplication.phone}</span></div></div></div>
                  <div><h3 className="text-sm font-medium text-gray-500">Okul/Kurum Bilgileri</h3><div className="mt-2 p-3 bg-gray-50 rounded-md"><div className="flex items-center gap-1"><Building2 className="w-4 h-4 text-gray-500" /><span className="font-medium">{selectedApplication.school}</span></div><div className="flex items-center gap-1 mt-1"><MapPin className="w-4 h-4 text-gray-500" /><span>{selectedApplication.city}, {selectedApplication.district}</span></div><div className="mt-2"><span className="text-sm text-gray-500">Öğrenci Sayısı:</span><span className="ml-2 font-medium">{selectedApplication.studentCount || "Belirtilmemiş"}</span></div></div></div>
                  <div><h3 className="text-sm font-medium text-gray-500">Durum</h3><div className="mt-2 p-3 bg-gray-50 rounded-md"><Badge variant={getStatusBadgeVariant(selectedApplication.status)} className="text-base px-3 py-1">{renderStatusText(selectedApplication.status)}</Badge>{selectedApplication.reviewedAt && (<div className="mt-2 text-sm"><span className="text-gray-500">İnceleme Tarihi:</span><span className="ml-2">{formatDateTime(selectedApplication.reviewedAt)}</span></div>)}{selectedApplication.reviewedBy && (<div className="mt-1 text-sm"><span className="text-gray-500">İnceleyen:</span><span className="ml-2">{selectedApplication.reviewedBy}</span></div>)}</div></div>
                </div>
                <div className="space-y-4">
                  <div><h3 className="text-sm font-medium text-gray-500">Motivasyon ve Hedefler</h3><div className="mt-2 p-3 bg-gray-50 rounded-md min-h-[150px]"><p className="whitespace-pre-wrap">{selectedApplication.motivation}</p></div></div>
                  {selectedApplication.billingInfo && (<div><h3 className="text-sm font-medium text-gray-500">Fatura Bilgileri</h3><div className="mt-2 p-3 bg-gray-50 rounded-md"><p><strong>İsim/Unvan:</strong> {selectedApplication.billingInfo.name}</p><p><strong>Adres:</strong> {selectedApplication.billingInfo.address}</p><p><strong>Vergi Dairesi:</strong> {selectedApplication.billingInfo.taxOffice}</p><p><strong>Vergi/TC No:</strong> {selectedApplication.billingInfo.taxNumber}</p></div></div>)}
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
                {selectedApplication.status === "pending" && (
                  <>
                    <Button onClick={() => handleInitialReview(selectedApplication.id, "approved")} disabled={isUpdating} className="bg-green-600 hover:bg-green-700 text-white">{isUpdating ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<CheckCircle className="mr-2 h-4 w-4" />)} Ön Onay Ver</Button>
                    <Button onClick={() => handleInitialReview(selectedApplication.id, "rejected")} disabled={isUpdating} variant="destructive">{isUpdating ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<XCircle className="mr-2 h-4 w-4" />)} Reddet</Button>
                  </>
                )}
                {selectedApplication.status.includes("-pending") && (
                   <Button onClick={() => handleFinalActivation(selectedApplication.id)} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white">{isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}Ödemeyi Onayla (Aktif Et)</Button>
                )}
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Kapat</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
