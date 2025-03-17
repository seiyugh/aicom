import axios from "axios"
import Cookies from "js-cookie"

// Define the base URL for the API
const API_URL = "http://127.0.0.1:8000/api/v1"
// Define the base URL for Laravel Sanctum (without the /api/v1 part)
const SANCTUM_URL = process.env.NEXT_PUBLIC_SANCTUM_URL || "http://127.0.0.1:8000"

// Update the getCsrfToken function to properly decode the token
export const getCsrfToken = () => {
  const token = Cookies.get("XSRF-TOKEN")
  if (token) {
    return decodeURIComponent(token)
  }
  return ""
}

// Helper function to decode JWT payload (for debugging)
export const decodeJwtPayload = (token: string) => {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error("Error decoding token:", e)
    return null
  }
}

// Replace the fetchCsrfToken function with this improved version
export const fetchCsrfToken = async () => {
  try {
    console.log("Fetching CSRF token from:", `${SANCTUM_URL}/sanctum/csrf-cookie`)

    // Use direct fetch instead of axios for the CSRF request
    const response = await fetch(`${SANCTUM_URL}/sanctum/csrf-cookie`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    })

    console.log("CSRF cookie response status:", response.status)

    // Wait for cookies to be set
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Log all cookies for debugging
    const allCookies = document.cookie
    console.log("All cookies after CSRF request:", allCookies)

    // Check specifically for XSRF-TOKEN
    const token = getCsrfToken()
    console.log("Extracted CSRF token:", token)

    if (!token) {
      console.warn("No CSRF token found in cookies after request")
      return ""
    }

    return token
  } catch (error) {
    console.error("Error fetching CSRF token:", error)
    return ""
  }
}

// Create a separate instance for Sanctum CSRF requests
export const sanctumClient = axios.create({
  baseURL: SANCTUM_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
  withCredentials: true,
})

// Update the apiClient configuration
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
  withCredentials: true, // Important for cookies
})

// Update the request interceptor to ensure token is properly formatted
apiClient.interceptors.request.use(
  async (config) => {
    // Get the CSRF token from cookies
    let token = getCsrfToken()

    // If no token is found, try to fetch it
    if (!token) {
      console.log("No CSRF token found in cookies, fetching new one")
      token = await fetchCsrfToken()
    }

    if (token) {
      console.log("Using CSRF token for request:", config.url)
      config.headers["X-XSRF-TOKEN"] = token
    } else {
      console.warn("No CSRF token available for request:", config.url)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    // Check if the error is a CORS error or network error
    if (error.message === "Network Error" || error.code === "ERR_NETWORK" || !error.response) {
      console.error("CORS or Network Error:", error)
      // Return a specific error that can be handled in the UI
      return Promise.reject({
        isCorsError: true,
        message: "API server is not accessible. This may be due to CORS restrictions.",
      })
    }

    // Handle CSRF token mismatch (419 error in Laravel)
    if (error.response?.status === 419) {
      console.error("CSRF token mismatch. Refreshing token...")
      try {
        // Try to refresh the CSRF token
        const newToken = await fetchCsrfToken()

        // If we still don't have a token, throw an error
        if (!newToken) {
          throw new Error("Failed to get CSRF token after refresh")
        }

        // Update the original request with the new token
        if (error.config) {
          error.config.headers["X-XSRF-TOKEN"] = newToken
        }

        // Retry the original request
        return apiClient(error.config)
      } catch (refreshError) {
        console.error("Failed to refresh CSRF token:", refreshError)
        return Promise.reject(refreshError)
      }
    }

    const originalRequest = error.config

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Don't automatically redirect, just return the error
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)
