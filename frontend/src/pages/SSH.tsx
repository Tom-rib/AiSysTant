import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Server, ArrowLeft } from 'lucide-react'
import MultiTerminal from '../components/MultiTerminal'
import { sshAPI } from '../services/api'

// ✅ NOUVEAU: Interface pour les serveurs SSH
interface SSHServer {
  id: number
  name: string
  host: string
  port: number
  username: string
}

export default function SSH() {
  const navigate = useNavigate()
  
  // ✅ NOUVEAU: State des serveurs
  const [servers, setServers] = useState<SSHServer[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingServer, setIsAddingServer] = useState(false)
  
  // ✅ NOUVEAU: Formulaire nouveau serveur
  const [newServer, setNewServer] = useState({
    name: '',
    host: '',
    port: 22,
    username: '',
    password: '',
    privateKey: '',
  })

  // ✅ NOUVEAU: Charger les serveurs au montage
  useEffect(() => {
    loadServers()
  }, [])

  /**
   * ✅ NOUVEAU: Charger les serveurs depuis l'API
   */
  const loadServers = async () => {
    try {
      setLoading(true)
      const response = await sshAPI.getServers()
      const data = response.data.data || response.data.servers || response.data || []
      setServers(data)
    } catch (error) {
      console.error('Erreur chargement serveurs:', error)
      setServers([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * ✅ NOUVEAU: Ajouter un nouveau serveur
   */
  const handleAddServer = async () => {
    try {
      if (!newServer.name || !newServer.host || !newServer.username) {
        alert('Remplissez tous les champs requis')
        return
      }

      await sshAPI.addServer({
        name: newServer.name,
        host: newServer.host,
        port: newServer.port,
        username: newServer.username,
        password: newServer.password || undefined,
        private_key: newServer.privateKey || undefined,
      })

      // Réinitialiser le formulaire
      setNewServer({
        name: '',
        host: '',
        port: 22,
        username: '',
        password: '',
        privateKey: '',
      })
      setIsAddingServer(false)

      // Recharger les serveurs
      await loadServers()
    } catch (error: any) {
      console.error('Erreur ajout serveur:', error)
      alert(error.response?.data?.message || 'Erreur lors de l\'ajout du serveur')
    }
  }

  /**
   * ✅ NOUVEAU: Supprimer un serveur
   */
  const handleDeleteServer = async (serverId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce serveur?')) return

    try {
      await sshAPI.deleteServer(serverId)
      await loadServers()
    } catch (error: any) {
      console.error('Erreur suppression serveur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-light">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-text" />
              </button>
              <h1 className="text-3xl font-bold text-text">Terminaux SSH</h1>
            </div>
            <button
              onClick={() => setIsAddingServer(!isAddingServer)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Ajouter un serveur
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire ajout serveur */}
      {isAddingServer && (
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-semibold text-text mb-4">Nouveau serveur SSH</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nom du serveur"
                value={newServer.name}
                onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="Adresse IP/Hostname"
                value={newServer.host}
                onChange={(e) => setNewServer({ ...newServer, host: e.target.value })}
                className="input"
              />
              <input
                type="number"
                placeholder="Port (défaut: 22)"
                value={newServer.port}
                onChange={(e) => setNewServer({ ...newServer, port: parseInt(e.target.value) })}
                className="input"
              />
              <input
                type="text"
                placeholder="Utilisateur SSH"
                value={newServer.username}
                onChange={(e) => setNewServer({ ...newServer, username: e.target.value })}
                className="input"
              />
              <input
                type="password"
                placeholder="Mot de passe (optionnel)"
                value={newServer.password}
                onChange={(e) => setNewServer({ ...newServer, password: e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="Clé privée (optionnel)"
                value={newServer.privateKey}
                onChange={(e) => setNewServer({ ...newServer, privateKey: e.target.value })}
                className="input"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddServer}
                className="btn-primary"
              >
                Ajouter
              </button>
              <button
                onClick={() => setIsAddingServer(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto p-6">
        {servers.length === 0 ? (
          <div className="text-center py-12">
            <Server className="w-16 h-16 text-text-light mx-auto mb-4" />
            <p className="text-text-light text-lg mb-2">Aucun serveur configuré</p>
            <p className="text-text-lighter">Ajoutez un serveur pour commencer</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-text mb-3">Serveurs disponibles</h2>
              <div className="grid grid-cols-3 gap-3">
                {servers.map(server => (
                  <div
                    key={server.id}
                    className="p-3 bg-white rounded-lg border border-gray-200 hover:border-primary transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text truncate">{server.name}</p>
                        <p className="text-sm text-text-light">{server.username}@{server.host}:{server.port}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteServer(server.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ✅ NOUVEAU: Utiliser le composant MultiTerminal */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-text mb-3">Terminaux</h2>
              <div style={{ height: '600px', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                <MultiTerminal servers={servers} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
