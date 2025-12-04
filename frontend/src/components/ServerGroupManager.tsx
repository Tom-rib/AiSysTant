import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, ChevronDown, ChevronRight } from 'lucide-react'

interface ServerGroup {
  id?: number
  name: string
  icon: string
  color: string
  description?: string
  servers?: number[]
}

interface SSHServer {
  id: number
  name: string
  host: string
  port: number
  username: string
}

interface ServerGroupManagerProps {
  servers: SSHServer[]
  onGroupsChange: (groups: ServerGroup[]) => void
}

const EMOJI_ICONS = ['🚀', '📦', '🧪', '🔧', '💾', '🌍', '🏢', '⚙️', '🔒', '📊']
const COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray']

export default function ServerGroupManager({ servers, onGroupsChange }: ServerGroupManagerProps) {
  const [groups, setGroups] = useState<ServerGroup[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<ServerGroup | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())
  const [serverGroups, setServerGroups] = useState<Record<number, number>>({}) // serverId -> groupId

  const [formData, setFormData] = useState({
    name: '',
    icon: '🚀',
    color: 'blue',
    description: ''
  })

  // Load groups from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('serverGroups')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setGroups(parsed)
        // Build serverGroups map
        const map: Record<number, number> = {}
        parsed.forEach((g: ServerGroup, idx: number) => {
          g.servers?.forEach(serverId => {
            map[serverId] = idx
          })
        })
        setServerGroups(map)
      } catch (e) {
        console.error('Error loading groups:', e)
      }
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('serverGroups', JSON.stringify(groups))
    onGroupsChange(groups)
  }, [groups])

  const handleCreateGroup = () => {
    if (!formData.name.trim()) {
      alert('Entrez un nom pour le groupe')
      return
    }

    const newGroup: ServerGroup = {
      id: Date.now(),
      ...formData,
      servers: []
    }

    setGroups([...groups, newGroup])
    setFormData({ name: '', icon: '🚀', color: 'blue', description: '' })
    setShowCreateModal(false)
  }

  const handleDeleteGroup = (groupId: number | undefined) => {
    if (!groupId) return
    if (!confirm('Supprimer ce groupe?')) return

    const newGroups = groups.filter(g => g.id !== groupId)
    setGroups(newGroups)

    // Remove servers from this group
    const newServerGroups = { ...serverGroups }
    Object.keys(newServerGroups).forEach(serverId => {
      if (newServerGroups[parseInt(serverId)] === groupId) {
        delete newServerGroups[parseInt(serverId)]
      }
    })
    setServerGroups(newServerGroups)
  }

  const handleAddServerToGroup = (serverId: number, groupId: number | undefined) => {
    if (!groupId) return

    const newServerGroups = { ...serverGroups }
    newServerGroups[serverId] = groupId

    setServerGroups(newServerGroups)

    // Update groups
    const newGroups = groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          servers: Array.from(new Set([...(g.servers || []), serverId]))
        }
      }
      return {
        ...g,
        servers: (g.servers || []).filter(id => id !== serverId)
      }
    })
    setGroups(newGroups)
  }

  const handleRemoveServerFromGroup = (serverId: number, groupId: number | undefined) => {
    if (!groupId) return

    const newServerGroups = { ...serverGroups }
    delete newServerGroups[serverId]
    setServerGroups(newServerGroups)

    // Update groups
    const newGroups = groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          servers: (g.servers || []).filter(id => id !== serverId)
        }
      }
      return g
    })
    setGroups(newGroups)
  }

  const toggleGroupExpanded = (groupId: number | undefined) => {
    if (!groupId) return
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  const ungroupedServers = servers.filter(s => !serverGroups[s.id])

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      pink: 'bg-pink-100 text-pink-800',
      gray: 'bg-gray-100 text-gray-800'
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Groupes de Serveurs</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Créer groupe
        </button>
      </div>

      {/* Groups List */}
      <div className="space-y-2 mb-4">
        {groups.map((group) => (
          <div key={group.id} className={`rounded-lg border-2 ${getColorClass(group.color)}`}>
            {/* Group Header */}
            <div
              onClick={() => toggleGroupExpanded(group.id)}
              className="flex items-center justify-between p-3 cursor-pointer hover:opacity-80 transition"
            >
              <div className="flex items-center gap-2">
                {expandedGroups.has(group.id!) ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
                <span className="text-2xl">{group.icon}</span>
                <div>
                  <div className="font-bold">{group.name}</div>
                  {group.description && <div className="text-xs opacity-75">{group.description}</div>}
                </div>
                <span className="ml-auto text-sm font-semibold">({group.servers?.length || 0})</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingGroup(group)
                  }}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteGroup(group.id)
                  }}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Group Servers */}
            {expandedGroups.has(group.id!) && (
              <div className="border-t-2 border-current opacity-30 px-3 py-2">
                <select
                  value=""
                  onChange={(e) => {
                    const serverId = parseInt(e.target.value)
                    if (serverId) {
                      handleAddServerToGroup(serverId, group.id)
                      e.target.value = ''
                    }
                  }}
                  className="w-full px-2 py-1 text-sm rounded bg-white bg-opacity-20 text-white mb-2"
                >
                  <option value="">+ Ajouter serveur...</option>
                  {servers
                    .filter(s => !group.servers?.includes(s.id))
                    .map(s => (
                      <option key={s.id} value={s.id} className="text-slate-900">
                        {s.name}
                      </option>
                    ))}
                </select>

                <div className="space-y-1">
                  {group.servers?.map(serverId => {
                    const server = servers.find(s => s.id === serverId)
                    if (!server) return null
                    return (
                      <div
                        key={serverId}
                        className="flex items-center justify-between bg-white bg-opacity-20 px-2 py-1 rounded text-sm"
                      >
                        <span>{server.name}</span>
                        <button
                          onClick={() => handleRemoveServerFromGroup(serverId, group.id)}
                          className="hover:bg-white hover:bg-opacity-30 p-1 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ungrouped Servers */}
      {ungroupedServers.length > 0 && (
        <div className="rounded-lg border-2 border-gray-400 bg-gray-100 text-gray-800 p-3">
          <div className="font-bold mb-2">📋 Sans groupe ({ungroupedServers.length})</div>
          <div className="space-y-1">
            {ungroupedServers.map(server => (
              <div key={server.id} className="text-sm opacity-75">
                {server.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 text-slate-900">
            <h2 className="text-xl font-bold mb-4">Créer un groupe</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nom *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Production"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Icône</label>
                <div className="flex gap-2 flex-wrap">
                  {EMOJI_ICONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                      className={`text-2xl p-2 rounded border-2 transition ${
                        formData.icon === emoji ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Couleur</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded border-2 transition ${
                        getColorClass(color) + ' ' + (formData.color === color ? 'border-4' : 'border-gray-300')
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Description (optionnel)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du groupe..."
                  maxLength={200}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                  rows={3}
                />
                <div className="text-xs text-gray-500 mt-1">{formData.description.length}/200</div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({ name: '', icon: '🚀', color: 'blue', description: '' })
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
