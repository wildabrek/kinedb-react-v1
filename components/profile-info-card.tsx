import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProfileInfoCardProps {
  title: string
  description?: string
  details: {
    label: string
    value: string
  }[]
}

export default function ProfileInfoCard({ title, description, details }: ProfileInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {details.map((detail, index) => (
            <div key={index} className="flex flex-col space-y-1">
              <span className="text-sm font-medium">{detail.label}</span>
              <span className="text-sm text-muted-foreground">{detail.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
