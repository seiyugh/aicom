"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Define the User type
type User = {
  id: number
  employeeNumber: string
  name: string
  role: "admin" // All users have the "admin" role
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (employeeNumber: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Set Laravel API URL
const SANCTUM_URL = process.env.NEXT_PUBLIC_SANCTUM_URL || "http://localhost:8000"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 🔹 Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // 🔹 Check if the user is authenticated
  const checkAuth = async (): Promise<boolean> => {
    setIsLoading(true);

    try {
      // First, fetch CSRF cookie
      await fetch(`${SANCTUM_URL}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include", // Important!
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      // Then, check authentication
      const response = await fetch(`${SANCTUM_URL}/api/v1/auth-check`, {
        method: "GET",
        credentials: "include", // Important!
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (!response.ok) {
        console.error("Auth check failed:", response.status);
        return false;
      }

      const data = await response.json();
      if (data.user) {
        setUser({ ...data.user, role: "admin" });
        return true;
      }

      return false;
    } catch (error) {
      console.error("Auth check error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  // 🔹 Login function
  const login = async (employeeNumber: string, password: string) => {
    setIsLoading(true)

    try {
      // Fetch CSRF cookie
      await fetch(`${SANCTUM_URL}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      })

      // Login request
      const response = await fetch(`${SANCTUM_URL}/api/v1/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          employee_number: employeeNumber, // Laravel expects "employee_number"
          password: password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Login failed")
      }

      const data = await response.json()
      if (data.user) {
        setUser({ ...data.user, role: "admin" }) // Ensure admin role
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

  // 🔹 Logout function
  const logout = async () => {
    setIsLoading(true)

    try {
      // Ensure CSRF token is refreshed before logout
      await fetch(`${SANCTUM_URL}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      })

      // Logout request
      await fetch(`${SANCTUM_URL}/api/v1/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      })

      setUser(null)
      router.push("/login") // Redirect to login page
    } catch (error) {
      console.error("Logout error:", error)
      setUser(null)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
