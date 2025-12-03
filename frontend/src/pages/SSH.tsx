import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Server, ArrowLeft, Terminal, HelpCircle, X } from 'lucide-react'
import { sshAPI } from '../services/api'

interface SSHServer {
  id: number
  name: string
  host: string
  port: number
  username: string
  connected?: boolean
}

interface TerminalSession {
  serverId: number
  serverName: string
  output: string[]
  currentDir: string
  isConnected: boolean
}

export default function SSH() {
  const navigate = useNavigate()
  
  const [servers, setServers] = useState<SSHServer[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingServer, setIsAddingServer] = useState(false)
  
  // Gestion de plusieurs terminaux
  const [activeSessions, setActiveSessions] = useState<Map<number, TerminalSession>>(new Map())
  const [activeServerId, setActiveServerId] = useState<number | null>(null)
  const [command, setCommand] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const terminalEndRef = useRef<HTMLDivElement>(null)
  
  const [newServer, setNewServer] = useState({
    name: '',
    host: '',
    port: 22,
    username: '',
    password: '',
    privateKey: '',
  })

  // Charger l'état des sessions depuis localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('sshSessions')
    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions)
        setActiveSessions(new Map(sessions))
        if (sessions.length > 0) {
          setActiveServerId(sessions[0][0])
        }
      } catch (e) {
        console.error('Erreur chargement sessions:', e)
      }
    }
    loadServers()
  }, [])

  // Sauvegarder l'état des sessions dans localStorage
  useEffect(() => {
    if (activeSessions.size > 0) {
      localStorage.setItem('sshSessions', JSON.stringify(Array.from(activeSessions.entries())))
    }
  }, [activeSessions])

  // Auto-scroll vers le bas
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeServerId, activeSessions])

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
        privateKey: newServer.privateKey || undefined,
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
      await sshAPI.deleteServer(serverId.toString())
      await loadServers()
      closeSession(serverId)
    } catch (error: any) {
      console.error('Erreur suppression serveur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const openSession = (serverId: number, serverName: string) => {
    if (!activeSessions.has(serverId)) {
      const newSession: TerminalSession = {
        serverId,
        serverName,
        output: [],
        currentDir: '/home',
        isConnected: true,
      }
      activeSessions.set(serverId, newSession)
      setActiveSessions(new Map(activeSessions))
    }
    setActiveServerId(serverId)
  }

  const closeSession = (serverId: number) => {
    const newSessions = new Map(activeSessions)
    newSessions.delete(serverId)
    setActiveSessions(newSessions)
    
    if (activeServerId === serverId) {
      const remaining = Array.from(newSessions.keys())
      setActiveServerId(remaining.length > 0 ? remaining[0] : null)
    }
  }

  const getCurrentSession = () => {
    return activeServerId ? activeSessions.get(activeServerId) : null
  }

  const updateSessionOutput = (serverId: number, newOutput: string[]) => {
    const session = activeSessions.get(serverId)
    if (session) {
      session.output = newOutput
      setActiveSessions(new Map(activeSessions))
    }
  }

  const updateSessionDir = (serverId: number, dir: string) => {
    const session = activeSessions.get(serverId)
    if (session) {
      session.currentDir = dir
      setActiveSessions(new Map(activeSessions))
    }
  }

  const executeCommand = async () => {
    if (!command.trim() || !activeServerId || isExecuting) return

    const session = getCurrentSession()
    if (!session) return

    setIsExecuting(true)
    try {
      const trimmedCommand = command.trim()
      updateSessionOutput(activeServerId, [...session.output, `$ ${trimmedCommand}`])
      
      let actualCommand = trimmedCommand
      
      if (trimmedCommand.startsWith('cd ')) {
        const pathArg = trimmedCommand.substring(3).trim()
        
        let newPath: string
        if (pathArg.startsWith('/')) {
          newPath = pathArg
        } else if (pathArg === '..') {
          const parts = session.currentDir.split('/')
          parts.pop()
          newPath = parts.join('/') || '/'
        } else if (pathArg === '.' || pathArg === './') {
          newPath = session.currentDir
        } else {
          newPath = session.currentDir === '/' 
            ? `/${pathArg}` 
            : `${session.currentDir}/${pathArg}`
        }
        
        newPath = newPath.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
        
        actualCommand = `test -d "${newPath}" && echo "OK" || echo "NOT_FOUND"`
        
        const response = await sshAPI.executeCommand(activeServerId.toString(), actualCommand)
        
        if (response.data.success && response.data.data?.output?.includes('OK')) {
          updateSessionDir(activeServerId, newPath)
          const updated = activeSessions.get(activeServerId)?.output || []
          updateSessionOutput(activeServerId, [...updated, `# Répertoire changé: ${newPath}`])
        } else {
          const updated = activeSessions.get(activeServerId)?.output || []
          updateSessionOutput(activeServerId, [...updated, `bash: cd: ${pathArg}: Aucun fichier ou dossier de ce type`])
        }
      } else {
        actualCommand = `cd "${session.currentDir}" && ${trimmedCommand}`
        
        const response = await sshAPI.executeCommand(activeServerId.toString(), actualCommand)
        
        if (response.data.success) {
          const result = response.data.data
          const output = result?.output || ''
          
          if (output) {
            const updated = activeSessions.get(activeServerId)?.output || []
            updateSessionOutput(activeServerId, [...updated, output.trim()])
          }
        } else {
          const errorMsg = response.data.message || response.data.data?.error || 'Erreur inconnue'
          const updated = activeSessions.get(activeServerId)?.output || []
          updateSessionOutput(activeServerId, [...updated, `Erreur: ${errorMsg}`])
        }
      }
      
      setCommand('')
    } catch (error: any) {
      console.error('Erreur exécution:', error)
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Erreur de connexion'
      const updated = activeSessions.get(activeServerId)?.output || []
      updateSessionOutput(activeServerId, [...updated, `Erreur: ${errorMsg}`])
    } finally {
      setIsExecuting(false)
    }
  }

  const clearSessionOutput = (serverId: number) => {
    updateSessionOutput(serverId, [])
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

  const currentSession = getCurrentSession()

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
              <h1 className="text-3xl font-bold text-text">SSH Terminal Multi-Serveur</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/ssh-help')}
                className="btn-secondary flex items-center gap-2"
                title="Guide SSH"
              >
                <HelpCircle className="w-5 h-5" />
                Guide
              </button>
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
            <h2 className="text-lg font-semibold text-text mb-3">Serveurs ({activeSessions.size} connectés)</h2>
            {servers.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg text-center text-text-light">
                <Server className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun serveur</p>
              </div>
            ) : (
              <div className="space-y-2">
                {servers.map(server => (
                  <div key={server.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => openSession(server.id, server.name)}
                      className={`w-full p-3 text-left transition ${
                        activeServerId === server.id
                          ? 'bg-primary text-white'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-medium">{server.name}</p>
                      <p className={`text-xs ${activeServerId === server.id ? 'text-white' : 'text-text-light'}`}>
                        {server.username}@{server.host}:{server.port}
                      </p>
                      {activeSessions.has(server.id) && (
                        <p className={`text-xs mt-1 ${activeServerId === server.id ? 'text-white' : 'text-green-600'}`}>
                          ● Connecté
                        </p>
                      )}
                    </button>
                    <div className="flex border-t border-gray-200">
                      <button
                        onClick={() => {
                          if (activeSessions.has(server.id)) {
                            clearSessionOutput(server.id)
                          }
                        }}
                        className="flex-1 p-2 text-xs text-gray-600 hover:bg-gray-50 border-r border-gray-200 disabled:opacity-50"
                        title="Effacer le terminal"
                        disabled={!activeSessions.has(server.id)}
                      >
                        🧹 Effacer
                      </button>
                      <button
                        onClick={() => handleDeleteServer(server.id)}
                        className="flex-1 p-2 text-xs text-red-600 hover:bg-red-50"
                        title="Supprimer"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Terminal Tabs & Display */}
          <div className="col-span-2">
            {activeSessions.size === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center flex items-center justify-center" style={{ minHeight: '500px' }}>
                <div>
                  <Terminal className="w-12 h-12 mx-auto mb-3 text-text-light opacity-50" />
                  <p className="text-text-light">Connectez-vous à un serveur pour commencer</p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg overflow-hidden flex flex-col" style={{ minHeight: '500px' }}>
                {/* Tabs */}
                <div className="bg-gray-800 border-b border-gray-700 flex overflow-x-auto">
                  {Array.from(activeSessions.values()).map(session => (
                    <div
                      key={session.serverId}
                      className={`flex items-center gap-2 px-4 py-3 cursor-pointer border-r border-gray-700 transition whitespace-nowrap ${
                        activeServerId === session.serverId
                          ? 'bg-primary text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => setActiveServerId(session.serverId)}
                    >
                      <Terminal className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-mono">{session.serverName}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          closeSession(session.serverId)
                        }}
                        className="ml-2 hover:text-red-400 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {currentSession && (
                  <>
                    {/* Terminal Header */}
                    <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-mono">
                          {currentSession.serverName}
                        </span>
                        <span className="text-gray-500 text-xs">• {currentSession.currentDir}</span>
                      </div>
                    </div>

                    {/* Terminal Output */}
                    <div className="flex-1 overflow-y-auto p-4 font-mono text-sm text-green-400 space-y-1">
                      {currentSession.output.length === 0 ? (
                        <div className="text-gray-500">Terminal prêt...</div>
                      ) : (
                        <>
                          {currentSession.output.map((line, i) => (
                            <div key={i} className="whitespace-pre-wrap break-words">
                              {line}
                            </div>
                          ))}
                          <div ref={terminalEndRef} />
                        </>
                      )}
                    </div>

                    {/* Terminal Input */}
                    <div className="bg-gray-800 border-t border-gray-700 p-3">
                      <div className="flex gap-2">
                        <span className="text-green-400 text-sm font-mono whitespace-nowrap">
                          {currentSession.currentDir}$
                        </span>
                        <input
                          type="text"
                          value={command}
                          onChange={(e) => setCommand(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !isExecuting) {
                              executeCommand()
                            }
                          }}
                          placeholder="Tapez une commande..."
                          disabled={isExecuting}
                          className="flex-1 bg-transparent outline-none text-green-400 text-sm placeholder-gray-500"
                          autoFocus
                        />
                        {isExecuting && (
                          <span className="text-gray-500 text-xs">Exécution...</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
