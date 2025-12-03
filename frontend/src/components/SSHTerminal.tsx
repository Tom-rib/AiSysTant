import { useState, useEffect, useRef } from 'react';
import { Send, LogOut, RotateCcw, Terminal as TerminalIcon } from 'lucide-react';
import '../styles/ssh-terminal.css';

// ✅ NOUVEAU: Interface pour les messages du terminal
interface SSHMessage {
  id: string;
  type: 'command' | 'output' | 'error' | 'info';
  content: string;
  timestamp: Date;
}

interface SSHServer {
  id: number;
  name: string;
  host: string;
  port: number;
  username: string;
  status?: 'connected' | 'disconnected' | 'connecting';
}

interface SSHTerminalProps {
  server: SSHServer;
  onDisconnect: (serverId: number) => void;
}

export default function SSHTerminal({ server, onDisconnect }: SSHTerminalProps) {
  // ✅ NOUVEAU: State pour le terminal
  const [messages, setMessages] = useState<SSHMessage[]>([]);
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentDir, setCurrentDir] = useState('/home');

  // ✅ NOUVEAU: Références
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ NOUVEAU: Charger le répertoire courant au montage
  useEffect(() => {
    loadCurrentDir();
  }, [server.id]);

  // ✅ NOUVEAU: Auto-scroll vers le bas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * ✅ NOUVEAU: Charger le répertoire courant depuis le serveur
   */
  const loadCurrentDir = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/ssh-terminal/current-dir/${server.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération du répertoire');

      const data = await response.json();
      if (data.success) {
        setCurrentDir(data.cwd);
        console.log(`[SSHTerminal] currentDir chargé: ${data.cwd}`);
      }
    } catch (error) {
      console.error('[SSHTerminal] Erreur lors du chargement du répertoire:', error);
      addMessage('Erreur lors de la récupération du répertoire courant', 'error');
    }
  };

  /**
   * ✅ NOUVEAU: Ajouter un message au terminal
   */
  const addMessage = (content: string, type: 'command' | 'output' | 'error' | 'info' = 'output') => {
    const message: SSHMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  /**
   * ✅ NOUVEAU: Scroller vers le bas du terminal
   */
  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * ✅ NOUVEAU: Exécuter une commande SSH
   */
  const executeCommand = async () => {
    if (!command.trim() || isExecuting) return;

    setIsExecuting(true);

    try {
      // ✅ NOUVEAU: Afficher la commande dans le terminal
      addMessage(command, 'command');

      const token = localStorage.getItem('token');
      const response = await fetch('/api/ssh-terminal/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serverId: server.id,
          command: command.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        addMessage(data.message || 'Erreur lors de l\'exécution', 'error');
        return;
      }

      // ✅ CORRIGÉ: Mettre à jour le répertoire courant
      if (data.cwd) {
        setCurrentDir(data.cwd);
        console.log(`[SSHTerminal] currentDir mis à jour: ${data.cwd}`);
      }

      // ✅ CORRIGÉ: Pour les commandes cd, nettoyer la sortie (enlever le pwd)
      let outputToDisplay = data.stdout;
      if (command.trim().startsWith('cd ')) {
        // Si la commande était cd, ne pas afficher la sortie de pwd
        outputToDisplay = '';
      }

      // ✅ NOUVEAU: Afficher la sortie
      if (outputToDisplay) {
        addMessage(outputToDisplay, 'output');
      }

      if (data.stderr) {
        addMessage(data.stderr, 'error');
      }

      // ✅ NOUVEAU: Afficher le code de sortie si erreur
      if (data.code !== 0 && !data.stderr) {
        addMessage(`[Commande terminée avec le code ${data.code}]`, 'info');
      }
    } catch (error: any) {
      console.error('[SSHTerminal] Erreur lors de l\'exécution:', error);
      addMessage(`Erreur: ${error.message}`, 'error');
    } finally {
      setIsExecuting(false);
      setCommand('');
      inputRef.current?.focus();
    }
  };

  /**
   * ✅ NOUVEAU: Gérer la touche Enter
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCommand();
    }
  };

  /**
   * ✅ NOUVEAU: Effacer le terminal
   */
  const handleClearTerminal = () => {
    setMessages([]);
    addMessage(`Connecté à ${server.username}@${server.host}`, 'info');
  };

  /**
   * ✅ NOUVEAU: Déconnecter
   */
  const handleDisconnect = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ssh-terminal/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ serverId: server.id })
      });

      const data = await response.json();
      if (data.success) {
        console.log('[SSHTerminal] Déconnecté');
        onDisconnect(server.id);
      }
    } catch (error) {
      console.error('[SSHTerminal] Erreur lors de la déconnexion:', error);
      onDisconnect(server.id);
    }
  };

  return (
    <div className="ssh-terminal-container">
      {/* En-tête du terminal */}
      <div className="terminal-header">
        <div className="terminal-info">
          <TerminalIcon className="w-5 h-5" />
          <div>
            <p className="terminal-server-name">{server.name}</p>
            <p className="terminal-server-address">
              {server.username}@{server.host}:{server.port}
            </p>
          </div>
        </div>

        <div className="terminal-actions">
          <button
            onClick={handleClearTerminal}
            className="terminal-btn"
            title="Effacer le terminal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleDisconnect}
            className="terminal-btn disconnect"
            title="Déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Zone de sortie du terminal */}
      <div className="terminal-output">
        {messages.length === 0 ? (
          <div className="terminal-empty">
            <p className="terminal-prompt">
              Connecté à <span className="terminal-host">{server.username}@{server.host}</span>
            </p>
            <p className="terminal-hint">Tapez une commande pour commencer...</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`terminal-line terminal-${msg.type}`}>
                {msg.type === 'command' && (
                  <div className="terminal-prompt-line">
                    <span className="terminal-prompt-user">{server.username}</span>
                    <span className="terminal-prompt-at">@</span>
                    <span className="terminal-prompt-host">{server.name}</span>
                    <span className="terminal-prompt-colon">:</span>
                    <span className="terminal-prompt-cwd">{currentDir}</span>
                    <span className="terminal-prompt-dollar">$ </span>
                    <span className="terminal-command-text">{msg.content}</span>
                  </div>
                )}
                {msg.type === 'output' && (
                  <span className="terminal-output-text">{msg.content}</span>
                )}
                {msg.type === 'error' && (
                  <span className="terminal-error-text">{msg.content}</span>
                )}
                {msg.type === 'info' && (
                  <span className="terminal-info-text">{msg.content}</span>
                )}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </>
        )}
      </div>

      {/* Zone d'entrée du terminal */}
      <div className="terminal-input-section">
        <div className="terminal-prompt-line">
          <span className="terminal-prompt-user">{server.username}</span>
          <span className="terminal-prompt-at">@</span>
          <span className="terminal-prompt-host">{server.name}</span>
          <span className="terminal-prompt-colon">:</span>
          <span className="terminal-prompt-cwd">{currentDir}</span>
          <span className="terminal-prompt-dollar">$ </span>

          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez une commande SSH..."
            className="terminal-input"
            disabled={isExecuting}
            autoFocus
          />

          <button
            onClick={executeCommand}
            disabled={!command.trim() || isExecuting}
            className="terminal-send-btn"
            title="Exécuter la commande"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
