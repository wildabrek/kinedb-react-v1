"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Gamepad2Icon as GameController2 } from "lucide-react"

interface RecommendedGamesProps {
  progress: string
}

export function RecommendedGames({ progress }: RecommendedGamesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {progress === "Advanced" ? (
        <>
          <Card>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <GameController2 className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Advanced Math Challenge</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Complex problem-solving with advanced mathematical concepts. Suitable for students exceeding grade-level
                expectations.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <GameController2 className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Critical Reading Explorer</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Advanced reading comprehension with analysis of complex texts and literary devices.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <GameController2 className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Scientific Method Mastery</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Design and conduct virtual experiments using the scientific method with advanced variables.
              </p>
            </CardContent>
          </Card>
        </>
      ) : progress === "On Track" ? (
        <>
          <Card>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <GameController2 className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Math Adventure Plus</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Grade-appropriate math challenges with occasional advanced problems to maintain engagement.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <GameController2 className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Word Explorer Intermediate</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Vocabulary building and reading comprehension at grade level with adaptive difficulty.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <GameController2 className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Science Quest Standard</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Explore scientific concepts through interactive experiments and simulations.
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <GameController2 className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Math Foundations</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Reinforces core math concepts with step-by-step guidance and immediate feedback.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <GameController2 className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Reading Basics Builder</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Focuses on fundamental reading skills with simplified texts and vocabulary building.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <GameController2 className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Science Concepts Intro</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Introduces basic scientific concepts through simple, guided experiments.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
