import React from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { Provider } from 'react-redux'
import AppRoutes from './routes'
import { store } from './store'

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
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <AppRoutes />
      </Provider>
    </ThemeProvider>
  </React.StrictMode>
)
