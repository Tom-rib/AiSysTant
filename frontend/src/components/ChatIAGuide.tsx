import { ChevronDown, ChevronUp, Lightbulb, Zap, Shield, BookOpen, AlertCircle } from 'lucide-react'
import { useState } from 'react'

// ✅ NOUVEAU: Composant guide ChatIA avec sections dépliables
export default function ChatIAGuide() {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    overview: true,
    features: false,
    ssh_agent: false,
    examples: false,
    tips: false,
    faq: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className="bg-gradient-to-b from-primary-50 to-white rounded-lg border border-primary-200 p-6 space-y-4">
      {/* En-tête */}
      <div className="space-y-2 pb-4 border-b border-primary-200">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-text">Guide ChatIA</h2>
        </div>
        <p className="text-text-light">
          Apprenez à utiliser AiSystant pour automatiser vos tâches DevOps et administrer vos serveurs SSH
        </p>
      </div>

      {/* Section 1: Vue d'ensemble */}
      <div className="border rounded-lg border-primary-100">
        <button
          onClick={() => toggleSection('overview')}
          className="w-full px-4 py-3 flex items-center justify-between bg-primary-50 hover:bg-primary-100 transition-colors rounded-lg"
        >
          <span className="font-semibold text-text flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>📖 Vue d'ensemble</span>
          </span>
          {expandedSections.overview ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.overview && (
          <div className="px-4 py-3 space-y-3 bg-white text-sm text-text-light">
            <p>
              <strong className="text-text">AiSystant</strong> est un assistant IA qui utilise Claude pour automatiser vos tâches DevOps. Il peut:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Exécuter des commandes automatiquement sur vos serveurs</li>
              <li>Analyser les risques de sécurité avant d'exécuter</li>
              <li>Mettre à jour les paquets et gérer les services</li>
              <li>Créer et modifier des fichiers</li>
              <li>Fournir des explications en temps réel</li>
            </ul>
            <p className="pt-2 bg-blue-50 border-l-4 border-blue-400 px-3 py-2">
              <strong>Astuce:</strong> Posez vos questions naturellement, l'IA comprendra votre intention!
            </p>
          </div>
        )}
      </div>

      {/* Section 2: Fonctionnalités principales */}
      <div className="border rounded-lg border-primary-100">
        <button
          onClick={() => toggleSection('features')}
          className="w-full px-4 py-3 flex items-center justify-between bg-primary-50 hover:bg-primary-100 transition-colors rounded-lg"
        >
          <span className="font-semibold text-text flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>⚡ Fonctionnalités principales</span>
          </span>
          {expandedSections.features ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.features && (
          <div className="px-4 py-3 space-y-4 bg-white text-sm text-text-light">
            <div className="space-y-3">
              <div className="border-l-4 border-green-500 pl-3">
                <h4 className="font-semibold text-text text-green-700">🟢 Commandes bas risque (Auto-exécution)</h4>
                <p className="text-xs mt-1">Exécutées automatiquement sans confirmation:</p>
                <code className="block bg-gray-100 p-2 rounded mt-1 text-xs">
                  ls, cat, grep, pwd, df, ps, apt list, git status
                </code>
              </div>

              <div className="border-l-4 border-yellow-500 pl-3">
                <h4 className="font-semibold text-text text-yellow-700">🟡 Commandes moyen risque (Confirmation)</h4>
                <p className="text-xs mt-1">Nécessitent votre confirmation:</p>
                <code className="block bg-gray-100 p-2 rounded mt-1 text-xs">
                  apt install, systemctl restart, docker stop, npm install
                </code>
              </div>

              <div className="border-l-4 border-red-500 pl-3">
                <h4 className="font-semibold text-text text-red-700">🔴 Commandes haut risque (Refusées)</h4>
                <p className="text-xs mt-1">Jamais exécutées (trop dangereuses):</p>
                <code className="block bg-gray-100 p-2 rounded mt-1 text-xs">
                  rm -rf, sudo reboot, systemctl disable, kill -9
                </code>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Mode Agent SSH */}
      <div className="border rounded-lg border-primary-100">
        <button
          onClick={() => toggleSection('ssh_agent')}
          className="w-full px-4 py-3 flex items-center justify-between bg-primary-50 hover:bg-primary-100 transition-colors rounded-lg"
        >
          <span className="font-semibold text-text flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>🔐 Mode Agent SSH avancé</span>
          </span>
          {expandedSections.ssh_agent ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.ssh_agent && (
          <div className="px-4 py-3 space-y-4 bg-white text-sm text-text-light">
            <div>
              <h4 className="font-semibold text-text mb-2">🚀 Qu'est-ce que le Mode Agent SSH?</h4>
              <p>
                Le Mode Agent SSH est une fonctionnalité avancée qui permet à Claude d'analyser et d'exécuter automatiquement des actions sur vos serveurs SSH avec un meilleur contrôle.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 px-3 py-2 space-y-2">
              <h4 className="font-semibold text-text text-blue-700">⚙️ Fonctionnement:</h4>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>L'IA analyse votre demande</li>
                <li>Elle planifie les actions nécessaires</li>
                <li>Elle exécute les actions via SSH sur vos serveurs</li>
                <li>Elle retourne les résultats avec explications</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-text">📋 Actions disponibles:</h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start space-x-2">
                  <span className="text-primary font-bold">▸</span>
                  <span><strong>Exécuter commandes</strong>: Lancer n'importe quelle commande shell</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary font-bold">▸</span>
                  <span><strong>Installer paquets</strong>: apt install, pip install, npm install...</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary font-bold">▸</span>
                  <span><strong>Lire fichiers</strong>: Consulter configuration, logs, etc.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary font-bold">▸</span>
                  <span><strong>Écrire fichiers</strong>: Créer ou modifier des fichiers</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary font-bold">▸</span>
                  <span><strong>Infos système</strong>: Récupérer OS, RAM, disque, etc.</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 px-3 py-2">
              <p className="text-xs font-semibold text-yellow-700 mb-1">⚠️ Important:</p>
              <p className="text-xs">
                Le Mode Agent SSH nécessite que vous ayez au moins un serveur SSH configuré dans l'onglet SSH. Les actions seront exécutées directement sur vos serveurs!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Exemples */}
      <div className="border rounded-lg border-primary-100">
        <button
          onClick={() => toggleSection('examples')}
          className="w-full px-4 py-3 flex items-center justify-between bg-primary-50 hover:bg-primary-100 transition-colors rounded-lg"
        >
          <span className="font-semibold text-text flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>💡 Exemples d'utilisation</span>
          </span>
          {expandedSections.examples ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.examples && (
          <div className="px-4 py-3 space-y-4 bg-white text-sm">
            <div className="space-y-3">
              <div className="bg-green-50 border-l-4 border-green-500 pl-3 py-2">
                <p className="font-semibold text-green-700 text-xs">✅ BON: Demandes claires</p>
                <ul className="text-xs text-text-light mt-2 space-y-1">
                  <li>• "Montre-moi l'espace disque disponible"</li>
                  <li>• "Quels services systemd sont actifs?"</li>
                  <li>• "Installe nginx et démarre-le"</li>
                  <li>• "Lis le fichier /etc/nginx/nginx.conf"</li>
                </ul>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-500 pl-3 py-2">
                <p className="font-semibold text-orange-700 text-xs">⚠️ CONFIRMABLE: Actions modérées</p>
                <ul className="text-xs text-text-light mt-2 space-y-1">
                  <li>• "Mets à jour tous les paquets"</li>
                  <li>• "Redémarre le serveur web"</li>
                  <li>• "Désinstalle le paquet nodejs"</li>
                  <li>• "Crée un utilisateur système"</li>
                </ul>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 pl-3 py-2">
                <p className="font-semibold text-red-700 text-xs">❌ À ÉVITER: Actions dangereuses</p>
                <ul className="text-xs text-text-light mt-2 space-y-1">
                  <li>• "Supprime le répertoire /home"</li>
                  <li>• "Désactive complètement le firewall"</li>
                  <li>• "Redémarre le serveur en production"</li>
                  <li>• "Tue tous les processus"</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 5: Conseils */}
      <div className="border rounded-lg border-primary-100">
        <button
          onClick={() => toggleSection('tips')}
          className="w-full px-4 py-3 flex items-center justify-between bg-primary-50 hover:bg-primary-100 transition-colors rounded-lg"
        >
          <span className="font-semibold text-text flex items-center space-x-2">
            <Lightbulb className="w-5 h-5" />
            <span>💡 Conseils et astuces</span>
          </span>
          {expandedSections.tips ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.tips && (
          <div className="px-4 py-3 space-y-3 bg-white text-sm text-text-light">
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-primary font-bold">✓</span>
                <span><strong className="text-text">Soyez spécifique:</strong> "Montre les logs nginx des 10 dernières lignes" plutôt que "Logs?"</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary font-bold">✓</span>
                <span><strong className="text-text">Demandez des explications:</strong> L'IA peut expliquer ce qu'elle fait et pourquoi</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary font-bold">✓</span>
                <span><strong className="text-text">Utilisez le contexte:</strong> Mentionnez le serveur ou le service si pertinent</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary font-bold">✓</span>
                <span><strong className="text-text">Vérifiez les résultats:</strong> Toujours vérifier que les actions ont eu l'effet attendu</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary font-bold">✓</span>
                <span><strong className="text-text">Utilisez le Mode Agent SSH:</strong> Pour des tâches complexes nécessitant plusieurs étapes</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Section 6: FAQ */}
      <div className="border rounded-lg border-primary-100">
        <button
          onClick={() => toggleSection('faq')}
          className="w-full px-4 py-3 flex items-center justify-between bg-primary-50 hover:bg-primary-100 transition-colors rounded-lg"
        >
          <span className="font-semibold text-text flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>❓ Questions fréquemment posées</span>
          </span>
          {expandedSections.faq ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.faq && (
          <div className="px-4 py-3 space-y-4 bg-white text-sm">
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-text">Q: L'IA va-t-elle vraiment exécuter des commandes?</p>
                <p className="text-text-light mt-1">
                  R: Oui, mais seulement les commandes bas risque. Les autres nécessitent votre confirmation. Les actions destructrices sont toujours refusées.
                </p>
              </div>

              <div>
                <p className="font-semibold text-text">Q: Que faire si je fais une erreur?</p>
                <p className="text-text-light mt-1">
                  R: Vous pouvez corriger dans le terminal SSH ou demander à l'IA comment annuler l'action.
                </p>
              </div>

              <div>
                <p className="font-semibold text-text">Q: Puis-je utiliser des variables d'environnement?</p>
                <p className="text-text-light mt-1">
                  R: Oui! Mentionnez-les dans votre demande: "Utilise la variable MYVAR=hello et exécute echo \$MYVAR"
                </p>
              </div>

              <div>
                <p className="font-semibold text-text">Q: Comment savoir quel Mode utiliser?</p>
                <p className="text-text-light mt-1">
                  R: Mode normal pour des questions générales. Mode Agent SSH pour des tâches complexes sur serveurs.
                </p>
              </div>

              <div>
                <p className="font-semibold text-text">Q: Et si la commande échoue?</p>
                <p className="text-text-light mt-1">
                  R: L'IA affichera l'erreur et proposera des solutions. Décrivez le contexte pour une meilleure aide.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 text-xs text-text-light">
        <p>
          <strong className="text-text">💡 Besoin d'aide?</strong> Consultez la documentation ou contactez le support. AiSystant est ici pour vous aider à travailler plus efficacement!
        </p>
      </div>
    </div>
  )
}
