import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-gray-700">Başvurular Yükleniyor...</h2>
        <p className="text-gray-500 mt-2">Lütfen bekleyin, başvuru verileri getiriliyor.</p>
      </div>
    </div>
  )
}
