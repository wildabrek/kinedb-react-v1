// Analytics Types for the Education Dashboard

// Base Types
export type TimeRange = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom"
export type TrendDirection = "up" | "down" | "stable"
export type PerformanceBand = "90-100" | "80-89" | "70-79" | "60-69" | "below60"
export type ImprovementLevel = "highImprovement" | "moderateImprovement" | "lowImprovement" | "noImprovement"
export type ChartType = "line" | "bar" | "pie" | "radar" | "heatmap" | "scatter" | "gauge" | "funnel"
export type MapType = "choropleth"
export type TableType = "data" | "pivot" | "heatTable"
export type DashboardType = "executive" | "operational" | "analytical" | "student-focused" | "teacher-focused"

// Metadata
export interface AnalyticsMetadata {
  version: string
  lastUpdated: string
  dataPoints: {
    students: number
    classes: number
    games: number
    assessments: number
    activities: number
  }
  timeRanges: Record<TimeRange, string>
}

// Trend Data
export interface Trend {
  percentage: number
  direction: TrendDirection
}

// Period Metrics
export interface PeriodMetrics {
  totalStudents: number
  activeStudents: number
  newStudents: number
  totalClasses: number
  activeClasses: number
  totalGames: number
  gamesPlayed: number
  averageScore: number
  completionRate: number
  engagementRate: number
}

// Period Data
export interface Period {
  startDate: string
  endDate: string
  metrics: PeriodMetrics
  trends?: Record<string, Trend>
}

// Top Performer
export interface TopPerformer {
  id: string | number
  name: string
  score: number
  improvement?: number
  timesPlayed?: number
  popularity?: number
}

// Dashboard Summary
export interface DashboardSummary {
  currentPeriod: Period
  previousPeriod: Period
  topPerformers: {
    students: TopPerformer[]
    classes: TopPerformer[]
    games: TopPerformer[]
  }
}

// Time Series Data
export interface TimeSeriesData {
  daily: {
    dates: string[]
    metrics: Record<string, number[]>
  }
  weekly: {
    weeks: string[]
    metrics: Record<string, number[]>
  }
  monthly: {
    months: string[]
    metrics: Record<string, number[]>
  }
}

// Student Analytics
export interface StudentOverview {
  totalCount: number
  activeCount: number
  inactiveCount: number
  averageScore: number
  averageGamesPlayed: number
  averageTimePerSession: string
  gradeDistribution: Record<string, number>
  performanceDistribution: Record<string, number>
}

export interface GradeMetrics {
  grade: string
  count: number
  avgScore: number
  avgGamesPlayed: number
  topSubjects: string[]
  improvementRate: number
}

export interface ClassMetrics {
  classId: number
  className: string
  count: number
  avgScore: number
  avgGamesPlayed: number
  topSubjects: string[]
  improvementRate: number
}

export interface SubjectMetrics {
  subject: string
  avgScore: number
  totalGamesPlayed: number
  improvementRate: number
  topSkills: string[]
  challengeAreas: string[]
}

export interface ProgressTracking {
  overall: {
    startingAverage: number
    currentAverage: number
    improvement: number
    projectedEndOfYear: number
    goalAttainment: number
  }
  bySkillCategory: {
    category: string
    startingLevel: number
    currentLevel: number
    improvement: number
    targetLevel: number
    progressPercentage: number
  }[]
}

export interface StudentMetrics {
  overallScore: number
  gamesPlayed: number
  timeSpent: string
  completionRate: number
  improvementRate: number
}

export interface SubjectPerformance {
  subject: string
  score: number
  improvement: number
}

export interface SkillAssessment {
  skill: string
  level: number
  improvement: number
}

export interface ActivityRecord {
  date: string
  game: string
  score: number
  timeSpent: string
}

export interface Recommendation {
  focus: string
  recommendedGames: string[]
}

export interface StudentDetail {
  id: string
  name: string
  grade: string
  class: string
  metrics: StudentMetrics
  subjectPerformance: SubjectPerformance[]
  skillsAssessment: SkillAssessment[]
  recentActivity: ActivityRecord[]
  recommendations: Recommendation[]
}

export interface StudentAnalytics {
  overview: StudentOverview
  detailedMetrics: {
    byGrade: GradeMetrics[]
    byClass: ClassMetrics[]
    bySubject: SubjectMetrics[]
  }
  progressTracking: ProgressTracking
  individualStudents: StudentDetail[]
}

// Class Analytics
export interface ClassOverview {
  totalCount: number
  activeCount: number
  inactiveCount: number
  averageSize: number
  averageScore: number
  averageGamesPlayed: number
  gradeDistribution: Record<string, number>
  performanceDistribution: Record<string, number>
}

export interface GradeClassMetrics {
  grade: string
  classCount: number
  studentCount: number
  avgScore: number
  avgGamesPlayed: number
  topSubjects: string[]
  improvementRate: number
}

export interface TeacherMetrics {
  teacher: string
  classCount: number
  studentCount: number
  avgScore: number
  avgGamesPlayed: number
  topSubjects: string[]
  improvementRate: number
}

export interface ClassMetricsDetail {
  studentCount: number
  averageScore: number
  gamesPlayed: number
  completionRate: number
  improvementRate: number
  attendanceRate: number
}

export interface StudentDistribution {
  performanceBands: Record<string, number>
  improvementRates: Record<ImprovementLevel, number>
}

export interface DailyActivity {
  day: string
  gamesPlayed: number
  avgScore: number
}

export interface RecentGame {
  id: number
  name: string
  date: string
  avgScore: number
  participation: number
}

export interface ClassDetail {
  id: number
  name: string
  teacher: string
  metrics: ClassMetricsDetail
  subjectPerformance: SubjectPerformance[]
  studentDistribution: StudentDistribution
  weeklyActivity: DailyActivity[]
  topStudents: TopPerformer[]
  recentGames: RecentGame[]
}

export interface ClassAnalytics {
  overview: ClassOverview
  detailedMetrics: {
    byGrade: GradeClassMetrics[]
    byTeacher: TeacherMetrics[]
  }
  individualClasses: ClassDetail[]
}

// Game Analytics
export interface GameOverview {
  totalCount: number
  activeCount: number
  inactiveCount: number
  totalPlays: number
  averageScore: number
  averageTimePerPlay: string
  subjectDistribution: Record<string, number>
  levelDistribution: Record<string, number>
}

export interface SubjectGameMetrics {
  subject: string
  gameCount: number
  totalPlays: number
  avgScore: number
  avgTimePerPlay: string
  popularGames: string[]
  skillsCovered: string[]
}

export interface GradeGameMetrics {
  grade: string
  gameCount: number
  totalPlays: number
  avgScore: number
  avgTimePerPlay: string
  popularGames: string[]
  skillsCovered: string[]
}

export interface GameMetricsDetail {
  plays: number
  uniqueStudents: number
  avgScore: number
  avgTime: string
  completionRate: number
  popularityRank: number
}

export interface SkillTargeted {
  skill: string
  proficiency: number
}

export interface ScoreDistribution {
  scoreBands: Record<string, number>
  timeDistribution: Record<string, number>
}

export interface ClassPerformance {
  classId: number
  className: string
  avgScore: number
  plays: number
}

export interface WeeklyTrend {
  week: string
  plays: number
  avgScore: number
}

export interface GameDetail {
  id: number
  name: string
  subject: string
  level: string
  metrics: GameMetricsDetail
  skillsTargeted: SkillTargeted[]
  studentPerformance: ScoreDistribution
  classPerformance: ClassPerformance[]
  weeklyTrends: WeeklyTrend[]
  topPerformers: TopPerformer[]
}

export interface GameAnalytics {
  overview: GameOverview
  detailedMetrics: {
    bySubject: SubjectGameMetrics[]
    byGrade: GradeGameMetrics[]
  }
  individualGames: GameDetail[]
}

// Skills Analytics
export interface SkillsOverview {
  totalSkills: number
  categoriesCount: number
  mostDevelopedSkills: string[]
  leastDevelopedSkills: string[]
  skillCategoryDistribution: Record<string, number>
}

export interface SkillCategoryMetrics {
  category: string
  skillCount: number
  avgProficiency: number
  mostDeveloped: string
  leastDeveloped: string
  relatedGames: string[]
  improvementRate: number
}

export interface GradeSkillMetrics {
  grade: string
  topSkills: string[]
  challengeAreas: string[]
  avgProficiency: number
  improvementRate: number
}

export interface SkillMetricsDetail {
  overallProficiency: number
  studentsAssessed: number
  improvementRate: number
  relatedGamesCount: number
}

export interface GradeBreakdown {
  grade: string
  proficiency: number
  studentCount: number
}

export interface ClassBreakdown {
  classId: number
  className: string
  proficiency: number
}

export interface RelatedGame {
  id: number
  name: string
  effectiveness: number
}

export interface ProgressTrend {
  month: string
  proficiency: number
}

export interface SkillDetail {
  id: number
  name: string
  category: string
  metrics: SkillMetricsDetail
  gradeBreakdown: GradeBreakdown[]
  classBreakdown: ClassBreakdown[]
  relatedGames: RelatedGame[]
  progressTrend: ProgressTrend[]
}

export interface SkillsAnalytics {
  overview: SkillsOverview
  detailedMetrics: {
    byCategory: SkillCategoryMetrics[]
    byGrade: GradeSkillMetrics[]
  }
  individualSkills: SkillDetail[]
}

// Report Templates
export interface ReportSection {
  sections: string[]
  metrics: string[]
  visualizations: string[]
}

export interface ReportTemplate {
  individual: ReportSection
  comparative: ReportSection
}

export interface ClassReportTemplate {
  performance: ReportSection
  comparative: ReportSection
}

export interface AdminReportTemplate {
  overview: ReportSection
  detailed: ReportSection
}

export interface ReportTemplates {
  student: ReportTemplate
  class: ClassReportTemplate
  administrative: AdminReportTemplate
}

// Visualization Options
export interface ChartOptions {
  type: ChartType
  applicableFor: string[]
  options: Record<string, boolean>
}

export interface MapOptions {
  type: MapType
  applicableFor: string[]
  options: Record<string, boolean>
}

export interface TableOptions {
  type: TableType
  applicableFor: string[]
  options: Record<string, boolean>
}

export interface DashboardOptions {
  type: DashboardType
  applicableFor: string[]
  components: string[]
}

export interface VisualizationOptions {
  charts: ChartOptions[]
  maps: MapOptions[]
  tables: TableOptions[]
  dashboards: DashboardOptions[]
}

// Main Analytics Data Structure
export interface AnalyticsData {
  metadata: AnalyticsMetadata
  dashboardSummary: DashboardSummary
  timeSeriesData: TimeSeriesData
  studentAnalytics: StudentAnalytics
  classAnalytics: ClassAnalytics
  gameAnalytics: GameAnalytics
  skillsAnalytics: SkillsAnalytics
  reportTemplates: ReportTemplates
  visualizationOptions: VisualizationOptions
}
