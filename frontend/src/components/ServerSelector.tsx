import { useState, useEffect, useRef } from 'react'
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
  groups?: ServerGroup[]
  selectedServerIds?: number[]
  onServerSelect: (serverIds: number[]) => void
}

export default function ServerSelector({ servers, groups = [], selectedServerIds = [], onServerSelect }: ServerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set(selectedServerIds))

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

  const toggleGroup = (groupId: number) => {
    const group = groups.find(g => g.id === groupId)
    if (!group || !group.servers) return

    const newSelected = new Set(selected)
    const allInGroup = group.servers.every(id => newSelected.has(id))

    if (allInGroup) {
      group.servers.forEach(id => newSelected.delete(id))
    } else {
      group.servers.forEach(id => newSelected.add(id))
    }
    setSelected(newSelected)
    onServerSelect(Array.from(newSelected))
  }

  const selectAll = () => {
    const allIds = servers.map(s => s.id)
    setSelected(new Set(allIds))
    onServerSelect(allIds)
  }

  const clearAll = () => {
    setSelected(new Set())
    onServerSelect([])
  }

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

  const selectedCount = selected.size
  const totalServers = servers.length

  return (
    <div className="relative inline-block w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-slate-950 font-medium text-left"
      >
        <span>
          {selectedCount === 0 ? '📋 Sélectionner serveurs...' : `✅ ${selectedCount}/${totalServers} serveur${selectedCount > 1 ? 's' : ''}`}
        </span>
        <ChevronDown size={16} className={`transition ${isOpen ? 'rotate-180' : ''} flex-shrink-0`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Action Buttons */}
          <div className="flex gap-2 px-4 py-3 border-b bg-gray-50">
            <button
              onClick={selectAll}
              className="flex-1 px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Tous
            </button>
            <button
              onClick={clearAll}
              className="flex-1 px-3 py-1 text-xs font-medium bg-gray-400 text-white rounded hover:bg-gray-500 transition"
            >
              Aucun
            </button>
          </div>

          {/* Dropdown Content - with auto scroll */}
          <div className="max-h-96 overflow-y-auto">
            {/* Ungrouped Servers */}
            {ungroupedServers.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-50 border-b sticky top-0">
                  📋 SANS GROUPE ({ungroupedServers.length})
                </div>
                {ungroupedServers.map(server => (
                  <label
                    key={server.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(server.id)}
                      onChange={() => toggleServer(server.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-slate-950">{server.name}</div>
                      <div className="text-xs text-gray-600">{server.username}@{server.host}:{server.port}</div>
                    </div>
                  </label>
                ))}
              </>
            )}

            {/* Grouped Servers */}
            {groups.map(group => {
              const groupServers = serversByGroup[group.id || 0]
              if (groupServers.length === 0) return null

              const allSelected = groupServers.every(s => selected.has(s.id))
              const someSelected = groupServers.some(s => selected.has(s.id))
              const checkboxRef = useRef<HTMLInputElement>(null)

              useEffect(() => {
                if (checkboxRef.current) {
                  checkboxRef.current.indeterminate = someSelected && !allSelected
                }
              }, [someSelected, allSelected])

              return (
                <div key={group.id}>
                  {/* Group Header with Checkbox */}
                  <label className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b font-semibold cursor-pointer hover:bg-gray-100 transition sticky top-0">
                    <input
                      ref={checkboxRef}
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => toggleGroup(group.id || 0)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span style={{ color: group.color || '#333' }}>
                      {group.icon} {group.name.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">({groupServers.length})</span>
                  </label>

                  {/* Group Servers */}
                  {groupServers.map(server => (
                    <label
                      key={server.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b cursor-pointer transition ml-6"
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(server.id)}
                        onChange={() => toggleServer(server.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-slate-950">{server.name}</div>
                        <div className="text-xs text-gray-600">{server.username}@{server.host}:{server.port}</div>
                      </div>
                    </label>
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
