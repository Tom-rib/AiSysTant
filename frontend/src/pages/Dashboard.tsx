import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  MessageSquare, 
  Terminal, 
  Server, 
  Activity,
  CheckCircle2,
} from 'lucide-react'
import { statsAPI } from '../services/api'

interface DashboardStats {
  totalConversations: number
  totalMessages: number
  totalServers: number
  activeConnections: number
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
  }>
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await statsAPI.getDashboard()
        setStats(response.data)
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const quickActions = [
    {
      title: 'Nouveau Chat',
      description: 'Démarrer une conversation avec l\'IA',
      icon: MessageSquare,
      link: '/chat',
      color: 'primary',
    },
    {
      title: 'Connexion SSH',
      description: 'Gérer vos serveurs distants',
      icon: Terminal,
      link: '/ssh',
      color: 'secondary',
    },
  ]

  const statsCards = [
    {
      title: 'Conversations',
      value: stats?.totalConversations || 0,
      icon: MessageSquare,
      color: 'primary',
      trend: '+12%',
    },
    {
      title: 'Messages',
      value: stats?.totalMessages || 0,
      icon: Activity,
      color: 'accent',
      trend: '+8%',
    },
    {
      title: 'Serveurs',
      value: stats?.totalServers || 0,
      icon: Server,
      color: 'secondary',
      trend: '+3',
    },
    {
      title: 'Connexions actives',
      value: stats?.activeConnections || 0,
      icon: CheckCircle2,
      color: 'secondary',
      trend: 'En ligne',
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading w-12 h-12 mb-4"></div>
          <p className="text-text-light">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">
            Bienvenue, {user?.username} ! 👋
          </h1>
          <p className="text-gray-300">
            Voici un aperçu de votre activité
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.title}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:scale-105 transition-all animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs mt-2 font-medium text-cyan-600">
                      {stat.trend}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-cyan-600" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.title}
                  to={action.link}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:scale-105 transition-all group animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Statut du système</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Opérationnel</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-800">API Backend</span>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xs text-green-700 mt-1">En ligne</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-800">WebSocket</span>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xs text-green-700 mt-1">Connecté</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-800">Base de données</span>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xs text-green-700 mt-1">Opérationnelle</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
