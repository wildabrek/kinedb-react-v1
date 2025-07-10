"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

interface ActionContextType {
  executeAction: (action: () => Promise<any>) => Promise<any>
  isLoading: boolean
  error: string | null
}

const ActionContext = createContext<ActionContextType | undefined>(undefined)

export function ActionProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeAction = useCallback(async (action: () => Promise<any>) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await action()
      return result
    } catch (err: any) {
      setError(err.message || "An unknown error occurred")
      throw err // Re-throw to allow calling component to handle
    } finally {
      setIsLoading(false)
    }
  }, [])

  return <ActionContext.Provider value={{ executeAction, isLoading, error }}>{children}</ActionContext.Provider>
}

export function useActions() {
  const context = useContext(ActionContext)
  if (context === undefined) {
    throw new Error("useActions must be used within an ActionProvider")
  }
  return context
}
