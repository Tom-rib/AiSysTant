import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  MessageSquare, 
  Terminal, 
  LayoutDashboard, 
  Menu,
  X,
  Settings
} from 'lucide-react'
import { useState } from 'react'
import logo from '../../public/logo-192.png'
import { ProfileDropdown } from './ProfileDropdown'

export default function Navbar() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/chat', label: 'Chat IA', icon: MessageSquare },
    { path: '/ssh', label: 'SSH', icon: Terminal },
    { path: '/settings', label: 'Paramètres', icon: Settings },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-white shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <img 
                src={logo} 
                alt="AiSystant Logo" 
                className="h-10 w-10 object-contain group-hover:scale-110 transition-transform"
              />
              <span className="text-xl font-bold text-text hidden sm:block">
                AiSystant
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive(link.path)
                      ? 'bg-primary text-white shadow-md'
                      : 'text-text hover:bg-primary-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-text" />
              ) : (
                <Menu className="w-6 h-6 text-text" />
              )}
            </button>

            {/* Desktop user menu - Profile Dropdown */}
            <div className="hidden md:block">
              <ProfileDropdown />
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-fade-in">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(link.path)
                      ? 'bg-primary text-white shadow-md'
                      : 'text-text hover:bg-primary-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              )
            })}
            
            {/* Mobile User Info */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="px-4 py-3">
                <ProfileDropdown />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
