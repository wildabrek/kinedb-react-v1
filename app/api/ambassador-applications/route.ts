import { type NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const dataFilePath = path.resolve(process.cwd(), "data", "ambassador-applications.json")

interface AmbassadorApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  school: string;
  city: string;
  district: string;
  motivation: string;
  packageName?: string;
  price?: number;
  billingInfo?: any;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  paymentDeclaredAt?: string;
}

async function readApplications(): Promise<AmbassadorApplication[]> {
  try {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true })
    const fileContent = await fs.readFile(dataFilePath, "utf-8")
    return JSON.parse(fileContent)
  } catch (error: any) {
    if (error.code === "ENOENT") {
      await fs.writeFile(dataFilePath, "[]", "utf-8")
      return []
    }
    throw error
  }
}

async function writeApplications(data: AmbassadorApplication[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf-8")
}

export async function GET(request: NextRequest) {
  try {
    const applications = await readApplications()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let filteredApplications = applications
    if (status) {
      if (status.includes('-pending')) {
        filteredApplications = applications.filter((app) => app.status.includes('-pending'));
      } else {
        filteredApplications = applications.filter((app) => app.status === status)
      }
    }
    return NextResponse.json({
      success: true,
      data: filteredApplications.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()),
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch applications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { formData, packageName, price } = await request.json();
    if (!formData || !packageName) { return NextResponse.json({ success: false, error: "Missing data" }, { status: 400 }); }
    
    const applications = await readApplications();
    if (applications.some(app => app.email === formData.email)) {
        return NextResponse.json({ success: false, error: "This email has already been used." }, { status: 409 });
    }

    const newApplication: AmbassadorApplication = {
      id: `ELCI-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      ...formData,
      packageName,
      price,
      status: "pending",
      submittedAt: new Date().toISOString(),
    }
    applications.push(newApplication)
    await writeApplications(applications)
    return NextResponse.json({ success: true, applicationId: newApplication.id }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) { return NextResponse.json({ success: false, error: "Application ID is required" }, { status: 400 }); }

    const applications = await readApplications()
    const applicationIndex = applications.findIndex((app) => app.id === id)

    if (applicationIndex === -1) { return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 }); }

    // Gelen yeni verileri mevcut verilerle birleştirerek güncelle
    const updatedApplication = { ...applications[applicationIndex], ...body, reviewedAt: new Date().toISOString() };
    applications[applicationIndex] = updatedApplication;

    await writeApplications(applications)
    return NextResponse.json({ success: true, data: updatedApplication })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
