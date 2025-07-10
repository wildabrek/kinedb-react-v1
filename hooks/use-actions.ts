"use client"

import React, { createContext, useContext, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

type ItemType = "student" | "class" | "game" | "report" | "user" | "setting"
type ActionType = "view" | "edit" | "delete" | "create" | "export" | "configure" | "analyze"

interface ActionState {
  loading: boolean
  currentAction: ActionType | null
  currentItem: { type: ItemType; id: string | number } | null
}

type ActionContextType = {
  state: ActionState
  viewDetails: (type: ItemType, id: string | number) => void
  editItem: (type: ItemType, id: string | number) => void
  deleteItem: (type: ItemType, id: string | number, name: string) => Promise<boolean>
  createItem: (type: ItemType) => void
  exportData: (type: ItemType, id?: string | number) => void
  configureItem: (type: ItemType, id: string | number) => void
  analyzeItem: (type: ItemType, id: string | number) => void
  resetState: () => void
}

const initialState: ActionState = {
  loading: false,
  currentAction: null,
  currentItem: null,
}

const ActionContext = createContext<ActionContextType | undefined>(undefined)

export function ActionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { toast } = useToast()
  const [state, setState] = useState<ActionState>(initialState)

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, loading }))
  }

  const resetState = () => {
    setState(initialState)
  }

  const viewDetails = (type: ItemType, id: string | number) => {
    setState({
      loading: true,
      currentAction: "view",
      currentItem: { type, id },
    })

    router.push(`/${type}s/${id}`)

    toast({
      title: "Viewing Details",
      description: `Navigating to ${type} details page`,
    })

    setTimeout(() => setLoading(false), 100)
  }

  const editItem = (type: ItemType, id: string | number) => {
    setState({
      loading: true,
      currentAction: "edit",
      currentItem: { type, id },
    })

    router.push(`/${type}s/${id}/edit`)

    toast({
      title: "Edit Mode",
      description: `Editing ${type} information`,
    })

    setTimeout(() => setLoading(false), 100)
  }

  const deleteItem = async (type: ItemType, id: string | number, name: string): Promise<boolean> => {
    setState({
      loading: true,
      currentAction: "delete",
      currentItem: { type, id },
    })

    try {
      // Simüle edilmiş API bekleme
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: "Item Deleted",
        description: `${name} has been deleted successfully`,
      })

      return true
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${name}`,
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const createItem = (type: ItemType) => {
    setState({
      loading: true,
      currentAction: "create",
      currentItem: { type, id: "__new__" }, // "__new__" tanımı özel id gibi
    })

    router.push(`/${type}s/create`)

    toast({
      title: "Create New",
      description: `Creating a new ${type}`,
    })

    setTimeout(() => setLoading(false), 100)
  }

  const exportData = (type: ItemType, id?: string | number) => {
    setState({
      loading: true,
      currentAction: "export",
      currentItem: id ? { type, id } : { type, id: "all" },
    })

    toast({
      title: "Export Started",
      description: `Exporting ${type} data as CSV`,
    })

    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `${type} data has been exported successfully`,
      })
      setLoading(false)
    }, 1500)
  }

  const configureItem = (type: ItemType, id: string | number) => {
    setState({
      loading: true,
      currentAction: "configure",
      currentItem: { type, id },
    })

    router.push(`/${type}s/${id}/configure`)

    toast({
      title: "Configure",
      description: `Configuring ${type} settings`,
    })

    setTimeout(() => setLoading(false), 100)
  }

  const analyzeItem = (type: ItemType, id: string | number) => {
    setState({
      loading: true,
      currentAction: "analyze",
      currentItem: { type, id },
    })

    router.push(`/${type}s/${id}/analytics`)

    toast({
      title: "Analytics",
      description: `Viewing analytics for ${type}`,
    })

    setTimeout(() => setLoading(false), 100)
  }

  return (
    <ActionContext.Provider
      value={{
        state,
        viewDetails,
        editItem,
        deleteItem,
        createItem,
        exportData,
        configureItem,
        analyzeItem,
        resetState,
      }}
    >
      {children}
    </ActionContext.Provider>
  )
}

export function useActions() {
  const context = useContext(ActionContext)
  if (context === undefined) {
    throw new Error("useActions must be used within an ActionProvider")
  }
  return context
}
