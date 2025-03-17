"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CreditCard, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const [employeeNumber, setEmployeeNumber] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [corsError, setCorsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  // Update the mock login function to use admin role
  const handleMockLogin = () => {
    // For development/testing when API is not available
    setIsLoading(true)
    setTimeout(() => {
      // Create a mock user with admin role
      const mockUser = {
        id: 1,
        employeeNumber: employeeNumber || "EMP001",
        name: "Test User",
        role: "admin",
      }

      // Set the user in localStorage for persistence
      localStorage.setItem("mockUser", JSON.stringify(mockUser))

      // Redirect to dashboard
      router.push("/dashboard")
      setIsLoading(false)
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setCorsError(false)
    setIsLoading(true)

    try {
      await login(employeeNumber, password)
      router.push("/dashboard")
    } catch (err: any) {
      if (err.isCorsError || (err.message && err.message.includes("CORS"))) {
        setCorsError(true)
      } else if (err.message && err.message.includes("Validation failed")) {
        // Handle validation errors
        setError(err.message)
      } else if (err.response?.status === 419) {
        setError("CSRF token mismatch. Please try again.")
      } else if (err.response?.status === 422) {
        // Validation errors from Laravel
        setError(err.response.data.message || "Validation failed. Please check your input.")
      } else if (err.response?.status === 401 || err.message?.includes("401")) {
        setError("Invalid credentials. Please try again.")
      } else {
        setError("Login failed: " + (err.message || "Please try again."))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">CSR Admin Payroll</CardTitle>
              <CardDescription>Enter your credentials to access the system</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {corsError && (
              <Alert variant="destructive" className="text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>API Connection Error</AlertTitle>
                <AlertDescription className="mt-2">
                  <p>Unable to connect to the API server due to CORS restrictions. Please ensure:</p>
                  <ol className="list-decimal pl-4 mt-2 space-y-1">
                    <li>The API server is running at http://127.0.0.1:8000</li>
                    <li>CORS is properly configured on your API server</li>
                    <li>Your network allows connections to the API server</li>
                  </ol>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="employeeNumber">Employee Number</Label>
              <Input
                id="employeeNumber"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                placeholder="Enter your employee number"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>

            {corsError && (
              <Button type="button" variant="outline" className="w-full" onClick={handleMockLogin} disabled={isLoading}>
                Use Mock Login (Development Only)
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

