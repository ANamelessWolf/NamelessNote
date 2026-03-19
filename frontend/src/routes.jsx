import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate
} from 'react-router-dom'
import { useMemo, useState } from 'react'
import LoginView from './views/LoginView'
import HomeView from './views/HomeView'
import ConfigView from './views/ConfigView'
import { saveAppConfig, getAppConfig } from './utils/appConfig'
import { setHttpBaseUrl } from './api/http'

export default function AppRoutes() {
  return (
    <Router>
      <AppRouteViews />
    </Router>
  )
}

function AppRouteViews() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [config, setConfig] = useState(getAppConfig)
  const navigate = useNavigate()

  const authApi = useMemo(
    () => ({
      login: () => setIsAuthenticated(true),
      logout: () => setIsAuthenticated(false)
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
            <LoginView onLogin={authApi.login} />
          )
        }
      />
      <Route
        path="/home"
        element={
          isAuthenticated ? (
            <HomeView
              config={config}
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
