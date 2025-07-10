import { Badge } from "@/components/ui/badge"
import { isLocalSchool } from "@/lib/school-utils"

interface SchoolBadgeProps {
  school: { school_id?: number }
}

export function SchoolBadge({ school }: SchoolBadgeProps) {
  if (isLocalSchool(school)) {
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
        Local
      </Badge>
    )
  }

  return (
    <Badge variant="default" className="bg-green-100 text-green-800">
      Database
    </Badge>
  )
}
