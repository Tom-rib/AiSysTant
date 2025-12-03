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

  // ✅ CORRIGÉ: Créer le terminal UNE SEULE FOIS au montage
  useEffect(() => {
    if (!terminalRef.current) return;

    console.log(`[TerminalEmulator] Mount: ${sessionId}`);

    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#0a0e1a',
        foreground: '#00ff88',
      },
    });

    termRef.current = term;

    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    term.writeln(`\x1B[1;32m$ Terminal ${sessionId}\x1B[0m`);

    // ✅ CORRIGÉ: Nettoyer UNIQUEMENT le terminal au unmount
    return () => {
      console.log(`[TerminalEmulator] Unmount: ${sessionId}`);
      if (termRef.current) {
        try {
          termRef.current.dispose();
        } catch (error) {
          console.error('[TerminalEmulator] Erreur dispose:', error);
        }
        termRef.current = null;
      }
    };
  }, []); // Vide! Une seule fois!

  // ✅ CORRIGÉ: Créer la session SSH au montage
  useEffect(() => {
    if (!socket || !termRef.current) return;

    console.log(`[TerminalEmulator] Create session: ${sessionId}`);

    socket.emit(
      'terminal-create',
      {
        sessionId,
        serverId,
        serverName,
      },
      (result: any) => {
        if (termRef.current) {
          if (result?.success) {
            console.log(`[TerminalEmulator] Session créée: ${sessionId}`);
            termRef.current.writeln(`\x1B[0;32mConnecté - ${result.currentDir}\x1B[0m`);
          } else {
            console.error(`[TerminalEmulator] Erreur:`, result);
            termRef.current.writeln(`\x1B[1;31mErreur: ${result?.error || 'Inconnu'}\x1B[0m`);
          }
        }
      }
    );

    // ✅ CORRIGÉ: Écouter les données GLOBALES (pas de cleanup!)
    const handleTerminalOutput = (data: any) => {
      if (data.sessionId === sessionId && termRef.current) {
        console.log(`[TerminalEmulator] Output: ${sessionId} - ${data.data.length} chars`);
        termRef.current.write(data.data);
      }
    };

    socket.on('terminal-output', handleTerminalOutput);

    // ✅ CORRIGÉ: Pas de cleanup des listeners!
    return () => {
      // Ne PAS supprimer le listener!
    };
  }, [sessionId, serverId, serverName, socket]);

  // ✅ CORRIGÉ: Input séparé
  useEffect(() => {
    if (!termRef.current || !socket) return;

    console.log(`[TerminalEmulator] Setup input: ${sessionId}`);

    const handleDataInput = (data: string) => {
      console.log(`[TerminalEmulator] User input: ${JSON.stringify(data)}`);
      socket.emit('terminal-input', { sessionId, input: data });
    };

    termRef.current.onData(handleDataInput);

    // ✅ CORRIGÉ: Pas de cleanup!
    return () => {};
  }, [sessionId, socket]);

  // ✅ CORRIGÉ: Resize
  useEffect(() => {
    if (!fitAddonRef.current) return;

    const handleResize = () => {
      try {
        fitAddonRef.current?.fit();
      } catch (error) {
        console.error('[TerminalEmulator] Erreur resize:', error);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      ref={terminalRef}
      className="terminal-emulator"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
