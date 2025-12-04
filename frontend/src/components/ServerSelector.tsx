import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface SSHServer {
  id: number
  name: string
  host: string
  port: number
  username: string
}

interface ServerGroup {
  id?: number
  name: string
  icon: string
  color: string
  servers?: number[]
}

interface ServerSelectorProps {
  servers: SSHServer[]
  selectedServerId?: number
  onServerSelect: (serverId: number) => void
}

export default function ServerSelector({ servers, selectedServerId, onServerSelect }: ServerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [groups, setGroups] = useState<ServerGroup[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('serverGroups')
    if (saved) {
      try {
        setGroups(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading groups:', e)
      }
    }
  }, [])

  const selectedServer = servers.find(s => s.id === selectedServerId)
  
  const groupMap: Record<number, ServerGroup> = {}
  groups.forEach(g => {
    g.servers?.forEach(serverId => {
      groupMap[serverId] = g
    })
  })

  const ungroupedServers = servers.filter(s => !groupMap[s.id])
  const serversByGroup: Record<number, SSHServer[]> = {}
  
  groups.forEach(g => {
    serversByGroup[g.id || 0] = servers.filter(s => g.servers?.includes(s.id))
  })

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-slate-950 font-medium"
      >
        {selectedServer ? (
          <>
            <span>🖥️ {selectedServer.name}</span>
          </>
        ) : (
          <>
            <span>📋 Sélectionner serveur...</span>
          </>
        )}
        <ChevronDown size={16} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Ungrouped Servers */}
          {ungroupedServers.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-50 border-b">
                📋 SANS GROUPE ({ungroupedServers.length})
              </div>
              {ungroupedServers.map(server => (
                <button
                  key={server.id}
                  onClick={() => {
                    onServerSelect(server.id)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b text-sm transition ${
                    selectedServerId === server.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="font-medium text-slate-950">{server.name}</div>
                  <div className="text-xs text-gray-600">{server.username}@{server.host}:{server.port}</div>
                </button>
              ))}
            </>
          )}

          {/* Grouped Servers */}
          {groups.map(group => {
            const groupServers = serversByGroup[group.id || 0]
            if (groupServers.length === 0) return null

            return (
              <div key={group.id}>
                <div className="px-4 py-2 text-xs font-semibold bg-gray-50 border-b" style={{ color: '#333' }}>
                  {group.icon} {group.name.toUpperCase()} ({groupServers.length})
                </div>
                {groupServers.map(server => (
                  <button
                    key={server.id}
                    onClick={() => {
                      onServerSelect(server.id)
                      setIsOpen(false)
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b text-sm transition ${
                      selectedServerId === server.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="font-medium text-slate-950">{server.name}</div>
                    <div className="text-xs text-gray-600">{server.username}@{server.host}:{server.port}</div>
                  </button>
                ))}
              </div>
            )
          })}

          {servers.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              <p className="text-sm">Aucun serveur disponible</p>
            </div>
          )}
        </div>
      )}

      {/* Close menu when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
