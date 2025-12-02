import { ArrowLeft, HelpCircle, Terminal, Lock, Wifi, Code } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function SSHHelp() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/ssh')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-text" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-text">Guide SSH pour Débutants</h1>
            <p className="text-text-light mt-1">Apprenez comment vous connecter à un serveur SSH</p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-text mb-4">📋 Contenu de ce guide</h2>
          <ul className="space-y-2 text-text-light">
            <li className="flex items-center space-x-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>Qu'est-ce que SSH?</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>Préparer votre serveur</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>Connecter votre serveur dans AiSystant</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>Exécuter des commandes</span>
            </li>
          </ul>
        </div>

        {/* Section 1 */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <HelpCircle className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text mb-3">1. Qu'est-ce que SSH?</h2>
              <p className="text-text-light mb-4">
                SSH (Secure Shell) est un protocole qui vous permet de vous connecter et de contrôler des serveurs à distance de manière sécurisée. C'est comme une ligne de commande (terminal) sur votre ordinateur, mais qui s'exécute sur un autre ordinateur.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
                <p className="text-sm text-text-light">
                  💡 <span className="font-semibold">Exemple:</span> Au lieu de physiquement vous asseoir devant un serveur pour utiliser son clavier et sa souris, vous pouvez vous connecter via SSH et utiliser votre ordinateur pour le contrôler.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <Lock className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text mb-3">2. Préparer votre serveur</h2>
              <p className="text-text-light mb-4">
                Avant de pouvoir vous connecter, vous avez besoin des informations de votre serveur et vous devez ouvrir le port SSH dans le pare-feu.
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-text mb-2">📍 Trouver l'adresse IP de votre serveur:</h3>
                  <p className="text-sm text-text-light mb-3">Exécutez une de ces commandes selon votre système:</p>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-text-light mb-1">🐧 Linux:</p>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                        ip addr show
                      </code>
                      <p className="text-xs text-text-light mt-1">Cherchez une ligne avec "inet" commençant par 192.168 ou 10.</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-light mb-1">🪟 Windows - PowerShell:</p>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                        ipconfig
                      </code>
                      <p className="text-xs text-text-light mt-1">Cherchez "IPv4 Address" dans la section Ethernet ou WiFi.</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-light mb-1">🍎 macOS - Terminal:</p>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                        ifconfig | grep "inet " | grep -v 127
                      </code>
                      <p className="text-xs text-text-light mt-1">Cherchez l'adresse commençant par 192.168 ou 10.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-text mb-2">📋 Autres informations nécessaires:</h3>
                  <ul className="space-y-2 text-text-light text-sm">
                    <li>✓ <span className="font-medium">Port SSH</span> (par défaut: 22)</li>
                    <li>✓ <span className="font-medium">Nom d'utilisateur</span> (ex: root, admin, ou votre nom d'utilisateur)</li>
                    <li>✓ <span className="font-medium">Mot de passe</span> de cet utilisateur</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-text mb-2">🔓 Ouvrir le port SSH dans le pare-feu:</h3>
                  <p className="text-sm text-text-light mb-3">Exécutez une de ces commandes selon votre système:</p>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-text-light mb-1">🐧 Linux - UFW (Ubuntu/Debian):</p>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                        sudo ufw allow 22/tcp
                      </code>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-light mb-1">🐧 Linux - iptables (Autres):</p>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                        sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
                      </code>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-light mb-1">🪟 Windows - PowerShell (Admin):</p>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                        netsh advfirewall firewall add rule name="SSH" dir=in action=allow protocol=tcp localport=22
                      </code>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-light mb-1">🍎 macOS - Firewall:</p>
                      <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                        sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
                      </code>
                      <p className="text-xs text-text-light mt-2">Ou: System Settings → General → Sharing → Remote Login</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <Wifi className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text mb-3">3. Connecter votre serveur dans AiSystant</h2>
              <p className="text-text-light mb-4">
                Une fois que votre serveur est préparé, suivez ces étapes:
              </p>

              <ol className="space-y-4">
                <li className="flex space-x-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold flex-shrink-0">
                    A
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-text mb-1">Cliquez sur "Ajouter un serveur"</h4>
                    <p className="text-sm text-text-light">Le bouton en haut à gauche de la page SSH</p>
                  </div>
                </li>
                <li className="flex space-x-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold flex-shrink-0">
                    B
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-text mb-1">Remplissez le formulaire</h4>
                    <ul className="text-sm text-text-light space-y-2 mt-2">
                      <li>• <span className="font-medium">Nom du serveur:</span> Un surnom pour identifier le serveur (ex: "Mon Serveur Web")</li>
                      <li>• <span className="font-medium">Adresse (Host):</span> L'IP du serveur (ex: 192.168.1.100)</li>
                      <li>• <span className="font-medium">Port:</span> 22 (sauf si vous avez changé)</li>
                      <li>• <span className="font-medium">Nom d'utilisateur:</span> Votre identifiant (ex: root)</li>
                      <li>• <span className="font-medium">Mot de passe:</span> Votre mot de passe</li>
                    </ul>
                  </div>
                </li>
                <li className="flex space-x-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold flex-shrink-0">
                    C
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-text mb-1">Cliquez sur "Ajouter"</h4>
                    <p className="text-sm text-text-light">Le serveur apparaîtra dans la liste à gauche</p>
                  </div>
                </li>
                <li className="flex space-x-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold flex-shrink-0">
                    D
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-text mb-1">Cliquez sur le serveur pour vous connecter</h4>
                    <p className="text-sm text-text-light">Attendez que le voyant passe au vert (Connecté)</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <Terminal className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text mb-3">4. Exécuter des commandes</h2>
              <p className="text-text-light mb-4">
                Une fois connecté, vous pouvez exécuter des commandes sur le serveur:
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-text mb-2">Commandes de base:</h4>
                  <ul className="space-y-2 text-sm">
                    <li><code className="bg-gray-100 px-2 py-1 rounded text-primary">pwd</code> <span className="text-text-light">- Affiche le dossier actuel</span></li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded text-primary">ls</code> <span className="text-text-light">- Liste les fichiers du dossier</span></li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded text-primary">cd dossier</code> <span className="text-text-light">- Change de dossier</span></li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded text-primary">cat fichier.txt</code> <span className="text-text-light">- Affiche le contenu d'un fichier</span></li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded text-primary">sudo apt update</code> <span className="text-text-light">- Met à jour les paquets (Linux)</span></li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <span className="font-semibold">Attention:</span> Les commandes SSH sont puissantes. Soyez prudent en exécutant des commandes que vous ne comprenez pas, surtout avec <code className="bg-yellow-100 px-1 rounded">sudo</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-text mb-4">❓ Questions Fréquentes</h2>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-text mb-1">Je ne connais pas l'IP de mon serveur, où la trouver?</h4>
              <p className="text-sm text-text-light">
                Sur le serveur, tapez <code className="bg-gray-100 px-2 py-1 rounded">ip addr</code> (Linux) ou <code className="bg-gray-100 px-2 py-1 rounded">ipconfig</code> (Windows). Cherchez une adresse commençant par 192.168 ou 10.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-text mb-1">La connexion est rejetée, pourquoi?</h4>
              <p className="text-sm text-text-light">
                Vérifiez que: 1) Le port SSH est ouvert, 2) L'identifiant et le mot de passe sont corrects, 3) L'IP du serveur est accessible depuis votre réseau
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-text mb-1">Puis-je utiliser une clé SSH au lieu d'un mot de passe?</h4>
              <p className="text-sm text-text-light">
                Pas pour le moment dans AiSystant, mais cette fonctionnalité pourrait être ajoutée à l'avenir.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200">
          <p className="text-center text-text">
            Prêt à vous connecter? <button onClick={() => navigate('/ssh')} className="font-semibold text-primary hover:underline">Retour à SSH →</button>
          </p>
        </div>
      </div>
    </div>
  )
}
