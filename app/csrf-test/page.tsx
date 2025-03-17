"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchCsrfToken, getCsrfToken } from "@/lib/api-client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function CsrfTestPage() {
  const [csrfToken, setCsrfToken] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<boolean>(false)
  const [allCookies, setAllCookies] = useState<string>("")

  // Check for existing token on page load
  useEffect(() => {
    const existingToken = getCsrfToken()
    if (existingToken) {
      setCsrfToken(existingToken)
      setSuccess(true)
    }

    // Display all cookies for debugging
    setAllCookies(document.cookie)
  }, [])

  const handleFetchToken = async () => {
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const token = await fetchCsrfToken()

      // Update cookies display
      setAllCookies(document.cookie)

      if (token) {
        setCsrfToken(token)
        setSuccess(true)
      } else {
        setError("Failed to get CSRF token. Check console for details.")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching the CSRF token")
      console.error("CSRF token fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDirectFetch = async () => {
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const sanctumUrl = process.env.NEXT_PUBLIC_SANCTUM_URL || "http://localhost:8000"

      // Try with fetch API directly
      const response = await fetch(`${sanctumUrl}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      })

      console.log("Direct fetch response:", response.status)

      // Wait for cookies to be set
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update cookies display
      setAllCookies(document.cookie)

      // Check if token is now available
      const newToken = getCsrfToken()
      if (newToken) {
        setCsrfToken(newToken)
        setSuccess(true)
      } else {
        setError("Failed to get CSRF token with direct fetch. Check console for details.")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during direct fetch")
      console.error("Direct fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleTestEndpoint = async () => {
    setLoading(true)
    setError("")

    try {
      const sanctumUrl = process.env.NEXT_PUBLIC_SANCTUM_URL || "http://localhost:8000"

      // Try the test-csrf endpoint
      const response = await fetch(`${sanctumUrl}/test-csrf`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      })

      console.log("Test endpoint response:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Test endpoint data:", data)

      // Wait for cookies to be set
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update cookies display
      setAllCookies(document.cookie)

      // Check if token is now available
      const newToken = getCsrfToken()
      if (newToken) {
        setCsrfToken(newToken)
        setSuccess(true)
      } else {
        setError("Test endpoint didn't set CSRF token. Check console for details.")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred testing the endpoint")
      console.error("Test endpoint error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>CSRF Token Test</CardTitle>
          <CardDescription>Test if CSRF tokens can be fetched from Laravel Sanctum</CardDescription>
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
              <AlertDescription>CSRF token successfully retrieved!</AlertDescription>
            </Alert>
          )}

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

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Sanctum URL:</h3>
            <div className="rounded-md bg-muted p-2 font-mono text-xs">
              {process.env.NEXT_PUBLIC_SANCTUM_URL || "http://localhost:8000"}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" onClick={handleFetchToken} disabled={loading}>
            {loading ? "Fetching..." : "Fetch CSRF Token (Axios)"}
          </Button>
          <Button className="w-full" variant="outline" onClick={handleDirectFetch} disabled={loading}>
            {loading ? "Fetching..." : "Fetch CSRF Token (Direct)"}
          </Button>
          <Button className="w-full" variant="secondary" onClick={handleTestEndpoint} disabled={loading}>
            {loading ? "Testing..." : "Test /test-csrf Endpoint"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

