import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader } from 'lucide-react'

interface ProtectedAdminRouteProps {
  children: React.ReactNode
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-bg">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Vérifier en temps réel le rôle
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  if (!isAdmin) {
    console.log('❌ Admin access denied:', { user, isAdmin })
    return <Navigate to="/dashboard" replace />
  }

  console.log('✅ Admin access granted:', { user, isAdmin })
  return <>{children}</>
}
