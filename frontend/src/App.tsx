import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { useAuth } from './contexts/AuthContext'
import './App.css';

function App() {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!user) {
    return <Login />
  }

  // ✅ THIS IS THE KEY CHANGE
  return <Dashboard />
}

export default App
