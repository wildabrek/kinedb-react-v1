import { safeStorage } from "@/lib/utils/safeStorage"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "https://kinefast.onrender.com"

// --- API'den gelecek veritabanı modelleri (kişisel veri içermez) ---
export interface StudentDB {
  student_internal_id: string // UUID
  name: string // Added name as required by backend error
  surname: string // Added surname as required by backend error
  class_id: number // Backend'den gelen int tipine uygun
  school_id: number
  status: "active" | "inactive"
  grade?: string // Grade kişisel veri değil, DB'ye gidebilir
  avg_score?: number
  last_active?: string // ISO date string
}

export interface TeacherDB {
  teacher_id: string // UUID
  first_name: string // Added as required by backend error
  last_name: string // Added as required by backend error
  email: string // Made required as per backend error
  school_id: number
  status: "active" | "inactive"
}

export interface ClassDB {
  class_id: string // UUID
  school_id: number
  teacher_id: string // UUID
  name: string // Sınıf adı kişisel veri değil
  description?: string
  status: "active" | "inactive"
}

export interface GameDB {
  game_id: number
  name: string
  description?: string
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface SkillDB {
  skill_id: number
  name: string
  description?: string
}

export interface GoalDB {
  goal_id: number
  name: string
  description?: string
}

export interface GameImpactDB {
  impact_id: number
  name: string
  description?: string
}

export interface AreaDB {
  area_id: number
  name: string
  description?: string
}

// --- UI'da kullanılacak tam modeller (API + Local Storage birleşimi) ---
// Bu modeller PII içerebilir, çünkü localStorage'dan gelen verilerle birleştirilecekler.
export interface Student {
  local_id?: string // Sadece UI için, localStorage'da tutulur
  student_internal_id: string // UUID
  name: string // PII
  surname: string // PII
  studentNumber: string // PII
  email?: string // PII
  avatar?: string // PII
  grade?: string
  class_id: number // Backend'den gelen int tipine uygun
  school_id: number
  status?: string
  join_date?: string
  avg_score?: number
  avg_time_per_session?: string
  last_active?: string
  phone?: string // PII
  progress_status?: string
  games_played?: number
  user_id?: number
  parent_name?: string // PII
  parent_email?: string // PII
  parent_phone?: string // PII
  notes?: string
  address?: string // PII
}

export interface Teacher {
  local_id?: string // Sadece UI için, localStorage'da tutulur
  teacher_id: string // UUID
  name: string // PII (Used for display in UI, derived from local storage or first_name)
  surname: string // PII (Used for display in UI, derived from local storage or last_name)
  first_name: string // PII (backend'den gelen)
  last_name: string // PII (backend'den gelen)
  email: string // PII
  status?: string
  school_id: number
  user_id?: number
}

export interface Class {
  local_id?: string // Sadece UI için, localStorage'da tutulur
  class_id: string // UUID
  class_name: string
  grade_level?: string
  description?: string
  schedule?: string
  location?: string
  status?: string
  teacher_id: string // Öğretmenin UUID'si
  school_id: number
  last_active?: string
  students?: number
  avgScore?: number
  studentList?: StudentListItem[]
  recentGames?: RecentGame[]
}

export interface User {
  user_id: number // Backend'den gelen int tipine uygun
  username: string
  email: string
  role: "admin" | "teacher" | "student" | "parent"
  first_name: string
  last_name: string
  status: string // school_status yerine status kullanılıyor
  profile_image?: string
  school_id: number
}

export interface UserSettings {
  user_id: number
  full_name: string
  email: string
  role: string
  language: string
}

export interface Subject {
  subject_id: number
  name: string
  description?: string
  grade_level?: string
  curriculum_area?: string
  icon?: string
}

export interface School {
  school_id: number
  school_name: string
  city: string
  status: string
}

export interface StudentListItem {
  id: number
  name: string
  grade: string
  avgScore: number
}

export interface RecentGame {
  id: number
  name: string
  date: string
  avgScore: number
}

export interface StudentSubjectScore {
  id: number
  student_id: number
  subject: string
  score: number
  subject_id: number
}

export interface Strength {
  strength_id: number
  name: string
  description?: string
  category?: string
}

export interface DevelopmentArea {
  area_id: number
  name: string
  description?: string
  category?: string
}

export interface StudentStrength {
  id: number
  student_id: number
  strength_id: number
  level: number
  notes?: string
}

export interface StudentDevelopmentArea {
  id: number
  student_id: number
  area_id: number
  priority: number
  notes?: string
  improvement_plan?: string
}

export interface GameTargetSkill {
  id: number
  game_id: number
  skill_id: number
  primary_focus?: boolean
  weight?: number
}

export interface GameTargetSubject {
  id: number
  game_id: number
  subject_id: number
  primary_focus?: boolean
  weight?: number
}

export interface ShortTermGoal {
  goal_id: number
  student_id: number
  title: string
  description?: string
  created_date?: string
  target_date?: string
  completion_date?: string
  status?: string
  progress?: number
  skill_id?: number
  subject_id?: number
  notes?: string
  created_by?: number
}

export interface MediumTermGoal {
  goal_id: number
  student_id: number
  title: string
  description?: string
  created_date?: string
  target_date?: string
  completion_date?: string
  status?: string
  progress?: number
  skill_id?: number
  subject_id?: number
  notes?: string
  related_short_term_goals?: number[]
  created_by?: number
}

export interface LongTermGoal {
  goal_id: number
  student_id: number
  title: string
  description?: string
  created_date?: string
  target_date?: string
  completion_date?: string
  status?: string
  progress?: number
  skill_id?: number
  subject_id?: number
  notes?: string
  related_medium_term_goals?: number[]
  created_by?: number
}

export interface StudentRecommendedGame {
  id: number
  student_id: number
  game_id: number
  recommendation_date?: string
  reason?: string
  priority?: number
  status?: string
  recommended_by?: number
  target_skill_id?: number
  target_area_id?: number
}

export interface MonthlyProgress {
  id: number
  student_id: number
  month: number
  year: number
  overall_score?: number
  games_played?: number
  total_time_spent?: number
  improvement_percentage?: number
  notes?: string
  teacher_feedback?: string
  strengths?: string[]
  areas_for_improvement?: string[]
}

export interface GameSkill {
  id: number
  game_id: number
  skill: string
}

export interface RecentPlayer {
  id: number
  game_id: number
  student_id: number
  score: number
  played_at?: string
}

export interface DashboardStats {
  total_students: number
  total_teachers: number
  total_schools: number
  total_classes: number
}

export interface Project {
  id: number
  name: string
  description: string
}

// Game Session API endpoints for Unity integration
export interface GameSession {
  session_id: number
  student_id: number
  game_id: number
  is_started: boolean
  completed: boolean
  result_score: number | null
  created_at: string
  start_time: string | null
  end_time: string | null
  duration: number | null
  metadata: string | null
}

export interface RecentActivity {
  id: number
  type: string
  student: string
  avatar?: string
  time: string
  game?: string
  score?: number
  achievement?: string
  subject?: string
  improvement?: string
  assessment?: string
}

// Helper for API calls
export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}
export async function apiRequest<T>(url: string, method: HttpMethod = HttpMethod.GET, body?: any): Promise<T> {
  const opts: RequestInit = { method, headers: { "Content-Type": "application/json" } }
  if (body) opts.body = JSON.stringify(body)

  try {
    const res = await fetch(`${API_BASE_URL}${url}`, opts)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(typeof err.detail === "string" ? err.detail : JSON.stringify(err) || `API error ${res.status}`)
    }
    return res.json()
  } catch (error) {
    console.error(`API request failed for ${url}:`, error)
    throw error
  }
}

// Authentication
export async function loginUser(email: string, password: string): Promise<User | null> {
  const formData = new FormData()
  formData.append("email", email)
  formData.append("password", password)

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.detail || "Login failed"
      console.error("Login failed:", errorMessage)
      throw new Error(errorMessage)
    }

    const userData: User = await response.json()
    return userData
  } catch (error: any) {
    console.error("Error during login API call:", error.message || error)
    throw error
  }
}

export async function registerUser(user: {
  name: string
  email: string
  password: string
  role: string
}): Promise<User | null> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  })

  if (!res.ok) return null
  return res.json()
}

export async function getUserSettings(userId: number): Promise<UserSettings> {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/settings`)
  if (!res.ok) throw new Error("Failed to load user settings")
  return res.json()
}

export async function updateUserSettings(userId: number, data: UserSettings): Promise<UserSettings> {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update settings")
  return res.json()
}

// Users
export const getUsers = () => apiRequest<User[]>("/users")
export const getUser = (id: number) => apiRequest<User>(`/users/${id}`)
export const getUserByUsername = (u: string) => apiRequest<User>(`/users/username/${u}`)

// Subjects
export const getSubjects = () => apiRequest<Subject[]>("/subjects")
export const getSubject = (id: number) => apiRequest<Subject>(`/subjects/${id}`)

// Skills
export const getSkills = () => apiRequest<SkillDB[]>("/skills")
export const getSkill = (id: number) => apiRequest<SkillDB>(`/skills/${id}`)

export const deleteSkill = (id: number) => apiRequest(`/skills/${id}`, "DELETE")

export const updateSkill = (id: number, data: any) => apiRequest(`/skills/${id}`, "PUT", data)

export const getSkillsBySubject = (sid: number) => apiRequest<SkillDB[]>(`/subjects/${sid}/skills`)

export async function createSkill(newSkill: {
  name: string
  description: string
  subject_id: number
  level: string
}) {
  return apiRequest("/skills", "POST", newSkill)
}

// Schools
export const getSchools = () => apiRequest<School[]>("/schools")
export const getSchool = (id: number) => apiRequest<School>(`/schools/${id}`)

export async function updateSchoolStatus(schoolId: number, status: string) {
  const res = await fetch(`${API_BASE_URL}/schools/${schoolId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error("Failed to update school status")
}

export async function createSchool(data: { school_name: string; city: string }) {
  const res = await fetch(`${API_BASE_URL}/schools`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create school")
  return await res.json()
}

export async function updateSchool(id: number, data: { school_name: string; address: string }) {
  const res = await fetch(`${API_BASE_URL}/schools/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update school")
  return await res.json()
}

export async function deleteSchool(schoolId: number) {
  const res = await fetch(`${API_BASE_URL}/schools/${schoolId}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete school")
}

// Add school synchronization functions after the existing school functions

export async function syncSchoolToDatabase(localSchool: LocalSchoolData): Promise<School> {
  try {
    const schoolData = {
      school_name: localSchool.school_name,
      city: localSchool.city,
    }

    const createdSchool = await createSchool(schoolData)
    return createdSchool
  } catch (error) {
    console.error("Failed to sync school to database:", error)
    throw error
  }
}

export async function syncAllLocalSchoolsToDatabase(): Promise<{ synced: number; failed: number }> {
  const localSchools = getLocalSchools()
  let synced = 0
  let failed = 0

  for (const localSchool of localSchools) {
    // Only sync schools with negative IDs (local-only schools)
    if (localSchool.school_id && localSchool.school_id < 0) {
      try {
        const syncedSchool = await syncSchoolToDatabase(localSchool)

        // Update local storage with the new database ID
        const localData = getLocalData()
        const updatedSchools = localData.schools.map((school) => {
          if (school.local_id === localSchool.local_id) {
            return {
              ...school,
              school_id: syncedSchool.school_id, // Replace negative ID with positive database ID
            }
          }
          return school
        })

        setAllLocalData({
          ...localData,
          schools: updatedSchools,
        })

        synced++
      } catch (error) {
        console.error(`Failed to sync school ${localSchool.school_name}:`, error)
        failed++
      }
    }
  }

  return { synced, failed }
}

// Teachers
export const getTeachers = () => apiRequest<TeacherDB[]>(`/teachers`) // Updated to fetch TeacherDB
export const getTeacher = (id: string) => apiRequest<Teacher>(`/teachers/${id}`) // Updated to use Teacher interface and string ID
export const getTeachersBySchool = (sid: number) => apiRequest<TeacherDB[]>(`/schools/${sid}/teachers`) // Updated to use TeacherDB
export const deleteTeacher = (id: string) => apiRequest<void>(`/teachers/${id}`, HttpMethod.DELETE)

export async function updateTeacherStatus(teacherId: string, status: string) {
  // Changed ID to string
  const res = await fetch(`${API_BASE_URL}/teachers/${teacherId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const message = Array.isArray(err.detail)
      ? err.detail.map((e: any) => e.msg).join(", ")
      : err.detail || "Failed to update teacher status"
    throw new Error(message)
  }

  return res.json()
}

export async function getTeacherById(id: string) {
  // Changed ID to string
  try {
    const res = await fetch(`${API_BASE_URL}/teachers/${id}`)
    if (!res.ok) {
      throw new Error("Failed to fetch teacher")
    }
    return res.json()
  } catch (error) {
    console.error(`Error fetching teacher ${id}:`, error)
    // Return a fallback teacher object
    return {
      teacher_id: id.toString(), // UUID string olmalı
      name: `Teacher ${id}`,
      status: "Active",
      school_id: 1,
    }
  }
}

export async function updateTeacher(
  id: string, // Changed ID to string
  data: {
    teacher_id: string // Changed ID to string
    first_name: string
    last_name: string
    email?: string
    status: string
    school_id: number
  },
) {
  const res = await fetch(`${API_BASE_URL}/teachers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const message = Array.isArray(err.detail)
      ? err.detail.map((e: any) => e.msg).join(", ")
      : err.detail || "Failed to update teacher"
    throw new Error(message)
  }

  return res.json()
}

export async function createTeacher(data: {
  teacher_id: string // Added teacher_id to match TeacherDB
  first_name: string
  last_name: string
  email: string // Made required
  status: string
  school_id: number
}) {
  const res = await fetch(`${API_BASE_URL}/teachers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const message = typeof err.detail === "string" ? err.detail : JSON.stringify(err) || "Failed to create teacher"
    throw new Error(message)
  }

  return res.json()
}

export async function getClassesBySchoolId(schoolId: number) {
  const res = await fetch(`${API_BASE_URL}/classes?school_id=${schoolId}`)
  if (!res.ok) throw new Error("Failed to fetch classes")
  return res.json()
}

export async function getTeacherBySchoolId(schoolId: number) {
  const res = await fetch(`${API_BASE_URL}/teachers?school_id=${schoolId}`)
  if (!res.ok) throw new Error("Failed to fetch teachers")
  return res.json()
}

// Classes
export interface ClassWithStudentsAndGames extends Class {
  students?: Student[]
  recentGames?: RecentGame[]
}

export const getClasses = (schoolId: number) =>
  apiRequest<ClassWithStudentsAndGames[]>(`/getclasses?school_id=${schoolId}`)

export const getClass = (id: string) => apiRequest<Class>(`/classes/${id}`) // Changed ID to string

export async function createClass(data: {
  class_name: string
  grade_level?: string
  description?: string
  schedule?: string
  location?: string
  status: string
  teacher_id: string
  school_id: number
}) {
  const res = await fetch(`${API_BASE_URL}/classes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Failed to create class")
  }
  return res.json()
}

export const updateClass = (id: string, c: Partial<Class>) => apiRequest<Class>(`/classes/${id}`, HttpMethod.PUT, c) // Changed ID to string
export const deleteClass = (id: string) => apiRequest<void>(`/classes/${id}`, HttpMethod.DELETE) // Changed ID to string

// Students
export async function getStudents(school_id?: number): Promise<StudentDB[]> {
  let url = `${API_BASE_URL}/students`
  if (school_id !== undefined) {
    url += `?school_id=${school_id}`
  }

  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    let message = "Failed to fetch students"

    if (Array.isArray(err.detail)) {
      message = err.detail.map((e: any) => e.msg).join(", ")
    } else if (typeof err.detail === "string") {
      message = err.detail
    } else {
      message = JSON.stringify(err.detail || err)
    }

    throw new Error(message)
  }
  return res.json()
}

export const getStudent = (id: string) => apiRequest<Student>(`/students/${id}`) // Changed ID to string

export const getStudentsByClass = (cid: number) => apiRequest<Student[]>(`/classes/${cid}/`)

export const createStudent = (studentData: StudentDB, schoolId: number) =>
  apiRequest(`/students?school_id=${schoolId}`, "POST", studentData)

export const updateStudent = (
  id: string,
  s: Partial<Student>, // Changed ID to string
) => apiRequest<Student>(`/students/${id}`, HttpMethod.PUT, s)
export const deleteStudent = (id: string) => apiRequest<void>(`/students/${id}`, HttpMethod.DELETE) // Changed ID to string

// Strengths & Development Areas
export const getStrengths = () => apiRequest<Strength[]>("/strengths")
export async function getStrengthById(id: number): Promise<{ strength_id: number; name: string; description: string }> {
  return await apiRequest(`/strengths/${id}`)
}
export async function updateStrength(id: number, data: { name: string; description: string }) {
  return await apiRequest(`/strengths/${id}`, "PUT", data)
}
export async function createStrength(data: { name: string; description: string; category: string }) {
  return await apiRequest("/strengths", "POST", data)
}
export async function deleteStrength(id: number) {
  return await apiRequest(`/strengths/${id}`, "DELETE")
}

export const getStudentStrengths = (sid: number) => apiRequest<StudentStrength[]>(`/students/${sid}/strengths`)
export const addStudentStrength = (sid: number, strength_id: number, level: number, notes?: string) =>
  apiRequest<StudentStrength>(`/students/${sid}/strengths`, HttpMethod.POST, { strength_id, level, notes })
export const getDevelopmentAreas = () => apiRequest<DevelopmentArea[]>("/development-areas")
export async function deleteArea(id: number) {
  return await apiRequest(`/areas/${id}`, "DELETE")
}
export const getStudentDevelopmentAreas = (sid: number) =>
  apiRequest<StudentDevelopmentArea[]>(`/students/${sid}/development-areas`)

// Games & Related
export interface Game {
  game_id: number
  game_name: string
  subject?: string
  level?: string
  description?: string
  status?: string
  creator?: string
  last_updated?: string
  plays?: number
  avg_score?: number
  avg_time?: string
  difficulty_level?: number
  age_range?: string
  thumbnail_url?: string
  time_limit?: number
  points_per_question?: number
}

export const getGames = async (): Promise<Game[]> => {
  const res = await fetch(`${API_BASE_URL}/games`)
  return await res.json()
}

export async function getAllGames() {
  return await apiRequest<Game[]>("/games")
}

export const getGameById = async (gameId: number): Promise<Game | undefined> => {
  try {
    const res = await fetch(`${API_BASE_URL}/games/${gameId}`)
    if (!res.ok) {
      console.error(`Failed to fetch game with ID ${gameId}:`, res.statusText)
      return undefined
    }

    const rawData = await res.json()

    // Dönüşüm: backend'den gelen veriyle frontend tipi eşleştiriliyor
    const game: Game = {
      game_id: rawData.game_id,
      game_name: rawData.game_name, // dönüşüm burada!
      subject: rawData.subject,
      level: rawData.level,
      description: rawData.description,
      status: rawData.status,
      creator: rawData.creator,
      last_updated: rawData.last_updated,
      plays: rawData.plays,
      avg_score: rawData.avg_score,
      avg_time: rawData.avg_time,
      difficulty_level: rawData.difficulty_level,
      age_range: rawData.age_range,
      thumbnail_url: rawData.thumbnail_url,
    }

    return game
  } catch (error) {
    console.error("Error fetching game:", error)
    return undefined
  }
}

export const getGameco = (name: string) => apiRequest<Game>(`/games/${name}`)
export const getGamesBySubject = (sub: string) => apiRequest<Game[]>(`/games/subject/${encodeURIComponent(sub)}`)
export const createGame = (g: Omit<Game, "game_id">) => apiRequest<Game>("/games", HttpMethod.POST, g)
export const updateGame = (id: number, g: Partial<Game>) => apiRequest<Game>(`/games/${id}`, HttpMethod.PUT, g)
export const deleteGame = (id: number) => apiRequest<void>(`/games/${id}`, HttpMethod.DELETE)
export const getGameTargetSkills = (id: number) => apiRequest<GameTargetSkill[]>(`/games/${id}/target-skills`)
export const getGameTargetSubjects = (id: number) => apiRequest<GameTargetSubject[]>(`/games/${id}/target-subjects`)
export const getStudentShortTermGoals = (sid: number) =>
  apiRequest<ShortTermGoal[]>(`/students/${sid}/short-term-goals`)

export const getStudentGamePerformances = (sid: number) =>
  apiRequest<StudentGamePerformance[]>(`/students/${sid}/game-performances`)
export const getGamePerformances = (id: number) => apiRequest<StudentGamePerformance[]>(`/games/${id}/performances`)

export async function getPerformanceChartData(timeRange = "Last 30 Days") {
  const res = await fetch(`${API_BASE_URL}/analytics/performance?time_range=${encodeURIComponent(timeRange)}`)
  if (!res.ok) throw new Error("Failed to fetch performance chart data")
  const result = await res.json()
  return result.data
}

export interface StudentGamePerformance {
  id: number
  student_id: number
  game_id: number
  score: number
  time_played: string
}

export const getStudentBadges = (sid: number) => apiRequest<StudentBadge[]>(`/students/${sid}/badges`)

export interface StudentBadge {
  id: number
  student_id: number
  badge_name: string
  date_earned: string
}

export const getStudentSkills = (sid: number) => apiRequest<StudentSkill[]>(`/students/${sid}/skills`)

export interface StudentSkill {
  id: number
  student_id: number
  skill_name: string
  level: number
}

export async function getStudentActionPlans(studentId: number) {
  const res = await fetch(`${API_BASE_URL}/students/${studentId}/action-plans`)
  if (!res.ok) throw new Error("Failed to fetch action plans")
  const result = await res.json()
  return result.data as { type: string; goal: string }[]
}

export const getStudentSubjectScores = (sid: number) =>
  apiRequest<StudentSubjectScore[]>(`/students/${sid}/subject-scores`)
export const getGamePlays = (id: number) => apiRequest<GamePlay[]>(`/games/${id}/plays`)

export interface GamePlay {
  id: number
  game_id: number
  student_id: number
  score: number
  played_at: string
}

export const getStudentGamePlays = (sid: number) => apiRequest<GamePlay[]>(`/students/${sid}/game-plays`)
export const recordGamePlay = (data: { game_id: number; student_id: number; score: number }) =>
  apiRequest<GamePlay>("/game-plays", HttpMethod.POST, data)
export const getRecentActivity = () => apiRequest<RecentActivityItem[]>("/recent-activity")

export async function getRecentActivities(): Promise<RecentActivity[]> {
  const res = await fetch(`${API_BASE_URL}/analytics/recent-activities`)
  if (!res.ok) throw new Error("Failed to fetch recent activities")
  return await res.json()
}

export interface RecentActivityItem {
  id: number
  type: string
  title: string
  description: string
  time: string
}

export async function getTopPerformers(subject = "Mathematics") {
  const res = await fetch(`${API_BASE_URL}/analytics/top-performers?subject=${subject}`)
  if (!res.ok) throw new Error("Failed to fetch top performers")
  const result = await res.json()
  return result.data // array of { id, name, score, avatar }
}

// Skill Distribution
export async function getSkillDistributionData() {
  const res = await fetch(`${API_BASE_URL}/analytics/skill-distribution`)
  if (!res.ok) throw new Error("Failed to fetch skill distribution data")
  return await res.json()
}

// Student Progress
export async function getStudentProgressData() {
  const res = await fetch(`${API_BASE_URL}/analytics/student-progress`)
  if (!res.ok) throw new Error("Failed to fetch student progress data")
  return await res.json()
}

// Engagement Metrics
export async function getEngagementMetricsData() {
  const res = await fetch(`${API_BASE_URL}/analytics/engagement-metrics`)
  if (!res.ok) throw new Error("Failed to fetch engagement metrics data")
  return await res.json()
}

export const getDashboardStats = () => apiRequest<DashboardStats>("/dashboard-stats")
export const getProjects = () => apiRequest<Project[]>("/projects")
export const getProject = (id: number) => apiRequest<Project>(`/projects/${id}`)

export async function getGameUsageData(timeframe = "month") {
  const res = await fetch(`${API_BASE_URL}/analytics/game-usage?timeframe=${timeframe}`)
  if (!res.ok) throw new Error("Failed to fetch game usage data")
  const result = await res.json()
  return result.data
}

// New endpoints
export const getMediumTermGoals = (sid: number) => apiRequest<MediumTermGoal[]>(`/students/${sid}/medium-term-goals`)
export const getLongTermGoals = (sid: number) => apiRequest<LongTermGoal[]>(`/students/${sid}/long-term-goals`)
export const getRecommendedGames = (sid: number) =>
  apiRequest<StudentRecommendedGame[]>(`/students/${sid}/recommended-games`)
export const getMonthlyProgress = (sid: number) => apiRequest<MonthlyProgress[]>(`/students/${sid}/monthly-progress`)
export const getGameSkills = (gid: number) => apiRequest<GameSkill[]>(`/games/${gid}/skills`)
export const getRecentPlayers = (gid: number) => apiRequest<RecentPlayer[]>(`/games/${gid}/recent-players`)

export async function getStudentById(studentId: string) {
  // Changed ID to string
  try {
    const res = await fetch(`${API_BASE_URL}/students/${studentId}`)
    if (!res.ok) {
      throw new Error("Failed to fetch student")
    }
    return res.json()
  } catch (error) {
    console.error(`Error fetching student ${studentId}:`, error)
    // Return a fallback student object
    return {
      student_internal_id: studentId.toString(), // UUID string olmalı
      name: `Student ${studentId}`,
      grade: "Unknown",
      status: "Active",
      class_id: 1,
    }
  }
}

export async function createDevelopmentArea(area: { name: string; description: string; category: string }) {
  return await apiRequest("/areas", "POST", area)
}

export async function updateDevelopmentArea(
  areaId: number,
  updatedArea: {
    name: string
    description: string
    category: string
  },
) {
  return await apiRequest(`/areas/${areaId}`, "PUT", updatedArea)
}

export interface GameImpact {
  impact_id: number
  name: string
  description: string
}

export async function getGameImpacts(): Promise<Record<string, GameImpact>> {
  return await apiRequest("/game-impacts")
}

export async function getPossibleStrengths(): Promise<
  { strength_id: number; name: string; description: string; category: string }[]
> {
  return await apiRequest("/strengths")
}

export async function getPossibleAreas(): Promise<
  { area_id: number; name: string; description: string; category: string }[]
> {
  return await apiRequest("/possible-areas")
}

export async function getClassAnalytics(classId: number, timeRange: string, schoolId: number): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/analytics/class/${classId}?range=${timeRange}&school_id=${schoolId}`)
  if (!res.ok) throw new Error("Failed to fetch class analytics")
  return await res.json()
}

export async function getClassGameUsage(classId: number, timeRange: string, schoolId: number): Promise<any[]> {
  const res = await fetch(
    `${API_BASE_URL}/analytics/class/${classId}/game-usage?range=${timeRange}&school_id=${schoolId}`,
  )
  if (!res.ok) throw new Error("Failed to fetch class game usage")
  return await res.json()
}

export async function getClassSubjectPerformance(classId: number, schoolId: number): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/analytics/class/${classId}/subject-performance?school_id=${schoolId}`)
  if (!res.ok) throw new Error("Failed to fetch subject performance")
  return await res.json()
}

export async function getClassSkillDistribution(classId: number, schoolId: number): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/analytics/class/${classId}/skill-distribution?school_id=${schoolId}`)
  if (!res.ok) throw new Error("Failed to fetch skill distribution")
  return await res.json()
}

export async function getClassLearningGrowth(
  classId: number,
  range = "month",
  schoolId: number,
): Promise<{ month: string; score: number }[]> {
  const res = await fetch(
    `${API_BASE_URL}/analytics/class/${classId}/learning-growth?range=${range}&school_id=${schoolId}`,
  )
  if (!res.ok) throw new Error("Failed to fetch class learning growth")
  return await res.json()
}

export async function getClassWeeklyActivity(classId: number, schoolId: number) {
  const res = await fetch(`${API_BASE_URL}/analytics/class/${classId}/weekly-activity?school_id=${schoolId}`)
  if (!res.ok) throw new Error("Failed to fetch weekly activity")
  return await res.json() // returns array of { weekday, sessions, avg_score }
}

export async function getClassDistribution(classId: number, schoolId: number) {
  const res = await fetch(`${API_BASE_URL}/analytics/class/${classId}/distribution?school_id=${schoolId}`)
  if (!res.ok) throw new Error("Failed to fetch student distribution")
  return await res.json() // returns array of { range, count }
}

export async function getClassSubjectBreakdown(classId: number, schoolId: number) {
  const res = await fetch(`${API_BASE_URL}/analytics/class/${classId}/subject-breakdown?school_id=${schoolId}`)
  if (!res.ok) throw new Error("Failed to fetch subject breakdown")
  return await res.json() // returns array of { subject, count }
}

// Game Session API endpoints for Unity integration
export const getNextStudentForGame = (gameId: number) =>
  apiRequest<GameSession | null>(`/gamesession/next?game_id=${gameId}`)

export const startGameSession = (data: { student_id: number; game_id: number }) =>
  apiRequest<GameSession>("/gamesession/start", HttpMethod.POST, data)

export const markSessionStarted = (sessionId: number) =>
  apiRequest<GameSession>(`/gamesession/${sessionId}/start`, HttpMethod.POST)

export const endGameSession = (sessionId: number, data: { result_score: number; game_id: number }) =>
  apiRequest<GameSession>(`/gamesession/${sessionId}/end`, HttpMethod.POST, data)

export const syncUIState = (data: { student_id: number; session_id: number; completed?: boolean; score?: number }) =>
  apiRequest<void>("/gamesession/ui-sync", HttpMethod.POST, data)

export const getUISyncStatus = () =>
  apiRequest<{ student_id: number | null; session_id: number | null; completed: boolean; score: number | null }>(
    "/gamesession/ui-sync-status",
  )

export const getGameSessions = (gameId: number) => apiRequest<GameSession[]>(`/gamesessions?game_id=${gameId}`)

// Local Data Manager
// Bu arayüzler, localStorage'da tutulan PII içeren verileri temsil eder.
export interface LocalSchoolData extends School {
  local_id: string
}

export interface LocalStudentData extends Student {
  local_id: string
}

export interface LocalTeacherData extends Teacher {
  local_id: string
}

export interface LocalClassData extends Class {
  local_id: string
}

const LOCAL_DATA_KEY = "kinedb_local_data"

interface LocalData {
  initialSetupComplete: boolean
  schools: LocalSchoolData[]
  students: LocalStudentData[]
  teachers: LocalTeacherData[]
  classes: LocalClassData[]
}

const defaultLocalData: LocalData = {
  initialSetupComplete: false,
  schools: [],
  students: [],
  teachers: [],
  classes: [],
}

export function getLocalData(): LocalData {
  try {
    const data = safeStorage.getItem(LOCAL_DATA_KEY)
    if (data) {
      return JSON.parse(data) as LocalData
    }
  } catch (e) {
    console.error("Error loading local data:", e)
  }
  return defaultLocalData
}

export function setAllLocalData(data: LocalData): void {
  try {
    safeStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(data))
  } catch (e) {
    console.error("Error saving local data:", e)
  }
}

export function getLocalSchools(): LocalSchoolData[] {
  console.log("Getting local schools...")
  const data = getLocalData()
  console.log("Local data loaded:", data)
  console.log("Local schools:", data.schools)
  return data.schools || []
}

export function getLocalStudents(): LocalStudentData[] {
  const data = getLocalData()
  console.log("Getting local students:", data.students)
  return data.students || []
}

export function getLocalTeachers(): LocalTeacherData[] {
  const data = getLocalData()
  console.log("Getting local teachers:", data.teachers)
  return data.teachers || []
}

export function getLocalClasses(): LocalClassData[] {
  const data = getLocalData()
  console.log("Getting local classes:", data.classes)
  return data.classes || []
}

export function clearLocalData() {
  safeStorage.removeItem(LOCAL_DATA_KEY)
}

export async function getAnalyticsDashboardData() {
  const res = await fetch(`${API_BASE_URL}/analytics/dashboard-data`)
  if (!res.ok) throw new Error("Failed to fetch dashboard analytics data")
  return await res.json()
}

export async function getDashboardAnalytics(schoolId: number) {
  const res = await fetch(`${API_BASE_URL}/analytics/dashboard?school_id=${schoolId}`)

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.detail || "Failed to fetch dashboard analytics")
  }

  return await res.json()
}

export async function getWeeklyActivityData(range = "month") {
  const res = await fetch(`${API_BASE_URL}/analytics/weekly-activity?range=${range}`)
  if (!res.ok) throw new Error("Failed to fetch weekly activity data")
  return await res.json()
}

export async function getStudentDistributionData() {
  const res = await fetch(`${API_BASE_URL}/analytics/student-distribution`)
  if (!res.ok) throw new Error("Failed to fetch student distribution data")
  return await res.json()
}

export async function getSubjectBreakdownData(range = "month") {
  const res = await fetch(`${API_BASE_URL}/analytics/subject-breakdown?range=${range}`)
  if (!res.ok) throw new Error("Failed to fetch subject breakdown data")
  return await res.json()
}

export async function getStudentsByClassId(classId: number, schoolId: number) {
  const res = await fetch(`${API_BASE_URL}/students?class_id=${classId}&school_id=${schoolId}`)
  if (!res.ok) throw new Error("Failed to fetch students by class ID")
  const data = await res.json()
  return data
}

export async function getStudentPerformanceData() {
  const res = await fetch(`${API_BASE_URL}/analytics/student-performance`)
  if (!res.ok) throw new Error("Failed to fetch student performance over time")
  return await res.json()
}

export async function getStudentPerformanceOverTime() {
  const res = await fetch(`${API_BASE_URL}/analytics/student-performance`)
  if (!res.ok) throw new Error("Failed to fetch student performance over time")
  return await res.json()
}

export async function getClassRecentActivities(classId: number): Promise<any[]> {
  // Mock recent activities
  const students = await getStudentsByClass(classId)
  const studentNames =
    students.length > 0
      ? students.map((s) => `${s.name} `)
      : ["Emma Thompson", "Noah Martinez", "Olivia Johnson", "Liam Wilson", "Sophia Davis"]

  const games = ["Math Blaster", "Word Wizard", "Science Quest", "History Explorer", "Coding Adventure"]
  const subjects = ["Math", "Science", "Reading", "Writing", "Social Studies"]
  const achievements = ["Problem Solver", "Quick Thinker", "Persistent Learner", "Team Player", "Creative Mind"]
  const assessments = ["Math Quiz", "Science Test", "Reading Assessment", "Writing Evaluation", "History Exam"]
  const times = ["2 hours ago", "3 hours ago", "5 hours ago", "Yesterday", "2 days ago"]

  const activities = []

  // Game completed activities
  activities.push({
    id: 1,
    type: "game_completed",
    student: studentNames[0],
    game: games[0],
    score: Math.floor(Math.random() * 10) + 85,
    time: times[0],
    avatar: "/placeholder.svg?height=32&width=32",
  })

  // Achievement activities
  activities.push({
    id: 2,
    type: "achievement",
    student: studentNames[1],
    achievement: achievements[0],
    game: games[2],
    time: times[1],
    avatar: "/placeholder.svg?height=32&width=32",
  })

  // Improvement activities
  activities.push({
    id: 3,
    type: "improvement",
    student: studentNames[2],
    subject: subjects[2],
    improvement: "+15%",
    time: times[2],
    avatar: "/placeholder.svg?height=32&width=32",
  })

  // Another game completed
  activities.push({
    id: 4,
    type: "game_completed",
    student: studentNames[3],
    game: games[1],
    score: Math.floor(Math.random() * 10) + 80,
    time: times[3],
    avatar: "/placeholder.svg?height=32&width=32",
  })

  // Assessment activity
  activities.push({
    id: 5,
    type: "assessment",
    student: studentNames[4],
    assessment: assessments[0],
    score: Math.floor(Math.random() * 10) + 85,
    time: times[4],
    avatar: "/placeholder.svg?height=32&width=32",
  })

  return activities
}

export async function getClassTopPerformers(classId: number, schoolId: number): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/analytics/class/${classId}/top-performers?school_id=${schoolId}`)
  if (!res.ok) throw new Error("Failed to fetch top performers")
  return await res.json() // [{ id, name, score, avatar, improvement }]
}

// Mock data for testing when backend is unavailable
const classesData: Class[] = [
  {
    class_id: "class-uuid-1",
    class_name: "Math 101",
    grade_level: "10",
    description: "Introduction to Mathematics",
    schedule: "Mon, Wed, Fri 9:00 AM",
    location: "Room 201",
    status: "Active",
    teacher_id: "teacher-uuid-1",
    school_id: 1,
    last_active: "2024-01-20",
    students: 25,
    avgScore: 75,
    studentList: [
      { id: 1, name: "Alice", grade: "A", avgScore: 85 },
      { id: 2, name: "Bob", grade: "B", avgScore: 70 },
    ],
    recentGames: [
      { id: 1, name: "Math Game 1", date: "2024-01-19", avgScore: 80 },
      { id: 2, name: "Math Game 2", date: "2024-01-18", avgScore: 75 },
    ],
  },
  {
    class_id: "class-uuid-2",
    class_name: "Science 101",
    grade_level: "10",
    description: "Introduction to Science",
    schedule: "Tue, Thu 10:00 AM",
    location: "Lab 101",
    status: "Active",
    teacher_id: "teacher-uuid-2",
    school_id: 1,
    last_active: "2024-01-20",
    students: 20,
    avgScore: 80,
    studentList: [
      { id: 3, name: "Charlie", grade: "A", avgScore: 90 },
      { id: 4, name: "David", grade: "C", avgScore: 65 },
    ],
    recentGames: [
      { id: 3, name: "Science Game 1", date: "2024-01-19", avgScore: 85 },
      { id: 4, name: "Science Game 2", date: "2024-01-18", avgScore: 80 },
    ],
  },
]

const gamesData: Game[] = [
  {
    game_id: 1,
    game_name: "Math Blaster",
    subject: "Math",
    level: "Beginner",
    description: "Blast your way through math problems!",
    status: "Active",
    creator: "InnoGames",
    last_updated: "2024-01-01",
    plays: 150,
    avg_score: 78,
    avg_time: "15 minutes",
    difficulty_level: 1,
    age_range: "6-10",
    thumbnail_url: "/math_blaster.png",
  },
  {
    game_id: 2,
    game_name: "Word Wizard",
    subject: "Reading",
    level: "Intermediate",
    description: "Cast spells with your vocabulary!",
    status: "Active",
    creator: "EduSoft",
    last_updated: "2023-12-15",
    plays: 200,
    avg_score: 85,
    avg_time: "20 minutes",
    difficulty_level: 2,
    age_range: "8-12",
    thumbnail_url: "/word_wizard.png",
  },
]

export const getClassesFormatted = async (): Promise<Class[]> => {
  return classesData
}

export const getGamesFormatted = async (): Promise<Game[]> => {
  return gamesData
}

export const getClassesByTeacher = async (teacherId: string): Promise<Class[]> => {
  // Changed teacherId to string
  return classesData.filter((cls) => cls.teacher_id === teacherId)
}

export const getClassById = (classId: string): Class | null => {
  // Changed classId to string
  const classItem = classesData.find((c) => c.class_id === classId)
  return classItem ? classItem : null
}
export async function getDashboardSummary() {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/dashboard-summary`)
    if (!res.ok) throw new Error("Failed to fetch dashboard summary")
    return await res.json()
  } catch (error) {
    console.error("Error fetching dashboard summary:", error)
    // Return mock data as fallback
    return {
      dashboardSummary: {
        currentPeriod: {
          metrics: {
            activeStudents: 150,
            totalStudents: 200,
            newStudents: 25,
            gamesPlayed: 1250,
            totalGames: 50,
            averageScore: 78,
            completionRate: 85,
          },
          trends: {
            studentGrowth: { percentage: 12, direction: "up" },
            scoreChange: { percentage: 5, direction: "up" },
            completionChange: { percentage: 8, direction: "up" },
          },
        },
        previousPeriod: {
          metrics: {
            activeStudents: 134,
            totalStudents: 180,
            newStudents: 20,
            gamesPlayed: 1150,
            totalGames: 45,
            averageScore: 74,
            completionRate: 78,
          },
        },
        topPerformers: {
          students: [
            { id: 1, name: "Emma Thompson", score: 95, improvement: 3 },
            { id: 2, name: "Noah Martinez", score: 92, improvement: 5 },
            { id: 3, name: "Olivia Johnson", score: 90, improvement: 2 },
          ],
          classes: [
            { id: 1, name: "3A", averageScore: 88, improvement: 4 },
            { id: 2, name: "3B", averageScore: 85, improvement: 3 },
          ],
          games: [
            { id: 1, name: "Math Blaster", popularity: 150, avg_score: 82 },
            { id: 2, name: "Word Wizard", popularity: 120, avg_score: 78 },
          ],
        },
      },
      timeSeriesData: {
        daily: {
          metrics: {
            gamesPlayed: [45, 52, 38, 65, 48, 55, 62],
          },
        },
      },
    }
  }
}
// Game Impact interfaces
export interface GameImpact {
  impact_id: number
  game_name: string
  main_subject?: string
  difficulty_level?: string
  recomended_age?: string
  time_to_complete?: string
  additional_notes?: string
  subjects_boost: Record<string, number>
  skills_boost: Record<string, number>
  add_strengths: string[]
  add_areas_on_low_score: string[]
  recommendations: string[]
}

export interface PossibleStrength {
  id: number
  strength_id: number
  name: string
  description: string
  category: string
}

export interface PossibleArea {
  area_id: number
  name: string
  description: string
  category: string
}

// Game Impact API functions
export async function getGameImpact(gameName: string): Promise<GameImpact | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/game-impacts/${encodeURIComponent(gameName)}`)
    if (!res.ok) {
      if (res.status === 404) return null
      throw new Error("Failed to fetch game impact")
    }
    return await res.json()
  } catch (error) {
    console.error("Error fetching game impact:", error)
    // Return mock data as fallback
    return {
      impact_id: 1,
      game_name: gameName,
      main_subject: "Math",
      difficulty_level: "Medium",
      recomended_age: "8-12",
      time_to_complete: "20 minutes",
      additional_notes: "Great for building problem-solving skills",
      subjects_boost: { Math: 3, Science: 1 },
      skills_boost: { "Problem Solving": 4, "Critical Thinking": 3 },
      add_strengths: ["1", "2"],
      add_areas_on_low_score: ["1"],
      recommendations: ["Word Wizard", "Science Quest"],
    }
  }
}

export async function createGameImpact(data: Omit<GameImpact, "impact_id">): Promise<GameImpact> {
  try {
    const res = await fetch(`${API_BASE_URL}/game-impacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create game impact")
    return await res.json()
  } catch (error) {
    console.error("Error creating game impact:", error)
    throw error
  }
}

export async function updateGameImpact(gameName: string, data: Partial<GameImpact>): Promise<GameImpact> {
  try {
    const res = await fetch(`${API_BASE_URL}/game-impacts/${encodeURIComponent(gameName)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to update game impact")
    return await res.json()
  } catch (error) {
    console.error("Error updating game impact:", error)
    throw error
  }
}

export async function deleteGameImpact(gameName: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/game-impacts/${encodeURIComponent(gameName)}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed to delete game impact")
  } catch (error) {
    console.error("Error deleting game impact:", error)
    throw error
  }
}

// Add getGame function (alias for getGameById)
export const getGame = async (gameId: number): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE_URL}/games/${gameId}`)
    if (!res.ok) {
      throw new Error("Failed to fetch game")
    }
    return await res.json()
  } catch (error) {
    console.error("Error fetching game:", error)
    return null
  }
}
