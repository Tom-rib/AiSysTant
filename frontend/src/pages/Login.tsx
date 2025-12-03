import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, AlertCircle, Loader } from 'lucide-react'
import logo from '/logo-192.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
      {/* Left Side - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center">
        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-12 max-w-md">
          <h2 className="text-4xl font-bold text-white mb-6">
            Rejoignez des milliers d'admins
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Gérez vos serveurs en français naturel avec notre IA
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Chat IA en français naturel</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Gestion multi-serveurs sécurisée</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Monitoring en temps réel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img 
                src={logo} 
                alt="AiSystant Logo" 
                className="h-16 w-16 object-contain drop-shadow-lg"
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Connexion
            </h1>
            <p className="text-gray-400 text-lg">
              Gérez votre infrastructure en langage naturel
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start space-x-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    placeholder="vous@exemple.com"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M15.171 13.576l1.472 1.473a1 1 0 001.414-1.414l-14-14a1 1 0 00-1.414 1.414l1.473 1.473A10.014 10.014 0 00.458 10c1.274 4.057 5.065 7 9.542 7 2.181 0 4.26-.601 6.01-1.629l1.559 1.559a1 1 0 001.414-1.414l-1.473-1.473z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-slate-600 text-cyan-400 focus:ring-cyan-400"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-400">
                  Rester connecté
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 hover:brightness-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Connexion...</span>
                  </>
                ) : (
                  <span>Se connecter</span>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-sm space-y-2">
              <p className="font-semibold text-cyan-400 flex items-center gap-2">
                <span>🎯</span> Compte de test
              </p>
              <p className="text-gray-300">
                <span className="font-mono text-cyan-400">admin@aisystant.com</span>
              </p>
              <p className="text-gray-300">
                <span className="font-mono text-cyan-400">admin123</span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="space-y-4 text-center">
            <div className="text-gray-400">
              Pas encore de compte?{' '}
              <Link 
                to="/register" 
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                Créer un compte
              </Link>
            </div>
            <Link 
              to="/pricing" 
              className="text-gray-500 hover:text-gray-400 text-sm transition-colors"
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </div>
    </div>
  )