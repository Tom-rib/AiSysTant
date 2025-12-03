import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { Socket } from 'socket.io-client';
import 'xterm/css/xterm.css';

// ✅ CORRIGÉ: Props pour l'émulateur
interface TerminalEmulatorProps {
  sessionId: string;
  serverId: number;
  serverName: string;
  socket: Socket;
}

export default function TerminalEmulator({
  sessionId,
  serverId,
  serverName,
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

    // ✅ CORRIGÉ: Créer la session SSH côté backend avec le bon serverName
    socket.emit(
      'terminal-create',
      {
        sessionId,
        serverId,
        serverName,
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

    // ✅ CORRIGÉ: Écouter les données du serveur UNIQUEMENT pour cette session
    const handleTerminalOutput = (data: any) => {
      if (data.sessionId === sessionId && term) {
        term.write(data.data);
      }
    };

    // ✅ CORRIGÉ: Enregistrer le listener avec namespace pour cette session
    socket.on(`terminal-output-${sessionId}`, handleTerminalOutput);

    // ✅ CORRIGÉ: Envoyer l'input de l'utilisateur avec callback
    const handleDataInput = (data: string) => {
      socket.emit('terminal-input', {
        sessionId,
        input: data,
      }, (result: any) => {
        if (!result?.success) {
          console.error('[TerminalEmulator] Erreur input:', result?.error);
        }
      });
    };

    term.onData(handleDataInput);

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

      // ✅ CORRIGÉ: Arrêter d'écouter les événements avec le bon namespace
      socket.off(`terminal-output-${sessionId}`, handleTerminalOutput);

      // ✅ CORRIGÉ: Supprimer le listener de redimensionnement
      window.removeEventListener('resize', handleResize);

      // ✅ CORRIGÉ: Disposer du terminal AVANT de quitter
      if (termRef.current) {
        try {
          termRef.current.dispose();
        } catch (error) {
          console.error('[TerminalEmulator] Erreur dispose:', error);
        }
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
