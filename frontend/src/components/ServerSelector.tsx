import { useState, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

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
  selectedServerIds?: number[]
  onServerSelect: (serverIds: number[]) => void
}

export default function ServerSelector({ servers, selectedServerIds = [], onServerSelect }: ServerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [groups, setGroups] = useState<ServerGroup[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set(selectedServerIds))

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

  useEffect(() => {
    setSelected(new Set(selectedServerIds))
  }, [selectedServerIds])

  const toggleServer = (serverId: number) => {
    const newSelected = new Set(selected)
    if (newSelected.has(serverId)) {
      newSelected.delete(serverId)
    } else {
      newSelected.add(serverId)
    }
    setSelected(newSelected)
    onServerSelect(Array.from(newSelected))
  }

  const toggleGroup = (groupServers: number[] | undefined) => {
    if (!groupServers) return
    const groupSet = new Set(groupServers)
    const allSelected = groupServers.every(id => selected.has(id))
    
    const newSelected = new Set(selected)
    if (allSelected) {
      groupServers.forEach(id => newSelected.delete(id))
    } else {
      groupServers.forEach(id => newSelected.add(id))
    }
    setSelected(newSelected)
    onServerSelect(Array.from(newSelected))
  }

  const selectedServer = servers.find(s => s.id === Array.from(selected)[0])
  
  const groupMap: Record<number, ServerGroup> = {}
  groups.forEach(g => {
    g.servers?.forEach(serverId => {
      groupMap[serverId] = g
    })
  })

  const ungroupedServers = servers.filter(s => !groupMap[s.id])
  const serversByGroup: Record<number, SSHServer[]> = {}
  
  groups.forEach(g => {
    const groupServersFiltered = servers.filter(s => g.servers?.includes(s.id))
    serversByGroup[g.id || 0] = groupServersFiltered
    console.debug(`Groupe "${g.name}": ${g.servers?.length || 0} serveurs attendus, ${groupServersFiltered.length} trouvés`, {
      expected: g.servers,
      available: servers.map(s => s.id),
      matched: groupServersFiltered.map(s => s.id)
    })
  })

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-slate-950 font-medium"
      >
        {selected.size > 0 ? (
          <>
            <span>🖥️ {selected.size} serveur{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}</span>
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
                  onClick={() => toggleServer(server.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b text-sm transition flex items-center gap-3 ${
                    selected.has(server.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(server.id)}
                    onChange={() => toggleServer(server.id)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-950">{server.name}</div>
                    <div className="text-xs text-gray-600">{server.username}@{server.host}:{server.port}</div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Grouped Servers */}
          {groups.map(group => {
            const groupServers = serversByGroup[group.id || 0]
            if (groupServers.length === 0) return null

            const allGroupSelected = groupServers.every(s => selected.has(s.id))

            return (
              <div key={group.id}>
                <div className="px-4 py-2 text-xs font-semibold bg-gray-50 border-b flex items-center justify-between" style={{ color: '#333' }}>
                  <div className="flex items-center gap-2">
                    <span>{group.icon} {group.name.toUpperCase()} ({groupServers.length})</span>
                  </div>
                  <button
                    onClick={() => toggleGroup(group.servers)}
                    className={`px-2 py-1 rounded text-xs font-semibold transition ${
                      allGroupSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {allGroupSelected ? '✓ Tous' : 'Tous'}
                  </button>
                </div>
                {groupServers.map(server => (
                  <button
                    key={server.id}
                    onClick={() => toggleServer(server.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b text-sm transition flex items-center gap-3 ${
                      selected.has(server.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(server.id)}
                      onChange={() => toggleServer(server.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-950">{server.name}</div>
                      <div className="text-xs text-gray-600">{server.username}@{server.host}:{server.port}</div>
                    </div>
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
