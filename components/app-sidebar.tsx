"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { BarChart3, Calendar, ClipboardList, CreditCard, LogOut, Settings, User, Users } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export function AppSidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  // Only show menu items based on user role
  const canAccessEmployees = user?.role === "admin" || user?.role === "billinghr"
  const canAccessPayroll = user?.role === "admin" || user?.role === "billinghr"
  const canAccessSettings = user?.role === "admin"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <CreditCard className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Payroll System</span>
            <span className="text-xs text-muted-foreground">v1.0</span>
          </div>
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard")} tooltip="Dashboard">
                  <Link href="/dashboard">
                    <BarChart3 />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Employee Management - Admin and BillingHR only */}
              {canAccessEmployees && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/employees")} tooltip="Employees">
                    <Link href="/employees">
                      <Users />
                      <span>Manage Employees</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Payroll Management - Admin and BillingHR only */}
              {canAccessPayroll && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/payroll")} tooltip="Payroll">
                    <Link href="/payroll">
                      <ClipboardList />
                      <span>Manage Payroll</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Time Entries - Admin and BillingHR only */}
              {canAccessPayroll && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/time-entries")} tooltip="Time Entries">
                    <Link href="/time-entries">
                      <Calendar />
                      <span>Time Entries</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Employee can view their own profile */}
              {user?.role === "employee" && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/profile")} tooltip="My Profile">
                    <Link href="/profile">
                      <User />
                      <span>My Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Settings - Admin only */}
              {canAccessSettings && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/settings")} tooltip="Settings">
                    <Link href="/settings">
                      <Settings />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{user?.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ModeToggle />
            <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

