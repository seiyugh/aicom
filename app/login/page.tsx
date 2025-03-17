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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setCorsError(false)
    setIsLoading(true)

    try {
      await login(employeeNumber, password)
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Login error:", err)

      if (err.message.includes("CORS") || err.isCorsError) {
        setCorsError(true)
      } else if (err.response?.status === 419) {
        setError("CSRF token mismatch. Please try again.")
      } else if (err.response?.status === 422) {
        setError(err.response.data.message || "Validation failed. Please check your input.")
      } else if (err.response?.status === 401) {
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
              <Label htmlFor="password">Password</Label>
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
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
