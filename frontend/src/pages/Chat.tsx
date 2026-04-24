import { useState, useEffect, useRef } from 'react'
import { Send, Loader, Plus, Trash2, MessageSquare, Bot } from 'lucide-react'
import ChatMessage from '../components/ChatMessage'
// ✅ NOUVEAU: Importer le guide ChatIA
import ChatIAGuide from '../components/ChatIAGuide'
import ServerSelector from '../components/ServerSelector'
import { chatAPI, sshAPI, groupsAPI } from '../services/api'
import { socketService } from '../services/socket'
import { useChat } from '../context/ChatContext'

interface Message {
  id: number
  content: string
  role: 'user' | 'assistant' | 'system'
  created_at: string
  conversation_id?: number
  user_id?: number
}

interface SSHServer {
  id: number
  name: string
  host: string
  port: number
  username: string
}

export default function Chat() {
  const {
    conversations,
    currentConversationId,
    setConversations,
    setCurrentConversationId,
    addConversation,
    removeConversation,
    setMessagesForConversation,
    addMessageToConversation,
    getMessagesForConversation,
  } = useChat()

  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [useSSHAgent, setUseSSHAgent] = useState(false)
  // ✅ NOUVEAU: State pour gérer l'onglet actif (conversations ou guide)
  const [activeTab, setActiveTab] = useState<'conversations' | 'guide'>('conversations')
  const [servers, setServers] = useState<SSHServer[]>([])
  const [selectedServerIds, setSelectedServerIds] = useState<number[]>([])
  const [showNewConvModal, setShowNewConvModal] = useState(false)
  const [newConvTitle, setNewConvTitle] = useState('')
  const [newConvGroupId, setNewConvGroupId] = useState<number>()
  const [serverGroups, setServerGroups] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messages = currentConversationId ? getMessagesForConversation(currentConversationId) : []

  useEffect(() => {
    // Load servers and server groups
    loadServers()
    loadServerGroups()
    
    if (conversations.length === 0) {
      loadConversations()
    } else if (currentConversationId && messages.length === 0) {
      loadMessages(currentConversationId)
    }
    
    const token = localStorage.getItem('token')
    if (token) {
      socketService.connect(token)
      
      socketService.onNewMessage((message) => {
        if (currentConversationId) {
          addMessageToConversation(currentConversationId, message)
        }
      })
    }

    return () => {
      // socketService.disconnect()
    }
  }, [conversations.length, currentConversationId])

  const loadServers = async () => {
    try {
      const response = await sshAPI.getServers()
      const data = response.data.data || response.data.servers || response.data || []
      setServers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading servers:', error)
      setServers([])
    }
  }

  const loadServerGroups = async () => {
    try {
      const response = await groupsAPI.list()
      const groups = response.data?.data || response.data?.groups || []
      setServerGroups(Array.isArray(groups) ? groups : [])
    } catch (error) {
      console.error('Error loading server groups:', error)
      setServerGroups([])
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
    }, 0)
  }

  const loadConversations = async () => {
    try {
      const response = await chatAPI.getConversations()
      const convs = response.data.data || response.data.conversations || []
      setConversations(convs)
      
      if (convs.length > 0 && !currentConversationId) {
        loadMessages(convs[0].id)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error)
    }
  }

  const loadMessages = async (conversationId: number) => {
    const cachedMessages = getMessagesForConversation(conversationId)
    if (cachedMessages.length > 0) {
      setCurrentConversationId(conversationId)
      return
    }

    setIsLoading(true)
    setCurrentConversationId(conversationId)
    
    try {
      const response = await chatAPI.getConversation(conversationId)
      const data = response.data.data
      
      const msgs = data.messages || data.conversation?.messages || []
      setMessagesForConversation(conversationId, msgs)
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error)
      setMessagesForConversation(conversationId, [])
    } finally {
      setIsLoading(false)
    }
  }

  const createNewConversation = async () => {
    try {
      const title = newConvTitle.trim() || 'Nouvelle conversation'
      const response = await chatAPI.createConversation(title)
      const newConv = response.data.data
      
      if (newConv?.id) {
        const convWithGroup = {
          ...newConv,
          server_group_id: newConvGroupId,
          server_group_name: serverGroups.find(g => g.id === newConvGroupId)?.name
        }
        addConversation(convWithGroup)
        setCurrentConversationId(newConv.id)
        setMessagesForConversation(newConv.id, [])
        
        // Reset modal
        setShowNewConvModal(false)
        setNewConvTitle('')
        setNewConvGroupId(undefined)
      }
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error)
    }
  }

  const deleteConversation = async (conversationId: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cette conversation ?')) return

    try {
      await chatAPI.deleteConversation(conversationId)
      removeConversation(conversationId)
      
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null)
        
        if (conversations.length > 1) {
          const remaining = conversations.filter(c => c.id !== conversationId)
          if (remaining.length > 0) {
            loadMessages(remaining[0].id)
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentConversationId || isSending) return

    const messageContent = inputMessage.trim()
    setInputMessage('')
    setIsSending(true)

    const tempUserMessage: Message = {
      id: Date.now(),
      content: messageContent,
      role: 'user',
      created_at: new Date().toISOString(),
      conversation_id: currentConversationId,
    }
    addMessageToConversation(currentConversationId, tempUserMessage)

    try {
      const response = await chatAPI.sendMessage(currentConversationId, messageContent, useSSHAgent, selectedServerIds)
      const data = response.data.data
      // ✅ NOUVEAU: Récupérer le mode d'exécution
      const executionMode = response.data.mode
      
      console.log(`[Chat] Response mode: ${executionMode}`)

      if (data.userMessage && data.assistantMessage) {
        // ✅ NOUVEAU: Ajouter les metadata d'exécution au message assistant
        const assistantMessageWithMeta = {
          ...data.assistantMessage,
          commandOutput: data.commandOutput,
          executedBy: executionMode === 'auto_executed' ? 'claude_auto' : undefined
        }

        const currentMessages = getMessagesForConversation(currentConversationId)
        const withoutTemp = currentMessages.filter(m => m.id !== tempUserMessage.id)
        
        setMessagesForConversation(currentConversationId, [
          ...withoutTemp,
          data.userMessage,
          assistantMessageWithMeta
        ])
        
        const convResponse = await chatAPI.getConversations()
        const convs = convResponse.data.data || convResponse.data.conversations || []
        setConversations(convs)

        // ✅ NOUVEAU: Log pour debugging
        if (executionMode === 'auto_executed') {
          console.log('[Chat] ✅ Commande auto-exécutée par Claude')
        } else if (executionMode === 'awaiting_confirmation') {
          console.log('[Chat] ⚠️ En attente de confirmation')
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error)
      
      const currentMessages = getMessagesForConversation(currentConversationId)
      const withoutTemp = currentMessages.filter(m => m.id !== tempUserMessage.id)
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        content: `Erreur: ${error.response?.data?.message || error.message || 'Une erreur est survenue'}`,
        role: 'system',
        created_at: new Date().toISOString(),
      }
      setMessagesForConversation(currentConversationId, [...withoutTemp, errorMessage])
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="h-[calc(100vh-4rem)] flex">
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 space-y-2">
            {/* ✅ NOUVEAU: Bouton nouvelle conversation */}
            <button
              onClick={() => setShowNewConvModal(true)}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Nouvelle conversation</span>
            </button>

            {/* ✅ NOUVEAU: Onglets (Conversations et Guide) */}
            <div className="flex gap-2 border-t pt-3">
              <button
                onClick={() => setActiveTab('conversations')}
                className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                  activeTab === 'conversations'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text hover:bg-gray-200'
                }`}
              >
                💬 Conversations
              </button>
              <button
                onClick={() => setActiveTab('guide')}
                className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                  activeTab === 'guide'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text hover:bg-gray-200'
                }`}
              >
                📖 Guide
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {/* ✅ NOUVEAU: Afficher le contenu selon l'onglet actif */}
            {activeTab === 'conversations' ? (
              <>
                {conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-text-light mx-auto mb-4" />
                    <p className="text-text-light">Aucune conversation</p>
                    <p className="text-sm text-text-lighter mt-2">
                      Créez-en une nouvelle pour commencer
                    </p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`group p-3 rounded-lg cursor-pointer transition-all ${
                          currentConversationId === conv.id
                            ? 'bg-primary-50 border-2 border-primary'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                        onClick={() => loadMessages(conv.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text truncate">
                              {conv.title}
                            </p>
                            {conv.server_group_name && (
                              <p className="text-xs bg-primary-50 text-primary px-2 py-0.5 rounded inline-block mt-1">
                                🖥️ {conv.server_group_name}
                              </p>
                            )}
                            <p className="text-xs text-text-light mt-1">
                              {new Date(conv.created_at).toLocaleString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteConversation(conv.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* ✅ NOUVEAU: Afficher le guide dans l'onglet */
              <div className="p-4">
                <ChatIAGuide />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {currentConversationId ? (
            <>
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="loading w-12 h-12 mb-4"></div>
                      <p className="text-text-light">Chargement des messages...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bot className="w-10 h-10 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold text-text mb-4">
                        Prêt à vous aider ! 🤖
                      </h2>
                      <p className="text-text-light mb-6">
                        Posez-moi n'importe quelle question sur la gestion de votre infrastructure,
                        l'exécution de commandes SSH, ou demandez-moi de l'aide.
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-blue-50 rounded-lg text-left">
                          <p className="font-medium text-blue-900">💡 Exemples</p>
                          <p className="text-blue-700 text-xs mt-1">
                            "Liste mes serveurs"
                          </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg text-left">
                          <p className="font-medium text-green-900">🚀 Commandes</p>
                          <p className="text-green-700 text-xs mt-1">
                            "Vérifie l'espace disque"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <ChatMessage 
                        key={message.id} 
                        message={{
                          ...message,
                          timestamp: message.created_at
                        }} 
                      />
                    ))}
                    {isSending && (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                          <div className="flex items-center space-x-2">
                            <Loader className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-text-light text-sm">Claude réfléchit...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useSSHAgent}
                        onChange={(e) => setUseSSHAgent(e.target.checked)}
                        disabled={isSending}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-text">
                        🤖 Mode Agent SSH (l'IA exécutera les commandes automatiquement)
                      </span>
                    </label>
                    <ServerSelector
                      servers={servers}
                      groups={serverGroups}
                      selectedServerIds={selectedServerIds}
                      onServerSelect={setSelectedServerIds}
                    />
                  </div>
                  <div className="flex items-end space-x-4">
                    <div className="flex-1">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={useSSHAgent ? "Décrivez le problème à résoudre (ex: 'nginx ne démarre pas')" : "Tapez votre message... (Entrée pour envoyer, Maj+Entrée pour nouvelle ligne)"}
                        className="input resize-none"
                        rows={3}
                        disabled={isSending}
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isSending}
                      className="btn-primary px-6 py-3 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>Traitement...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Envoyer</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-text-lighter mt-2">
                    {useSSHAgent ? "⚠️ L'IA exécutera des actions SSH sur vos serveurs. Vérifiez toujours les commandes suggérées." : "L'IA peut faire des erreurs. Vérifiez les informations importantes."}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-text-light mx-auto mb-4" />
                <p className="text-xl text-text mb-2">Aucune conversation sélectionnée</p>
                <p className="text-text-light">
                  Créez ou sélectionnez une conversation pour commencer
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nouvelle Conversation */}
      {showNewConvModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h2 className="text-2xl font-bold text-text mb-4">Nouvelle conversation</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Nom de la conversation *</label>
                <input
                  type="text"
                  value={newConvTitle}
                  onChange={(e) => setNewConvTitle(e.target.value)}
                  placeholder="Ex: Configuration nginx"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-2">Groupe de serveurs</label>
                <select
                  value={newConvGroupId || ''}
                  onChange={(e) => setNewConvGroupId(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Sélectionnez un groupe --</option>
                  {serverGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.icon} {group.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewConvModal(false)
                  setNewConvTitle('')
                  setNewConvGroupId(undefined)
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-text rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Annuler
              </button>
              <button
                onClick={createNewConversation}
                disabled={!newConvTitle.trim()}
                className="flex-1 px-4 py-2 btn-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
