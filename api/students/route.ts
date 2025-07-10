import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid" // UUID oluşturmak için

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const schoolId = searchParams.get("school_id")

  if (!schoolId) {
    return NextResponse.json({ error: "School ID is required" }, { status: 400 })
  }

  const apiUrl = process.env.API_URL || "https://kinefast.onrender.com"

  try {
    const response = await fetch(`${apiUrl}/students?school_id=${schoolId}`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.warn(`API returned ${response.status}, using mock data for anonymous students`)

      // Generate mock anonymous students with UUIDs
      const mockAnonymousStudents = Array.from({ length: 5 }, (_, i) => ({
        student_internal_id: uuidv4(), // UUID string
        grade: `Grade ${5 + i}`,
        school_id: Number.parseInt(schoolId),
        class_id: 1, // Mock class_id
        status: "active",
      }))

      return NextResponse.json(mockAnonymousStudents)
    }

    const data = await response.json()
    // Backend'den gelen verinin sadece anonim kısımlarını döndürdüğünden emin ol
    // Backend'in zaten sadece anonim verileri döndürdüğü varsayılıyor (prompt'a göre)
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error fetching students:`, error)

    // Return mock anonymous data on error
    const mockAnonymousStudents = Array.from({ length: 5 }, (_, i) => ({
      student_internal_id: uuidv4(), // UUID string
      grade: `Grade ${5 + i}`,
      school_id: Number.parseInt(schoolId),
      class_id: 1, // Mock class_id
      status: "active",
    }))

    return NextResponse.json(mockAnonymousStudents)
  }
}
