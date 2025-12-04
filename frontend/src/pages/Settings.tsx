import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Eye, EyeOff, Save, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user } = useAuth()
  const [claudeApiKey, setClaudeApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/settings/claude-key`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Ne pas afficher la clé complète pour la sécurité, juste une indication
        if (data.hasKey) {
          setClaudeApiKey('••••••••••••••••••••••••••••••••••')
          setHasApiKey(true)
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
    }
  }

  const handleSave = async () => {
    // Ne pas envoyer si c'est juste le masquage de la clé
    if (claudeApiKey === '••••••••••••••••••••••••••••••••••' && !hasChanges) {
      setMessage({ type: 'error', text: 'Aucun changement à enregistrer' })
      return
    }

    if (!claudeApiKey.trim()) {
      setMessage({ type: 'error', text: 'Veuillez entrer une clé API Claude valide' })
      return
    }

    setIsLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/settings/claude-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ claudeApiKey: claudeApiKey.trim() })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Clé API Claude sauvegardée avec succès' })
        setClaudeApiKey('••••••••••••••••••••••••••••••••••')
        setHasChanges(false)
        setHasApiKey(true)
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Erreur lors de la sauvegarde' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `Erreur: ${error.message}` })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteApiKey = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setIsLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/settings/claude-key`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Clé API Claude supprimée avec succès' })
        setClaudeApiKey('')
        setHasChanges(false)
        setHasApiKey(false)
        setShowDeleteConfirm(false)
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.message || 'Erreur lors de la suppression' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `Erreur: ${error.message}` })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClaudeApiKey(e.target.value)
    setHasChanges(true)
    setMessage(null)
  }

  return (
    <div className="min-h-screen bg-background pt-8 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-primary-50 p-3 rounded-lg">
              <SettingsIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Configuration IA</h1>
              <p className="text-gray-300 mt-1">Configurez votre clé API Claude et vos préférences</p>
            </div>
          </div>
        </div>

        {/* Alert Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* API Key Settings Card */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-text mb-2">Clé API Claude</h2>
            <p className="text-text-light text-sm">
              Configurez votre clé API Anthropic Claude pour utiliser les fonctionnalités IA avancées.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="claudeApiKey" className="block text-sm font-medium text-text mb-2">
                Clé API Claude
              </label>
              <div className="relative">
                <input
                  id="claudeApiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={claudeApiKey}
                  onChange={handleApiKeyChange}
                  placeholder="sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="input pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text transition-colors"
                >
                  {showApiKey ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-text-light mt-2">
                Votre clé sera chiffrée et stockée de manière sécurisée sur le serveur.
              </p>
            </div>

            {/* Information Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Comment obtenir votre clé API :</strong>
              </p>
              <ol className="text-sm text-blue-800 mt-2 ml-4 space-y-1 list-decimal">
                <li>Visitez <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">console.anthropic.com</a></li>
                <li>Accédez à votre compte Anthropic</li>
                <li>Allez dans la section "API Keys"</li>
                <li>Créez une nouvelle clé et copiez-la</li>
              </ol>
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-6">
            <button
              onClick={handleSave}
              disabled={isLoading || !hasChanges}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
            {hasApiKey && (
              <button
                onClick={handleDeleteApiKey}
                disabled={isLoading}
                className="btn-outline flex items-center space-x-2 text-red-600 hover:bg-red-50 border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span>{showDeleteConfirm ? 'Confirmer la suppression ?' : 'Supprimer'}</span>
              </button>
            )}
            {hasChanges && (
              <p className="text-sm text-yellow-600 font-medium">Changements non enregistrés</p>
            )}
          </div>

          {showDeleteConfirm && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 mb-3">
                ⚠️ Vous êtes sur le point de supprimer votre clé API Claude. Cette action ne peut pas être annulée.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteApiKey}
                  disabled={isLoading}
                  className="btn-primary bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? 'Suppression...' : 'Supprimer définitivement'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                  className="btn-outline"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Information */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-xl font-semibold text-text mb-4">Informations du profil</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-text-light">Email</span>
              <span className="font-medium text-text">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-text-light">Nom d'utilisateur</span>
              <span className="font-medium text-text">{user?.username}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-light">Type de compte</span>
              <span className="font-medium text-text">Utilisateur</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
