"use client"
import { CheckCircle2 } from 'lucide-react'

interface ImprovementStrategiesProps {
  progress: string
}

export function ImprovementStrategies({ progress }: ImprovementStrategiesProps) {
  return (
    <div className="space-y-4">
      {progress === "Advanced" ? (
        <>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Enrichment Activities</h4>
              <p className="text-sm text-muted-foreground">
                Provide opportunities for deeper exploration of topics through project-based learning and independent
                research.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Peer Teaching</h4>
              <p className="text-sm text-muted-foreground">
                Encourage the student to help peers with difficult concepts, which reinforces their own understanding.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Advanced Challenges</h4>
              <p className="text-sm text-muted-foreground">
                Introduce more complex problem-solving scenarios that require applying knowledge across multiple
                domains.
              </p>
            </div>
          </div>
        </>
      ) : progress === "On Track" ? (
        <>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Consistent Practice</h4>
              <p className="text-sm text-muted-foreground">
                Maintain regular engagement with educational games across all subject areas to ensure balanced
                development.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Incremental Challenges</h4>
              <p className="text-sm text-muted-foreground">
                Gradually increase difficulty levels in games to maintain engagement and promote continuous improvement.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Self-Assessment</h4>
              <p className="text-sm text-muted-foreground">
                Encourage reflection on performance and setting personal goals for improvement in specific areas.
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Structured Support</h4>
              <p className="text-sm text-muted-foreground">
                Provide guided practice with immediate feedback and step-by-step instructions for complex tasks.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Foundational Focus</h4>
              <p className="text-sm text-muted-foreground">
                Concentrate on mastering core concepts before moving to more advanced material, with frequent review.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Confidence Building</h4>
              <p className="text-sm text-muted-foreground">
                Celebrate small victories and progress to build confidence and motivation for continued learning.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
