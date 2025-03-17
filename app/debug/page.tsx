"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function DebugPage() {
  const [csrfToken, setCsrfToken] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<boolean>(false)
  const [allCookies, setAllCookies] = useState<string>("")
  const [serverResponse, setServerResponse] = useState<string>("")

  const sanctumUrl = process.env.NEXT_PUBLIC_SANCTUM_URL || "http://localhost:8000"

  // Check for existing token on page load
  useEffect(() => {
    setAllCookies(document.cookie)
  }, [])

  const getCsrfToken = () => {
    const tokenCookie = document.cookie.split("; ").find((row) => row.startsWith("XSRF-TOKEN="))

    if (tokenCookie) {
      return decodeURIComponent(tokenCookie.split("=")[1])
    }
    return ""
  }

  const handleFetchToken = async () => {
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch(`${sanctumUrl}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      })

      console.log("CSRF fetch response:", response)
      setServerResponse(`Status: ${response.status} ${response.statusText}`)

      // Wait for cookies to be set
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update cookies display
      setAllCookies(document.cookie)

      // Check if token is now available
      const token = getCsrfToken()
      if (token) {
        setCsrfToken(token)
        setSuccess(true)
      } else {
        setError("Failed to get CSRF token. No XSRF-TOKEN cookie found.")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
      console.error("CSRF fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleTestLogin = async () => {
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const token = getCsrfToken()

      if (!token) {
        setError("No CSRF token available. Please fetch token first.")
        setLoading(false)
        return
      }

      const response = await fetch(`${sanctumUrl}/api/v1/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-XSRF-TOKEN": token,
        },
        body: JSON.stringify({
          employee_number: "test123", // Changed from employeeNumber to employee_number
          password: "password",
        }),
      })

      console.log("Login test response:", response)
      setServerResponse(`Status: ${response.status} ${response.statusText}`)

      // Update cookies display
      setAllCookies(document.cookie)

      if (response.ok) {
        setSuccess(true)
        const data = await response.json()
        console.log("Login response data:", data)
      } else {
        setError(`Login failed with status ${response.status}`)
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
      console.error("Login test error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>CSRF Debug Tool</CardTitle>
          <CardDescription>Test CSRF token handling with Laravel Sanctum</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-300">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Operation completed successfully!</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Sanctum URL:</h3>
            <div className="rounded-md bg-muted p-2 font-mono text-xs break-all">{sanctumUrl}</div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Server Response:</h3>
            <div className="rounded-md bg-muted p-2 font-mono text-xs break-all">
              {serverResponse || "No response yet"}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Current CSRF Token:</h3>
            <div className="rounded-md bg-muted p-2 font-mono text-xs break-all">
              {csrfToken || "No token available"}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">All Cookies:</h3>
            <div className="rounded-md bg-muted p-2 font-mono text-xs break-all">
              {allCookies || "No cookies available"}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" onClick={handleFetchToken} disabled={loading}>
            {loading ? "Fetching..." : "Fetch CSRF Token"}
          </Button>
          <Button className="w-full" variant="outline" onClick={handleTestLogin} disabled={loading}>
            {loading ? "Testing..." : "Test Login Request"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

