import { useState, useEffect, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import TerminalEmulator from './TerminalEmulator';

// ✅ NOUVEAU: Interface pour un onglet de terminal
interface TerminalTab {
  sessionId: string;
  serverId: number;
  serverName: string;
  isActive: boolean;
}

interface MultiTerminalProps {
  servers: any[];
}

export default function MultiTerminal({ servers }: MultiTerminalProps) {
  // ✅ NOUVEAU: State des onglets
  const [tabs, setTabs] = useState<TerminalTab[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // ✅ NOUVEAU: Initialiser le socket UNE SEULE FOIS
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    // ✅ NOUVEAU: UN SEUL socket pour tous les onglets!
    socketRef.current = io(window.location.origin, {
      auth: { token, userId },
      reconnection: true,
    });

    socketRef.current.on('connect', () => {
      console.log('[MultiTerminal] Socket connecté');
    });

    socketRef.current.on('disconnect', () => {
      console.log('[MultiTerminal] Socket déconnecté');
    });

    return () => {
      // ✅ NOUVEAU: NE PAS fermer le socket au unmount
      // Il continuera à fonctionner pour les autres onglets
    };
  }, []);

  /**
   * ✅ NOUVEAU: Ajouter un nouvel onglet de terminal
   */
  const addTerminal = (serverId: number, serverName: string) => {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // ✅ NOUVEAU: Ajouter l'onglet
    const newTab: TerminalTab = {
      sessionId,
      serverId,
      serverName,
      isActive: true,
    };

    setTabs(prev => [
      ...prev.map(t => ({ ...t, isActive: false })), // Désactiver les autres
      newTab, // Ajouter le nouveau (actif)
    ]);

    setActiveSessionId(sessionId);

    console.log(`[MultiTerminal] Onglet créé: ${sessionId}`);
  };

  /**
   * ✅ NOUVEAU: Fermer un onglet
   */
  const closeTerminal = (sessionId: string) => {
    console.log(`[MultiTerminal] Fermeture: ${sessionId}`);

    // ✅ NOUVEAU: Notifier le backend
    if (socketRef.current) {
      socketRef.current.emit('terminal-close', { sessionId }, (result: any) => {
        console.log('[MultiTerminal] Terminal fermé:', result);
      });
    }

    // ✅ NOUVEAU: Retirer l'onglet
    const remaining = tabs.filter(t => t.sessionId !== sessionId);
    setTabs(remaining);

    // ✅ NOUVEAU: Si c'était l'onglet actif, activer un autre
    if (activeSessionId === sessionId) {
      const newActive = remaining.length > 0 ? remaining[remaining.length - 1].sessionId : null;
      setActiveSessionId(newActive);
    }
  };

  /**
   * ✅ NOUVEAU: Changer l'onglet actif
   */
  const switchTab = (sessionId: string) => {
    setTabs(prev =>
      prev.map(t => ({
        ...t,
        isActive: t.sessionId === sessionId,
      }))
    );
    setActiveSessionId(sessionId);
  };

  return (
    <div className="multi-terminal">
      {/* ✅ NOUVEAU: Barre d'onglets */}
      <div className="terminal-tabs">
        <div className="tabs-list">
          {tabs.map(tab => (
            <div
              key={tab.sessionId}
              className={`terminal-tab ${tab.isActive ? 'active' : ''}`}
              onClick={() => switchTab(tab.sessionId)}
            >
              <span className="tab-name">{tab.serverName}</span>
              <button
                className="tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTerminal(tab.sessionId);
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* ✅ NOUVEAU: Bouton pour ajouter un onglet */}
        <div className="tabs-actions">
          <div className="dropdown-menu">
            <button className="btn-add-terminal">
              <Plus className="w-5 h-5" />
              <span>Nouveau</span>
            </button>

            <div className="dropdown-content">
              {servers.map(server => (
                <button
                  key={server.id}
                  className="dropdown-item"
                  onClick={() => addTerminal(server.id, server.name)}
                >
                  {server.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ NOUVEAU: Zone d'affichage des terminaux */}
      <div className="terminal-content">
        {tabs.length === 0 ? (
          <div className="terminal-empty">
            <p>Aucun terminal ouvert</p>
            <p className="text-small">Cliquez sur "Nouveau" pour créer un terminal</p>
          </div>
        ) : (
          tabs.map(tab => (
            <div
              key={tab.sessionId}
              className={`terminal-panel ${tab.isActive ? 'active' : ''}`}
            >
              {/* ✅ NOUVEAU: Passer le socket à l'émulateur */}
              <TerminalEmulator
                sessionId={tab.sessionId}
                serverId={tab.serverId}
                socket={socketRef.current!}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
