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
import { Edit, Eye, Plus, Search, Trash2, Download, Filter } from "lucide-react"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Employee = {
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

export default function EmployeesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)
  const [departments, setDepartments] = useState<string[]>([])
  const [formData, setFormData] = useState({
    employeeNumber: "",
    firstName: "",
    lastName: "",
    middleName: "",
    address: "",
    position: "",
    department: "",
    assignedArea: "",
    dateHired: "",
    employmentStatus: "Regular",
    civilStatus: "Single",
    gender: "Male",
    birthdate: "",
    birthplace: "",
    contacts: "",
    emergencyContactName: "",
    emergencyContactMobile: "",
    sssNo: "",
    tinNo: "",
    philhealthNo: "",
    pagibigNo: "",
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get("/employees")
      if (response.status === 200) {
        setEmployees(response.data)

        // Extract unique departments for filtering
        const uniqueDepartments = Array.from(new Set(response.data.map((emp: Employee) => emp.department))).filter(
          Boolean,
        )
        setDepartments(uniqueDepartments as string[])
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast({
        title: "Error",
        description: "Failed to fetch employees. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddEmployee = async () => {
    try {
      const response = await apiClient.post("/employees", formData)
      if (response.status === 201) {
        toast({
          title: "Success",
          description: "Employee added successfully",
        })
        fetchEmployees()
        setIsAddDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error adding employee:", error)
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditEmployee = async () => {
    if (!currentEmployee) return

    try {
      const response = await apiClient.put(`/employees/${currentEmployee.employeeNumber}`, formData)
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Employee updated successfully",
        })
        fetchEmployees()
        setIsEditDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error updating employee:", error)
      toast({
        title: "Error",
        description: "Failed to update employee. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEmployee = async (employeeNumber: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return

    try {
      const response = await apiClient.delete(`/employees/${employeeNumber}`)
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Employee deleted successfully",
        })
        fetchEmployees()
      }
    } catch (error) {
      console.error("Error deleting employee:", error)
      toast({
        title: "Error",
        description: "Failed to delete employee. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      employeeNumber: "",
      firstName: "",
      lastName: "",
      middleName: "",
      address: "",
      position: "",
      department: "",
      assignedArea: "",
      dateHired: "",
      employmentStatus: "Regular",
      civilStatus: "Single",
      gender: "Male",
      birthdate: "",
      birthplace: "",
      contacts: "",
      emergencyContactName: "",
      emergencyContactMobile: "",
      sssNo: "",
      tinNo: "",
      philhealthNo: "",
      pagibigNo: "",
    })
    setCurrentEmployee(null)
  }

  const openEditDialog = (employee: Employee) => {
    setCurrentEmployee(employee)
    setFormData({
      employeeNumber: employee.employeeNumber,
      firstName: employee.firstName,
      lastName: employee.lastName,
      middleName: employee.middleName || "",
      address: employee.address,
      position: employee.position,
      department: employee.department,
      assignedArea: employee.assignedArea || "",
      dateHired: employee.dateHired,
      employmentStatus: employee.employmentStatus,
      civilStatus: employee.civilStatus,
      gender: employee.gender,
      birthdate: employee.birthdate,
      birthplace: employee.birthplace,
      contacts: employee.contacts,
      emergencyContactName: employee.emergencyContactName,
      emergencyContactMobile: employee.emergencyContactMobile,
      sssNo: employee.sssNo || "",
      tinNo: employee.tinNo || "",
      philhealthNo: employee.philhealthNo || "",
      pagibigNo: employee.pagibigNo || "",
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (employee: Employee) => {
    setCurrentEmployee(employee)
    setIsViewDialogOpen(true)
  }

  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Employee ID", "Name", "Position", "Department", "Date Hired", "Status", "Contact"].join(",")

    const rows = filteredEmployees.map((emp) =>
      [
        emp.employeeNumber,
        emp.fullName || `${emp.firstName} ${emp.lastName}`,
        emp.position,
        emp.department,
        new Date(emp.dateHired).toLocaleDateString(),
        emp.employmentStatus,
        emp.contacts,
      ].join(","),
    )

    const csvContent = [headers, ...rows].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `employees_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Apply filters and search
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter
    const matchesStatus = statusFilter === "all" || employee.employmentStatus === statusFilter

    return matchesSearch && matchesDepartment && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">Manage employee information and records</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>Enter the details for the new employee</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeNumber">Employee Number</Label>
                  <Input
                    id="employeeNumber"
                    value={formData.employeeNumber}
                    onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateHired">Date Hired</Label>
                  <Input
                    id="dateHired"
                    type="date"
                    value={formData.dateHired}
                    onChange={(e) => setFormData({ ...formData, dateHired: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentStatus">Employment Status</Label>
                  <Select
                    value={formData.employmentStatus}
                    onValueChange={(value) => setFormData({ ...formData, employmentStatus: value })}
                  >
                    <SelectTrigger id="employmentStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="Probationary">Probationary</SelectItem>
                      <SelectItem value="Contractual">Contractual</SelectItem>
                      <SelectItem value="Resigned">Resigned</SelectItem>
                      <SelectItem value="Terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedArea">Assigned Area</Label>
                  <Input
                    id="assignedArea"
                    value={formData.assignedArea}
                    onChange={(e) => setFormData({ ...formData, assignedArea: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="civilStatus">Civil Status</Label>
                  <Select
                    value={formData.civilStatus}
                    onValueChange={(value) => setFormData({ ...formData, civilStatus: value })}
                  >
                    <SelectTrigger id="civilStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Separated">Separated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthdate">Birthdate</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthplace">Birthplace</Label>
                  <Input
                    id="birthplace"
                    value={formData.birthplace}
                    onChange={(e) => setFormData({ ...formData, birthplace: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contacts">Contact Number</Label>
                  <Input
                    id="contacts"
                    value={formData.contacts}
                    onChange={(e) => setFormData({ ...formData, contacts: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactMobile">Emergency Contact Number</Label>
                  <Input
                    id="emergencyContactMobile"
                    value={formData.emergencyContactMobile}
                    onChange={(e) => setFormData({ ...formData, emergencyContactMobile: e.target.value })}
                  />
                </div>
              </div>
              <h3 className="text-lg font-medium mt-2">Government IDs</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sssNo">SSS Number</Label>
                  <Input
                    id="sssNo"
                    value={formData.sssNo}
                    onChange={(e) => setFormData({ ...formData, sssNo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tinNo">TIN Number</Label>
                  <Input
                    id="tinNo"
                    value={formData.tinNo}
                    onChange={(e) => setFormData({ ...formData, tinNo: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="philhealthNo">PhilHealth Number</Label>
                  <Input
                    id="philhealthNo"
                    value={formData.philhealthNo}
                    onChange={(e) => setFormData({ ...formData, philhealthNo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pagibigNo">Pag-IBIG Number</Label>
                  <Input
                    id="pagibigNo"
                    value={formData.pagibigNo}
                    onChange={(e) => setFormData({ ...formData, pagibigNo: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEmployee}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search employees..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Label htmlFor="department-filter" className="text-xs">
                  Department
                </Label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger id="department-filter" className="mt-1">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-2">
                <Label htmlFor="status-filter" className="text-xs">
                  Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter" className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Probationary">Probationary</SelectItem>
                    <SelectItem value="Contractual">Contractual</SelectItem>
                    <SelectItem value="Resigned">Resigned</SelectItem>
                    <SelectItem value="Terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button variant="outline" size="sm" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Department</TableHead>
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
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-8 w-16" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.employeeNumber}</TableCell>
                  <TableCell>{employee.fullName || `${employee.firstName} ${employee.lastName}`}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        employee.employmentStatus === "Regular"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : employee.employmentStatus === "Probationary"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            : employee.employmentStatus === "Contractual"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {employee.employmentStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openViewDialog(employee)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(employee)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteEmployee(employee.employeeNumber)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update the employee information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_employeeNumber">Employee Number</Label>
                <Input
                  id="edit_employeeNumber"
                  value={formData.employeeNumber}
                  onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_position">Position</Label>
                <Input
                  id="edit_position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_department">Department</Label>
                <Input
                  id="edit_department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>
            {/* Additional fields similar to Add Employee dialog */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEmployee}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Employee Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>View detailed employee information</DialogDescription>
          </DialogHeader>
          {currentEmployee && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Employee Number:</span>
                      <span className="text-sm">{currentEmployee.employeeNumber}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Full Name:</span>
                      <span className="text-sm">
                        {currentEmployee.fullName || `${currentEmployee.firstName} ${currentEmployee.lastName}`}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Gender:</span>
                      <span className="text-sm">{currentEmployee.gender}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Civil Status:</span>
                      <span className="text-sm">{currentEmployee.civilStatus}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Birthdate:</span>
                      <span className="text-sm">{format(new Date(currentEmployee.birthdate), "MMMM d, yyyy")}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Age:</span>
                      <span className="text-sm">{currentEmployee.age}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Birthplace:</span>
                      <span className="text-sm">{currentEmployee.birthplace}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Address:</span>
                      <span className="text-sm">{currentEmployee.address}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Contact Number:</span>
                      <span className="text-sm">{currentEmployee.contacts}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Employment Information</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Position:</span>
                      <span className="text-sm">{currentEmployee.position}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Department:</span>
                      <span className="text-sm">{currentEmployee.department}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Assigned Area:</span>
                      <span className="text-sm">{currentEmployee.assignedArea || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Date Hired:</span>
                      <span className="text-sm">{format(new Date(currentEmployee.dateHired), "MMMM d, yyyy")}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Years of Service:</span>
                      <span className="text-sm">{currentEmployee.yearsOfService}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Employment Status:</span>
                      <span className="text-sm">{currentEmployee.employmentStatus}</span>
                    </div>
                    {currentEmployee.dateOfRegularization && (
                      <div className="grid grid-cols-2">
                        <span className="text-sm font-medium">Date of Regularization:</span>
                        <span className="text-sm">
                          {format(new Date(currentEmployee.dateOfRegularization), "MMMM d, yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Government IDs</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">SSS Number:</span>
                      <span className="text-sm">{currentEmployee.sssNo || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">TIN Number:</span>
                      <span className="text-sm">{currentEmployee.tinNo || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">PhilHealth Number:</span>
                      <span className="text-sm">{currentEmployee.philhealthNo || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Pag-IBIG Number:</span>
                      <span className="text-sm">{currentEmployee.pagibigNo || "N/A"}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Emergency Contact</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Name:</span>
                      <span className="text-sm">{currentEmployee.emergencyContactName}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm font-medium">Contact Number:</span>
                      <span className="text-sm">{currentEmployee.emergencyContactMobile}</span>
                    </div>
                  </div>
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

