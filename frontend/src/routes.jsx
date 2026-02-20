import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { useMemo, useState } from 'react'
import LoginView from './views/LoginView'
import HomeView from './views/HomeView'

export default function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const authApi = useMemo(
    () => ({
      login: () => setIsAuthenticated(true),
      logout: () => setIsAuthenticated(false)
    }),
    []
  )

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/home" replace />
            ) : (
              <LoginView onLogin={authApi.login} />
            )
          }
        />
        <Route
          path="/home"
          element={
            isAuthenticated ? (
              <HomeView onLogout={authApi.logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? '/home' : '/login'} replace />
          }
        />
      </Routes>
    </Router>
  )
}
