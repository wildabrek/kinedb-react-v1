export const runtime = "nodejs"

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import path from "path"
import fs from "fs/promises"

// GET handler
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Ambassador ID is required" }, { status: 400 })
    }

    // Elçiye özel öğrenci dosyasının yolunu oluştur
    const filePath = path.resolve(process.cwd(), "data", "ambassadors", `${id}-students.json`)

    const fileContent = await fs.readFile(filePath, "utf-8")
    const data = JSON.parse(fileContent)

    return NextResponse.json(data)
  } catch (error: any) {
    if (error.code === "ENOENT") {
      // Dosya yoksa boş bir liste dön
      return NextResponse.json([])
    }

    console.error("Error fetching ambassador's students:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
