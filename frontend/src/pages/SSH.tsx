import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Server, ArrowLeft, Trash2, Terminal } from 'lucide-react'
import { sshAPI } from '../services/api'

interface SSHServer {
  id: number
  name: string
  host: string
  port: number
  username: string
  connected?: boolean
}

export default function SSH() {
  const navigate = useNavigate()
  
  const [servers, setServers] = useState<SSHServer[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingServer, setIsAddingServer] = useState(false)
  const [selectedServerId, setSelectedServerId] = useState<number | null>(null)
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [command, setCommand] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  
  const [newServer, setNewServer] = useState({
    name: '',
    host: '',
    port: 22,
    username: '',
    password: '',
    privateKey: '',
  })

  useEffect(() => {
    loadServers()
  }, [])

  const loadServers = async () => {
    try {
      setLoading(true)
      const response = await sshAPI.getServers()
      const data = response.data.data || response.data.servers || response.data || []
      setServers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erreur chargement serveurs:', error)
      setServers([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddServer = async () => {
    try {
      if (!newServer.name || !newServer.host || !newServer.username) {
        alert('Remplissez tous les champs requis')
        return
      }

      if (!newServer.password && !newServer.privateKey) {
        alert('Remplissez mot de passe ou clé privée')
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

      setNewServer({
        name: '',
        host: '',
        port: 22,
        username: '',
        password: '',
        privateKey: '',
      })
      setIsAddingServer(false)
      await loadServers()
    } catch (error: any) {
      console.error('Erreur ajout serveur:', error)
      alert(error.response?.data?.message || 'Erreur lors de l\'ajout du serveur')
    }
  }

  const handleDeleteServer = async (serverId: number) => {
    if (!window.confirm('Êtes-vous sûr?')) return

    try {
      await sshAPI.deleteServer(serverId)
      await loadServers()
      if (selectedServerId === serverId) {
        setSelectedServerId(null)
        setTerminalOutput([])
      }
    } catch (error: any) {
      console.error('Erreur suppression serveur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const executeCommand = async () => {
    if (!command.trim() || !selectedServerId || isExecuting) return

    setIsExecuting(true)
    try {
      setTerminalOutput(prev => [...prev, `$ ${command}`])
      
      const response = await sshAPI.executeCommand(selectedServerId, command)
      
      if (response.data.success) {
        const output = response.data.data?.output || response.data.data?.stdout || ''
        if (output) {
          setTerminalOutput(prev => [...prev, output])
        }
      } else {
        setTerminalOutput(prev => [...prev, `Erreur: ${response.data.message}`])
      }
      
      setCommand('')
    } catch (error: any) {
      console.error('Erreur exécution:', error)
      setTerminalOutput(prev => [...prev, `Erreur: ${error.message}`])
    } finally {
      setIsExecuting(false)
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-text" />
              </button>
              <h1 className="text-3xl font-bold text-text">SSH Terminal</h1>
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

      {/* Add Server Form */}
      {isAddingServer && (
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-semibold text-text mb-4">Nouveau serveur SSH</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
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
            <div className="flex gap-2">
              <button onClick={handleAddServer} className="btn-primary">
                Ajouter
              </button>
              <button onClick={() => setIsAddingServer(false)} className="btn-secondary">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Servers List */}
          <div className="col-span-1">
            <h2 className="text-lg font-semibold text-text mb-3">Serveurs</h2>
            {servers.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg text-center text-text-light">
                <Server className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun serveur</p>
              </div>
            ) : (
              <div className="space-y-2">
                {servers.map(server => (
                  <div
                    key={server.id}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      selectedServerId === server.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary'
                    }`}
                    onClick={() => setSelectedServerId(server.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text">{server.name}</p>
                        <p className="text-xs text-text-light">
                          {server.username}@{server.host}:{server.port}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteServer(server.id)
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Terminal */}
          <div className="col-span-2">
            {selectedServerId ? (
              <div className="bg-gray-900 rounded-lg overflow-hidden flex flex-col h-full" style={{ minHeight: '500px' }}>
                {/* Terminal Header */}
                <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-mono">
                    {servers.find(s => s.id === selectedServerId)?.name}
                  </span>
                </div>

                {/* Terminal Output */}
                <div className="flex-1 overflow-y-auto p-4 font-mono text-sm text-green-400 space-y-1">
                  {terminalOutput.length === 0 ? (
                    <div className="text-gray-500">Terminal prêt...</div>
                  ) : (
                    terminalOutput.map((line, i) => (
                      <div key={i} className="whitespace-pre-wrap break-words">
                        {line}
                      </div>
                    ))
                  )}
                </div>

                {/* Terminal Input */}
                <div className="bg-gray-800 border-t border-gray-700 p-3">
                  <div className="flex gap-2">
                    <span className="text-green-400 text-sm font-mono">$ </span>
                    <input
                      type="text"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          executeCommand()
                        }
                      }}
                      placeholder="Entrez une commande..."
                      disabled={isExecuting}
                      className="flex-1 bg-transparent outline-none text-green-400 text-sm placeholder-gray-500"
                      autoFocus
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center flex items-center justify-center" style={{ minHeight: '500px' }}>
                <div>
                  <Terminal className="w-12 h-12 mx-auto mb-3 text-text-light opacity-50" />
                  <p className="text-text-light">Sélectionnez un serveur pour commencer</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

