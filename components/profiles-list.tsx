import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Profile {
  id: string | number
  name: string
  role: string
  avatar?: string
  email: string
  status: "active" | "inactive"
}

interface ProfilesListProps {
  title: string
  description?: string
  profiles: Profile[]
  viewPath: string
}

export default function ProfilesList({ title, description, profiles, viewPath }: ProfilesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {profiles.map((profile) => (
            <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={profile.avatar || "/placeholder.svg?height=40&width=40"} alt={profile.name} />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={profile.status === "active" ? "default" : "secondary"}>
                  {profile.status === "active" ? "Active" : "Inactive"}
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`${viewPath}/${profile.id}`}>View Profile</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
