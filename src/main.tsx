import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/bodoni-moda/400.css'
import '@fontsource/bodoni-moda/500.css'
import './index.css'
import App from './App'
import { ConfigError } from './components/auth/ConfigError'
import { ToastProvider } from './components/ui/Toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './hooks/useTheme'
import { queryClient } from './lib/queryClient'
import { supabaseConfigured } from './lib/supabase'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      {supabaseConfigured ? (
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ToastProvider>
        </QueryClientProvider>
      ) : (
        <ConfigError />
      )}
    </ThemeProvider>
  </StrictMode>,
)
