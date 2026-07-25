import { AppShell } from './AppShell'
import { AuthSplash, LoginScreen } from './components/auth/LoginScreen'
import { useAuth } from './contexts/AuthContext'
import { ProfileProvider } from './contexts/ProfileContext'
import { EntryModalProvider } from './hooks/useEntryModal'

function App() {
  const { session, loading } = useAuth()

  if (loading) return <AuthSplash />
  if (!session) return <LoginScreen />

  return (
    <ProfileProvider>
      <EntryModalProvider>
        <AppShell />
      </EntryModalProvider>
    </ProfileProvider>
  )
}

export default App
