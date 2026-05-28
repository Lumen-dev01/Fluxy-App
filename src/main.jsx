import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ThemeProvider wraps everything so all components can access theme */}
    <ThemeProvider>
      {/* BrowserRouter enables client-side routing */}
      <BrowserRouter>
        {/* AuthProvider manages login state for the whole app */}
        <AuthProvider>
          <App />
          {/* Toaster shows toast notifications (success, error messages) */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#18181b',
                color: '#f4f4f5',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#8b5cf6', secondary: '#18181b' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#18181b' },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)
