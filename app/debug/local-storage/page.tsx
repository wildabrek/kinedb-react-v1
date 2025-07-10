"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { safeStorage } from "@/lib/utils/safeStorage"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { setAllLocalData, type LocalKineDBData } from "@/lib/local-data-manager" // Local storage manager'ı import et

export default function LocalStorageDebuggerPage() {
  const [localStorageData, setLocalStorageData] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchLocalStorageData = useCallback(() => {
    const data: Record<string, string> = {}
    if (typeof window !== "undefined" && window.localStorage) {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        if (key) {
          data[key] = window.localStorage.getItem(key) || ""
        }
      }
    }
    setLocalStorageData(data)
  }, [])

  useEffect(() => {
    fetchLocalStorageData()
  }, [fetchLocalStorageData])

  const handleClearItem = (key: string) => {
    if (typeof window !== "undefined" && window.localStorage) {
      safeStorage.removeItem(key)
      fetchLocalStorageData()
      toast({
        title: "Başarılı",
        description: `'${key}' yerel depolamadan silindi.`,
      })
    }
  }

  const handleClearAll = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      safeStorage.clear()
      fetchLocalStorageData()
      toast({
        title: "Başarılı",
        description: "Tüm yerel depolama temizlendi.",
      })
    }
  }

  const handleDownloadJson = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      const data: Record<string, string> = {}
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        if (key) {
          data[key] = window.localStorage.getItem(key) || ""
        }
      }

      try {
        const jsonString = JSON.stringify(data, null, 2)
        const blob = new Blob([jsonString], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "kinedb_local_storage_backup.json"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast({
          title: "Başarılı",
          description: "Yerel depolama verileri JSON olarak indirildi.",
        })
      } catch (error) {
        console.error("Error downloading local storage data:", error)
        toast({
          title: "Hata",
          description: "Yerel depolama verileri indirilirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      toast({
        title: "Hata",
        description: "Dosya seçilmedi.",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const parsedData: LocalKineDBData = JSON.parse(content)

        // Basic validation for the structure
        if (
          !parsedData.students ||
          !Array.isArray(parsedData.students) ||
          !parsedData.teachers ||
          !Array.isArray(parsedData.teachers) ||
          !parsedData.classes ||
          !Array.isArray(parsedData.classes)
        ) {
          throw new Error(
            "Geçersiz JSON yapısı. Lütfen 'students', 'teachers' ve 'classes' dizilerini içerdiğinden emin olun.",
          )
        }

        setAllLocalData(parsedData) // Tüm veriyi local storage'a kaydet ve initialSetupComplete'i true yap
        fetchLocalStorageData() // Verileri yenile

        toast({
          title: "Başarılı",
          description: "Veriler JSON dosyasından başarıyla yüklendi.",
        })
      } catch (error: any) {
        toast({
          title: "Hata",
          description: error.message || "JSON dosyası ayrıştırılamadı. Lütfen geçerli bir JSON olduğundan emin olun.",
          variant: "destructive",
        })
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "" // Clear the file input
        }
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Local Storage Debugger</CardTitle>
          <div className="flex space-x-2">
            <Button onClick={fetchLocalStorageData} variant="outline">
              Refresh Data
            </Button>
            <Button onClick={handleDownloadJson} variant="outline">
              Download JSON
            </Button>
            <Button onClick={handleClearAll} variant="destructive">
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* JSON Upload Section */}
          <div className="space-y-4 border-b pb-4 mb-4">
            <h3 className="text-xl font-semibold">JSON'dan Veri Yükle</h3>
            <CardDescription className="text-sm text-gray-600">
              Mevcut öğrenci, öğretmen ve sınıf verilerini bir JSON dosyasından yükleyebilirsiniz.
            </CardDescription>
            <div className="flex items-center space-x-2">
              <Label htmlFor="json-upload" className="sr-only">
                JSON Dosyası Yükle
              </Label>
              <Input
                id="json-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="flex-1"
              />
            </div>
          </div>

          {Object.keys(localStorageData).length === 0 ? (
            <p className="text-center text-gray-500">Local Storage boş.</p>
          ) : (
            <ScrollArea className="h-[500px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(localStorageData).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{key}</TableCell>
                      <TableCell className="break-all text-sm">
                        <pre className="whitespace-pre-wrap text-xs">{value}</pre>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleClearItem(key)}>
                          Clear
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
