"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

interface ComparisonTableProps {
  studentData: any
}

export function ComparisonTable({ studentData }: ComparisonTableProps) {
  // Generate class and grade averages based on student data
  const generateComparison = () => {
    const subjects = Object.keys(studentData.subjects)

    return subjects.map((subject) => {
      const studentScore = studentData.subjects[subject]
      // Generate slightly lower averages for class and grade
      const classAverage = Math.max(60, studentScore - Math.floor(Math.random() * 10) - 5)
      const gradeAverage = Math.max(55, classAverage - Math.floor(Math.random() * 8) - 2)

      return {
        subject,
        studentScore,
        classAverage,
        gradeAverage,
        difference: studentScore - classAverage,
      }
    })
  }

  const comparisonData = generateComparison()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>Student Score</TableHead>
          <TableHead>Class Average</TableHead>
          <TableHead>Grade Average</TableHead>
          <TableHead>Difference</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {comparisonData.map((item) => (
          <TableRow key={item.subject}>
            <TableCell className="font-medium">{item.subject}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span>{item.studentScore}%</span>
                <Progress value={item.studentScore} className="h-2 w-16" />
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span>{item.classAverage}%</span>
                <Progress value={item.classAverage} className="h-2 w-16" />
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span>{item.gradeAverage}%</span>
                <Progress value={item.gradeAverage} className="h-2 w-16" />
              </div>
            </TableCell>
            <TableCell>
              <span className={item.difference > 0 ? "text-green-600" : "text-red-600"}>
                {item.difference > 0 ? "+" : ""}
                {item.difference}%
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
