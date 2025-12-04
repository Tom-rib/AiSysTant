import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../services/api'

interface User {
  id: string
  username: string
  email: string
  createdAt: string
  role?: 'user' | 'admin' | 'super_admin'
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Vérifier le token au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          // Configurer le header Authorization
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const response = await api.get('/auth/me')
          
          // Gérer différentes structures de réponse
          const userData = response.data.data?.user || response.data.user || response.data.data || response.data
          setUser(userData)
        } catch (error) {
          console.error('Token invalide:', error)
          localStorage.removeItem('token')
          delete api.defaults.headers.common['Authorization']
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      
      // La réponse est: { success, message, data: { user, token } }
      const { data: responseData } = response.data
      const { token, user: userData } = responseData
      
      // Stocker le token
      localStorage.setItem('token', token)
      
      // Configurer le header Authorization pour les futures requêtes
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Mettre à jour l'état utilisateur
      setUser(userData)
      console.log('Login successful, user:', userData)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de connexion')
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { username, email, password })
      
      // La réponse est: { success, message, data: { user, token } }
      const { data: responseData } = response.data
      const { token, user: userData } = responseData
      
      // Stocker le token
      localStorage.setItem('token', token)
      
      // Configurer le header Authorization pour les futures requêtes
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Mettre à jour l'état utilisateur
      setUser(userData)
      console.log('Register successful, user:', userData)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erreur lors de l'inscription")
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}