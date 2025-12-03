import { ArrowLeft, HelpCircle, Terminal, Lock, Wifi, Code, Server, Copy, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function SSHHelp() {
  const navigate = useNavigate()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const CodeBlock = ({ code, id, label }: { code: string; id: string; label?: string }) => (
    <div className="mb-3">
      {label && <p className="text-xs font-semibold text-text-light mb-1">{label}</p>}
      <div className="relative group">
        <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto break-all">
          {code}
        </code>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="Copier"
        >
          {copiedCode === id ? (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-300" />
          )}
        </button>
      </div>
    </div>
  )

  const OSSection = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <div className="bg-gray-50 border-l-4 border-primary p-4 rounded-lg mb-4">
      <h4 className="font-semibold text-text mb-3">{icon} {title}</h4>
      {children}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/ssh')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-text" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-text">Guide SSH Complet</h1>
            <p className="text-text-light mt-1">Apprenez à configurer et utiliser SSH sur tous les systèmes d'exploitation</p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-text mb-4">📋 Contenu du guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-text-light">
            <div>✅ Qu'est-ce que SSH?</div>
            <div>✅ Trouver votre adresse IP</div>
            <div>✅ Ouvrir le port SSH (Pare-feu)</div>
            <div>✅ Connecter votre serveur</div>
            <div>✅ Exécuter des commandes</div>
            <div>✅ Dépannage</div>
          </div>
        </div>

        {/* Section 1: Qu'est-ce que SSH */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <HelpCircle className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text mb-3">1️⃣ Qu'est-ce que SSH?</h2>
              <p className="text-text-light mb-4">
                SSH (Secure Shell) est un protocole qui vous permet de vous connecter et contrôler des serveurs à distance de manière sécurisée. C'est comme une ligne de commande (terminal) sur votre ordinateur, mais qui s'exécute sur un autre ordinateur.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary">
                <p className="text-sm text-text-light">
                  💡 <span className="font-semibold">Exemple:</span> Au lieu de physiquement vous asseoir devant un serveur, vous pouvez vous connecter via SSH et le contrôler depuis votre ordinateur, même depuis l'autre côté du monde!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Trouver l'adresse IP */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <Wifi className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text mb-3">2️⃣ Trouver votre adresse IP</h2>
              <p className="text-text-light mb-4">
                L'adresse IP est l'identifiant unique de votre ordinateur sur le réseau. Voici comment la trouver sur chaque système:
              </p>

              <div className="space-y-4">
                <OSSection title="Linux" icon="🐧">
                  <div className="space-y-3">
                    <p className="text-sm text-text-light mb-2">Ouvrez un terminal et exécutez:</p>
                    <CodeBlock 
                      code="ip addr show"
                      id="linux-ip-1"
                      label="Méthode 1 (moderne)"
                    />
                    <CodeBlock 
                      code="hostname -I"
                      id="linux-ip-2"
                      label="Méthode 2 (simple)"
                    />
                    <p className="text-xs text-text-light">
                      ✅ Cherchez une adresse commençant par <span className="font-mono">192.168</span>, <span className="font-mono">10.</span>, ou <span className="font-mono">172.16</span>
                    </p>
                  </div>
                </OSSection>

                <OSSection title="Windows" icon="🪟">
                  <div className="space-y-3">
                    <p className="text-sm text-text-light mb-2">Ouvrez PowerShell et exécutez:</p>
                    <CodeBlock 
                      code="ipconfig"
                      id="windows-ip-1"
                    />
                    <p className="text-xs text-text-light">
                      ✅ Cherchez <span className="font-mono">IPv4 Address</span> dans la section Ethernet ou WiFi
                    </p>
                    <p className="text-xs text-text-light mt-2">
                      💡 Exemple: <span className="font-mono">192.168.1.100</span>
                    </p>
                  </div>
                </OSSection>

                <OSSection title="macOS" icon="🍎">
                  <div className="space-y-3">
                    <p className="text-sm text-text-light mb-2">Ouvrez Terminal et exécutez:</p>
                    <CodeBlock 
                      code="ifconfig | grep 'inet ' | grep -v 127"
                      id="macos-ip-1"
                    />
                    <p className="text-xs text-text-light">
                      ✅ Cherchez l'adresse commençant par <span className="font-mono">192.168</span> ou <span className="font-mono">10.</span>
                    </p>
                  </div>
                </OSSection>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Ouvrir le port SSH */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <Lock className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text mb-3">3️⃣ Ouvrir le port SSH dans le pare-feu</h2>
              <p className="text-text-light mb-4">
                SSH utilise le port <span className="font-mono bg-gray-100 px-2 py-1 rounded text-text">22</span> par défaut. Vous devez ouvrir ce port dans votre pare-feu pour pouvoir accéder au serveur à distance.
              </p>

              <div className="space-y-4">
                {/* Linux */}
                <OSSection title="Linux" icon="🐧">
                  <div className="space-y-3">
                    <p className="text-sm text-text-light mb-2"><span className="font-semibold">Avec UFW (Ubuntu/Debian):</span></p>
                    <CodeBlock 
                      code="sudo ufw allow 22/tcp"
                      id="linux-fw-ufw-1"
                    />
                    <CodeBlock 
                      code="sudo ufw enable"
                      id="linux-fw-ufw-2"
                      label="Activer le pare-feu (si pas encore activé)"
                    />

                    <p className="text-sm text-text-light mb-2 mt-4"><span className="font-semibold">Avec firewalld (CentOS/RHEL):</span></p>
                    <CodeBlock 
                      code="sudo firewall-cmd --permanent --add-service=ssh"
                      id="linux-fw-firewalld-1"
                    />
                    <CodeBlock 
                      code="sudo firewall-cmd --reload"
                      id="linux-fw-firewalld-2"
                    />

                    <p className="text-sm text-text-light mb-2 mt-4"><span className="font-semibold">Vérifier l'état SSH:</span></p>
                    <CodeBlock 
                      code="sudo systemctl status ssh"
                      id="linux-ssh-status"
                    />
                    <CodeBlock 
                      code="sudo systemctl start ssh"
                      id="linux-ssh-start"
                      label="Démarrer SSH (si arrêté)"
                    />
                  </div>
                </OSSection>

                {/* Windows */}
                <OSSection title="Windows" icon="🪟">
                  <div className="space-y-3">
                    <p className="text-sm text-text-light mb-2"><span className="font-semibold">Option 1: Windows Defender Firewall (GUI)</span></p>
                    <ol className="text-sm text-text-light space-y-2 list-decimal list-inside">
                      <li>Ouvrez <span className="font-mono bg-gray-100 px-2 py-1 rounded">Windows Defender Firewall</span></li>
                      <li>Cliquez sur <span className="font-mono bg-gray-100 px-2 py-1 rounded">Allow an app through firewall</span></li>
                      <li>Cliquez sur <span className="font-mono bg-gray-100 px-2 py-1 rounded">Change settings</span></li>
                      <li>Cliquez sur <span className="font-mono bg-gray-100 px-2 py-1 rounded">Allow another app</span></li>
                      <li>Cherchez <span className="font-mono bg-gray-100 px-2 py-1 rounded">OpenSSH Server</span> et ajoutez-le</li>
                    </ol>

                    <p className="text-sm text-text-light mb-2 mt-4"><span className="font-semibold">Option 2: PowerShell (Ligne de commande)</span></p>
                    <CodeBlock 
                      code="New-NetFirewallRule -Name 'SSH' -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22"
                      id="windows-fw-1"
                    />

                    <p className="text-sm text-text-light mb-2 mt-4"><span className="font-semibold">Installer SSH Server (si nécessaire):</span></p>
                    <CodeBlock 
                      code="Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0"
                      id="windows-ssh-install"
                    />

                    <p className="text-sm text-text-light mb-2 mt-4"><span className="font-semibold">Démarrer SSH:</span></p>
                    <CodeBlock 
                      code="Start-Service sshd"
                      id="windows-ssh-start"
                    />
                    <CodeBlock 
                      code="Set-Service -Name sshd -StartupType 'Automatic'"
                      id="windows-ssh-auto"
                      label="Auto-démarrage (optionnel)"
                    />
                  </div>
                </OSSection>

                {/* macOS */}
                <OSSection title="macOS" icon="🍎">
                  <div className="space-y-3">
                    <p className="text-sm text-text-light mb-2"><span className="font-semibold">Activer SSH Server:</span></p>
                    <ol className="text-sm text-text-light space-y-2 list-decimal list-inside">
                      <li>Ouvrez <span className="font-mono bg-gray-100 px-2 py-1 rounded">System Preferences</span></li>
                      <li>Allez à <span className="font-mono bg-gray-100 px-2 py-1 rounded">Sharing</span></li>
                      <li>Cochez <span className="font-mono bg-gray-100 px-2 py-1 rounded">Remote Login</span></li>
                      <li>Sélectionnez qui peut se connecter (Tous les utilisateurs recommandé)</li>
                    </ol>

                    <p className="text-sm text-text-light mb-2 mt-4"><span className="font-semibold">Ou en ligne de commande:</span></p>
                    <CodeBlock 
                      code="sudo systemsetup -setremotelogin on"
                      id="macos-ssh-enable"
                    />

                    <p className="text-sm text-text-light mb-2 mt-4"><span className="font-semibold">Vérifier l'état:</span></p>
                    <CodeBlock 
                      code="sudo systemsetup -getremotelogin"
                      id="macos-ssh-status"
                    />
                  </div>
                </OSSection>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Connecter votre serveur */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <Server className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text mb-3">4️⃣ Connecter votre serveur dans AiSystant</h2>
              <p className="text-text-light mb-4">
                Maintenant que votre serveur est configuré et que vous avez votre adresse IP, vous pouvez l'ajouter dans AiSystant.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-text mb-2">📝 Informations nécessaires:</p>
                <ul className="text-sm text-text-light space-y-1 list-disc list-inside">
                  <li><span className="font-semibold">Nom du serveur:</span> Un nom pour vous repérer (ex: "Serveur Bureau")</li>
                  <li><span className="font-semibold">Adresse IP/Hostname:</span> L'adresse IP trouvée ci-dessus</li>
                  <li><span className="font-semibold">Port:</span> 22 (par défaut)</li>
                  <li><span className="font-semibold">Utilisateur SSH:</span> Votre nom d'utilisateur sur le serveur</li>
                  <li><span className="font-semibold">Mot de passe ou clé privée:</span> Votre authentification</li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-text-light mb-2"><span className="font-semibold">Exemple pour Windows:</span></p>
                <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm text-text-light">
                  <div>📌 Nom: "Mon PC Windows"</div>
                  <div>📌 Adresse IP: 192.168.1.100</div>
                  <div>📌 Port: 22</div>
                  <div>📌 Utilisateur: tom</div>
                  <div>📌 Mot de passe: *****</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Exécuter des commandes */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <Terminal className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text mb-3">5️⃣ Exécuter des commandes SSH</h2>
              <p className="text-text-light mb-4">
                Une fois connecté, vous pouvez exécuter n'importe quelle commande comme si vous étiez en ligne de commande sur le serveur.
              </p>

              <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <p className="text-xs font-semibold text-gray-300 mb-2">Exemples de commandes utiles:</p>
                <div className="space-y-2">
                  <CodeBlock code="ls" id="cmd-ls" label="📂 Lister les fichiers" />
                  <CodeBlock code="pwd" id="cmd-pwd" label="📍 Afficher le répertoire courant" />
                  <CodeBlock code="cd /home" id="cmd-cd" label="📂 Changer de répertoire" />
                  <CodeBlock code="mkdir monrepertoire" id="cmd-mkdir" label="📁 Créer un dossier" />
                  <CodeBlock code="touch fichier.txt" id="cmd-touch" label="📄 Créer un fichier" />
                  <CodeBlock code="cat fichier.txt" id="cmd-cat" label="📖 Afficher le contenu d'un fichier" />
                  <CodeBlock code="rm fichier.txt" id="cmd-rm" label="🗑️ Supprimer un fichier" />
                  <CodeBlock code="sudo apt update && sudo apt upgrade" id="cmd-update" label="🔄 Mettre à jour (Linux)" />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-text-light">
                  💡 <span className="font-semibold">Conseil:</span> Utilisez <span className="font-mono bg-white px-2 py-1 rounded">cd</span> pour naviguer dans les dossiers, et <span className="font-mono bg-white px-2 py-1 rounded">ls</span> pour voir le contenu. L'historique de vos commandes est sauvegardé!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Dépannage */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <HelpCircle className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text mb-3">6️⃣ Dépannage</h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4 py-2">
                  <p className="font-semibold text-text mb-2">❌ "Connexion refusée"</p>
                  <ul className="text-sm text-text-light space-y-1 list-disc list-inside">
                    <li>Vérifiez que SSH est activé sur le serveur</li>
                    <li>Vérifiez que le port 22 est ouvert dans le pare-feu</li>
                    <li>Vérifiez que le serveur est allumé</li>
                    <li>Vérifiez l'adresse IP (avec <span className="font-mono bg-gray-100 px-1">ip addr show</span>)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-red-500 pl-4 py-2">
                  <p className="font-semibold text-text mb-2">❌ "Permission refusée" ou "Authentification échouée"</p>
                  <ul className="text-sm text-text-light space-y-1 list-disc list-inside">
                    <li>Vérifiez le nom d'utilisateur (sensible à la casse)</li>
                    <li>Vérifiez le mot de passe</li>
                    <li>Si vous utilisez une clé SSH, assurez-vous qu'elle est correctement formatée</li>
                  </ul>
                </div>

                <div className="border-l-4 border-red-500 pl-4 py-2">
                  <p className="font-semibold text-text mb-2">❌ "Timeout" ou "Connexion lente"</p>
                  <ul className="text-sm text-text-light space-y-1 list-disc list-inside">
                    <li>Vérifiez votre connexion Internet</li>
                    <li>Vérifiez que le serveur est en ligne</li>
                    <li>Essayez de faire un ping: <span className="font-mono bg-gray-100 px-1">ping IP_DU_SERVEUR</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-primary/5 border border-primary rounded-lg p-6 text-center">
          <p className="text-text-light mb-3">
            Prêt à vous connecter? Retournez à la page SSH et ajoutez votre serveur!
          </p>
          <button
            onClick={() => navigate('/ssh')}
            className="btn-primary"
          >
            Aller à SSH Terminal
          </button>
        </div>
      </div>
    </div>
  )
}
