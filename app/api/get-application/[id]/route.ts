export const runtime = "nodejs"

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import fs from "fs/promises"
import path from "path"

const dataFilePath = path.join(process.cwd(), "data", "ambassador-applications.json")

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: applicationId } = await params

    if (!applicationId) {
      return NextResponse.json({ message: "Başvuru ID bilgisi eksik." }, { status: 400 })
    }

    const fileData = await fs.readFile(dataFilePath, "utf8")
    const applications = JSON.parse(fileData)

    const application = applications.find((app: any) => app.id === applicationId)

    if (!application) {
      return NextResponse.json({ message: "Başvuru bulunamadı." }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return NextResponse.json({ message: "Veri kaynağı bulunamadı." }, { status: 404 })
    }

    console.error("Başvuru getirme hatası:", error)
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 })
  }
}
