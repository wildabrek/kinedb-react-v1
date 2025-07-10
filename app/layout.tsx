
import type React from "react"
import ClientLayout from "./clientLayout"

// Update the metadata title
export const metadata = {
  title: "KineKids",
  description: "Performance monitoring panel for primary school students",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout children={children} />
}

