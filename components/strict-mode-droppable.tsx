"use client"

import { useState, useEffect } from "react"
import { Droppable, type DroppableProps } from "react-beautiful-dnd"

// This component is a workaround for the issue with react-beautiful-dnd in React 18 Strict Mode
// It delays the rendering of the Droppable component until after the initial render cycle
export const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    // Add flag to disable react-beautiful-dnd dev warnings which
    // are triggered by the delayed rendering
    window.__react_beautiful_dnd_disable_dev_warnings = true

    // Use requestAnimationFrame to delay rendering until after the initial render cycle
    const animation = requestAnimationFrame(() => setEnabled(true))

    return () => {
      cancelAnimationFrame(animation)
      window.__react_beautiful_dnd_disable_dev_warnings = false
    }
  }, [])

  if (!enabled) {
    // Return a placeholder with the same structure that Droppable children expect
    return (
      <div ref={(el) => el} style={{ display: "none" }}>
        {children({
          innerRef: () => {},
          placeholder: <div style={{ display: "none" }} />,
          droppableProps: {
            "data-rbd-droppable-id": props.droppableId || "placeholder",
            "data-rbd-droppable-context-id": "0",
          },
        })}
      </div>
    )
  }

  return (
    <Droppable {...props} isDropDisabled={false}>
      {children}
    </Droppable>
  )
}

// Add the missing type to the global Window interface
declare global {
  interface Window {
    __react_beautiful_dnd_disable_dev_warnings?: boolean
  }
}
