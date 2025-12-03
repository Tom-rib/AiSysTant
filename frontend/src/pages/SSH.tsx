import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Server, ArrowLeft, Trash2, Terminal, LogOut } from 'lucide-react'
import { sshAPI } from '../services/api'

interface SSHServer {
  id: number
  name: string
  host: string
  port: number
  username: string
  connected?: boolean
}

interface TerminalState {
  serverId: number | null
  output: string[]
  currentDir: string
  isConnected: boolean
}

export default function SSH() {
  const navigate = useNavigate()
  
  const [servers, setServers] = useState<SSHServer[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingServer, setIsAddingServer] = useState(false)
  const [selectedServerId, setSelectedServerId] = useState<number | null>(null)
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [currentDir, setCurrentDir] = useState('/home')
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

  // Charger l'état du terminal depuis localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sshTerminalState')
    if (savedState) {
      try {
        const state: TerminalState = JSON.parse(savedState)
        if (state.serverId) {
          setSelectedServerId(state.serverId)
          setTerminalOutput(state.output)
          setCurrentDir(state.currentDir)
        }
      } catch (e) {
        console.error('Erreur chargement état terminal:', e)
      }
    }
    loadServers()
  }, [])

  // Sauvegarder l'état du terminal dans localStorage
  useEffect(() => {
    if (selectedServerId) {
      const state: TerminalState = {
        serverId: selectedServerId,
        output: terminalOutput,
        currentDir,
        isConnected: true,
      }
      localStorage.setItem('sshTerminalState', JSON.stringify(state))
    }
  }, [selectedServerId, terminalOutput, currentDir])

  // Auto-scroll vers le bas
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [terminalOutput])

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
        setCurrentDir('/home')
        localStorage.removeItem('sshTerminalState')
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
      // Afficher la commande
      setTerminalOutput(prev => [...prev, `$ ${command}`])
      
      const trimmedCommand = command.trim()
      let actualCommand = trimmedCommand
      
      // Vérifier si c'est une commande cd
      if (trimmedCommand.startsWith('cd ')) {
        const pathArg = trimmedCommand.substring(3).trim()
        
        // Déterminer le nouveau chemin (relatif ou absolu)
        let newPath: string
        if (pathArg.startsWith('/')) {
          // Chemin absolu
          newPath = pathArg
        } else if (pathArg === '..') {
          // Remontez d'un niveau
          const parts = currentDir.split('/')
          parts.pop()
          newPath = parts.join('/') || '/'
        } else if (pathArg === '.' || pathArg === './') {
          // Rester dans le même répertoire
          newPath = currentDir
        } else {
          // Chemin relatif
          newPath = currentDir === '/' 
            ? `/${pathArg}` 
            : `${currentDir}/${pathArg}`
        }
        
        // Nettoyer le chemin (remplacer // par /, enlever les / finaux sauf pour /)
        newPath = newPath.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
        
        // Vérifier que le répertoire existe avec 'test -d'
        actualCommand = `test -d "${newPath}" && echo "OK" || echo "NOT_FOUND"`
        
        const response = await sshAPI.executeCommand(selectedServerId, actualCommand)
        
        if (response.data.success && response.data.data?.output?.includes('OK')) {
          setCurrentDir(newPath)
          setTerminalOutput(prev => [...prev, `# Répertoire changé: ${newPath}`])
        } else {
          setTerminalOutput(prev => [...prev, `bash: cd: ${pathArg}: Aucun fichier ou dossier de ce type`])
        }
      } else {
        // Pour les autres commandes, exécuter depuis le répertoire courant
        actualCommand = `cd "${currentDir}" && ${trimmedCommand}`
        
        const response = await sshAPI.executeCommand(selectedServerId, actualCommand)
        
        if (response.data.success) {
          const result = response.data.data
          const output = result?.output || ''
          
          // Afficher la sortie (sauf si vide)
          if (output) {
            setTerminalOutput(prev => [...prev, output.trim()])
          }
        } else {
          const errorMsg = response.data.message || response.data.data?.error || 'Erreur inconnue'
          setTerminalOutput(prev => [...prev, `Erreur: ${errorMsg}`])
        }
      }
      
      setCommand('')
    } catch (error: any) {
      console.error('Erreur exécution:', error)
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Erreur de connexion'
      setTerminalOutput(prev => [...prev, `Erreur: ${errorMsg}`])
    } finally {
      setIsExecuting(false)
    }
  }

  const disconnectServer = () => {
    setSelectedServerId(null)
    setTerminalOutput([])
    setCurrentDir('/home')
    setCommand('')
    localStorage.removeItem('sshTerminalState')
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
                <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-mono">
                      {servers.find(s => s.id === selectedServerId)?.name}
                    </span>
                    <span className="text-gray-500 text-xs">• {currentDir}</span>
                  </div>
                  <button
                    onClick={disconnectServer}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Déconnecter"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Terminal Output */}
                <div className="flex-1 overflow-y-auto p-4 font-mono text-sm text-green-400 space-y-1">
                  {terminalOutput.length === 0 ? (
                    <div className="text-gray-500">Connecté. Prêt à exécuter des commandes...</div>
                  ) : (
                    <>
                      {terminalOutput.map((line, i) => (
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
                      {currentDir}$
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


