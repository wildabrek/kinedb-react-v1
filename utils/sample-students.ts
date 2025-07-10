// Assuming the URL is accessible and returns valid JSON
const JSON_URL = "http://localhost:3000/sample-students.json"

// --- Assuming a Student Type Definition like this ---
interface Student {
   id: string;
   name: string;
   grade: string;
   class: string;
   avatar: string;
   teacher: string;
   email: string;
   gamesPlayed: number;
   avgScore: number;
   lastActive: string;
   progress: string;
   subjects: { [key: string]: number };
   skills: { [key: string]: number };
   strengths: string[];
   areasToImprove: string[];
   gamePerformance: {
     name: string;
     score: number;
     plays: number;
     completion: number;
     avgTime: string;
     achievements: number;
   }[];
   monthlyProgress: {
     month: string;
     Math: number;
     English: number;
     Science: number;
     History: number;
   }[];
   skillDevelopment: {
     month: string;
     "Critical Thinking": number;
     "Problem Solving": number;
     "Reading Comprehension": number;
     // Add other skills if they appear here
   }[];
   learningGains: {
     game: string;
     gain: number;
   }[];
   recommendedGames: {
     name: string;
     level: string;
     description: string;
   }[];
   personalizedLearningPlan: { // Updated structure
     overallRecommendation: string;
     suggestedActionPlan: {
       shortTermGoals: string[];
       mediumTermGoals: string[];
       longTermGoals: string[];
     };
     teacherNotes: string;
   };
   // Remove old 'personalizedPlan' if it existed in the type
 }

// Use a self-executing async function to fetch the data
const fetchStudents = async (): Promise<Student[]> => {
 try {
   const response = await fetch(JSON_URL)
   if (!response.ok) {
     throw new Error(`HTTP error! status: ${response.status}`)
   }
   const data = await response.json()
   return data.student as Student[]
 } catch (error) {
   console.error("Could not fetch students data:", error)
   // Return an empty array or a default value to prevent errors
   return []
 }
}

// Export the fetched data as a constant
const student: Student[] = await fetchStudents(JSON_URL)

export { student }
