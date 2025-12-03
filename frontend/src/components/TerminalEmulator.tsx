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

  console.log(`[TerminalEmulator] Render: ${sessionId}`);

  // ✅ CORRIGÉ: ÉTAPE 1 - Créer le Terminal UNE SEULE FOIS au montage
  useEffect(() => {
    console.log(`[TerminalEmulator] useEffect 1: INIT TERMINAL - ${sessionId}`);

    if (!terminalRef.current) {
      console.error(`[TerminalEmulator] terminalRef.current est null!`);
      return;
    }

    try {
      // Créer le terminal
      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Courier New, monospace',
        theme: {
          background: '#0a0e1a',
          foreground: '#00ff88',
          cursor: '#00ff88',
        },
      });

      termRef.current = term;
      console.log(`[TerminalEmulator] Terminal créé: ${sessionId}`);

      // Charger les addons
      const fitAddon = new FitAddon();
      fitAddonRef.current = fitAddon;
      term.loadAddon(fitAddon);
      console.log(`[TerminalEmulator] Addons chargés: ${sessionId}`);

      // Ouvrir dans le DOM
      term.open(terminalRef.current);
      console.log(`[TerminalEmulator] Terminal ouvert dans DOM: ${sessionId}`);

      // ✅ CORRIGÉ: Attendre que le DOM soit complètement rendu AVANT fit()
      // IMPORTANT: fitAddon.fit() doit être appelé APRÈS que xterm soit dans le DOM ET visible
      setTimeout(() => {
        try {
          if (fitAddon && terminalRef.current?.offsetHeight && terminalRef.current?.offsetHeight > 0) {
            fitAddon.fit();
            console.log(`[TerminalEmulator] FitAddon appliqué: ${sessionId}`);
          } else {
            console.warn(`[TerminalEmulator] ⚠️ Dimensions non disponibles pour fitAddon: height=${terminalRef.current?.offsetHeight}`);
          }
        } catch (error) {
          console.error(`[TerminalEmulator] Erreur fitAddon (non-bloquante):`, error);
          // Ne pas crash si fitAddon échoue, le terminal marche quand même
        }
      }, 200);

      // Afficher message initial
      term.writeln(`\x1B[1;32m$ Initialisation du terminal ${sessionId}\x1B[0m`);
      term.writeln(`\x1B[0;33m$ Connexion au serveur ${serverName}...\x1B[0m`);

      return () => {
        console.log(`[TerminalEmulator] Cleanup 1: DISPOSE TERMINAL - ${sessionId}`);
        if (termRef.current) {
          try {
            termRef.current.dispose();
            console.log(`[TerminalEmulator] Terminal disposé: ${sessionId}`);
          } catch (error) {
            console.error(`[TerminalEmulator] Erreur dispose: ${sessionId}`, error);
          }
          termRef.current = null;
        }
      };
    } catch (error) {
      console.error(`[TerminalEmulator] Erreur création terminal: ${sessionId}`, error);
    }
  }, []); // ✅ VIDE! Une seule fois au montage

  // ✅ CORRIGÉ: ÉTAPE 2 - Créer la session SSH au montage
  useEffect(() => {
    console.log(`[TerminalEmulator] useEffect 2: CREATE SESSION - ${sessionId}`);

    if (!socket || !termRef.current) {
      console.warn(`[TerminalEmulator] Socket ou term manquant: ${sessionId}`, {
        socket: !!socket,
        term: !!termRef.current,
      });
      return;
    }

    // ✅ CORRIGÉ: Vérifier que le socket est connecté AVANT d'émettre!
    if (!socket.connected) {
      console.warn(`[TerminalEmulator] Socket NOT connected yet: ${sessionId}`, {
        connected: socket.connected,
        disconnected: socket.disconnected,
      });
      
      // Attendre la connexion
      socket.once('connect', () => {
        console.log(`[TerminalEmulator] Socket finalement connecté: ${sessionId}`);
        emitTerminalCreate();
      });
      
      return;
    }

    emitTerminalCreate();

    function emitTerminalCreate() {
      try {
        console.log(`[TerminalEmulator] Émission: terminal-create pour ${sessionId}`);

        socket!.emit(
          'terminal-create',
          {
            sessionId,
            serverId,
            serverName,
          },
          (result: any) => {
            console.log(`[TerminalEmulator] Callback terminal-create: ${sessionId}`, result);

            if (termRef.current) {
              if (result?.success) {
                termRef.current.writeln(`\x1B[0;32m✓ Connecté au serveur\x1B[0m`);
                if (result.currentDir) {
                  termRef.current.writeln(`\x1B[0;36m$ ${result.currentDir}\x1B[0m`);
                }
              } else {
                termRef.current.writeln(
                  `\x1B[1;31m✗ Erreur: ${result?.error || 'Erreur inconnue'}\x1B[0m`
                );
              }
            }
          }
        );
      } catch (error) {
        console.error(`[TerminalEmulator] Erreur émission terminal-create:`, error);
        if (termRef.current) {
          termRef.current.writeln(`\x1B[1;31m✗ Erreur: ${error}\x1B[0m`);
        }
      }
    }
  }, [sessionId, serverId, serverName, socket]);

  // ✅ CORRIGÉ: ÉTAPE 3 - Écouter les événements Socket.io
  useEffect(() => {
    console.log(`[TerminalEmulator] useEffect 3: SETUP LISTENERS - ${sessionId}`);

    if (!socket) {
      console.warn(`[TerminalEmulator] Socket manquant: ${sessionId}`);
      return;
    }

    // Handler pour les données du serveur
    const handleTerminalOutput = (data: any) => {
      if (data?.sessionId === sessionId && termRef.current) {
        console.log(
          `[TerminalEmulator] Reçu output: ${sessionId} - ${data.data.length} caractères`
        );
        try {
          termRef.current.write(data.data);
        } catch (error) {
          console.error(`[TerminalEmulator] Erreur write: ${sessionId}`, error);
        }
      }
    };

    // Handler pour les erreurs
    const handleTerminalError = (data: any) => {
      if (data?.sessionId === sessionId && termRef.current) {
        console.error(`[TerminalEmulator] Reçu erreur: ${sessionId}`, data);
        termRef.current.writeln(`\x1B[1;31mErreur: ${data.message}\x1B[0m`);
      }
    };

    // Handler pour la fermeture
    const handleTerminalClosed = (data: any) => {
      if (data?.sessionId === sessionId && termRef.current) {
        console.log(`[TerminalEmulator] Terminal fermé: ${sessionId}`);
        termRef.current.writeln(`\x1B[1;33m[Terminal fermé]\x1B[0m`);
      }
    };

    // ✅ CORRIGÉ: Retirer TOUS les listeners précédents pour éviter les doublons
    socket.off('terminal-output');
    socket.off('terminal-error');
    socket.off('terminal-closed');

    console.log(`[TerminalEmulator] Enregistrement listeners: ${sessionId}`);
    socket.on('terminal-output', handleTerminalOutput);
    socket.on('terminal-error', handleTerminalError);
    socket.on('terminal-closed', handleTerminalClosed);

    return () => {
      console.log(`[TerminalEmulator] Cleanup 3: REMOVE LISTENERS - ${sessionId}`);
      socket.off('terminal-output', handleTerminalOutput);
      socket.off('terminal-error', handleTerminalError);
      socket.off('terminal-closed', handleTerminalClosed);
    };
  }, [sessionId, socket]);

  // ✅ CORRIGÉ: ÉTAPE 4 - Gérer l'INPUT utilisateur (LE PLUS IMPORTANT!)
  useEffect(() => {
    console.log(`[TerminalEmulator] useEffect 4: SETUP INPUT - ${sessionId}`);

    if (!termRef.current || !socket) {
      console.warn(`[TerminalEmulator] Term ou socket manquant: ${sessionId}`, {
        term: !!termRef.current,
        socket: !!socket,
      });
      return;
    }

    // Handler pour l'input utilisateur
    const handleTerminalData = (data: string) => {
      console.log(
        `[TerminalEmulator] Input utilisateur: ${sessionId} - ${JSON.stringify(data)}`
      );

      try {
        console.log(
          `[TerminalEmulator] 📤 EMIT terminal-input: ${sessionId}`, 
          { input: data, socketConnected: socket.connected }
        );

        socket.emit('terminal-input', { sessionId, input: data }, (result: any) => {
          console.log(`[TerminalEmulator] ✅ Callback input: ${sessionId}`, result);
          if (!result?.success) {
            console.error(`[TerminalEmulator] ❌ Erreur input: ${result?.error}`);
          }
        });
      } catch (error) {
        console.error(`[TerminalEmulator] Erreur émission input: ${sessionId}`, error);
      }
    };

    console.log(`[TerminalEmulator] Enregistrement term.onData: ${sessionId}`);
    termRef.current.onData(handleTerminalData);

    return () => {
      console.log(`[TerminalEmulator] Cleanup 4: NO-OP - ${sessionId}`);
      // ✅ IMPORTANT: NE PAS nettoyer onData! Le terminal reste actif quand caché
    };
  }, [sessionId, socket]);

  // ✅ CORRIGÉ: ÉTAPE 5 - Gérer le redimensionnement
  useEffect(() => {
    console.log(`[TerminalEmulator] useEffect 5: SETUP RESIZE - ${sessionId}`);

    if (!fitAddonRef.current || !terminalRef.current) {
      console.warn(`[TerminalEmulator] Fit ou ref manquant: ${sessionId}`);
      return;
    }

    const handleWindowResize = () => {
      console.log(`[TerminalEmulator] Resize detected: ${sessionId}`);
      try {
        fitAddonRef.current?.fit();
      } catch (error) {
        console.error(`[TerminalEmulator] Erreur fit: ${sessionId}`, error);
      }
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      console.log(`[TerminalEmulator] Cleanup 5: REMOVE RESIZE - ${sessionId}`);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [sessionId]);

  return (
    <div
      ref={terminalRef}
      className="terminal-emulator"
      style={{ width: '100%', height: '100%', overflow: 'hidden' }}
    />
  );
}
