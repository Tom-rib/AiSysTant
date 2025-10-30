import { useState, useEffect } from 'react'
import { MessageSquare, Server, Activity, TrendingUp } from 'lucide-react'
import axios from 'axios'

interface Stats {
  conversations: number
  messages: number
  servers: number
  activeConnections: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    conversations: 0,
    messages: 0,
    servers: 0,
    activeConnections: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:3001/api/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Conversations',
      value: stats.conversations,
      change: '+12%',
      icon: MessageSquare,
      color: 'bg-blue-500',
    },
    {
      title: 'Messages',
      value: stats.messages,
      change: '+8%',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Serveurs',
      value: stats.servers,
      change: '+3',
      icon: Server,
      color: 'bg-purple-500',
    },
    {
      title: 'Connexions actives',
      value: stats.activeConnections,
      change: 'En ligne',
      icon: Activity,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Tableau de bord</h1>
        <p className="text-text-light">
          Bienvenue sur AiSystant - Votre assistant IA pour l'administration système
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-light text-sm mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-text mb-2">
                  {loading ? '...' : stat.value}
                </p>
                <p className="text-sm text-success">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-text mb-4">Actions rapides</h2>
          <div className="space-y-3">
            
              href="/chat"
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Nouvelle conversation</span>
            </a>
            
              href="/ssh"
              className="btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <Server className="w-5 h-5" />
              <span>Gérer les serveurs</span>
            </a>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-text mb-4">Activité récente</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-text-light">
                {stats.conversations > 0
                  ? `${stats.conversations} conversation${stats.conversations > 1 ? 's' : ''} créée${stats.conversations > 1 ? 's' : ''}`
                  : 'Aucune conversation'}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-text-light">
                {stats.messages > 0
                  ? `${stats.messages} message${stats.messages > 1 ? 's' : ''} échangé${stats.messages > 1 ? 's' : ''}`
                  : 'Aucun message'}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-text-light">
                {stats.servers > 0
                  ? `${stats.servers} serveur${stats.servers > 1 ? 's' : ''} configuré${stats.servers > 1 ? 's' : ''}`
                  : 'Aucun serveur configuré'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
