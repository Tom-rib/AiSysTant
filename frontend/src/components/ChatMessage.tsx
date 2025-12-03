import { User, Bot, Copy, Check } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useState } from 'react'

// ✅ NOUVEAU: Ajouter les propriétés optionnelles pour l'exécution
interface ChatMessageProps {
  message: {
    id: string | number
    content: string
    role: 'user' | 'assistant' | 'system'
    timestamp: Date | string
    commandOutput?: string
    executedBy?: 'claude_auto' | 'user_confirmed'
  }
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    return format(date, 'HH:mm', { locale: fr })
  }

  // Détecter si le message contient du code
  const hasCode = message.content.includes('```')
  
  // Parser le code markdown
  const parseContent = (content: string) => {
    if (!hasCode) return content

    const parts = content.split(/(```[\s\S]*?```)/g)
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const code = part.replace(/```(\w+)?\n?/g, '').replace(/```$/g, '')
        const language = part.match(/```(\w+)/)?.[1] || 'text'
        
        return (
          <div key={index} className="relative my-4">
            <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg">
              <span className="text-xs text-gray-400 uppercase">{language}</span>
              <button
                onClick={handleCopy}
                className="text-gray-400 hover:text-white transition-colors"
                title="Copier le code"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <pre className="code-block rounded-t-none">
              <code>{code}</code>
            </pre>
          </div>
        )
      }
      
      // Remplacer les retours à la ligne par des <br />
      return (
        <span key={index} dangerouslySetInnerHTML={{ 
          __html: part.replace(/\n/g, '<br />') 
        }} />
      )
    })
  }

  if (isSystem) {
    return (
      <div className="message-system">
        <p className="text-sm text-accent-700 font-medium">
          {message.content}
        </p>
        <p className="text-xs text-text-lighter mt-1">
          {formatTime(message.timestamp)}
        </p>
      </div>
    )
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-slide-up`}>
      <div className={`flex items-start space-x-3 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary' : 'bg-secondary'
        }`}>
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* ✅ NOUVEAU: Afficher le badge d'exécution */}
          {message.executedBy && (
            <div className="mb-2">
              {message.executedBy === 'claude_auto' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  🤖 Claude a exécuté
                </span>
              )}
              {message.executedBy === 'user_confirmed' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  👤 Tu as confirmé
                </span>
              )}
            </div>
          )}

          <div className={`rounded-lg p-4 shadow-sm ${
            isUser 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-text'
          }`}>
            <div className="text-sm whitespace-pre-wrap break-words">
              {parseContent(message.content)}
            </div>
          </div>

          {/* ✅ NOUVEAU: Afficher le résultat d'exécution si disponible */}
          {message.commandOutput && (
            <div className="mt-3 p-3 bg-gray-900 text-gray-100 rounded-lg text-xs font-mono w-full max-h-40 overflow-auto">
              <div className="font-semibold text-gray-400 mb-2">📤 Résultat:</div>
              <pre className="whitespace-pre-wrap">{message.commandOutput}</pre>
            </div>
          )}
          
          {/* Timestamp */}
          <span className="text-xs text-text-lighter mt-1 px-1">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  )
}
