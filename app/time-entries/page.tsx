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
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, Plus, Search, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type TimeEntry = {
  id: number
  employeeNumber: string
  clockIn: string
  clockOut: string | null
  totalHours: number
}

type Employee = {
  id: number
  employeeNumber: string
  firstName: string
  lastName: string
  fullName: string
}

export default function TimeEntriesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    employeeNumber: "",
    clockIn: "",
    clockOut: "",
  })
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))

  const canEdit = user?.role === "admin" || user?.role === "billinghr"

  useEffect(() => {
    fetchTimeEntries()
    fetchEmployees()
  }, [selectedDate])

  const fetchTimeEntries = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get("/time-entries")
      if (response.status === 200) {
        // Filter by selected date
        const filteredEntries = response.data.filter((entry: TimeEntry) => {
          const entryDate = format(new Date(entry.clockIn), "yyyy-MM-dd")
          return entryDate === selectedDate
        })
        setTimeEntries(filteredEntries)
      }
    } catch (error) {
      console.error("Error fetching time entries:", error)
      toast({
        title: "Error",
        description: "Failed to fetch time entries. Please try again.",
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

  const handleAddTimeEntry = async () => {
    try {
      const response = await apiClient.post("/time-entries", formData)
      if (response.status === 201) {
        toast({
          title: "Success",
          description: "Time entry added successfully",
        })
        fetchTimeEntries()
        setIsAddDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error adding time entry:", error)
      toast({
        title: "Error",
        description: "Failed to add time entry. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTimeEntry = async (id: number) => {
    if (!confirm("Are you sure you want to delete this time entry?")) return

    try {
      const response = await apiClient.delete(`/time-entries/${id}`)
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Time entry deleted successfully",
        })
        fetchTimeEntries()
      }
    } catch (error) {
      console.error("Error deleting time entry:", error)
      toast({
        title: "Error",
        description: "Failed to delete time entry. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      employeeNumber: "",
      clockIn: "",
      clockOut: "",
    })
  }

  const filteredTimeEntries = timeEntries.filter((entry) =>
    entry.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Entries</h1>
          <p className="text-muted-foreground">Manage employee attendance and time records</p>
        </div>
        {canEdit && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Time Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Time Entry</DialogTitle>
                <DialogDescription>Record a new time entry for an employee</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeNumber">Employee</Label>
                  <Select
                    value={formData.employeeNumber}
                    onValueChange={(value) => setFormData({ ...formData, employeeNumber: value })}
                  >
                    <SelectTrigger id="employeeNumber">
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
                  <Label htmlFor="clockIn">Clock In</Label>
                  <Input
                    id="clockIn"
                    type="datetime-local"
                    value={formData.clockIn}
                    onChange={(e) => setFormData({ ...formData, clockIn: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clockOut">Clock Out (Optional)</Label>
                  <Input
                    id="clockOut"
                    type="datetime-local"
                    value={formData.clockOut}
                    onChange={(e) => setFormData({ ...formData, clockOut: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTimeEntry}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center space-x-2">
          <div className="w-full md:w-64">
            <Label htmlFor="date" className="sr-only">
              Select Date
            </Label>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>
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
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead>Duration</TableHead>
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
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredTimeEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No time entries found for this date.
                </TableCell>
              </TableRow>
            ) : (
              filteredTimeEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.employeeNumber}</TableCell>
                  <TableCell>{formatDateTime(entry.clockIn)}</TableCell>
                  <TableCell>
                    {entry.clockOut ? (
                      formatDateTime(entry.clockOut)
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                        <Clock className="mr-1 h-3 w-3" />
                        Active
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{entry.totalHours ? formatDuration(entry.totalHours) : "-"}</TableCell>
                  <TableCell className="text-right">
                    {canEdit && (
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTimeEntry(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

