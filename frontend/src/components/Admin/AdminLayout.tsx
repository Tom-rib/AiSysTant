import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, CreditCard, Server, Settings, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/billing', label: 'Billing', icon: CreditCard },
    { path: '/admin/servers', label: 'Servers', icon: Server },
    { path: '/admin/settings', label: 'Settings', icon: Settings }
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Navbar */}
      <nav className="h-16 bg-section-bg border-b border-gray-700 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-gray-700 rounded-lg"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-white font-bold text-xl">🛡️ Admin Panel</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-section-bg border-r border-gray-700 h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-200 fixed left-0 top-16 z-30 md:relative md:w-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                    isActive
                      ? 'bg-primary text-white border-r-4 border-cyan-400'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-0">
          <div className="md:p-8 p-4 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
