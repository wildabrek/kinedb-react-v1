"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Send, ThumbsUp } from "lucide-react"

export default function FeedbackPage() {
  const { toast } = useToast()
  const [feedbackType, setFeedbackType] = useState("suggestion")
  const [feedbackText, setFeedbackText] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!feedbackText.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please enter your feedback before submitting.",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would send the feedback to a server
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback!",
    })

    setSubmitted(true)
  }

  const handleNewFeedback = () => {
    setFeedbackType("suggestion")
    setFeedbackText("")
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
              <ThumbsUp className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription>Your feedback has been submitted successfully.</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <p className="mb-6">
              We appreciate you taking the time to share your thoughts with us. Your feedback helps us improve our
              platform.
            </p>
            <Button onClick={handleNewFeedback}>Submit Another Feedback</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Provide Feedback</CardTitle>
          <CardDescription>
            We value your input! Please share your thoughts, suggestions, or report any issues you've encountered.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Feedback Type</Label>
              <RadioGroup value={feedbackType} onValueChange={setFeedbackType} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="suggestion" id="suggestion" />
                  <Label htmlFor="suggestion">Suggestion</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="issue" id="issue" />
                  <Label htmlFor="issue">Issue/Bug</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compliment" id="compliment" />
                  <Label htmlFor="compliment">Compliment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>

            {feedbackType === "issue" && (
              <div className="space-y-2">
                <Label htmlFor="page">Where did you encounter the issue?</Label>
                <Input id="page" placeholder="e.g., Students page, Game configuration" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="feedback">Your Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Please describe your feedback in detail..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input id="email" type="email" placeholder="Enter your email if you'd like us to follow up" />
              <p className="text-xs text-muted-foreground mt-1">
                We'll only use your email to respond to your feedback if necessary.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="ml-auto">
              <Send className="mr-2 h-4 w-4" />
              Submit Feedback
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
