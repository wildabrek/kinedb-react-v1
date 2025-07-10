"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle, Clock, Info, AlertTriangle, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

// Sample data - in a real app, this would come from an API
const notifications = [
  {
    id: 1,
    type: "alert",
    title: "System Maintenance",
    message: "The system will be undergoing maintenance on Saturday from 2 AM to 4 AM.",
    date: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "game",
    title: "New Game Available",
    message: "A new game 'Fraction Master' has been added to the platform.",
    date: "Yesterday",
    read: false,
  },
  {
    id: 3,
    type: "student",
    title: "Student Achievement",
    message: "Emma Thompson has earned the 'Math Master' badge.",
    date: "2 days ago",
    read: true,
  },
]

export default function NotificationsPage() {
  const { toast } = useToast()
  const [notificationsList, setNotificationsList] = useState(notifications)

  const handleMarkAsRead = (id: number) => {
    setNotificationsList((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
    toast({
      title: "Notification Marked as Read",
      description: "The notification has been marked as read.",
    })
  }

  const handleMarkAllAsRead = () => {
    setNotificationsList((prev) => prev.map((notification) => ({ ...notification, read: true })))
    toast({
      title: "All Notifications Marked as Read",
      description: "All notifications have been marked as read.",
    })
  }

  const handleDeleteNotification = (id: number) => {
    setNotificationsList((prev) => prev.filter((notification) => notification.id !== id))
    toast({
      title: "Notification Deleted",
      description: "The notification has been deleted.",
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "game":
        return <Bell className="h-5 w-5 text-purple-500" />
      case "student":
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <Button variant="outline" onClick={handleMarkAllAsRead}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Mark All as Read
        </Button>
      </div>

      <div className="space-y-4">
        {notificationsList.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm text-muted-foreground">You don't have any notifications yet.</p>
            </CardContent>
          </Card>
        ) : (
          notificationsList.map((notification) => (
            <Card key={notification.id} className={notification.read ? "opacity-80" : ""}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="bg-muted p-2 rounded-full">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {notification.date}
                      </span>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span className="sr-only">Mark as read</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDeleteNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                  {!notification.read && (
                    <Badge variant="outline" className="mt-2">
                      Unread
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
