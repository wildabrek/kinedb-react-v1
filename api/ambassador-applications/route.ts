import { type NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

// Define the path to the JSON file for storing applications
const dataFilePath = path.resolve(process.cwd(), "data", "ambassador-applications.json")

interface AmbassadorApplication {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  school: string
  city: string
  district: string
  experience: string
  motivation: string
  studentCount: string
  region: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  notes?: string
}

// Helper function to read applications from the JSON file
async function readApplications(): Promise<AmbassadorApplication[]> {
  try {
    // Ensure the directory exists
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true })
    // Read the file
    const fileContent = await fs.readFile(dataFilePath, "utf-8")
    return JSON.parse(fileContent)
  } catch (error: any) {
    // If the file doesn't exist, return an empty array
    if (error.code === "ENOENT") {
      await fs.writeFile(dataFilePath, "[]", "utf-8") // Create the file if it doesn't exist
      return []
    }
    // For other errors, re-throw
    throw error
  }
}

// Helper function to write applications to the JSON file
async function writeApplications(data: AmbassadorApplication[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf-8")
}

// GET - Retrieve all applications
export async function GET(request: NextRequest) {
  try {
    const applications = await readApplications()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let filteredApplications = applications
    if (status) {
      filteredApplications = applications.filter((app) => app.status === status)
    }

    return NextResponse.json({
      success: true,
      data: filteredApplications,
      total: filteredApplications.length,
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch applications" }, { status: 500 })
  }
}

// POST - Submit new application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["firstName", "lastName", "email", "phone", "school", "city", "district", "motivation"]
    const missingFields = requiredFields.filter((field) => !body[field]?.trim())

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          missingFields,
        },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    const applications = await readApplications()

    // Check for duplicate email
    const existingApplication = applications.find((app) => app.email === body.email)
    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: "An application with this email already exists" },
        { status: 409 },
      )
    }

    // Generate unique application ID
    const applicationId = `ELCI-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create new application
    const newApplication: AmbassadorApplication = {
      id: applicationId,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      school: body.school.trim(),
      city: body.city.trim(),
      district: body.district.trim(),
      experience: body.experience?.trim() || "",
      motivation: body.motivation.trim(),
      studentCount: body.studentCount || "",
      region: body.region?.trim() || "",
      status: "pending",
      submittedAt: new Date().toISOString(),
    }

    // Add to the list and save to file
    applications.push(newApplication)
    await writeApplications(applications)

    // Log for admin monitoring
    console.log(`New ambassador application saved to JSON: ${applicationId}`)
    console.log(`Applicant: ${newApplication.firstName} ${newApplication.lastName} (${newApplication.email})`)

    return NextResponse.json(
      {
        success: true,
        data: {
          id: applicationId,
          message: "Application submitted successfully and saved to JSON.",
          submittedAt: newApplication.submittedAt,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error processing application:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update application status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, notes, reviewedBy } = body

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Application ID and status are required" }, { status: 400 })
    }

    const applications = await readApplications()
    const applicationIndex = applications.findIndex((app) => app.id === id)

    if (applicationIndex === -1) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 })
    }

    // Update application
    applications[applicationIndex] = {
      ...applications[applicationIndex],
      status,
      notes: notes || applications[applicationIndex].notes,
      reviewedBy: reviewedBy || "Admin", // Default reviewer
      reviewedAt: new Date().toISOString(),
    }

    // Save the updated list to the file
    await writeApplications(applications)

    return NextResponse.json({
      success: true,
      data: applications[applicationIndex],
    })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
