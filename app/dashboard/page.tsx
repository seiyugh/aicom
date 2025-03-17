"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, ClipboardList, DollarSign, Users } from "lucide-react"

// Dashboard stats type
type DashboardStats = {
  totalEmployees: number
  activePayrolls: number
  pendingPayrolls: number
  totalTimeEntries: number
  recentTimeEntries: any[]
  recentPayrolls: any[]
  recentEmployees: any[]
}

export default function DashboardPage() {
  const { user } = useAuth() // Get the authenticated user
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activePayrolls: 0,
    pendingPayrolls: 0,
    totalTimeEntries: 0,
    recentTimeEntries: [],
    recentPayrolls: [],
    recentEmployees: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user]) // Re-run when user changes

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Fetch all data for the dashboard
      const employeesResponse = await apiClient.get("/employees")
      const payrollPeriodsResponse = await apiClient.get("/payroll-periods")
      const timeEntriesResponse = await apiClient.get("/time-entries")
      const payrollEntriesResponse = await apiClient.get("/payroll-entries")

      const activePayrolls = payrollPeriodsResponse.data.filter((period: any) => period.status === "active").length
      const pendingPayrolls = payrollPeriodsResponse.data.filter((period: any) => period.status === "pending").length

      setStats({
        totalEmployees: employeesResponse.data.length,
        activePayrolls,
        pendingPayrolls,
        totalTimeEntries: timeEntriesResponse.data.length,
        recentTimeEntries: timeEntriesResponse.data.slice(0, 5),
        recentPayrolls: payrollEntriesResponse.data.slice(0, 5),
        recentEmployees: employeesResponse.data
          .sort((a: any, b: any) => new Date(b.dateHired).getTime() - new Date(a.dateHired).getTime())
          .slice(0, 5),
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.username || "User"}! Here's an overview of your system.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Total Employees" value={stats.totalEmployees} description="Active employees in system" icon={<Users className="h-4 w-4 text-muted-foreground" />} isLoading={isLoading} />
            <StatsCard title="Active Payrolls" value={stats.activePayrolls} description="Current pay periods" icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />} isLoading={isLoading} />
            <StatsCard title="Pending Payrolls" value={stats.pendingPayrolls} description="Awaiting processing" icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} isLoading={isLoading} />
            <StatsCard title="Time Entries" value={stats.totalTimeEntries} description="Total attendance records" icon={<Calendar className="h-4 w-4 text-muted-foreground" />} isLoading={isLoading} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <DataCard title="Recent Time Entries" description="Latest attendance records" data={stats.recentTimeEntries} isLoading={isLoading} />
            <DataCard title="Recent Payrolls" description="Latest payroll entries" data={stats.recentPayrolls} isLoading={isLoading} formatter={formatCurrency} />
            <DataCard title="Recent Employees" description="Latest employee additions" data={stats.recentEmployees} isLoading={isLoading} />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>View detailed analytics and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Analytics content will be displayed here.</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and view system reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Reports content will be displayed here.</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Reusable component for statistics cards
function StatsCard({ title, value, description, icon, isLoading }: { title: string, value: number, description: string, icon: React.ReactNode, isLoading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-7 w-1/2" /> : <div className="text-2xl font-bold">{value}</div>}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

// Reusable component for data lists
function DataCard({ title, description, data, isLoading, formatter }: { title: string, description: string, data: any[], isLoading: boolean, formatter?: (value: number) => string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>
        ) : data.length > 0 ? (
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex justify-between text-sm border-b pb-2">
                <span>{item.employeeNumber || item.fullName}</span>
                <span>{formatter ? formatter(item.grossPay) : item.status || item.position}</span>
              </div>
            ))}
          </div>
        ) : <div className="text-sm text-muted-foreground">No recent data available.</div>}
      </CardContent>
    </Card>
  )
}
