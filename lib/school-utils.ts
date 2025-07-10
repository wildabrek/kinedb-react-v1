// Okul tipini kontrol etmek için yardımcı fonksiyonlar
export function isLocalSchool(school: { school_id?: number }): boolean {
  return school.school_id !== undefined && school.school_id < 0
}

export function isDatabaseSchool(school: { school_id?: number }): boolean {
  return school.school_id !== undefined && school.school_id > 0
}

// Okul kaynağını belirlemek için
export function getSchoolSource(school: { school_id?: number }): "local" | "database" | "unknown" {
  if (!school.school_id) return "unknown"
  if (school.school_id < 0) return "local"
  if (school.school_id > 0) return "database"
  return "unknown"
}

// Geçici ID oluşturucu
export function generateTempSchoolId(): number {
  return -Math.abs(Math.floor(Math.random() * 1000000))
}

// Okul durumunu kontrol et
export function getSchoolStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "active":
      return "text-green-600"
    case "disabled":
    case "inactive":
      return "text-red-600"
    case "pending":
      return "text-yellow-600"
    default:
      return "text-gray-600"
  }
}

// Okul badge'i için renk
export function getSchoolBadgeVariant(isLocal: boolean): "default" | "secondary" | "outline" {
  return isLocal ? "secondary" : "outline"
}
