import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/api'
import type { AuthResponse, User } from '../types'

interface AuthContextType {
  user: User | null
  loginWithGoogle: (token: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const loginWithGoogle = async (token: string) => {
  try {
    console.log('➡️ Sending Google token to backend...')

    const res = await api.post<AuthResponse>('/auth/google', { token })

    console.log('✅ Backend response:', res.data)

    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))

    setUser(res.data.user)
  } catch (error: any) {
    console.error('❌ Login failed:', error)
    alert('Login failed. Check console & backend logs.')
  }
}


  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
