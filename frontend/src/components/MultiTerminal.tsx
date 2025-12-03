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

  // ✅ CORRIGÉ: Initialiser le socket UNE SEULE FOIS (avec useCallback pour l'authentification)
  useEffect(() => {
    console.log('[MultiTerminal] useEffect: Initialisation Socket.io');
    
    if (socketRef.current) {
      console.log('[MultiTerminal] Socket déjà initialisé, skip');
      return;
    }

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    console.log('[MultiTerminal] Création Socket.io avec auth:', { token: !!token, userId });
    console.log('[MultiTerminal] localStorage contents:', { 
      token: token ? token.substring(0, 20) + '...' : null, 
      userId 
    });

    // ✅ CORRIGÉ: UN SEUL socket pour tous les onglets!
    socketRef.current = io(window.location.origin, {
      auth: { token, userId },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    console.log('[MultiTerminal] Socket créé (mais pas encore connecté)');

    socketRef.current.on('connect', () => {
      console.log('[MultiTerminal] ✅ Socket CONNECTÉ:', socketRef.current?.id);
    });

    socketRef.current.on('connect_error', (error: any) => {
      console.error('[MultiTerminal] ❌ Socket CONNECT ERROR:', error);
    });

    socketRef.current.on('disconnect', () => {
      console.log('[MultiTerminal] Socket déconnecté');
    });

    socketRef.current.on('error', (error: any) => {
      console.error('[MultiTerminal] Socket erreur:', error);
    });

    // Cleanup: déconnecter au unmount du composant
    return () => {
      console.log('[MultiTerminal] Cleanup: Fermeture Socket.io');
      // ✅ CORRIGÉ: NE PAS fermer le socket ici! Il continuera à fonctionner
    };
  }, []); // Vide! Une seule fois!

  /**
   * ✅ NOUVEAU: Ajouter un nouvel onglet de terminal
   */
  const addTerminal = (serverId: number, serverName: string) => {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log(`[MultiTerminal] addTerminal: ${sessionId} - ${serverName}`);

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
    console.log(`[MultiTerminal] closeTerminal: ${sessionId}`);

    // ✅ NOUVEAU: Notifier le backend
    if (socketRef.current) {
      socketRef.current.emit('close-terminal', { sessionId }, (result: any) => {
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
    console.log(`[MultiTerminal] switchTab: ${sessionId}`);
    
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
            // ✅ CORRIGÉ: Garder le composant en DOM avec display: none (pas de démontage!)
            <div
              key={tab.sessionId}
              className="terminal-panel"
              style={{ 
                display: tab.isActive ? 'flex' : 'none',
                flexDirection: 'column',
              }}
            >
              {/* ✅ CORRIGÉ: Passer le socket global et le serverName */}
              {socketRef.current && (
                <TerminalEmulator
                  sessionId={tab.sessionId}
                  serverId={tab.serverId}
                  serverName={tab.serverName}
                  socket={socketRef.current}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
