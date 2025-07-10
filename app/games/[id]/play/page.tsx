"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { ArrowRight, RefreshCw, AlertCircle, Trophy, BarChart, Users, Dot } from "lucide-react"
import { useSearchParams, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"

interface Student {
  id: number
  name: string
  grade: string
  avg_score: number
}

export default function GamePlayPage({ params }: { params: { id: string } }) {
  const { id } = useParams()
  const gameId = Number.parseInt(id as string)
  const searchParams = useSearchParams()
  const selectedIds = searchParams.get("students")?.split(",").map(Number) || []
  const { user } = useAuth()

  const [students, setStudents] = useState<Student[]>([])
  const [scores, setScores] = useState<{ [key: number]: number }>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lastCompletedStudent, setLastCompletedStudent] = useState<number | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [syncStatus, setSyncStatus] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [debugMessages, setDebugMessages] = useState<string[]>([])
  const [lastPollTime, setLastPollTime] = useState<number>(0)
  const [pollCount, setPollCount] = useState<number>(0)
  const [completedStudents, setCompletedStudents] = useState<Set<number>>(new Set())
  const [mockMode, setMockMode] = useState(false)
  const [showGameSummary, setShowGameSummary] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)

  const [apiBaseUrl, setApiBaseUrl] = useState("http://localhost:8000")
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("connecting")
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  // Use refs to avoid dependency issues and infinite loops
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const studentsRef = useRef<Student[]>([])
  const scoresRef = useRef<{ [key: number]: number }>({})
  const currentIndexRef = useRef(0)
  const retryCountRef = useRef(0)
  const isFetchingRef = useRef(false)
  const lastFetchTimeRef = useRef(0)
  const requestInProgressRef = useRef(false)
  const hasInitializedRef = useRef(false)
  const studentsLoadedRef = useRef(false)
  const pollCountRef = useRef(0)
  const connectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const scoreIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Keep refs in sync with state
  useEffect(() => {
    studentsRef.current = students
    currentIndexRef.current = currentIndex
    scoresRef.current = scores
    pollCountRef.current = pollCount
  }, [students, currentIndex, scores, pollCount])

  // Add debug info
  const addDebugMessage = useCallback((message: string) => {
    console.log(message)
    setDebugMessages((prev) => {
      const newMessages = [`${new Date().toLocaleTimeString()}: ${message}`, ...prev]
      return newMessages.slice(0, 20) // Keep only the last 20 messages
    })
  }, []) // Boş bağımlılık dizisi

  // stopPolling fonksiyonunu önce tanımlayalım
  const stopPolling = useCallback(() => {
    addDebugMessage("Stopping polling")

    // Make sure we clear the interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
      addDebugMessage("Polling interval cleared")
    }

    setIsPolling(false)
  }, [addDebugMessage])

  // stopAllApiRequests fonksiyonunu önce tanımlayalım
  const stopAllApiRequests = useCallback(() => {
    console.log("All students completed. Stopping all API requests.")

    // Polling'i durdur
    stopPolling()

    // Tüm interval'ları temizle
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }

    // Diğer interval'ları da temizle
    if (connectionIntervalRef.current) {
      clearInterval(connectionIntervalRef.current)
      connectionIntervalRef.current = null
    }

    if (scoreIntervalRef.current) {
      clearInterval(scoreIntervalRef.current)
      scoreIntervalRef.current = null
    }

    // Oyun tamamlandı bayrağını ayarla
    setGameCompleted(true)

    // Oyun özetini göster
    setShowGameSummary(true)

    addDebugMessage("All API requests stopped. Game completed.")
  }, [stopPolling, addDebugMessage])

  // Function to poll for UI sync status
  // pollSyncStatus fonksiyonunu önce tanımlayalım
  const pollSyncStatus = useCallback(async () => {
    // Mock mod açıksa, API çağrısı yapmayalım
    if (mockMode) {
      console.log("Mock mod açık. API çağrısı atlanıyor.")
      return
    }
    try {
      // Tüm öğrenciler tamamlandıysa polling'i durduralım
      if (completedStudents.size === studentsRef.current.length && studentsRef.current.length > 0) {
        console.log("Tüm öğrenciler tamamlandı. Tüm API isteklerini durduruyoruz.")
        stopAllApiRequests()
        return
      }
      // Update poll count
      setPollCount((prev) => prev + 1)
      setLastPollTime(Date.now())

      if (!isPolling) {
        console.log("Polling is disabled, skipping poll")
        return
      }

      // Prevent concurrent requests
      if (requestInProgressRef.current) {
        console.log("Sync request already in progress, skipping")
        return
      }

      requestInProgressRef.current = true
      console.log(`Poll #${pollCountRef.current + 1}: Fetching UI sync status`)

      // Use AbortController to timeout long requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

      const res = await fetch(`${apiBaseUrl}/gamesession/ui-sync-status`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const errorText = await res.text()
        console.log(`Poll #${pollCountRef.current}: API error: ${res.status} - ${errorText}`)
        throw new Error(`Server responded with ${res.status}: ${errorText}`)
      }

      const data = await res.json()
      console.log(`Poll #${pollCountRef.current}: Received sync data: ${JSON.stringify(data)}`)
      setSyncStatus(data)

      // Check if we have valid data
      if (!data || Object.keys(data).length === 0) {
        console.log(`Poll #${pollCountRef.current}: No sync data available`)
        return
      }

      // Normalize data types - ensure student_id is number
      const studentId =
        typeof data.student_id === "string" ? Number.parseInt(data.student_id, 10) : Number(data.student_id)

      // Aktif öğrenciyi kontrol et ve currentIndex'i güncelle
      if (studentId) {
        const studentIndex = studentsRef.current.findIndex((s) => s.id === studentId)
        if (studentIndex !== -1) {
          // Her zaman güncelle, aynı olsa bile - bu, Unity'den gelen bilgiyi önceliklendirir
          console.log(
            `Poll #${pollCountRef.current}: Setting currentIndex to ${studentIndex} for active student ${studentId}`,
          )
          setCurrentIndex(studentIndex)
          currentIndexRef.current = studentIndex

          // Eğer tüm öğrenciler tamamlandıysa, bu aktif öğrenciyi lastCompletedStudent olarak da ayarla
          if (completedStudents.size === studentsRef.current.length && lastCompletedStudent === null) {
            console.log(
              `Poll #${pollCountRef.current}: All students completed. Setting lastCompletedStudent to active student ${studentId}`,
            )
            setLastCompletedStudent(studentId)
          }
        }
      }

      // Check if we have a completed game with score
      const completed = data.completed === true || data.completed === 1
      const score = typeof data.score === "string" ? Number.parseInt(data.score, 10) : Number(data.score)

      console.log(
        `Poll #${pollCountRef.current}: Normalized data - completed: ${completed}, studentId: ${studentId}, score: ${score}`,
      )

      // Geri kalan kod aynı...
      if (completed && studentId && score !== null && score !== undefined) {
        // Eğer bu öğrenci zaten tamamlanmış olarak işaretlenmişse, tekrar işlem yapma
        if (completedStudents.has(studentId)) {
          console.log(`Poll #${pollCountRef.current}: Student ${studentId} already marked as completed. Skipping.`)
          requestInProgressRef.current = false
          return
        }

        console.log(`Poll #${pollCountRef.current}: Found completed game for student ${studentId} with score ${score}`)

        // Always update the score, even if it's the same
        setScores((prev) => {
          const newScores = {
            ...prev,
            [studentId]: score,
          }
          console.log(`Poll #${pollCountRef.current}: Updated scores: ${JSON.stringify(newScores)}`)

          // Skor güncellendiğinde, bir sonraki aktif öğrenciyi belirle
          setTimeout(() => {
            // Find the index of this student in our array
            const completedIndex = studentsRef.current.findIndex((s) => s.id === studentId)

            // Tüm öğrenciler tamamlandıysa, son tamamlanan öğrenciyi göster
            if (completedStudents.size + 1 >= studentsRef.current.length) {
              console.log(
                `Poll #${pollCountRef.current}: All students completed. Setting currentIndex to last completed student.`,
              )
              setCurrentIndex(completedIndex)
              currentIndexRef.current = completedIndex
            } else {
              // Tamamlanmamış bir sonraki öğrenciyi bul
              let nextIndex = (completedIndex + 1) % studentsRef.current.length
              let loopCount = 0
              const completedStudentsArray = Array.from(completedStudents)
              completedStudentsArray.push(studentId) // Yeni tamamlanan öğrenciyi de ekle

              while (
                completedStudentsArray.includes(studentsRef.current[nextIndex].id) &&
                loopCount < studentsRef.current.length
              ) {
                nextIndex = (nextIndex + 1) % studentsRef.current.length
                loopCount++
              }

              if (loopCount < studentsRef.current.length) {
                console.log(`Poll #${pollCountRef.current}: Setting currentIndex to next active student: ${nextIndex}`)
                setCurrentIndex(nextIndex)
                currentIndexRef.current = nextIndex
              }
            }
          }, 100)

          return newScores
        })

        // Add this student to the completed students set
        setCompletedStudents((prev) => {
          const newSet = new Set(prev)
          newSet.add(studentId)
          console.log(
            `Poll #${pollCountRef.current}: Added student ${studentId} to completed students. Total: ${newSet.size}`,
          )
          return newSet
        })

        // Set the last completed student
        console.log(`Poll #${pollCountRef.current}: Setting lastCompletedStudent to ${studentId}`)
        setLastCompletedStudent(studentId)

        // Find the index of this student in our array
        const completedIndex = studentsRef.current.findIndex((s) => s.id === studentId)
        console.log(`Poll #${pollCountRef.current}: Student index in array: ${completedIndex}`)

        if (completedIndex !== -1) {
          // Calculate the next student index
          // Find the next uncompleted student
          let nextIndex = (completedIndex + 1) % studentsRef.current.length
          let loopCount = 0
          const completedStudentsArray = Array.from(completedStudents)

          // Check if we've found an uncompleted student or if all students are completed
          while (
            completedStudentsArray.includes(studentsRef.current[nextIndex].id) &&
            loopCount < studentsRef.current.length
          ) {
            nextIndex = (nextIndex + 1) % studentsRef.current.length
            loopCount++
          }

          // If we've checked all students and they're all completed, don't move to next student
          if (loopCount >= studentsRef.current.length || completedStudentsArray.length >= studentsRef.current.length) {
            console.log(
              `Poll #${pollCountRef.current}: All students have completed their games. Not moving to next student.`,
            )
            requestInProgressRef.current = false
            return // Exit the function early
          }

          console.log(
            `Poll #${pollCountRef.current}: Next student index would be: ${nextIndex}, current index is: ${currentIndexRef.current}`,
          )

          // IMMEDIATELY update the current index to show the correct student as playing
          if (currentIndexRef.current !== nextIndex) {
            console.log(`Poll #${pollCountRef.current}: Setting currentIndex to ${nextIndex}`)
            setCurrentIndex(nextIndex)
            currentIndexRef.current = nextIndex // Manually update the ref to avoid stale values
          }

          // Send start signal for the next student with a slight delay
          setTimeout(() => {
            const nextStudentId = studentsRef.current[nextIndex].id

            // Eğer bu öğrenci zaten tamamlanmışsa, bir sonraki öğrenciye geç
            if (completedStudents.has(nextStudentId)) {
              console.log(
                `Poll #${pollCountRef.current}: Student ${nextStudentId} already completed. Finding next student.`,
              )

              // Bir sonraki öğrenciye geç - handleNextStudent fonksiyonunu çağırmak yerine doğrudan mantığı uygula
              let nextStudentIndex = (nextIndex + 1) % studentsRef.current.length
              let loopCount = 0
              const completedStudentsArray = Array.from(completedStudents)

              // Check if we've found an uncompleted student or if all students are completed
              while (
                completedStudentsArray.includes(studentsRef.current[nextStudentIndex].id) &&
                loopCount < studentsRef.current.length
              ) {
                nextStudentIndex = (nextIndex + 1) % studentsRef.current.length
                loopCount++
              }

              // If we've checked all students and they're all completed, don't move to next student
              if (
                loopCount >= studentsRef.current.length ||
                completedStudentsArray.length >= completedStudents.length
              ) {
                console.log(
                  `Poll #${pollCountRef.current}: All students have completed their games. Not moving to next student.`,
                )
                return // Exit the function early
              }

              console.log(`Poll #${pollCountRef.current}: Moving to next student at index ${nextStudentIndex}`)
              setCurrentIndex(nextStudentIndex)
              currentIndexRef.current = nextStudentIndex

              const nextId = studentsRef.current[nextStudentIndex].id
              console.log(`Poll #${pollCountRef.current}: Sending start signal for next student: ${nextId}`)
              sendStartSignal(nextId)
              return
            }

            console.log(`Poll #${pollCountRef.current}: Sending start signal for next student: ${nextStudentId}`)
            sendStartSignal(nextStudentId)
          }, 500)
        }
      } else {
        console.log(`Poll #${pollCountRef.current}: No completed game found in sync data`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.log(`Poll #${pollCountRef.current}: Error: ${errorMessage}`)
      console.error("Polling error:", err)

      if (String(err).includes("ERR_INSUFFICIENT_RESOURCES")) {
        console.log("Resource limit reached during polling. Pausing polling...")

        // Temporarily pause polling for 10 seconds
        stopPolling()
        setTimeout(() => {
          if (studentsRef.current.length > 0) {
            console.log("Resuming polling after resource error pause")
            startPolling()
          }
        }, 10000)
      }
    } finally {
      requestInProgressRef.current = false
    }
  }, [isPolling, completedStudents, lastCompletedStudent, apiBaseUrl, mockMode, stopAllApiRequests, stopPolling])

  // Start/stop polling
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }

    addDebugMessage("Starting polling")
    setIsPolling(true)

    // Poll immediately with a small delay to ensure state is updated
    setTimeout(() => {
      pollSyncStatus().catch((err) => {
        addDebugMessage(`Error in initial poll: ${err.message}`)
        console.error("Error in initial poll:", err)
      })

      // Then set up interval - use a longer interval to reduce resource usage
      pollingIntervalRef.current = setInterval(() => {
        addDebugMessage("Polling interval triggered")
        pollSyncStatus().catch((err) => {
          addDebugMessage(`Error in interval poll: ${err.message}`)
          console.error("Error in interval poll:", err)
        })
      }, 3000) // Poll every 3 seconds
    }, 500) // Small delay before first poll
  }, [pollSyncStatus, addDebugMessage])

  // handleCheckSyncStatus fonksiyonunu da benzer şekilde güncelleyelim
  const handleCheckSyncStatus = useCallback(async () => {
    // Mock mod açıksa veya oyun tamamlandıysa, API çağrısı yapmayalım
    if (mockMode || gameCompleted) {
      console.log(`${mockMode ? "Mock mod açık" : "Oyun tamamlandı"}. API çağrısı atlanıyor.`)
      return
    }
    try {
      console.log("Manually checking sync status")

      const res = await fetch(`${apiBaseUrl}/gamesession/ui-sync-status`)

      if (!res.ok) {
        const errorText = await res.text()
        console.log(`Failed to fetch UI sync status: ${res.status} - ${errorText}`)
        return
      }

      const data = await res.json()
      setSyncStatus(data)
      console.log(`Sync status: ${JSON.stringify(data)}`)

      // Aktif öğrenciyi kontrol et ve currentIndex'i güncelle
      const studentId =
        typeof data.student_id === "string" ? Number.parseInt(data.student_id, 10) : Number(data.student_id)

      if (studentId) {
        const studentIndex = studentsRef.current.findIndex((s) => s.id === studentId)
        if (studentIndex !== -1 && studentIndex !== currentIndexRef.current) {
          console.log(
            `Manual check: Updating currentIndex from ${currentIndexRef.current} to ${studentIndex} for active student ${studentId}`,
          )
          setCurrentIndex(studentIndex)
          currentIndexRef.current = studentIndex
        }
      }

      // Process the sync status manually - use the same normalization as in pollSyncStatus
      const completed = data.completed === true || data.completed === 1
      const score = typeof data.score === "string" ? Number.parseInt(data.score, 10) : Number(data.score)

      console.log(`Manual check: Normalized data - completed: ${completed}, studentId: ${studentId}, score: ${score}`)

      // Geri kalan kod aynı...
      if (completed && studentId && score !== null && score !== undefined) {
        console.log(`Manual check: Found completed game for student ${studentId} with score ${score}`)

        // Update the score
        setScores((prev) => {
          const newScores = {
            ...prev,
            [studentId]: score,
          }

          // Skor güncellendiğinde, bir sonraki aktif öğrenciyi belirle
          setTimeout(() => {
            // Find the index of this student in our array
            const completedIndex = studentsRef.current.findIndex((s) => s.id === studentId)

            // Tüm öğrenciler tamamlandıysa, son tamamlanan öğrenciyi göster
            if (completedStudents.size + 1 >= studentsRef.current.length) {
              console.log(`Manual check: All students completed. Setting currentIndex to last completed student.`)
              setCurrentIndex(completedIndex)
              currentIndexRef.current = completedIndex
            } else {
              // Tamamlanmamış bir sonraki öğrenciyi bul
              let nextIndex = (completedIndex + 1) % studentsRef.current.length
              let loopCount = 0
              const completedStudentsArray = Array.from(completedStudents)
              completedStudentsArray.push(studentId) // Yeni tamamlanan öğrenciyi de ekle

              while (
                completedStudentsArray.includes(studentsRef.current[nextIndex].id) &&
                loopCount < studentsRef.current.length
              ) {
                nextIndex = (nextIndex + 1) % studentsRef.current.length
                loopCount++
              }

              if (loopCount < studentsRef.current.length) {
                console.log(`Manual check: Setting currentIndex to next active student: ${nextIndex}`)
                setCurrentIndex(nextIndex)
                currentIndexRef.current = nextIndex
              }
            }
          }, 100)

          return newScores
        })

        // Add this student to the completed students set
        setCompletedStudents((prev) => {
          const newSet = new Set(prev)
          newSet.add(studentId)
          console.log(`Manual check: Added student ${studentId} to completed students. Total: ${newSet.size}`)
          return newSet
        })

        // Set the last completed student
        setLastCompletedStudent(studentId)
        console.log(`Manual check: Set lastCompletedStudent to ${studentId}`)

        // Find the index of this student in our array
        const completedIndex = studentsRef.current.findIndex((s) => s.id === studentId)
        console.log(`Manual check: Student index in array: ${completedIndex}`)

        if (completedIndex !== -1) {
          // Calculate the next student index
          // Find the next uncompleted student
          let nextIndex = (completedIndex + 1) % studentsRef.current.length
          let loopCount = 0
          const completedStudentsArray = Array.from(completedStudents)

          // Check if we've found an uncompleted student or if all students are completed
          while (
            completedStudentsArray.includes(studentsRef.current[nextIndex].id) &&
            loopCount < studentsRef.current.length
          ) {
            nextIndex = (nextIndex + 1) % studentsRef.current.length
            loopCount++
          }

          // If we've checked all students and they're all completed, don't move to next student
          if (loopCount >= studentsRef.current.length || completedStudentsArray.length >= studentsRef.current.length) {
            console.log(`Manual check: All students have completed their games. Not moving to next student.`)
            return // Exit the function early
          }

          console.log(
            `Manual check: Next student index would be: ${nextIndex}, current index is: ${currentIndexRef.current}`,
          )

          // IMMEDIATELY update the current index to show the correct student as playing
          if (currentIndexRef.current !== nextIndex) {
            console.log(`Manual check: Setting currentIndex to ${nextIndex}`)
            setCurrentIndex(nextIndex)
            currentIndexRef.current = nextIndex // Manually update the ref to avoid stale values
          }

          // Send start signal for the next student with a slight delay
          setTimeout(() => {
            const nextStudentId = studentsRef.current[nextIndex].id
            console.log(`Manual check: Sending start signal for next student: ${nextStudentId}`)
            sendStartSignal(nextStudentId)
          }, 500)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.log(`Error checking sync status: ${errorMessage}`)
      console.error("Error checking sync status:", err)
    }
  }, [completedStudents, apiBaseUrl, mockMode, gameCompleted])

  // Fetch students for this game - with localStorage caching
  const fetchStudents = useCallback(
    async (force = false) => {
      // Mock mod açıksa, API çağrısı yapmayalım
      if (mockMode) {
        console.log("Mock mod açık. API çağrısı atlanıyor.")
        return
      }
      // Prevent concurrent requests
      if (isFetchingRef.current) {
        addDebugMessage("Fetch already in progress, skipping")
        return
      }

      // Check localStorage cache first
      const cacheKey = `students_${gameId}_${selectedIds.join("_")}`
      const cachedData = localStorage.getItem(cacheKey)

      if (!force && cachedData) {
        try {
          const { data, timestamp } = JSON.parse(cachedData)
          const cacheAge = Date.now() - timestamp

          // Use cache if it's less than 5 minutes old
          if (cacheAge < 5 * 60 * 1000) {
            addDebugMessage("Using cached student data")
            setStudents(data)
            studentsLoadedRef.current = true
            return data
          } else {
            addDebugMessage("Cache expired, fetching fresh data")
          }
        } catch (err) {
          addDebugMessage("Error parsing cache, fetching fresh data")
        }
      }

      setIsLoadingStudents(true)
      isFetchingRef.current = true

      try {
        addDebugMessage(`Fetching students (attempt ${retryCountRef.current + 1})`)

        // Check if we have valid gameId and selectedIds
        if (!gameId) {
          throw new Error("Invalid game ID")
        }

        if (!selectedIds || selectedIds.length === 0) {
          throw new Error("No student IDs selected")
        }

        const url = `${apiBaseUrl}/games/${gameId}/students`
        addDebugMessage(`Fetching from URL: ${url}`)

        // Use AbortController to timeout long requests
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        const res = await fetch(url, {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!res.ok) {
          const errorText = await res.text()
          addDebugMessage(`API error: ${res.status} - ${errorText}`)
          throw new Error(`Server responded with ${res.status}: ${errorText}`)
        }

        const data = await res.json()
        addDebugMessage(`Received ${data.length} students from API`)

        // Check if data is valid
        if (!Array.isArray(data)) {
          throw new Error(`Invalid response format: expected array, got ${typeof data}`)
        }

        // Filter students based on selected IDs and ensure uniqueness
        const filteredStudents = data
          .filter((s: any) => selectedIds.includes(s.id))
          .map((item: any) => ({
            id: item.id,
            name: item.name,
            grade: item.grade,
            avg_score: item.avg_score || 0,
          }))

        // Create a unique list based on student IDs
        const uniqueStudents = Array.from(new Map(filteredStudents.map((item: Student) => [item.id, item])).values())

        addDebugMessage(`Filtered to ${uniqueStudents.length} selected students`)

        // Cache the results in localStorage
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: uniqueStudents,
            timestamp: Date.now(),
          }),
        )

        setStudents(uniqueStudents as Student[])
        studentsLoadedRef.current = true
        setError(null) // Clear any previous errors
        retryCountRef.current = 0 // Reset retry count on success
        return uniqueStudents
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        addDebugMessage(`Error fetching students: ${errorMessage}`)
        setError(`Error fetching students: ${errorMessage}`)

        // Only retry once to avoid overwhelming the server
        if (retryCountRef.current < 1) {
          retryCountRef.current += 1
          const delay = 5000 // 5 second delay
          addDebugMessage(`Will retry in ${delay / 1000} seconds...`)

          setTimeout(() => {
            addDebugMessage(`Auto-retrying fetch students (${retryCountRef.current}/1)`)
            fetchStudents(true) // Force refresh on retry
          }, delay)
        }
        return null
      } finally {
        setIsLoadingStudents(false)
        isFetchingRef.current = false
      }
    },
    [gameId, selectedIds, addDebugMessage, apiBaseUrl, mockMode],
  )

  // sendStartSignal fonksiyonunu tanımlayalım
  const sendStartSignal = async (studentId: number) => {
    try {
      console.log(`Sending start signal for student ${studentId} with game ID ${gameId}`)
      console.log(`Sending start signal for student ${studentId} with game ID ${gameId} and user_id ${user?.user_id}`)

      // Önce öğrencinin indeksini bulalım ve currentIndex'i güncelleyelim
      const studentIndex = students.findIndex((s) => s.id === studentId)
      if (studentIndex !== -1 && studentIndex !== currentIndex) {
        console.log(`Updating currentIndex from ${currentIndex} to ${studentIndex} for starting student`)
        setCurrentIndex(studentIndex)
        currentIndexRef.current = studentIndex
      }
      console.log(user?.user_id)
      // API'ye yapılan isteği güncelleyelim - game_id'yi body içinde gönderelim
      const response = await fetch(`${apiBaseUrl}/gamesession/send-start-signal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_id: Number(gameId),
          student_id: Number(studentId),
          user_id: Number(user?.user_id),
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        console.log(`Error sending start signal: ${text}`)
        setError(`Failed to send start signal: ${response.status}`)
        return
      }
      console.log(`Start signal sent for student ${studentId} by user ${user?.user_id}`)

      const result = await response.json()
      console.log(`Start signal result: ${JSON.stringify(result)}`)

      // Başarılı bir start signal sonrası, polling'i yeniden başlat
      if (!isPolling) {
        console.log("Start signal successful, starting polling")
        startPolling()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.log(`Failed to send start signal: ${errorMessage}`)
      setError(`Failed to send start signal: ${errorMessage}`)
    }
  }

  // fetchAllScores fonksiyonunu düzenleyelim - gameId ve selectedIds dışındaki bağımlılıkları kaldıralım
  const fetchAllScores = useCallback(async () => {
    // Mock mod açıksa, API çağrısı yapmayalım
    if (mockMode) {
      console.log("Mock mod açık. API çağrısı atlanıyor.")
      return
    }
    try {
      // Tüm öğrenciler tamamlandıysa ve skorları zaten aldıysak, gereksiz API çağrısı yapmayalım
      if (completedStudents.size === selectedIds.length && Object.keys(scores).length === selectedIds.length) {
        console.log("Tüm öğrenciler zaten tamamlandı ve skorlar mevcut. API çağrısı atlanıyor.")

        // Eğer oyun tamamlanmadıysa, tüm API isteklerini durduralım
        if (!gameCompleted) {
          stopAllApiRequests()
        }

        return scores
      }
      console.log("Fetching all scores")

      if (!gameId || !selectedIds || selectedIds.length === 0) {
        console.log("Cannot fetch scores: Invalid game ID or no student IDs")
        return
      }

      const url = `${apiBaseUrl}/gamesession/all-scores?game_id=${gameId}&student_ids=${selectedIds.join(",")}`
      console.log(`Fetching from URL: ${url}`)

      const res = await fetch(url, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.log(`API error: ${res.status} - ${errorText}`)
        throw new Error(`Server responded with ${res.status}: ${errorText}`)
      }

      const data = await res.json()
      console.log(`Received scores for ${Object.keys(data).length} students`)

      // Skorları güncelle
      const newScores: { [key: number]: number } = {}
      const newCompletedStudents = new Set<number>()

      Object.entries(data).forEach(([studentId, info]: [string, any]) => {
        const id = Number.parseInt(studentId, 10)
        if (info.completed && info.score !== null && info.score !== undefined) {
          newScores[id] = info.score
          newCompletedStudents.add(id)
        }
      })

      console.log(`Updating scores: ${JSON.stringify(newScores)}`)
      console.log(`Updating completed students: ${Array.from(newCompletedStudents)}`)

      setScores(newScores)
      setCompletedStudents(newCompletedStudents)

      // Skorlar güncellendiğinde, aktif öğrenciyi güncelle
      setTimeout(() => {
        // Tüm öğrenciler tamamlandıysa, son tamamlanan öğrenciyi göster
        if (newCompletedStudents.size === selectedIds.length && lastCompletedStudent) {
          const lastCompletedIndex = studentsRef.current.findIndex((s) => s.id === lastCompletedStudent)
          if (lastCompletedIndex !== -1) {
            console.log(
              `fetchAllScores: All students completed. Setting currentIndex to last completed student: ${lastCompletedStudent}`,
            )
            setCurrentIndex(lastCompletedIndex)
            currentIndexRef.current = lastCompletedIndex
          }
        } else {
          // Tamamlanmamış ilk öğrenciyi bul
          const completedStudentsArray = Array.from(newCompletedStudents)
          let activeIndex = -1

          for (let i = 0; i < studentsRef.current.length; i++) {
            if (!completedStudentsArray.includes(studentsRef.current[i].id)) {
              activeIndex = i
              break
            }
          }

          if (activeIndex !== -1 && activeIndex !== currentIndexRef.current) {
            console.log(
              `fetchAllScores: Setting currentIndex to active student: ${studentsRef.current[activeIndex].id}`,
            )
            setCurrentIndex(activeIndex)
            currentIndexRef.current = activeIndex
          }
        }
      }, 100)

      // Eğer tüm öğrenciler tamamlandıysa, aktif öğrenciyi kontrol et
      if (newCompletedStudents.size === selectedIds.length) {
        console.log("All students completed. Checking active student from UI-sync-status after fetching scores.")
        // setTimeout kullanarak state güncellemelerinin tamamlanmasını bekleyelim
        setTimeout(() => {
          handleCheckSyncStatus()
        }, 100)
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error(`Error fetching all scores: ${errorMessage}`)
      console.error("Error fetching all scores:", err)
      return null
    }
  }, [
    gameId,
    selectedIds,
    apiBaseUrl,
    completedStudents,
    scores,
    handleCheckSyncStatus,
    mockMode,
    gameCompleted,
    stopAllApiRequests,
    lastCompletedStudent,
  ])

  // Manual controls
  const handleNextStudent = useCallback(() => {
    if (students.length === 0) return

    // Find the next uncompleted student
    let nextIndex = (currentIndex + 1) % students.length
    let loopCount = 0
    const completedStudentsArray = Array.from(completedStudents)

    // Check if we've found an uncompleted student or if all students are completed
    while (completedStudentsArray.includes(students[nextIndex].id) && loopCount < students.length) {
      nextIndex = (nextIndex + 1) % students.length
      loopCount++
    }

    // If we've checked all students and they're all completed, don't move to next student
    if (loopCount >= students.length || completedStudentsArray.length >= students.length) {
      addDebugMessage(`Manual next: All students have completed their games. Not moving to next student.`)
      return // Exit the function early
    }

    addDebugMessage(`Manually moving to next student at index ${nextIndex}`)
    setCurrentIndex(nextIndex)

    const nextStudentId = students[nextIndex].id
    sendStartSignal(nextStudentId)
  }, [students, currentIndex, completedStudents, addDebugMessage])

  // checkConnection fonksiyonunu HEAD yerine GET metodu kullanacak şekilde güncelleyelim
  const checkConnection = useCallback(async () => {
    // Eğer oyun tamamlandıysa, API çağrısı yapmayalım
    if (gameCompleted) {
      console.log("Oyun tamamlandı. Bağlantı kontrolü atlanıyor.")
      return true
    }
    try {
      setConnectionStatus("connecting")
      // HEAD yerine GET metodu kullanıyoruz
      const res = await fetch(`${apiBaseUrl}/gamesession/ui-sync-status`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
        signal: AbortSignal.timeout(3000), // 3 saniye timeout
      })

      if (res.ok) {
        setConnectionStatus("connected")
        setError(null)
        setRetryCount(0)
        return true
      } else {
        throw new Error(`Server responded with status: ${res.status}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error(`Connection check failed: ${errorMessage}`)
      setConnectionStatus("disconnected")

      // Hata mesajını güncelle - daha açıklayıcı hata mesajı
      let errorDetail = errorMessage
      if (errorMessage.includes("405")) {
        errorDetail = "Sunucu bu istek metodunu desteklemiyor (405 Method Not Allowed)"
      } else if (errorMessage.includes("Failed to fetch")) {
        errorDetail = "Sunucuya ulaşılamıyor. Sunucunun çalıştığından emin olun."
      }

      setError(`Backend sunucusuna bağlanılamıyor: ${errorDetail}`)

      // Yeniden deneme sayısını artır
      setRetryCount((prev) => prev + 1)
      return false
    }
  }, [apiBaseUrl, gameCompleted])

  // Initialize component once
  useEffect(() => {
    if (hasInitializedRef.current) return

    hasInitializedRef.current = true
    addDebugMessage("Component initialized")

    // Fetch students with a delay to ensure component is fully mounted
    setTimeout(() => {
      fetchStudents()
    }, 500)

    // Sayfa yüklendiğinde polling'i otomatik olarak başlat
    setTimeout(() => {
      if (!isPolling) {
        addDebugMessage("Auto-starting polling on component initialization")
        startPolling()
      }
    }, 2000)

    // Cleanup function
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [fetchStudents, addDebugMessage, startPolling, isPolling])

  // Start the first student's game when students are loaded
  useEffect(() => {
    if (students.length > 0 && !studentsLoadedRef.current && user?.user_id !== undefined && user?.user_id !== null) {
      studentsLoadedRef.current = true
      const firstStudentId = students[0].id
      addDebugMessage(`Starting game for first student: ${firstStudentId}`)
      sendStartSignal(firstStudentId)
    }
  }, [students, user, addDebugMessage])

  // Start polling when students are loaded
  useEffect(() => {
    // Only start polling if it's not already running and we have students
    if (students.length > 0 && !isPolling && studentsLoadedRef.current) {
      // Önce UI-sync-status'u kontrol edelim
      handleCheckSyncStatus()

      // Delay starting polling to ensure component is fully mounted
      const timer = setTimeout(() => {
        startPolling()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [students.length, isPolling, startPolling, studentsLoadedRef.current, handleCheckSyncStatus])

  // Sayfa yüklendiğinde ve belirli aralıklarla tüm skorları alalım - useEffect'i düzenleyelim
  useEffect(() => {
    if (students.length > 0 && studentsLoadedRef.current && !gameCompleted) {
      // Sayfa yüklendiğinde tüm skorları al
      const fetchScores = async () => {
        const result = await fetchAllScores()

        // Skorlar yüklendikten sonra aktif öğrenciyi kontrol et
        if (completedStudents.size === students.length) {
          console.log("All students completed. Checking active student after fetching scores.")
          handleCheckSyncStatus()

          // Tüm öğrenciler tamamlandığında, son tamamlanan öğrenciyi göster
          if (lastCompletedStudent) {
            const lastCompletedIndex = students.findIndex((s) => s.id === lastCompletedStudent)
            if (lastCompletedIndex !== -1 && lastCompletedIndex !== currentIndex) {
              console.log(
                `All students completed. Setting currentIndex to last completed student: ${lastCompletedStudent}`,
              )
              setCurrentIndex(lastCompletedIndex)
            }
          }

          // Tüm API isteklerini durdur
          stopAllApiRequests()
        }
      }

      fetchScores()

      // Her 30 saniyede bir tüm skorları al - eğer oyun tamamlanmadıysa
      scoreIntervalRef.current = setInterval(() => {
        if (!gameCompleted) {
          fetchScores()
        } else {
          // Eğer oyun tamamlandıysa interval'ı temizle
          if (scoreIntervalRef.current) {
            clearInterval(scoreIntervalRef.current)
            scoreIntervalRef.current = null
          }
        }
      }, 30000)

      return () => {
        if (scoreIntervalRef.current) {
          clearInterval(scoreIntervalRef.current)
          scoreIntervalRef.current = null
        }
      }
    }
  }, [
    students.length,
    studentsLoadedRef.current,
    fetchAllScores,
    completedStudents,
    handleCheckSyncStatus,
    lastCompletedStudent,
    students,
    currentIndex,
    stopAllApiRequests,
    gameCompleted,
  ])

  // Bağlantı kontrolü için useEffect'i düzenleyelim
  useEffect(() => {
    // Sayfa yüklendiğinde bağlantıyı kontrol et - eğer oyun tamamlanmadıysa
    if (!gameCompleted) {
      checkConnection()

      // Her 30 saniyede bir bağlantıyı kontrol et - eğer oyun tamamlanmadıysa
      connectionIntervalRef.current = setInterval(() => {
        if (!gameCompleted) {
          checkConnection()
        } else {
          // Eğer oyun tamamlandıysa interval'ı temizle
          if (connectionIntervalRef.current) {
            clearInterval(connectionIntervalRef.current)
            connectionIntervalRef.current = null
          }
        }
      }, 30000)

      return () => {
        if (connectionIntervalRef.current) {
          clearInterval(connectionIntervalRef.current)
          connectionIntervalRef.current = null
        }
      }
    }
  }, [checkConnection, gameCompleted])

  // Temizleme işlemlerini yapmak için component unmount olduğunda çalışacak bir useEffect ekleyelim
  useEffect(() => {
    // Component unmount olduğunda tüm interval'ları temizle
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }

      if (connectionIntervalRef.current) {
        clearInterval(connectionIntervalRef.current)
        connectionIntervalRef.current = null
      }

      if (scoreIntervalRef.current) {
        clearInterval(scoreIntervalRef.current)
        scoreIntervalRef.current = null
      }
    }
  }, [])

  // Butonların disabled durumlarını gameCompleted state'ine göre güncelleyelim
  // "Sonraki Öğrenciye Geç" butonunun disabled özelliğini şu şekilde değiştirelim:
  // "Polling Başlat/Durdur" butonunun disabled özelliğini şu şekilde değiştirelim:
  // "Polling'i Yeniden Başlat" butonunun disabled özelliğini şu şekilde değiştirelim:
  // "Sync Durumunu Kontrol Et" butonunun disabled özelliğini şu şekilde değiştirelim:

  // Oyun özeti için gerekli hesaplamaları yapalım
  const getGameSummary = useCallback(() => {
    if (students.length === 0 || Object.keys(scores).length === 0) {
      return null
    }

    // En yüksek skoru hesapla
    let highestScore = 0
    let highestScoreStudent = null

    // En düşük skoru hesapla
    let lowestScore = Number.POSITIVE_INFINITY
    let lowestScoreStudent = null

    // Ortalama skoru hesapla
    let totalScore = 0
    let scoreCount = 0

    // Sınıf bazında ortalama skorları hesapla
    const gradeScores = {}

    students.forEach((student) => {
      const score = scores[student.id]
      if (score !== undefined) {
        // En yüksek skor
        if (score > highestScore) {
          highestScore = score
          highestScoreStudent = student
        }

        // En düşük skor
        if (score < lowestScore) {
          lowestScore = score
          lowestScoreStudent = student
        }

        // Toplam skor
        totalScore += score
        scoreCount++

        // Sınıf bazında skorlar
        if (!gradeScores[student.grade]) {
          gradeScores[student.grade] = {
            total: 0,
            count: 0,
          }
        }
        gradeScores[student.grade].total += score
        gradeScores[student.grade].count++
      }
    })

    // Ortalama skor
    const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0

    // Sınıf bazında ortalama skorları hesapla
    const gradeAverages = {}
    Object.keys(gradeScores).forEach((grade) => {
      const { total, count } = gradeScores[grade]
      gradeAverages[grade] = count > 0 ? total / count : 0
    })

    return {
      highestScore,
      highestScoreStudent,
      lowestScore: lowestScore === Number.POSITIVE_INFINITY ? 0 : lowestScore,
      lowestScoreStudent,
      averageScore,
      gradeAverages,
      totalStudents: students.length,
      completedStudents: scoreCount,
    }
  }, [students, scores])

  // Oyun özeti
  const gameSummary = getGameSummary()

  const handleRestartPolling = useCallback(() => {
    stopPolling()
    startPolling()
  }, [startPolling, stopPolling])

  return (
    <div className="p-6 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => setError(null)}>
                Dismiss
              </Button>
              {error.includes("fetching students") && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => fetchStudents(true)}
                  disabled={isLoadingStudents || isFetchingRef.current}
                  className="flex items-center gap-1"
                >
                  {isLoadingStudents || isFetchingRef.current ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3" />
                      Retry
                    </>
                  )}
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Oyun Tamamlandı Bildirimi */}
      {showGameSummary && completedStudents.size === students.length && students.length > 0 && (
        <Alert className="bg-green-50 border-green-200">
          <Trophy className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-700">Oyun Tamamlandı!</AlertTitle>
          <AlertDescription className="text-green-600">
            Tüm öğrenciler oyunu tamamladı. Aşağıda oyun sonuçlarını görebilirsiniz.
          </AlertDescription>
        </Alert>
      )}

      {connectionStatus === "disconnected" && (
        <div className="mb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Bağlantı Hatası</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>Backend sunucusuna bağlanılamıyor. Sunucunun çalıştığından emin olun.</p>
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="API URL (örn: http://localhost:8000)"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      checkConnection()
                      addDebugMessage(`API URL değiştirildi: ${apiBaseUrl}`)
                    }}
                  >
                    Bağlan
                  </Button>
                  <Button
                    variant={mockMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setMockMode(!mockMode)
                      addDebugMessage(`Mock mod ${mockMode ? "kapatıldı" : "açıldı"}`)
                      if (!mockMode) {
                        // Mock modu açıldığında örnek veriler oluştur
                        const mockStudents = Array.from({ length: 3 }, (_, i) => ({
                          id: i + 1,
                          name: `Öğrenci ${i + 1}`,
                          grade: `${Math.floor(Math.random() * 5) + 1}. Sınıf`,
                          avg_score: Math.floor(Math.random() * 100),
                        }))
                        setStudents(mockStudents)
                        studentsRef.current = mockStudents
                        studentsLoadedRef.current = true

                        // Örnek skorlar oluştur
                        const mockScores = {}
                        const mockCompleted = new Set()
                        mockStudents.forEach((student) => {
                          if (Math.random() > 0.3) {
                            mockScores[student.id] = Math.floor(Math.random() * 100)
                            mockCompleted.add(student.id)
                          }
                        })
                        setScores(mockScores)
                        setCompletedStudents(mockCompleted)
                      }
                    }}
                  >
                    {mockMode ? "Mock Mod Açık" : "Mock Mod"}
                  </Button>
                </div>
                <Button variant="default" size="sm" onClick={checkConnection} className="flex items-center gap-1">
                  <RefreshCw className={`h-3 w-3 ${connectionStatus === "connecting" ? "animate-spin" : ""}`} />
                  Bağlantıyı Kontrol Et
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Oyun Özeti */}
      {showGameSummary && gameSummary && (
        <div className="mb-6 bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Oyun Özeti</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="font-medium">Toplam Öğrenci:</span>
                <span>{gameSummary.totalStudents}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="font-medium">Tamamlayan Öğrenci:</span>
                <span>{gameSummary.completedStudents}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                <span className="font-medium">Ortalama Skor:</span>
                <span>{gameSummary.averageScore.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              {gameSummary.highestScoreStudent && (
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span className="font-medium">En Yüksek Skor:</span>
                  <span>
                    {gameSummary.highestScoreStudent.name} ({gameSummary.highestScore})
                  </span>
                </div>
              )}

              {gameSummary.lowestScoreStudent && (
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="font-medium">En Düşük Skor:</span>
                  <span>
                    {gameSummary.lowestScoreStudent.name} ({gameSummary.lowestScore})
                  </span>
                </div>
              )}

              <div className="p-2 bg-gray-50 rounded">
                <div className="font-medium mb-1">Sınıf Ortalamaları:</div>
                <div className="space-y-1">
                  {Object.entries(gameSummary.gradeAverages).map(([grade, average]) => (
                    <div key={grade} className="flex justify-between text-sm">
                      <span>{grade}:</span>
                      <span>{average.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowGameSummary(false)} className="mr-2">
              Özeti Gizle
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                // Burada yeni bir oyun başlatma mantığı eklenebilir
                // Şimdilik sadece özeti kapatıyoruz
                setShowGameSummary(false)
              }}
            >
              Yeni Oyun
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-4">
        <Button
          variant="outline"
          onClick={handleNextStudent}
          className="flex items-center gap-2"
          disabled={students.length === 0 || completedStudents.size === students.length || gameCompleted}
        >
          <ArrowRight className="h-4 w-4" />
          Sonraki Öğrenciye Geç
        </Button>

        <Button
          variant={isPolling ? "default" : "outline"}
          onClick={() => {
            if (isPolling) {
              stopPolling()
              addDebugMessage("Stop polling button clicked")
            } else {
              startPolling()
              addDebugMessage("Start polling button clicked")
            }
          }}
          className="flex items-center gap-2"
          disabled={students.length === 0 || completedStudents.size === students.length || gameCompleted}
        >
          <RefreshCw className={`h-4 w-4 ${isPolling ? "animate-spin" : ""}`} />
          {isPolling ? "Polling Durdur" : "Polling Başlat"}
        </Button>

        <Button
          variant="outline"
          onClick={handleCheckSyncStatus}
          className="flex items-center gap-2"
          disabled={students.length === 0 || gameCompleted}
        >
          Sync Durumunu Kontrol Et
        </Button>

        <Button
          variant="outline"
          onClick={handleRestartPolling}
          className="flex items-center gap-2"
          disabled={students.length === 0 || completedStudents.size === students.length || gameCompleted}
        >
          <RefreshCw className="h-4 w-4" />
          Polling'i Yeniden Başlat
        </Button>

        <Button
          variant="outline"
          onClick={fetchAllScores}
          className="flex items-center gap-2"
          disabled={students.length === 0}
        >
          <RefreshCw className="h-4 w-4" />
          Tüm Skorları Yenile
        </Button>

        <Button
          variant="outline"
          onClick={() => fetchStudents(true)}
          disabled={isLoadingStudents || isFetchingRef.current}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          {isLoadingStudents || isFetchingRef.current ? "Öğrenciler Yükleniyor..." : "Öğrencileri Yenile"}
        </Button>

        {completedStudents.size === students.length && students.length > 0 && (
          <Button
            variant={showGameSummary ? "default" : "outline"}
            onClick={() => setShowGameSummary(!showGameSummary)}
            className="flex items-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            {showGameSummary ? "Özeti Gizle" : "Oyun Özetini Göster"}
          </Button>
        )}
      </div>

      {isLoadingStudents && (
        <div className="flex items-center justify-center p-8 border rounded-lg bg-gray-50">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
            <p>Öğrenciler yükleniyor...</p>
          </div>
        </div>
      )}

      {!isLoadingStudents && students.length === 0 && (
        <div className="flex items-center justify-center p-8 border rounded-lg bg-gray-50">
          <div className="flex flex-col items-center gap-2">
            <Users className="h-8 w-8 text-gray-400" />
            <p>Henüz öğrenci yok veya öğrenciler yüklenemedi.</p>
            <Button variant="outline" size="sm" onClick={() => fetchStudents(true)} className="mt-2">
              Öğrencileri Yenile
            </Button>
          </div>
        </div>
      )}

      {students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {user?.user_id}
          {students.map((student, index) => {
            // Değerleri hesapla
            const isCurrent = index === currentIndex
            const score = scores[student.id]
            const isCompleted = completedStudents.has(student.id)

            // Kart sınıfını hesapla
            const cardClassName = `transition-all duration-300 ${
              isCurrent ? "border-blue-500 border-2 shadow-lg" : ""
            } ${isCompleted ? "bg-green-50" : ""}`

            return (
              <Card key={student.id} className={cardClassName}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {student.name}
                    {isCurrent && (
                      <span className="flex items-center text-sm text-blue-600">
                        <Dot className="h-4 w-4 fill-blue-500 animate-ping mr-1" />
                        Oynuyor
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-1">Sınıf: {student.grade}</p>
                  <p className="text-muted-foreground text-sm mb-1">Ortalama Skor: {student.avg_score.toFixed(2)}</p>
                  {score !== undefined && <p className="font-bold text-green-600 text-lg mt-2">Skor: {score}</p>}
                  {completedStudents.has(student.id) && (
                    <p className="text-green-600 text-sm font-medium mt-1">Tamamlandı</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="mt-8 border rounded-lg p-4 bg-gray-50">
        <h3 className="font-medium mb-2">Debug Bilgileri</h3>
        <div className="text-xs font-mono bg-white p-2 rounded border h-40 overflow-y-auto">
          {debugMessages.map((info, i) => (
            <div key={i} className="mb-1">
              {info}
            </div>
          ))}
        </div>

        {syncStatus && (
          <div className="mt-4">
            <h4 className="font-medium mb-1">Son Sync Durumu:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
              {JSON.stringify(syncStatus, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-4">
          <h4 className="font-medium mb-1">Durum Bilgileri:</h4>
          <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
            {JSON.stringify(
              {
                gameId,
                selectedIds,
                studentsCount: students.length,
                currentIndex,
                isPolling,
                pollCount,
                lastPollTime: lastPollTime ? new Date(lastPollTime).toLocaleTimeString() : "Hiç",
                retryCount: retryCountRef.current,
                lastCompletedStudent,
                isFetching: isFetchingRef.current,
                requestInProgress: requestInProgressRef.current,
                studentsLoaded: studentsLoadedRef.current,
                scores,
                completedStudents: Array.from(completedStudents),
                apiBaseUrl,
                connectionStatus,
                retryCount,
                maxRetries,
                mockMode,
                showGameSummary,
                gameCompleted,
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </div>
  )
}
