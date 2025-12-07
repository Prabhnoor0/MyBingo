import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  // Show loading while checking authentication status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0EEEA]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#97B3AE] mx-auto mb-4"></div>
          <p className="text-[#486856]">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Render children if authenticated
  return children
}

export default ProtectedRoute

