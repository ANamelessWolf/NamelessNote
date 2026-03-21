import React from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Provider } from 'react-redux'
import AppRoutes from './routes'
import { store } from './store'
import rocksBackground from './assets/img/Rocks 2304x1440.jpg'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0c6d63'
    },
    secondary: {
      main: '#f39c12'
    },
    background: {
      default: '#f4f7f8'
    }
  },
  shape: {
    borderRadius: 10
  },
  typography: {
    fontFamily: '"Work Sans", "Segoe UI", sans-serif'
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `linear-gradient(rgba(244, 247, 248, 0.25), rgba(244, 247, 248, 0.3)), url("${rocksBackground}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat'
        },
        '#root': {
          minHeight: '100vh'
        }
      }
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Provider store={store}>
          <AppRoutes />
        </Provider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
)
