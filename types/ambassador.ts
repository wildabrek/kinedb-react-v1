export interface AmbassadorApplication {
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
