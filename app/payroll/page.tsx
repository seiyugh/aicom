"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Calculator, CalendarDays, Download, Eye, Plus, Search, FileText } from "lucide-react"
import { format } from "date-fns"

type PayrollPeriod = {
  id: number
  periodStart: string
  periodEnd: string
  paymentDate: string
  status: string
}

type PayrollEntry = {
  id: number
  employeeNumber: string
  payrollPeriodId: number
  grossPay: number
  sssDeduction: number
  philhealthDeduction: number
  pagibigDeduction: number
  taxDeduction: number
  otherDeductions: number
  netPay: number
  status: string
}

type Employee = {
  id: number
  employeeNumber: string
  firstName: string
  lastName: string
  fullName: string
}

export default function PayrollPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([])
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("")
  const [isAddPeriodDialogOpen, setIsAddPeriodDialogOpen] = useState(false)
  const [isCalculateDialogOpen, setIsCalculateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<PayrollEntry | null>(null)
  const [periodFormData, setPeriodFormData] = useState({
    periodStart: "",
    periodEnd: "",
    paymentDate: "",
    status: "active",
  })
  const [calculateFormData, setCalculateFormData] = useState({
    employeeNumber: "",
    payrollPeriodId: "",
  })

  useEffect(() => {
    fetchPayrollPeriods()
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (selectedPeriod) {
      fetchPayrollEntries(selectedPeriod)
    }
  }, [selectedPeriod])

  const fetchPayrollPeriods = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get("/payroll-periods")
      if (response.status === 200) {
        setPayrollPeriods(response.data)
        if (response.data.length > 0) {
          setSelectedPeriod(response.data[0].id.toString())
        }
      }
    } catch (error) {
      console.error("Error fetching payroll periods:", error)
      toast({
        title: "Error",
        description: "Failed to fetch payroll periods. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPayrollEntries = async (periodId: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.get("/payroll-entries")
      if (response.status === 200) {
        // Filter entries by period ID
        const filteredEntries = response.data.filter(
          (entry: PayrollEntry) => entry.payrollPeriodId.toString() === periodId,
        )
        setPayrollEntries(filteredEntries)
      }
    } catch (error) {
      console.error("Error fetching payroll entries:", error)
      toast({
        title: "Error",
        description: "Failed to fetch payroll entries. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await apiClient.get("/employees")
      if (response.status === 200) {
        setEmployees(response.data)
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
    }
  }

  const handleAddPayrollPeriod = async () => {
    try {
      const response = await apiClient.post("/payroll-periods", periodFormData)
      if (response.status === 201) {
        toast({
          title: "Success",
          description: "Payroll period added successfully",
        })
        fetchPayrollPeriods()
        setIsAddPeriodDialogOpen(false)
        resetPeriodForm()
      }
    } catch (error) {
      console.error("Error adding payroll period:", error)
      toast({
        title: "Error",
        description: "Failed to add payroll period. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCalculatePayroll = async () => {
    try {
      const response = await apiClient.post(
        `/calculate-payroll/${calculateFormData.employeeNumber}/${calculateFormData.payrollPeriodId}`,
      )
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Payroll calculated successfully",
        })
        fetchPayrollEntries(selectedPeriod)
        setIsCalculateDialogOpen(false)
        resetCalculateForm()
      }
    } catch (error) {
      console.error("Error calculating payroll:", error)
      toast({
        title: "Error",
        description: "Failed to calculate payroll. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetPeriodForm = () => {
    setPeriodFormData({
      periodStart: "",
      periodEnd: "",
      paymentDate: "",
      status: "active",
    })
  }

  const resetCalculateForm = () => {
    setCalculateFormData({
      employeeNumber: "",
      payrollPeriodId: selectedPeriod,
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  const openViewDialog = (entry: PayrollEntry) => {
    setCurrentEntry(entry)
    setIsViewDialogOpen(true)
  }

  const exportPayrollToPDF = () => {
    toast({
      title: "Export Started",
      description: "Generating PDF payroll report...",
    })
    // In a real implementation, this would generate and download a PDF
  }

  const generatePayslips = () => {
    toast({
      title: "Generating Payslips",
      description: "Creating payslips for all employees in this period...",
    })
    // In a real implementation, this would generate payslips
  }

  const filteredPayrollEntries = payrollEntries.filter((entry) =>
    entry.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const currentPeriod = payrollPeriods.find((period) => period.id.toString() === selectedPeriod)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">Manage payroll periods and process employee payments</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddPeriodDialogOpen} onOpenChange={setIsAddPeriodDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Period
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payroll Period</DialogTitle>
                <DialogDescription>Create a new payroll period for processing</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="periodStart">Period Start</Label>
                    <Input
                      id="periodStart"
                      type="date"
                      value={periodFormData.periodStart}
                      onChange={(e) =>
                        setPeriodFormData({
                          ...periodFormData,
                          periodStart: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periodEnd">Period End</Label>
                    <Input
                      id="periodEnd"
                      type="date"
                      value={periodFormData.periodEnd}
                      onChange={(e) =>
                        setPeriodFormData({
                          ...periodFormData,
                          periodEnd: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Payment Date</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={periodFormData.paymentDate}
                      onChange={(e) =>
                        setPeriodFormData({
                          ...periodFormData,
                          paymentDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={periodFormData.status}
                      onValueChange={(value) =>
                        setPeriodFormData({
                          ...periodFormData,
                          status: value,
                        })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddPeriodDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPayrollPeriod}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCalculateDialogOpen} onOpenChange={setIsCalculateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Payroll
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Calculate Payroll</DialogTitle>
                <DialogDescription>Process payroll for an employee</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_select">Select Employee</Label>
                  <Select
                    value={calculateFormData.employeeNumber}
                    onValueChange={(value) =>
                      setCalculateFormData({
                        ...calculateFormData,
                        employeeNumber: value,
                      })
                    }
                  >
                    <SelectTrigger id="employee_select">
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.employeeNumber} value={employee.employeeNumber}>
                          {employee.fullName || `${employee.firstName} ${employee.lastName}`} ({employee.employeeNumber}
                          )
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period_select">Select Payroll Period</Label>
                  <Select
                    value={calculateFormData.payrollPeriodId || selectedPeriod}
                    onValueChange={(value) =>
                      setCalculateFormData({
                        ...calculateFormData,
                        payrollPeriodId: value,
                      })
                    }
                  >
                    <SelectTrigger id="period_select">
                      <SelectValue placeholder="Select a period" />
                    </SelectTrigger>
                    <SelectContent>
                      {payrollPeriods.map((period) => (
                        <SelectItem key={period.id} value={period.id.toString()}>
                          {format(new Date(period.periodStart), "MMM d, yyyy")} -{" "}
                          {format(new Date(period.periodEnd), "MMM d, yyyy")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCalculateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCalculatePayroll}>Calculate</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
          <div className="w-full md:w-64">
            <Select
              value={selectedPeriod}
              onValueChange={setSelectedPeriod}
              disabled={isLoading || payrollPeriods.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a payroll period" />
              </SelectTrigger>
              <SelectContent>
                {payrollPeriods.map((period) => (
                  <SelectItem key={period.id} value={period.id.toString()}>
                    {format(new Date(period.periodStart), "MMM d, yyyy")} -{" "}
                    {format(new Date(period.periodEnd), "MMM d, yyyy")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {currentPeriod && (
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarDays className="mr-1 h-4 w-4" />
              <span>Payment Date: {format(new Date(currentPeriod.paymentDate), "MMM d, yyyy")}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by employee number..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" title="Export Payroll" onClick={exportPayrollToPDF}>
            <Download className="h-4 w-4" />
            <span className="sr-only">Export</span>
          </Button>
          <Button variant="outline" size="icon" title="Generate Payslips" onClick={generatePayslips}>
            <FileText className="h-4 w-4" />
            <span className="sr-only">Payslips</span>
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead className="text-right">Gross Pay</TableHead>
              <TableHead className="text-right">SSS</TableHead>
              <TableHead className="text-right">PhilHealth</TableHead>
              <TableHead className="text-right">Pag-IBIG</TableHead>
              <TableHead className="text-right">Tax</TableHead>
              <TableHead className="text-right">Net Pay</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredPayrollEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No payroll entries found for this period.
                </TableCell>
              </TableRow>
            ) : (
              filteredPayrollEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.employeeNumber}</TableCell>
                  <TableCell className="text-right">{formatCurrency(entry.grossPay)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(entry.sssDeduction || 0)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(entry.philhealthDeduction || 0)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(entry.pagibigDeduction || 0)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(entry.taxDeduction || 0)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(entry.netPay)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        entry.status === "paid"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : entry.status === "processed"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      {entry.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openViewDialog(entry)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Payroll Entry Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payroll Entry Details</DialogTitle>
            <DialogDescription>Detailed breakdown of payroll entry</DialogDescription>
          </DialogHeader>
          {currentEntry && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Employee Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Employee Number:</span>
                  <span>{currentEntry.employeeNumber}</span>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Earnings</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Gross Pay:</span>
                  <span className="text-right">{formatCurrency(currentEntry.grossPay)}</span>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Deductions</h3>
                <div className="space-y-1">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">SSS:</span>
                    <span className="text-right">{formatCurrency(currentEntry.sssDeduction || 0)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">PhilHealth:</span>
                    <span className="text-right">{formatCurrency(currentEntry.philhealthDeduction || 0)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Pag-IBIG:</span>
                    <span className="text-right">{formatCurrency(currentEntry.pagibigDeduction || 0)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="text-right">{formatCurrency(currentEntry.taxDeduction || 0)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Other Deductions:</span>
                    <span className="text-right">{formatCurrency(currentEntry.otherDeductions || 0)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm border-t pt-1 mt-1 font-medium">
                    <span className="text-muted-foreground">Total Deductions:</span>
                    <span className="text-right">
                      {formatCurrency(
                        (currentEntry.sssDeduction || 0) +
                          (currentEntry.philhealthDeduction || 0) +
                          (currentEntry.pagibigDeduction || 0) +
                          (currentEntry.taxDeduction || 0) +
                          (currentEntry.otherDeductions || 0),
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4 bg-muted">
                <div className="grid grid-cols-2 gap-2 text-sm font-medium">
                  <span>Net Pay:</span>
                  <span className="text-right">{formatCurrency(currentEntry.netPay)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

