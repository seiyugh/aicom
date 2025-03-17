"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCsrfToken } from "@/lib/api-client"

// Simplify the User type to have a single role
type User = {
  id: number
  employeeNumber: string
  name: string
  role: "admin" // All users will have admin role
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (employeeNumber: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Define SANCTUM_URL (replace with your actual Sanctum URL)
const SANCTUM_URL = process.env.NEXT_PUBLIC_SANCTUM_URL || "http://localhost:8000"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if we have a mock user in localStorage (for development)
  useEffect(() => {
    const mockUser = localStorage.getItem("mockUser")
    if (mockUser) {
      try {
        const parsedUser = JSON.parse(mockUser)
        // Ensure the user has admin role
        parsedUser.role = "admin"
        setUser(parsedUser)
      } catch (e) {
        console.error("Error parsing mock user:", e)
        localStorage.removeItem("mockUser")
      }
    }
    setIsLoading(false)
  }, [])

  // Check authentication status
  const checkAuth = async (): Promise<boolean> => {
    // If we have a mock user, return true
    if (localStorage.getItem("mockUser")) {
      return true
    }

    try {
      const sanctumUrl = process.env.NEXT_PUBLIC_SANCTUM_URL || "http://localhost:8000"

      // First, ensure we have a valid CSRF token
      await fetch(`${sanctumUrl}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      })

      // Wait for cookies to be set
      await new Promise((resolve) => setTimeout(resolve, 500))

      const csrfToken = getCsrfToken()
      console.log("Auth check CSRF token:", csrfToken)

      if (!csrfToken) {
        console.error("No CSRF token available for auth check")
        return false
      }

      // Make the auth check request
      const response = await fetch(`${sanctumUrl}/api/v1/auth-check`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-XSRF-TOKEN": csrfToken,
        },
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()

      if (data.user) {
        // Ensure the user has admin role
        data.user.role = "admin"
        setUser(data.user)
        return true
      }
      return false
    } catch (error) {
      console.error("Auth check error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (employeeNumber: string, password: string) => {
    setIsLoading(true)
    try {
      // Use the environment variable
      const sanctumUrl = process.env.NEXT_PUBLIC_SANCTUM_URL || "http://localhost:8000"

      // First, ensure we have the CSRF cookie using fetch API directly
      const csrfResponse = await fetch(`${sanctumUrl}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      })

      console.log("CSRF cookie fetch status:", csrfResponse.status)

      // Wait for cookies to be set
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Get the token from the cookie
      const csrfToken = getCsrfToken()
      console.log("Login CSRF Token:", csrfToken)

      if (!csrfToken) {
        throw new Error("Failed to get CSRF token")
      }

      // Make the login request with the CSRF token
      const response = await fetch(`${sanctumUrl}/api/v1/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-XSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({
          employee_number: employeeNumber, // Changed from employeeNumber to employee_number
          password: password,
        }),
      })

      // Handle validation errors (422)
      if (response.status === 422) {
        const errorData = await response.json()
        console.log("Validation errors:", errorData)

        // Format validation error message
        let errorMessage = "Validation failed: "
        if (errorData.errors) {
          errorMessage += Object.values(errorData.errors).flat().join(", ")
        } else if (errorData.message) {
          errorMessage += errorData.message
        }

        throw new Error(errorMessage)
      }

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Login response:", data)

      if (data.user) {
        // Ensure the user has admin role
        data.user.role = "admin"
        setUser(data.user)
      } else {
        throw new Error("No user data in response")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    // Clear mock user if it exists
    localStorage.removeItem("mockUser")

    setIsLoading(true)
    try {
      const sanctumUrl = process.env.NEXT_PUBLIC_SANCTUM_URL || "http://localhost:8000"

      // Get fresh CSRF token
      await fetch(`${sanctumUrl}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      })

      // Wait for cookies to be set
      await new Promise((resolve) => setTimeout(resolve, 500))

      const csrfToken = getCsrfToken()

      if (!csrfToken) {
        throw new Error("Failed to get CSRF token for logout")
      }

      await fetch(`${sanctumUrl}/api/v1/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-XSRF-TOKEN": csrfToken,
        },
      })

      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      setUser(null)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

