import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate
} from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import LoginView from './views/LoginView'
import HomeView from './views/HomeView'
import ConfigView from './views/ConfigView'
import { saveAppConfig, getAppConfig } from './utils/appConfig'
import { setHttpBaseUrl } from './api/http'
import {
  clearAccessToken,
  getAuthenticatedUser,
  hasValidAccessToken,
  saveAccessToken,
  subscribeToAuthChanges
} from './utils/authSession'

export default function AppRoutes() {
  return (
    <Router>
      <AppRouteViews />
    </Router>
  )
}

function AppRouteViews() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasValidAccessToken())
  const [currentUser, setCurrentUser] = useState(() => getAuthenticatedUser())
  const [config, setConfig] = useState(getAppConfig)
  const navigate = useNavigate()

  useEffect(
    () =>
      subscribeToAuthChanges(() => {
        setIsAuthenticated(hasValidAccessToken())
        setCurrentUser(getAuthenticatedUser())
      }),
    []
  )

  const authApi = useMemo(
    () => ({
      login: (token) => {
        saveAccessToken(token)
        setIsAuthenticated(true)
        setCurrentUser(getAuthenticatedUser(token))
      },
      logout: () => {
        clearAccessToken()
        setIsAuthenticated(false)
        setCurrentUser(null)
      }
    }),
    []
  )

  const saveConfig = (nextConfig) => {
    const persistedConfig = saveAppConfig(nextConfig)
    setHttpBaseUrl(persistedConfig.apiBaseUrl)
    setConfig(persistedConfig)
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/home" replace />
          ) : (
            <LoginView language={config.language} onLogin={authApi.login} />
          )
        }
      />
      <Route
        path="/home"
        element={
          isAuthenticated ? (
            <HomeView
              config={config}
              currentUser={currentUser}
              onLogout={authApi.logout}
              onOpenConfig={() => navigate('/config')}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/config"
        element={
          isAuthenticated ? (
            <ConfigView
              config={config}
              language={config.language}
              onSave={saveConfig}
              onBack={() => navigate('/home')}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/home' : '/login'} replace />}
      />
    </Routes>
  )
}
