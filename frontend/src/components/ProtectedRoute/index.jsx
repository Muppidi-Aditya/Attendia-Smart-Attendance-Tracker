import { Navigate, Outlet } from 'react-router-dom'
import Cookies from 'js-cookie'

const ProtectedRoute = () => {
  const token = Cookies.get('token')
  const username = Cookies.get('username')
  const displayName = Cookies.get('displayName')
  
  // Only check for token and either username or displayName
  // No password check needed with the new split API approach
  if (!token || (!username && !displayName)) {
    return <Navigate to="/login" replace />
  }
  
  return <Outlet />
}

export default ProtectedRoute