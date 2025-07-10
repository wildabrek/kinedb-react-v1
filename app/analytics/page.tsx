"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic" // Dinamik import için eklendi

// UI Bileşenleri (Shadcn)
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Ikonlar
import {
  BarChart,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Activity,
  Loader2,
  AlertCircle,
  Download,
  Calendar,
  Share2,
  Printer,
  TrendingUp,
} from "lucide-react"

// Recharts'ın hafif parçaları (statik olarak kalabilir)
import {
  Line,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  Pie,
  Area,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"

// Hook'lar ve API çağrıları
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/components/ui/use-toast"
import {
  getGameUsageData,
  getStudentSubjectScores,
  getStudents,
  getAnalyticsDashboardData,
  getStudentPerformanceData,
  getSkillDistributionData,
  getStudentProgressData,
  getEngagementMetricsData,
  getTopPerformers,
  getDashboardAnalytics,
  getWeeklyActivityData,
  getSubjectBreakdownData,
  getStudentDistributionData,
  getRecentActivities,
} from "@/lib/api"
import Link from "next/link"


// --- DİNAMİK BİLEŞEN YÜKLEYİCİLERİ ---

const ChartLoader = ({ height = 300 }) => (
  <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
)

// Recharts grafiklerini dinamik olarak import et
// HATA DÜZELTİLDİ: Named export olan bileşenler için .then() eklendi.
const DynamicComposedChart = dynamic(() => import("recharts").then(mod => mod.ComposedChart), { loading: () => <ChartLoader />, ssr: false })
const DynamicLineChart = dynamic(() => import("recharts").then(mod => mod.LineChart), { loading: () => <ChartLoader />, ssr: false })
const DynamicPieChart = dynamic(() => import("recharts").then(mod => mod.PieChart), { loading: () => <ChartLoader />, ssr: false })
const DynamicBarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { loading: () => <ChartLoader />, ssr: false })
const DynamicAreaChart = dynamic(() => import("recharts").then(mod => mod.AreaChart), { loading: () => <ChartLoader />, ssr: false })
const DynamicRadarChart = dynamic(() => import("recharts").then(mod => mod.RadarChart), { loading: () => <ChartLoader />, ssr: false })


// --- YENİDEN KULLANILABİLİR GRAFİK KARTI BİLEŞENİ ---

interface ChartCardProps {
  title: string
  description: string
  loading: boolean
  error: string | null
  children: React.ReactNode
  height?: number
  footerContent?: React.ReactNode
  className?: string
}

const ChartCard: React.FC<ChartCardProps> = ({ title, description, loading, error, children, height = 300, footerContent, className }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent style={{ height: `${height}px` }}>
      {loading ? (
        <ChartLoader height={height} />
      ) : error ? (
        <div className="flex flex-col items-center justify-center text-center h-full">
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      )}
    </CardContent>
    {footerContent && <CardFooter className="border-t px-6 py-4">{footerContent}</CardFooter>}
  </Card>
)


// --- ANA SAYFA BİLEŞENİ ---

export default function AnalyticsPage() {
    const {user} = useAuth()
    const {toast} = useToast()
    const {translate: t} = useLanguage()
    const [activeTab, setActiveTab] = useState("overview")
    const [timeRange, setTimeRange] = useState("month")
    const [isExporting, setIsExporting] = useState(false)

    // Data ve state'ler
    const [studentPerformanceData, setStudentPerformanceData] = useState<any[]>([])
    const [skillDistributionData, setSkillDistributionData] = useState<any[]>([])
    const [studentProgressData, setStudentProgressData] = useState<any[]>([])
    const [performanceMetricsData, setPerformanceMetricsData] = useState<any[]>([])
    const [engagementMetricsData, setEngagementMetricsData] = useState<any[]>([])
    const [gameUsageData, setGameUsageData] = useState<any[]>([])
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [topPerformersData, setTopPerformersData] = useState<any[]>([])
    const [weeklyActivityData, setWeeklyActivityData] = useState<any[]>([])
    const [subjectBreakdownData, setSubjectBreakdownData] = useState<any[]>([])
    const [studentDistributionData, setStudentDistributionData] = useState<any[]>([])
    const [recentActivities, setRecentActivities] = useState<any[]>([])
    const [scoreHistory, setScoreHistory] = useState<number[]>([])
    const [gamesHistory, setGamesHistory] = useState<number[]>([])
    const [engagementHistory, setEngagementHistory] = useState<number[]>([])

    const [loading, setLoading] = useState({
        studentPerformance: true,
        skillDistribution: true,
        studentProgress: true,
        performanceMetrics: true,
        gameUsage: true,
        dashboard: true,
        engagementMetrics: true,
        topPerformers: true,
        weeklyActivity: true,
        subjectBreakdown: true,
        studentDistribution: true,
        recentActivities: true,
    });

    const [error, setError] = useState<{ [key: string]: string | null }>({
        studentPerformance: null,
        skillDistribution: null,
        studentProgress: null,
        performanceMetrics: null,
        gameUsage: null,
        dashboard: null,
        engagementMetrics: null,
        topPerformers: null,
        weeklyActivity: null,
        subjectBreakdown: null,
        studentDistribution: null,
        recentActivities: null,
    });

    useEffect(() => {
        async function fetchAllData() {
            if (!user?.school_id) return;

            const schoolId = Number(user.school_id);

            const dataFetchers = {
                dashboard: () => getDashboardAnalytics(schoolId).then(data => {
                    setDashboardData(data);
                    if (data.scoreHistory) setScoreHistory(data.scoreHistory);
                    if (data.gamesHistory) setGamesHistory(data.gamesHistory);
                    if (data.engagementHistory) setEngagementHistory(data.engagementHistory);
                }),
                recentActivities: () => getRecentActivities().then(data => setRecentActivities(Array.isArray(data) ? data : [])),
                studentPerformance: () => getStudentPerformanceData().then(data => setStudentPerformanceData(Array.isArray(data) && data.length > 0 ? data : [])),
                skillDistribution: () => getSkillDistributionData().then(data => setSkillDistributionData(Array.isArray(data) ? data : [])),
                studentProgress: () => getStudentProgressData().then(data => setStudentProgressData(Array.isArray(data) ? data : [])),
                gameUsage: () => getGameUsageData(timeRange).then(data => setGameUsageData(Array.isArray(data) && data.length > 0 ? data : [])),
                engagementMetrics: () => getEngagementMetricsData().then(data => setEngagementMetricsData(Array.isArray(data) ? data : [])),
                topPerformers: () => getTopPerformers().then(data => setTopPerformersData(Array.isArray(data) ? data : [])),
                weeklyActivity: () => getWeeklyActivityData(timeRange).then(data => setWeeklyActivityData(Array.isArray(data) && data.length > 0 ? data : [])),
                studentDistribution: () => getStudentDistributionData().then(data => {
                    const defaultColors = ["#ef4444", "#f59e0b", "#6366f1", "#10b981"];
                    const coloredData = (Array.isArray(data) ? data : []).map((item, index) => ({
                        ...item,
                        color: item.color || defaultColors[index % defaultColors.length],
                    }));
                    setStudentDistributionData(coloredData);
                }),
                subjectBreakdown: () => getSubjectBreakdownData(timeRange).then(data => {
                    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ef4444", "#8b5cf6"];
                    const coloredData = (Array.isArray(data) ? data : []).map((item, index) => ({
                        ...item,
                        color: item.color || colors[index % colors.length],
                    }));
                    setSubjectBreakdownData(coloredData);
                }),
            };

            Object.entries(dataFetchers).forEach(([key, fetcher]) => {
                setLoading(prev => ({...prev, [key]: true}));
                fetcher()
                    .catch(() => setError(prev => ({...prev, [key]: t(`Failed to load ${key} data`)})))
                    .finally(() => setLoading(prev => ({...prev, [key]: false})));
            });
        }

        fetchAllData();
    }, [user, timeRange, t]);


    // --- YARDIMCI FONKSİYONLAR VE İŞLEYİCİLER ---

    const renderSparkline = (data: number[], color: string) => {
        if (!data || data.length === 0) return <div
            className="flex items-center justify-center h-full text-xs text-muted-foreground">{t("No data available")}</div>;
        const chartData = data.map((value, index) => ({value, index}));
        return (
            <ResponsiveContainer width="100%" height="100%">
                <DynamicLineChart data={chartData} margin={{top: 0, right: 0, bottom: 0, left: 0}}>
                    <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false}
                          isAnimationActive={false}/>
                </DynamicLineChart>
            </ResponsiveContainer>
        );
    };

    const handleExport = () => {
        setIsExporting(true);
        toast({
            title: t("Exporting Data"),
            description: t("Analytics data is being prepared for download."),
        });
        setTimeout(() => {
            toast({
                title: t("Export Complete"),
                description: t("Analytics data has been exported to CSV."),
            });
            setIsExporting(false);
        }, 1500);
    };

    const handlePrint = () => {
        toast({
            title: t("Printing Analytics"),
            description: t("The analytics report is being sent to the printer."),
        });
        window.print();
    };

    const handleShare = () => {
        navigator.clipboard.writeText(`${window.location.origin}/analytics`);
        toast({
            title: t("Link Copied"),
            description: t("Analytics page link copied to clipboard"),
        });
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{t("Analytics Dashboard")}</h1>
                <div className="flex gap-4">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[180px]">
                            <Calendar className="mr-2 h-4 w-4"/>
                            <SelectValue placeholder={t("Select time range")}/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">{t("Last 7 Days")}</SelectItem>
                            <SelectItem value="month">{t("Last 30 Days")}</SelectItem>
                            <SelectItem value="quarter">{t("Last 3 Months")}</SelectItem>
                            <SelectItem value="year">{t("Last Year")}</SelectItem>
                        </SelectContent>
                    </Select>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Share2 className="h-4 w-4"/>
                                <span className="sr-only">{t("Share")}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={handleShare}>{t("Copy Link")}</DropdownMenuItem>
                            <DropdownMenuItem onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4"/>
                                {t("Print Report")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> :
                            <Download className="mr-2 h-4 w-4"/>}
                        {isExporting ? t("Exporting...") : t("Export")}
                    </Button>
                    <Link href="/dashboard"><Button variant="outline">{t("Main Dashboard")}</Button></Link>
                    <Link href="/analytics/dashboard-summary"><Button
                        variant="default">{t("View Dashboard Summary")}</Button></Link>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview" className="flex items-center gap-2"><BarChart
                        className="h-4 w-4"/>{t("Overview")}</TabsTrigger>
                    <TabsTrigger value="performance" className="flex items-center gap-2"><LineChartIcon
                        className="h-4 w-4"/>{t("Performance")}</TabsTrigger>
                    <TabsTrigger value="engagement" className="flex items-center gap-2"><PieChartIcon
                        className="h-4 w-4"/>{t("Engagement")}</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="overflow-hidden">
                            <CardHeader
                                className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20">
                                <div className="space-y-1"><CardTitle
                                    className="text-sm font-medium">{t("Average Score")}</CardTitle><CardDescription>{t("Overall performance")}</CardDescription>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Activity className="h-4 w-4 text-primary"/></div>
                            </CardHeader>
                            <CardContent className="py-4">
                                <div className="flex items-baseline space-x-2">
                                    <div
                                        className="text-3xl font-bold">{dashboardData?.dashboardSummary?.currentPeriod?.metrics?.averageScore || 78}%
                                    </div>
                                    <div className="text-xs font-medium text-green-500 flex items-center"><TrendingUp
                                        className="h-3 w-3 mr-1"/>+3.5%
                                    </div>
                                </div>
                                <div className="mt-3 h-10">{renderSparkline(scoreHistory, "#3b82f6")}</div>
                                <div
                                    className="mt-2 text-xs text-muted-foreground">{t("Compared to previous")} {t(timeRange)}</div>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden">
                            <CardHeader
                                className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20">
                                <div className="space-y-1"><CardTitle
                                    className="text-sm font-medium">{t("Games Played")}</CardTitle><CardDescription>{t("Total sessions")}</CardDescription>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <BarChart className="h-4 w-4 text-primary"/></div>
                            </CardHeader>
                            <CardContent className="py-4">
                                <div className="flex items-baseline space-x-2">
                                    <div
                                        className="text-3xl font-bold">{dashboardData?.dashboardSummary?.currentPeriod?.metrics?.gamesPlayed || 1250}</div>
                                    <div className="text-xs font-medium text-green-500 flex items-center"><TrendingUp
                                        className="h-3 w-3 mr-1"/>+8.2%
                                    </div>
                                </div>
                                <div className="mt-3 h-10">{renderSparkline(gamesHistory, "#10b981")}</div>
                                <div
                                    className="mt-2 text-xs text-muted-foreground">{t("65 games in the last week")}</div>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden">
                            <CardHeader
                                className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20">
                                <div className="space-y-1"><CardTitle
                                    className="text-sm font-medium">{t("Completion Rate")}</CardTitle><CardDescription>{t("Assignments finished")}</CardDescription>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <PieChartIcon className="h-4 w-4 text-primary"/></div>
                            </CardHeader>
                            <CardContent className="py-4">
                                <div className="flex items-baseline space-x-2">
                                    <div
                                        className="text-3xl font-bold">{dashboardData?.dashboardSummary?.currentPeriod?.metrics?.completionRate || 82}%
                                    </div>
                                    <div className="text-xs font-medium text-green-500 flex items-center"><TrendingUp
                                        className="h-3 w-3 mr-1"/>+3.5%
                                    </div>
                                </div>
                                <div className="mt-4"><Progress
                                    value={dashboardData?.dashboardSummary?.currentPeriod?.metrics?.completionRate || 82}
                                    className="h-2"/></div>
                                <div
                                    className="mt-2 text-xs text-muted-foreground">{t("22 of 24 students on track")}</div>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden">
                            <CardHeader
                                className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20">
                                <div className="space-y-1"><CardTitle
                                    className="text-sm font-medium">{t("Active Students")}</CardTitle><CardDescription>{t("Student participation")}</CardDescription>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Activity className="h-4 w-4 text-primary"/></div>
                            </CardHeader>
                            <CardContent className="py-4">
                                <div className="flex items-baseline space-x-2">
                                    <div
                                        className="text-3xl font-bold">{dashboardData?.dashboardSummary?.currentPeriod?.metrics?.activeStudents || 250}</div>
                                    <div className="text-xs font-medium text-green-500 flex items-center"><TrendingUp
                                        className="h-3 w-3 mr-1"/>+5.2%
                                    </div>
                                </div>
                                <div className="mt-3 h-10">{renderSparkline(engagementHistory, "#f59e0b")}</div>
                                <div
                                    className="mt-2 text-xs text-muted-foreground">{t("High engagement in Math games")}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <ChartCard
                            title={t("Performance Trends")}
                            description={t("Average scores over time")}
                            loading={loading.studentPerformance}
                            error={error.studentPerformance}
                            height={300}
                            className="lg:col-span-2"
                            footerContent={
                                <div className="flex justify-between items-center w-full text-sm">
                                    <div className="flex items-center"><Badge variant="outline"
                                                                              className="mr-2">{t("Trend")}</Badge><span
                                        className="text-green-500 font-medium">{t("Improving")}</span></div>
                                    <div><span className="text-muted-foreground">{t("Starting")}: </span><span
                                        className="font-medium">70%</span><span
                                        className="mx-2 text-muted-foreground">→</span><span
                                        className="text-muted-foreground">{t("Current")}: </span><span
                                        className="font-medium">85%</span></div>
                                </div>
                            }>
                            <DynamicLineChart data={studentPerformanceData}
                                              margin={{top: 20, right: 30, left: 20, bottom: 20}}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="month"/>
                                <YAxis domain={[0, 100]}/>
                                <Tooltip/>
                                <Legend/>
                                <Line type="monotone" dataKey="math" name={t("Math")} stroke="#3b82f6" strokeWidth={2}
                                      dot={{r: 4}}/>
                                <Line type="monotone" dataKey="reading" name={t("Reading")} stroke="#10b981"
                                      strokeWidth={2} dot={{r: 4}}/>
                                <Line type="monotone" dataKey="science" name={t("Science")} stroke="#f59e0b"
                                      strokeWidth={2} dot={{r: 4}}/>
                                <Line type="monotone" dataKey="average" name={t("Average")} stroke="#ef4444"
                                      strokeWidth={3} dot={{r: 6}}/>
                            </DynamicLineChart>
                        </ChartCard>

                        <ChartCard
                            title={t("Student Distribution")}
                            description={t("Performance by score range")}
                            loading={loading.studentDistribution}
                            error={error.studentDistribution}
                            height={350} width={100}>
                            <>
                                <div className="h-[250px] w-full">
                                    <DynamicPieChart>
                                        <Pie data={studentDistributionData} cx="50%" cy="50%" innerRadius={60}
                                             outerRadius={80} paddingAngle={5} dataKey="value"
                                             label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                                            {studentDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color}/>))}
                                        </Pie>
                                        <Tooltip/>
                                    </DynamicPieChart>
                                </div>
                                <div className="mt-4 space-y-2">
                                    {studentDistributionData.map((item) => (
                                        <div key={item.name} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full mr-2"
                                                     style={{backgroundColor: item.color}}></div>
                                                <span className="text-sm">{item.name}</span>
                                            </div>
                                            <span className="text-sm font-medium">{item.value} {t("students")}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        </ChartCard>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard
                            title={t("Weekly Activity")}
                            description={t("Game sessions and scores by day")}
                            loading={loading.weeklyActivity}
                            error={error.weeklyActivity}
                            height={300}
                            footerContent={
                                <div className="flex justify-between items-center w-full text-sm">
                                    <div><span className="text-muted-foreground">{t("Total Sessions")}: </span><span
                                        className="font-medium">{weeklyActivityData.reduce((sum, day) => sum + day.sessions, 0)}</span>
                                    </div>
                                    <div><span className="text-muted-foreground">{t("Average Score")}: </span><span
                                        className="font-medium">{(weeklyActivityData.reduce((sum, day) => sum + day.avgScore, 0) / (weeklyActivityData.length || 1)).toFixed(1)}</span>
                                    </div>
                                </div>
                            }>
                            <DynamicComposedChart data={weeklyActivityData}
                                                  margin={{top: 20, right: 30, left: 20, bottom: 20}}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="day"/>
                                <YAxis yAxisId="left" orientation="left"/>
                                <YAxis yAxisId="right" orientation="right" domain={[0, 100]}/>
                                <Tooltip/>
                                <Legend/>
                                <Bar yAxisId="left" dataKey="sessions" name={t("Game Sessions")} fill="#3b82f6"
                                     radius={[4, 4, 0, 0]}/>
                                <Line yAxisId="right" type="monotone" dataKey="avgScore" name={t("Avg. Score")}
                                      stroke="#f59e0b" strokeWidth={2}/>
                            </DynamicComposedChart>
                        </ChartCard>

                        <ChartCard
                            title={t("Subject Breakdown")}
                            description={t("Game usage by subject area")}
                            loading={loading.subjectBreakdown}
                            error={error.subjectBreakdown}
                            height={300}
                            footerContent={
                                <div className="text-sm">
                                    <span className="text-muted-foreground">{t("Most popular")}: </span>
                                    <span className="font-medium">
                    {subjectBreakdownData.length > 0 ? `${subjectBreakdownData.reduce((prev, current) => (prev.value > current.value) ? prev : current).name}` : "N/A"}
                  </span>
                                </div>
                            }>
                            <DynamicPieChart>
                                <Pie data={subjectBreakdownData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                                     label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}>
                                    {subjectBreakdownData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color}/>))}
                                </Pie>
                                <Tooltip/>
                                <Legend/>
                            </DynamicPieChart>
                        </ChartCard>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle>{t("Top Performers")}</CardTitle><CardDescription>{t("Highest scoring students")}</CardDescription></CardHeader>
                            <CardContent className="h-[300px] space-y-4 overflow-y-auto">
                                {loading.topPerformers ? <ChartLoader height={200}/> : error.topPerformers ? <div/> :
                                    topPerformersData.map((student) => (
                                        <div key={student.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar><AvatarImage src={student.avatar || "/placeholder.svg"}
                                                                     alt={student.name}/><AvatarFallback>{student.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback></Avatar>
                                                <div><p className="text-sm font-medium">{student.name}</p><p
                                                    className="text-xs text-muted-foreground">{t("Score")}: {student.score}%</p>
                                                </div>
                                            </div>
                                            <div
                                                className="text-sm font-medium text-green-500">{student.improvement || `+${Math.floor(Math.random() * 5) + 1}%`}</div>
                                        </div>
                                    ))
                                }
                            </CardContent>
                            <CardFooter className="border-t px-6 py-4"><Button variant="outline" size="sm"
                                                                               className="w-full">{t("View All Students")}</Button></CardFooter>
                        </Card>
                        <Card className="w-full">
                            <CardHeader><CardTitle>{t("Recent Student Activities")}</CardTitle></CardHeader>
                            <CardContent className="h-[300px] overflow-y-auto">
                                {recentActivities.length > 0 ? (
                                    <ul className="space-y-3 text-sm">
                                        {recentActivities.map((activity) => (
                                            <li key={activity.id} className="border-b pb-2 last:border-b-0">
                                                <div className="font-medium">{activity.student}</div>
                                                <div className="text-muted-foreground text-xs">
                                                    {activity.type === "game_completed" ? `${t("completed")} ${activity.game} (${activity.score} ${t("points")})` : activity.type === "achievement" ? `${t("earned")} ${activity.achievement}` : `${t("activity")} - ${activity.type}`}
                                                    {" • "}
                                                    {activity.time}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-muted-foreground">{t("No recent activities found.")}</p>}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4 pt-4">
                    <ChartCard
                        title={t("Performance Metrics")}
                        description={t("Student performance by grade level")}
                        loading={loading.performanceMetrics}
                        error={error.performanceMetrics}
                        height={400}
                        footerContent={<div className="flex justify-between w-full"><Button
                            variant="outline">{t("Export Data")}</Button><Button
                            variant="default">{t("View Detailed Analysis")}</Button></div>}>
                        <DynamicComposedChart data={performanceMetricsData}
                                              margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="grade"/>
                            <YAxis yAxisId="left" orientation="left" domain={[0, 100]}/>
                            <YAxis yAxisId="right" orientation="right" domain={[0, 10]}/>
                            <Tooltip formatter={(value, name) => {
                                if (name === "avgScore") return [`${value}%`, t("Avg. Score")];
                                if (name === "improvement") return [`${value}%`, t("improvement")];
                                return [value, t("Students")]
                            }}/>
                            <Legend/>
                            <Bar yAxisId="left" dataKey="avgScore" fill="#8884d8" name={t("Avg. Score")}/>
                            <Line yAxisId="right" type="monotone" dataKey="improvement" stroke="#ff7300"
                                  name={t("improvement")}/>
                            <Area yAxisId="left" type="monotone" dataKey="students" fill="#82ca9d" stroke="#82ca9d"
                                  name={t("Students")}/>
                        </DynamicComposedChart>
                    </ChartCard>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ChartCard
                            title={t("Skill Distribution")}
                            description={t("Average proficiency by subject area")}
                            loading={loading.skillDistribution}
                            error={error.skillDistribution}
                            height={300}>
                            <DynamicRadarChart outerRadius={90} data={skillDistributionData}>
                                <PolarGrid/>
                                <PolarAngleAxis dataKey="subject"/>
                                <PolarRadiusAxis angle={30} domain={[0, 100]}/>
                                <Radar name={t("Proficiency")} dataKey="score" stroke="#8884d8" fill="#8884d8"
                                       fillOpacity={0.6}/>
                                <Tooltip formatter={(value) => [`${value}%`, t("Proficiency")]}/>
                                <Legend/>
                            </DynamicRadarChart>
                        </ChartCard>

                        <ChartCard
                            title={t("Student Progress")}
                            description={t("Skill level progression over time")}
                            loading={loading.studentProgress}
                            error={error.studentProgress}
                            height={300}>
                            <DynamicAreaChart data={studentProgressData}
                                              margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <Tooltip/>
                                <Legend/>
                                <Area type="monotone" dataKey="beginner" stackId="1" stroke="#8884d8" fill="#8884d8"
                                      name={t("Beginner")}/>
                                <Area type="monotone" dataKey="intermediate" stackId="1" stroke="#82ca9d" fill="#82ca9d"
                                      name={t("Intermediate")}/>
                                <Area type="monotone" dataKey="advanced" stackId="1" stroke="#ffc658" fill="#ffc658"
                                      name={t("Advanced")}/>
                                <Area type="monotone" dataKey="expert" stackId="1" stroke="#ff8042" fill="#ff8042"
                                      name={t("Expert")}/>
                            </DynamicAreaChart>
                        </ChartCard>
                    </div>
                </TabsContent>

                <TabsContent value="engagement" className="space-y-4 pt-4">
                    <ChartCard
                        title={t("Engagement Metrics")}
                        description={t("Student engagement patterns throughout the week")}
                        loading={loading.engagementMetrics}
                        error={error.engagementMetrics}
                        height={400}
                        footerContent={<div className="flex justify-between w-full"><Button
                            variant="outline">{t("Export Data")}</Button><Button
                            variant="default">{t("View Engagement Report")}</Button></div>}>
                        <DynamicAreaChart data={engagementMetricsData}
                                          margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="day"/>
                            <YAxis/>
                            <Tooltip formatter={(value, name) => {
                                if (name === "activeUsers") return [value, t("Active Students")];
                                if (name === "sessionsPerUser") return [value, t("Sessions Per User")];
                                return [`${value} min`, t("Avg. Session")]
                            }}/>
                            <Legend/>
                            <Area type="monotone" dataKey="activeUsers" stackId="1" stroke="#8884d8" fill="#8884d8"
                                  name={t("Active Students")}/>
                            <Area type="monotone" dataKey="sessionsPerUser" stackId="2" stroke="#82ca9d" fill="#82ca9d"
                                  name={t("Sessions Per User")}/>
                            <Area type="monotone" dataKey="avgSessionTime" stackId="3" stroke="#ffc658" fill="#ffc658"
                                  name={t("Avg. Session")}/>
                        </DynamicAreaChart>
                    </ChartCard>

                    <ChartCard
                        title={t("Game Usage")}
                        description={t("Most popular educational games")}
                        loading={loading.gameUsage}
                        error={error.gameUsage}
                        height={400}
                        footerContent={<Button variant="outline" className="w-full">{t("View All Games")}</Button>}>
                        <DynamicBarChart data={gameUsageData} margin={{top: 5, right: 30, left: 20, bottom: 5}}
                                         layout="vertical">
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis type="number"/>
                            <YAxis dataKey="name" type="category" width={100}/>
                            <Tooltip
                                formatter={(value, name) => [value, name === "plays" ? t("Total Plays") : name === "avgScore" ? t("Avg. Score") : t("Completion Rate")]}/>
                            <Legend/>
                            <Bar dataKey="plays" fill="#8884d8" name={t("Total Plays")}/>
                            <Bar dataKey="avgScore" fill="#82ca9d" name={t("Avg. Score")}/>
                            <Bar dataKey="completionRate" fill="#ffc658" name={t("Completion Rate")}/>
                        </DynamicBarChart>
                    </ChartCard>
                </TabsContent>
            </Tabs>
        </div>
    )
}
