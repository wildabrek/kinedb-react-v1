import {
  generateUUID,
  type LocalKineDBData,
  type LocalSchoolData,
  type LocalTeacherData,
  type LocalClassData,
  type LocalStudentData,
} from "@/lib/local-data-manager"

export interface TestDataOptions {
  schoolCount: number
  teachersPerSchool: number
  classesPerSchool: number
  studentsPerClass: number
}

export interface TestDataSummary {
  schools: number
  teachers: number
  classes: number
  students: number
}

export interface GeneratedTestData {
  schools: LocalSchoolData[]
  teachers: LocalTeacherData[]
  classes: LocalClassData[]
  students: LocalStudentData[]
  summary: TestDataSummary
}

// Turkish names and cities for realistic test data
const turkishFirstNames = [
  "Ahmet",
  "Mehmet",
  "Mustafa",
  "Ali",
  "Hüseyin",
  "Hasan",
  "İbrahim",
  "İsmail",
  "Ömer",
  "Yusuf",
  "Fatma",
  "Ayşe",
  "Emine",
  "Hatice",
  "Zeynep",
  "Elif",
  "Meryem",
  "Büşra",
  "Seda",
  "Özge",
  "Can",
  "Ege",
  "Arda",
  "Kaan",
  "Berk",
  "Deniz",
  "Cem",
  "Onur",
  "Burak",
  "Emre",
  "İrem",
  "Dila",
  "Selin",
  "Nisa",
  "Ece",
  "Defne",
  "Ela",
  "Ada",
  "Nehir",
  "Lara",
]

const turkishLastNames = [
  "Yılmaz",
  "Kaya",
  "Demir",
  "Şahin",
  "Çelik",
  "Yıldız",
  "Yıldırım",
  "Öztürk",
  "Aydin",
  "Özdemir",
  "Arslan",
  "Doğan",
  "Kılıç",
  "Aslan",
  "Çetin",
  "Kara",
  "Koç",
  "Kurt",
  "Özkan",
  "Şimşek",
  "Erdoğan",
  "Güneş",
  "Akın",
  "Avcı",
  "Polat",
  "Bulut",
  "Kaplan",
  "Çakır",
  "Özer",
  "Turan",
]

const turkishCities = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Adana",
  "Konya",
  "Gaziantep",
  "Mersin",
  "Diyarbakır",
  "Kayseri",
  "Eskişehir",
  "Urfa",
  "Malatya",
  "Erzurum",
  "Van",
  "Batman",
  "Elazığ",
  "İçel",
  "Tokat",
  "Sivas",
  "Trabzon",
  "Balıkesir",
  "Kahramanmaraş",
  "Manisa",
  "Bolu",
  "Aydın",
  "Tekirdağ",
  "Sakarya",
  "Denizli",
]

const schoolTypes = ["İlkokulu", "Ortaokulu", "Lisesi", "Anadolu Lisesi", "Fen Lisesi", "Meslek Lisesi"]
const subjects = [
  "Matematik",
  "Türkçe",
  "Fen Bilgisi",
  "Sosyal Bilgiler",
  "İngilizce",
  "Beden Eğitimi",
  "Resim",
  "Müzik",
]
const gradeNames = ["1-A", "1-B", "2-A", "2-B", "3-A", "3-B", "4-A", "4-B", "5-A", "5-B"]

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateSchoolName(city: string): string {
  const schoolType = getRandomItem(schoolTypes)
  const nameOptions = [
    `${city} ${schoolType}`,
    `Atatürk ${schoolType}`,
    `Cumhuriyet ${schoolType}`,
    `Fatih ${schoolType}`,
    `Gazi ${schoolType}`,
    `İstiklal ${schoolType}`,
    `Mehmet Akif ${schoolType}`,
    `Namık Kemal ${schoolType}`,
    `Yunus Emre ${schoolType}`,
    `Mimar Sinan ${schoolType}`,
  ]
  return getRandomItem(nameOptions)
}

export function generateCompleteTestData(options: TestDataOptions): GeneratedTestData {
  const schools: LocalSchoolData[] = []
  const teachers: LocalTeacherData[] = []
  const classes: LocalClassData[] = []
  const students: LocalStudentData[] = []

  // Generate schools
  for (let i = 0; i < options.schoolCount; i++) {
    const city = getRandomItem(turkishCities)
    const school: LocalSchoolData = {
      local_id: generateUUID(),
      school_id: -(i + 1), // Negative IDs for local-only schools
      school_name: generateSchoolName(city),
      city: city,
      status: "Active",
      address: `${city} Merkez, ${getRandomNumber(1, 100)}. Sokak No: ${getRandomNumber(1, 50)}`,
      phone: `0${getRandomNumber(200, 599)} ${getRandomNumber(100, 999)} ${getRandomNumber(10, 99)} ${getRandomNumber(10, 99)}`,
      email: `info@${city.toLowerCase().replace("ı", "i").replace("ş", "s").replace("ç", "c").replace("ğ", "g").replace("ü", "u").replace("ö", "o")}okul.edu.tr`,
      principal: `${getRandomItem(turkishFirstNames)} ${getRandomItem(turkishLastNames)}`,
      student_count: 0, // Will be calculated later
      teacher_count: 0, // Will be calculated later
      established_year: getRandomNumber(1950, 2020),
    }
    schools.push(school)
  }

  // Generate teachers for each school
  schools.forEach((school) => {
    for (let i = 0; i < options.teachersPerSchool; i++) {
      const firstName = getRandomItem(turkishFirstNames)
      const lastName = getRandomItem(turkishLastNames)
      const teacher: LocalTeacherData = {
        local_id: generateUUID(),
        teacher_id: generateUUID(),
        name: firstName,
        surname: lastName,
        first_name: firstName,
        last_name: lastName,
        email: `${firstName.toLowerCase().replace("ı", "i").replace("ş", "s").replace("ç", "c").replace("ğ", "g").replace("ü", "u").replace("ö", "o")}.${lastName.toLowerCase().replace("ı", "i").replace("ş", "s").replace("ç", "c").replace("ğ", "g").replace("ü", "u").replace("ö", "o")}@${school.city.toLowerCase().replace("ı", "i").replace("ş", "s").replace("ç", "c").replace("ğ", "g").replace("ü", "u").replace("ö", "o")}okul.edu.tr`,
        status: "Active",
        school_id: school.school_id,
        phone: `0${getRandomNumber(500, 599)} ${getRandomNumber(100, 999)} ${getRandomNumber(10, 99)} ${getRandomNumber(10, 99)}`,
        subject: getRandomItem(subjects),
        experience_years: getRandomNumber(1, 25),
      }
      teachers.push(teacher)
    }
    school.teacher_count = options.teachersPerSchool
  })

  // Generate classes for each school
  schools.forEach((school) => {
    const schoolTeachers = teachers.filter((t) => t.school_id === school.school_id)

    for (let i = 0; i < options.classesPerSchool; i++) {
      const teacher = schoolTeachers[i % schoolTeachers.length] // Distribute classes among teachers
      const className = getRandomItem(gradeNames)
      const classData: LocalClassData = {
        local_id: generateUUID(),
        class_id: generateUUID(),
        class_name: className,
        name: className,
        grade_level: className.split("-")[0], // Extract grade number
        description: `${className} sınıfı - ${teacher.subject} dersi`,
        status: "Active",
        teacher_id: teacher.teacher_id,
        school_id: school.school_id,
        capacity: options.studentsPerClass,
        academic_year: "2024-2025",
        students: 0, // Will be calculated later
      }
      classes.push(classData)
    }
  })

  // Generate students for each class
  classes.forEach((classData) => {
    for (let i = 0; i < options.studentsPerClass; i++) {
      const firstName = getRandomItem(turkishFirstNames)
      const lastName = getRandomItem(turkishLastNames)
      const studentNumber = `${Math.abs(classData.school_id)}${classData.grade_level}${String(i + 1).padStart(3, "0")}`

      const student: LocalStudentData = {
        local_id: generateUUID(),
        student_internal_id: generateUUID(),
        name: firstName,
        surname: lastName,
        studentNumber: studentNumber,
        email: `${firstName.toLowerCase().replace("ı", "i").replace("ş", "s").replace("ç", "c").replace("ğ", "g").replace("ü", "u").replace("ö", "o")}.${lastName.toLowerCase().replace("ı", "i").replace("ş", "s").replace("ç", "c").replace("ğ", "g").replace("ü", "u").replace("ö", "o")}@ogrenci.edu.tr`,
        grade: classData.grade_level,
        class_id: Number.parseInt(classData.class_id.replace(/-/g, "").substring(0, 8), 16), // Convert UUID to number for compatibility
        school_id: classData.school_id,
        status: "Active",
        join_date: new Date(2024, 8, getRandomNumber(1, 30)).toISOString(), // September 2024
        avg_score: getRandomNumber(60, 100),
        games_played: getRandomNumber(5, 50),
        last_active: new Date(Date.now() - getRandomNumber(0, 7) * 24 * 60 * 60 * 1000).toISOString(), // Within last week
        progress_status: getRandomItem(["Excellent", "Good", "Average", "Needs Improvement"]),
        parent_name: `${getRandomItem(turkishFirstNames)} ${lastName}`,
        parent_email: `${firstName.toLowerCase().replace("ı", "i").replace("ş", "s").replace("ç", "c").replace("ğ", "g").replace("ü", "u").replace("ö", "o")}.veli@gmail.com`,
        parent_phone: `0${getRandomNumber(500, 599)} ${getRandomNumber(100, 999)} ${getRandomNumber(10, 99)} ${getRandomNumber(10, 99)}`,
      }
      students.push(student)
    }
    classData.students = options.studentsPerClass
  })

  // Update school student counts
  schools.forEach((school) => {
    const schoolStudents = students.filter((s) => s.school_id === school.school_id)
    school.student_count = schoolStudents.length
  })

  const summary: TestDataSummary = {
    schools: schools.length,
    teachers: teachers.length,
    classes: classes.length,
    students: students.length,
  }

  return {
    schools,
    teachers,
    classes,
    students,
    summary,
  }
}

export function generateTestData(options: TestDataOptions): LocalKineDBData {
  const testData = generateCompleteTestData(options)

  return {
    initialSetupComplete: true,
    schools: testData.schools,
    teachers: testData.teachers,
    classes: testData.classes,
    students: testData.students,
    lastUpdated: new Date().toISOString(),
  }
}

export function getTestDataSummary(data: LocalKineDBData): string {
  return `Generated ${data.schools.length} schools, ${data.teachers.length} teachers, ${data.classes.length} classes, and ${data.students.length} students`
}
