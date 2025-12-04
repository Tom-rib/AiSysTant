import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { SSHProvider } from './context/SSHContext'
import { ChatProvider } from './context/ChatContext'
import { useState, useEffect } from 'react'

// ✅ NOUVEAU: Importer les styles du terminal SSH
import './styles/ssh-terminal.css'
// ✅ NOUVEAU: Importer les styles du shell SSH persistant
import './styles/ssh-shell.css'
// ✅ NOUVEAU: Importer les styles du terminal multi-onglets
import './styles/multi-terminal.css'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Pricing from './pages/Pricing'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import SSH from './pages/SSH'
import SSHHelp from './pages/SSHHelp'
import Settings from './pages/Settings'
import BillingPage from './pages/BillingPage'
import { AccountSettings } from './pages/AccountSettings'
import { SecuritySettings } from './pages/SecuritySettings'

// ✅ NOUVEAU: Admin Pages
import AdminLayout from './components/Admin/AdminLayout'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminUsers from './pages/Admin/AdminUsers'
import AdminBilling from './pages/Admin/AdminBilling'
import AdminServers from './pages/Admin/AdminServers'

// Components
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import PublicNavbar from './components/PublicNavbar'

function App() {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Déterminer quelle navbar afficher
  const isPublicPage = ['/', '/pricing', '/login', '/register'].includes(location.pathname)

  // Mettre à jour isAdmin quand user change
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      setIsAdmin(true)
      console.log('✅ User is admin:', user.email)
    } else {
      setIsAdmin(false)
      console.log('❌ User is not admin:', user?.email, 'Role:', user?.role)
    }
  }, [user])

  return (
    <SSHProvider>
      <ChatProvider>
        <div className="min-h-screen bg-background">
          {isAuthenticated ? <Navbar /> : isPublicPage && <PublicNavbar />}
          
          <Routes>
            {/* Public routes */}
            <Route 
              path="/" 
              element={<Landing />} 
            />
            <Route 
              path="/pricing" 
              element={<Pricing />} 
            />
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
            />
            <Route 
              path="/register" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} 
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <PrivateRoute>
                  <Chat />
                </PrivateRoute>
              }
            />
            <Route
              path="/ssh-help"
              element={
                <PrivateRoute>
                  <SSHHelp />
                </PrivateRoute>
              }
            />
            <Route
              path="/ssh"
              element={
                <PrivateRoute>
                  <SSH />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
            <Route
              path="/api-keys"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <PrivateRoute>
                  <BillingPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/account/settings"
              element={
                <PrivateRoute>
                  <AccountSettings />
                </PrivateRoute>
              }
            />
            <Route
              path="/account/security"
              element={
                <PrivateRoute>
                  <SecuritySettings />
                </PrivateRoute>
              }
            />

            {/* ✅ NOUVEAU: Admin Routes */}
            <Route
              path="/admin"
              element={isAdmin ? <AdminLayout /> : <Navigate to="/dashboard" />}
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="billing" element={<AdminBilling />} />
              <Route path="servers" element={<AdminServers />} />
            </Route>

            {/* 404 - Not found */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
                    <p className="text-xl text-text-light mb-8">Page non trouvée</p>
                    <a href="/" className="btn-primary">
                      Retour à l'accueil
                    </a>
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>
      </ChatProvider>
    </SSHProvider>
  )
}

export default App