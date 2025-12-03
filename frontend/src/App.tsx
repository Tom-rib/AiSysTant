import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { SSHProvider } from './context/SSHContext'
import { ChatProvider } from './context/ChatContext'

// ✅ NOUVEAU: Importer les styles du terminal SSH
import './styles/ssh-terminal.css'
// ✅ NOUVEAU: Importer les styles du shell SSH persistant
import './styles/ssh-shell.css'
// ✅ NOUVEAU: Importer les styles du terminal multi-onglets
import './styles/multi-terminal.css'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import SSH from './pages/SSH'
import SSHHelp from './pages/SSHHelp'
import Settings from './pages/Settings'

// Components
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <SSHProvider>
      <ChatProvider>
        <div className="min-h-screen bg-background">
          {isAuthenticated && <Navbar />}
          
          <Routes>
            {/* Public routes */}
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

            {/* Redirect root to dashboard if authenticated, otherwise to login */}
            <Route 
              path="/" 
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
            />

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