"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { CalendarDays, CreditCard, DollarSign, User } from "lucide-react"
import { format } from "date-fns"
import { useSearchParams } from "next/navigation"

type EmployeeProfile = {
  id: number
  employeeNumber: string
  firstName: string
  lastName: string
  middleName?: string
  fullName: string
  address: string
  position: string
  department: string
  assignedArea?: string
  dateHired: string
  yearsOfService: number
  employmentStatus: string
  dateOfRegularization?: string
  status201?: string
  resignationTerminationDate?: string
  rateType: number
  civilStatus: string
  gender: string
  birthdate: string
  birthplace: string
  age: number
  contacts: string
  idStatus: number
  sssNo?: string
  tinNo?: string
  philhealthNo?: string
  pagibigNo?: string
  emergencyContactName: string
  emergencyContactMobile: string
}

type PayrollHistory = {
  id: number
  employeeNumber: string
  payrollPeriodId: number
  periodStart: string
  periodEnd: string
  grossPay: number
  sssDeduction: number
  philhealthDeduction: number
  pagibigDeduction: number
  taxDeduction: number
  otherDeductions: number
  netPay: number
  status: string
  paymentDate: string | null
}

type TimeEntry = {
  id: number
  employeeNumber: string
  clockIn: string
  clockOut: string | null
  totalHours: number
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")

  const [profile, setProfile] = useState<EmployeeProfile | null>(null)
  const [payrollHistory, setPayrollHistory] = useState<PayrollHistory[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("profile")

  useEffect(() => {
    // Set the active tab based on URL parameter if present
    if (tabParam && ["profile", "payroll", "attendance"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  useEffect(() => {
    if (user?.employeeNumber) {
      fetchEmployeeProfile()
      fetchPayrollHistory()
      fetchTimeEntries()
    }
  }, [user])

  const fetchEmployeeProfile = async () => {
    setIsLoading(true)
    try {
      if (!user?.employeeNumber) return

      const response = await apiClient.get(`/employees/${user.employeeNumber}`)
      if (response.status === 200) {
        setProfile(response.data)
      }
    } catch (error) {
      console.error("Error fetching employee profile:", error)
      toast({
        title: "Error",
        description: "Failed to fetch your profile information.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPayrollHistory = async () => {
    try {
      if (!user?.employeeNumber) return

      const response = await apiClient.get(`/payroll-entries/${user.employeeNumber}`)
      if (response.status === 200) {
        setPayrollHistory(response.data)
      }
    } catch (error) {
      console.error("Error fetching payroll history:", error)
      toast({
        title: "Error",
        description: "Failed to fetch your payroll history.",
        variant: "destructive",
      })
    }
  }

  const fetchTimeEntries = async () => {
    try {
      if (!user?.employeeNumber) return

      const response = await apiClient.get(`/time-entries/${user.employeeNumber}`)
      if (response.status === 200) {
        setTimeEntries(response.data)
      }
    } catch (error) {
      console.error("Error fetching time entries:", error)
      toast({
        title: "Error",
        description: "Failed to fetch your time entries.",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  const formatDateTime = (dateTime: string) => {
    return format(new Date(dateTime), "MMM d, yyyy h:mm a")
  }

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    return `${wholeHours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">View your personal information, payroll history, and attendance records</p>
      </div>

      <Tabs defaultValue={activeTab} className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="payroll">Payroll History</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Personal Information</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading || !profile ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {profile.fullName || `${profile.firstName} ${profile.lastName}`}
                    </div>
                    <div className="text-sm text-muted-foreground">Employee ID: {profile.employeeNumber}</div>
                    <div className="text-sm text-muted-foreground">Gender: {profile.gender}</div>
                    <div className="text-sm text-muted-foreground">Civil Status: {profile.civilStatus}</div>
                    <div className="text-sm text-muted-foreground">Contact: {profile.contacts}</div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employment Details</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading || !profile ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{profile.position}</div>
                    <div className="text-sm text-muted-foreground">Department: {profile.department}</div>
                    <div className="text-sm text-muted-foreground">Status: {profile.employmentStatus}</div>
                    <div className="text-sm text-muted-foreground">Years of Service: {profile.yearsOfService}</div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employment Date</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading || !profile ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {profile.dateHired ? format(new Date(profile.dateHired), "MMM d, yyyy") : "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">Hire Date</div>
                    {profile.dateOfRegularization && (
                      <>
                        <div className="text-lg font-medium mt-2">
                          {format(new Date(profile.dateOfRegularization), "MMM d, yyyy")}
                        </div>
                        <div className="text-sm text-muted-foreground">Regularization Date</div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional profile information */}
          {!isLoading && profile && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Government IDs</CardTitle>
                  <CardDescription>Your government-issued identification numbers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">SSS Number:</span>
                      <span className="text-sm">{profile.sssNo || "Not provided"}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">TIN Number:</span>
                      <span className="text-sm">{profile.tinNo || "Not provided"}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">PhilHealth Number:</span>
                      <span className="text-sm">{profile.philhealthNo || "Not provided"}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Pag-IBIG Number:</span>
                      <span className="text-sm">{profile.pagibigNo || "Not provided"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                  <CardDescription>Your emergency contact information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Name:</span>
                      <span className="text-sm">{profile.emergencyContactName}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Contact Number:</span>
                      <span className="text-sm">{profile.emergencyContactMobile}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll History</CardTitle>
              <CardDescription>View your past payroll records and payment history</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex flex-col space-y-2 rounded-lg border p-4">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-5 w-1/4" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/5" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : payrollHistory.length === 0 ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                  No payroll records found.
                </div>
              ) : (
                <div className="space-y-4">
                  {payrollHistory.map((record) => (
                    <div key={record.id} className="flex flex-col space-y-3 rounded-lg border p-4">
                      <div className="flex flex-col justify-between space-y-1 sm:flex-row sm:space-y-0">
                        <div className="font-medium">
                          {format(new Date(record.periodStart), "MMM d")} -{" "}
                          {format(new Date(record.periodEnd), "MMM d, yyyy")}
                        </div>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            record.status === "paid"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : record.status === "processed"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          }`}
                        >
                          {record.status}
                        </div>
                      </div>
                      <div className="flex flex-col justify-between space-y-1 text-sm text-muted-foreground sm:flex-row sm:space-y-0">
                        <div>Payroll Period ID: {record.payrollPeriodId}</div>
                        {record.paymentDate && (
                          <div>Paid on: {format(new Date(record.paymentDate), "MMM d, yyyy")}</div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1 pt-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div className="grid grid-cols-2 gap-2 text-sm sm:flex sm:gap-4">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Gross:</span>
                            <span>{formatCurrency(record.grossPay)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Deductions:</span>
                            <span>
                              {formatCurrency(
                                (record.sssDeduction || 0) +
                                  (record.philhealthDeduction || 0) +
                                  (record.pagibigDeduction || 0) +
                                  (record.taxDeduction || 0) +
                                  (record.otherDeductions || 0),
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 font-medium">
                          <span className="text-muted-foreground">Net Pay:</span>
                          <span>{formatCurrency(record.netPay)}</span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                          <DollarSign className="h-3 w-3" />
                          View Pay Slip
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>View your time entries and attendance history</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex justify-between border-b pb-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/6" />
                    </div>
                  ))}
                </div>
              ) : timeEntries.length === 0 ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                  No attendance records found.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 font-medium pb-2 border-b">
                    <div>Clock In</div>
                    <div>Clock Out</div>
                    <div>Duration</div>
                  </div>
                  {timeEntries.map((entry) => (
                    <div key={entry.id} className="grid grid-cols-3 py-2 border-b text-sm">
                      <div>{formatDateTime(entry.clockIn)}</div>
                      <div>
                        {entry.clockOut ? (
                          formatDateTime(entry.clockOut)
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                            Active
                          </span>
                        )}
                      </div>
                      <div>{entry.totalHours ? formatDuration(entry.totalHours) : "-"}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

