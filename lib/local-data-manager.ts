import { safeStorage } from "@/lib/utils/safeStorage"

export interface LocalSchoolData {
  local_id: string
  school_id: number
  school_name: string
  city: string
  status: string
  address?: string
  phone?: string
  email?: string
  principal?: string
  student_count?: number
  teacher_count?: number
  established_year?: number
}

export interface LocalStudentData {
  local_id: string
  student_internal_id: string
  name: string
  surname: string
  studentNumber: string
  email?: string
  avatar?: string
  grade?: string
  class_id: number
  school_id: number
  status?: string
  join_date?: string
  avg_score?: number
  avg_time_per_session?: string
  last_active?: string
  phone?: string
  progress_status?: string
  games_played?: number
  user_id?: number
  parent_name?: string
  parent_email?: string
  parent_phone?: string
  notes?: string
  address?: string
}

export interface LocalTeacherData {
  local_id: string
  teacher_id: string
  name: string
  surname: string
  first_name: string
  last_name: string
  email: string
  status?: string
  school_id: number
  user_id?: number
  phone?: string
  subject?: string
  experience_years?: number
}

export interface LocalClassData {
  local_id: string
  class_id: string
  class_name: string
  name: string
  grade_level?: string
  description?: string
  schedule?: string
  location?: string
  status?: string
  teacher_id: string
  school_id: number
  last_active?: string
  students?: number
  avgScore?: number
  capacity?: number
  academic_year?: string
}

export interface LocalKineDBData {
  initialSetupComplete: boolean
  schools: LocalSchoolData[]
  students: LocalStudentData[]
  teachers: LocalTeacherData[]
  classes: LocalClassData[]
  lastUpdated: string
}

// Legacy aliases for backward compatibility
export type LocalSchool = LocalSchoolData
export type LocalStudent = LocalStudentData
export type LocalTeacher = LocalTeacherData
export type LocalClass = LocalClassData
export type LocalData = LocalKineDBData

const LOCAL_DATA_KEY = "kinedb_local_data"

const defaultLocalData: LocalKineDBData = {
  initialSetupComplete: false,
  schools: [],
  students: [],
  teachers: [],
  classes: [],
  lastUpdated: new Date().toISOString(),
}

export function getLocalData(): LocalKineDBData {
  try {
    const data = safeStorage.getItem(LOCAL_DATA_KEY)
    if (data) {
      const parsedData = JSON.parse(data) as LocalKineDBData
      // Ensure all required fields exist
      return {
        ...defaultLocalData,
        ...parsedData,
      }
    }
  } catch (e) {
    console.error("Error loading local data:", e)
  }
  return defaultLocalData
}

// Alias for backward compatibility
export function loadLocalData(): LocalKineDBData {
  return getLocalData()
}

export function setLocalData(data: LocalKineDBData): void {
  try {
    const dataWithTimestamp = {
      ...data,
      lastUpdated: new Date().toISOString(),
    }
    safeStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(dataWithTimestamp))
  } catch (e) {
    console.error("Error saving local data:", e)
  }
}

// Alias for backward compatibility
export function setAllLocalData(data: LocalKineDBData): void {
  setLocalData(data)
}

export function isInitialSetupComplete(): boolean {
  const data = getLocalData()
  return data.initialSetupComplete
}

export function markInitialSetupComplete(): void {
  const data = getLocalData()
  data.initialSetupComplete = true
  setLocalData(data)
}

export function getLocalSchools(): LocalSchoolData[] {
  const data = getLocalData()
  return data.schools || []
}

export function setLocalSchools(schools: LocalSchoolData[]): void {
  const data = getLocalData()
  data.schools = schools
  setLocalData(data)
}

export function addLocalSchool(school: LocalSchoolData): void {
  const data = getLocalData()
  data.schools = data.schools || []
  data.schools.push(school)
  setLocalData(data)
}

export function updateLocalSchool(localId: string, updates: Partial<LocalSchoolData>): void {
  const data = getLocalData()
  const schoolIndex = data.schools.findIndex((s) => s.local_id === localId)
  if (schoolIndex !== -1) {
    data.schools[schoolIndex] = { ...data.schools[schoolIndex], ...updates }
    setLocalData(data)
  }
}

export function deleteLocalSchool(localId: string): void {
  const data = getLocalData()
  data.schools = data.schools.filter((s) => s.local_id !== localId)
  setLocalData(data)
}

export function getLocalStudents(): LocalStudentData[] {
  const data = getLocalData()
  return data.students || []
}

export function setLocalStudents(students: LocalStudentData[]): void {
  const data = getLocalData()
  data.students = students
  setLocalData(data)
}

export function addLocalStudent(student: LocalStudentData): void {
  const data = getLocalData()
  data.students = data.students || []
  data.students.push(student)
  setLocalData(data)
}

export function getLocalTeachers(): LocalTeacherData[] {
  const data = getLocalData()
  return data.teachers || []
}

export function setLocalTeachers(teachers: LocalTeacherData[]): void {
  const data = getLocalData()
  data.teachers = teachers
  setLocalData(data)
}

export function addLocalTeacher(teacher: LocalTeacherData): void {
  const data = getLocalData()
  data.teachers = data.teachers || []
  data.teachers.push(teacher)
  setLocalData(data)
}

export function getLocalClasses(): LocalClassData[] {
  const data = getLocalData()
  return data.classes || []
}

export function setLocalClasses(classes: LocalClassData[]): void {
  const data = getLocalData()
  data.classes = classes
  setLocalData(data)
}

export function addLocalClass(classData: LocalClassData): void {
  const data = getLocalData()
  data.classes = data.classes || []
  data.classes.push(classData)
  setLocalData(data)
}

export function clearLocalData(): void {
  safeStorage.removeItem(LOCAL_DATA_KEY)
}

export function clearAllLocalData(): void {
  clearLocalData()
}

export function getLocalDataStats() {
  const data = getLocalData()
  return {
    schools: data.schools?.length || 0,
    students: data.students?.length || 0,
    teachers: data.teachers?.length || 0,
    classes: data.classes?.length || 0,
    lastUpdated: data.lastUpdated,
    initialSetupComplete: data.initialSetupComplete,
  }
}

export function exportLocalDataToJSON(): string {
  const data = getLocalData()
  return JSON.stringify(data, null, 2)
}

export function importLocalDataFromJSON(jsonString: string): boolean {
  try {
    const importedData = JSON.parse(jsonString) as LocalKineDBData
    // Validate the structure
    if (
      typeof importedData === "object" &&
      Array.isArray(importedData.schools) &&
      Array.isArray(importedData.students) &&
      Array.isArray(importedData.teachers) &&
      Array.isArray(importedData.classes)
    ) {
      setLocalData(importedData)
      return true
    }
    return false
  } catch (e) {
    console.error("Error importing local data:", e)
    return false
  }
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Helper functions for school operations
export function updateSchoolId(oldId: number, newId: number): void {
  const data = getLocalData()

  // Update school
  const school = data.schools.find((s) => s.school_id === oldId)
  if (school) {
    school.school_id = newId
  }

  // Update related data
  data.teachers.forEach((teacher) => {
    if (teacher.school_id === oldId) {
      teacher.school_id = newId
    }
  })

  data.classes.forEach((classItem) => {
    if (classItem.school_id === oldId) {
      classItem.school_id = newId
    }
  })

  data.students.forEach((student) => {
    if (student.school_id === oldId) {
      student.school_id = newId
    }
  })

  setLocalData(data)
}
