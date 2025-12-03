import { useState, useEffect, useRef } from 'react';
import { Send, LogOut, RotateCcw, Terminal as TerminalIcon } from 'lucide-react';

// ✅ NOUVEAU: Interface pour un message du terminal
interface TerminalMessage {
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
}

interface SSHShellTabProps {
  server: SSHServer;
  onDisconnect: (serverId: number) => void;
}

export default function SSHShellTab({ server, onDisconnect }: SSHShellTabProps) {
  // ✅ NOUVEAU: State du terminal
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [command, setCommand] = useState('');
  const [currentDir, setCurrentDir] = useState('/home');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  // ✅ NOUVEAU: Références
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ NOUVEAU: Charger le répertoire courant au montage
  useEffect(() => {
    loadCurrentDir();
    addMessage('Connecté au serveur', 'info');
  }, [server.id]);

  // ✅ NOUVEAU: Auto-scroll vers le bas
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * ✅ NOUVEAU: Charger le répertoire courant
   */
  const loadCurrentDir = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/ssh/current-dir/${server.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setCurrentDir(data.cwd);
      }
    } catch (error) {
      console.error('[SSHShellTab] Erreur:', error);
      addMessage('Erreur lors de la connexion', 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * ✅ NOUVEAU: Ajouter un message
   */
  const addMessage = (content: string, type: TerminalMessage['type'] = 'output') => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    }]);
  };

  /**
   * ✅ NOUVEAU: Exécuter une commande
   */
  const executeCommand = async () => {
    if (!command.trim() || isLoading) return;

    setIsLoading(true);
    try {
      // ✅ NOUVEAU: Afficher la commande
      addMessage(command, 'command');

      const token = localStorage.getItem('token');
      const response = await fetch('/api/ssh/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          serverId: server.id,
          command: command.trim(),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        addMessage(data.message || data.error || 'Erreur lors de l\'exécution', 'error');
        return;
      }

      // ✅ NOUVEAU: Mettre à jour le répertoire courant
      if (data.cwd) {
        setCurrentDir(data.cwd);
      }

      // ✅ NOUVEAU: Afficher la sortie (mais pas pour les "cd")
      if (data.output && !command.trim().startsWith('cd ')) {
        addMessage(data.output, 'output');
      }
    } catch (error: any) {
      console.error('[SSHShellTab] Erreur:', error);
      addMessage(`Erreur: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
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
   * ✅ NOUVEAU: Déconnecter
   */
  const handleDisconnect = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/ssh/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ serverId: server.id }),
      });
      onDisconnect(server.id);
    } catch (error) {
      console.error('[SSHShellTab] Erreur:', error);
      onDisconnect(server.id);
    }
  };

  /**
   * ✅ NOUVEAU: Effacer le terminal
   */
  const handleClear = () => {
    setMessages([]);
    addMessage(`${server.username}@${server.name} - Session shell persistante`, 'info');
  };

  if (isConnecting) {
    return (
      <div className="ssh-shell-container">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-light">Connexion au serveur...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ssh-shell-container">
      {/* En-tête */}
      <div className="ssh-shell-header">
        <div className="ssh-shell-info">
          <TerminalIcon className="w-5 h-5 text-primary" />
          <div>
            <p className="ssh-shell-title">{server.name}</p>
            <p className="ssh-shell-address">{server.username}@{server.host}</p>
          </div>
        </div>

        <div className="ssh-shell-actions">
          <button
            onClick={handleClear}
            className="ssh-shell-btn"
            title="Effacer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleDisconnect}
            className="ssh-shell-btn ssh-shell-btn-danger"
            title="Déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Zone de sortie */}
      <div className="ssh-shell-output">
        {messages.map((msg) => (
          <div key={msg.id} className={`ssh-shell-line ssh-shell-${msg.type}`}>
            {msg.type === 'command' && (
              <div className="ssh-shell-prompt-line">
                <span className="ssh-shell-user">{server.username}</span>
                <span className="ssh-shell-at">@</span>
                <span className="ssh-shell-host">{server.name}</span>
                <span className="ssh-shell-colon">:</span>
                <span className="ssh-shell-cwd">{currentDir}</span>
                <span className="ssh-shell-dollar">$ </span>
                <span className="ssh-shell-text">{msg.content}</span>
              </div>
            )}
            {msg.type === 'output' && (
              <span className="ssh-shell-text">{msg.content}</span>
            )}
            {msg.type === 'error' && (
              <span className="ssh-shell-error">{msg.content}</span>
            )}
            {msg.type === 'info' && (
              <span className="ssh-shell-info-text">{msg.content}</span>
            )}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Zone d'entrée */}
      <div className="ssh-shell-input-section">
        <div className="ssh-shell-prompt-line">
          <span className="ssh-shell-user">{server.username}</span>
          <span className="ssh-shell-at">@</span>
          <span className="ssh-shell-host">{server.name}</span>
          <span className="ssh-shell-colon">:</span>
          <span className="ssh-shell-cwd">{currentDir}</span>
          <span className="ssh-shell-dollar">$ </span>

          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez une commande..."
            className="ssh-shell-input"
            disabled={isLoading}
            autoFocus
          />

          <button
            onClick={executeCommand}
            disabled={!command.trim() || isLoading}
            className="ssh-shell-send-btn"
            title="Exécuter"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
