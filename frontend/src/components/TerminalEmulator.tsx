import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { Socket } from 'socket.io-client';
import 'xterm/css/xterm.css';

// ✅ NOUVEAU: Props pour l'émulateur
interface TerminalEmulatorProps {
  sessionId: string;
  serverId: number;
  socket: Socket;
}

export default function TerminalEmulator({
  sessionId,
  serverId,
  socket,
}: TerminalEmulatorProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current || !socket) return;

    console.log(`[TerminalEmulator] Initialisation: ${sessionId}`);

    // ✅ NOUVEAU: Créer une INSTANCE xterm isolée pour cette session
    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#0a0e1a',
        foreground: '#00ff88',
      },
    });

    termRef.current = term;

    // ✅ NOUVEAU: Ajouter le plugin de redimensionnement
    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    term.loadAddon(fitAddon);

    // ✅ NOUVEAU: Ouvrir le terminal dans le DOM
    term.open(terminalRef.current);
    fitAddon.fit();

    // ✅ NOUVEAU: Afficher un message initial
    term.writeln(`\x1B[1;32m$ Terminal connecté (${sessionId})\x1B[0m`);

    // ✅ NOUVEAU: Créer la session SSH côté backend
    socket.emit(
      'terminal-create',
      {
        sessionId,
        serverId,
        serverName: 'Server',
      },
      (result: any) => {
        if (result.success) {
          console.log(`[TerminalEmulator] Session créée: ${sessionId}`);
          term.writeln(`\x1B[0;32mConnecté au serveur (${result.currentDir})\x1B[0m`);
        } else {
          term.writeln(`\x1B[1;31mErreur: ${result.error}\x1B[0m`);
        }
      }
    );

    // ✅ NOUVEAU: Écouter les données du serveur
    // Important: chaque émulateur écoute SEULEMENT ses propres données (via sessionId)
    const handleTerminalOutput = (data: any) => {
      if (data.sessionId === sessionId) {
        term.write(data.data);
      }
    };

    socket.on('terminal-output', handleTerminalOutput);

    // ✅ NOUVEAU: Envoyer l'input de l'utilisateur
    // Important: inclure sessionId pour isolation
    term.onData(data => {
      socket.emit('terminal-input', {
        sessionId,
        input: data,
      });
    });

    // ✅ NOUVEAU: Redimensionner au changement de fenêtre
    const handleResize = () => {
      if (fitAddonRef.current && terminalRef.current) {
        fitAddonRef.current.fit();
      }
    };

    window.addEventListener('resize', handleResize);

    // ✅ NOUVEAU: Cleanup
    return () => {
      console.log(`[TerminalEmulator] Cleanup: ${sessionId}`);

      // ✅ NOUVEAU: Arrêter d'écouter les événements
      socket.off('terminal-output', handleTerminalOutput);

      // ✅ NOUVEAU: Supprimer le listener de redimensionnement
      window.removeEventListener('resize', handleResize);

      // ✅ NOUVEAU: Disposer du terminal (NE PAS fermer le socket!)
      if (termRef.current) {
        termRef.current.dispose();
        termRef.current = null;
      }

      // ✅ NOUVEAU: Le socket reste ouvert pour les autres onglets
    };
  }, [sessionId, serverId, socket]);

  return (
    <div
      ref={terminalRef}
      className="terminal-emulator"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
