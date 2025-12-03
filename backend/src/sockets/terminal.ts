import { Server as SocketIOServer, Socket } from 'socket.io';
import { TerminalSessionManager } from '../services/TerminalSessionManager';
import { SSHService } from '../services/SSHService';

// ✅ NOUVEAU: Setup des sockets pour le terminal
export function setupTerminalSockets(io: SocketIOServer) {
  // ✅ NOUVEAU: Nettoyage périodique des sessions inactives
  setInterval(() => {
    console.log('[Socket] Nettoyage sessions inactives...');
    TerminalSessionManager.closeInactiveSessions();
  }, 60 * 1000); // Toutes les minutes

  io.on('connection', (socket: Socket) => {
    const userId = (socket.handshake.auth as any).userId;
    console.log(`[Socket] ✅ CONNECT: ${socket.id} (user: ${userId})`);

    /**
     * ✅ NOUVEAU: Créer une nouvelle session de terminal
     */
    socket.on('terminal-create', async (data: any, callback: any) => {
      try {
        const { sessionId, serverId, serverName } = data;

        console.log(`[Socket] 📡 terminal-create: ${sessionId}`, {
          serverId,
          serverName,
          socketId: socket.id,
        });

        // ✅ NOUVEAU: Vérifier l'accès au serveur
        const server = await SSHService.getServerById(serverId);
        if (!server) {
          console.error(`[Socket] ❌ Serveur non trouvé: ${serverId}`);
          return callback({ success: false, error: 'Serveur non trouvé' });
        }

        if (server.user_id !== userId) {
          console.error(`[Socket] ❌ Accès refusé pour user ${userId} au serveur ${serverId}`);
          return callback({ success: false, error: 'Accès refusé' });
        }

        // ✅ NOUVEAU: Créer la session
        console.log(`[Socket] 🔌 Création session SSH: ${sessionId}`);
        const result = await TerminalSessionManager.createSession(
          sessionId,
          socket.id,
          serverId,
          userId,
          serverName
        );

        console.log(`[Socket] 📝 Résultat création: ${sessionId}`, result);

        // ✅ NOUVEAU: Si succès, écouter les données du stream
        if (result.success) {
          const session = TerminalSessionManager.getSession(sessionId);
          if (session) {
            console.log(`[Socket] 👂 Écoute stream: ${sessionId}`);

            // ✅ CORRIGÉ: Envoyer sur le channel GLOBAL 'terminal-output'
            session.stream.on('data', (data: Buffer) => {
              console.log(
                `[Socket] 📤 Envoi output: ${sessionId} - ${data.length} bytes`
              );
              socket.emit('terminal-output', {
                sessionId,
                data: data.toString(),
              });
            });

            // Écouter les erreurs
            session.stream.on('error', (error: any) => {
              console.error(`[Socket] ⚠️ Erreur stream: ${sessionId}`, error);
              socket.emit('terminal-error', {
                sessionId,
                message: error.message,
              });
            });

            // Écouter la fermeture
            session.stream.on('close', () => {
              console.log(`[Socket] 🔌 Stream fermé: ${sessionId}`);
              socket.emit('terminal-closed', { sessionId });
            });
          }
        }

        callback(result);
      } catch (error: any) {
        console.error(`[Socket] ❌ Erreur terminal-create:`, error);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * ✅ NOUVEAU: Envoyer l'input utilisateur au terminal
     */
    socket.on('terminal-input', async (data: any, callback: any) => {
      try {
        const { sessionId, input } = data;

        console.log(`[Socket] ⌨️ terminal-input reçu: ${sessionId} - ${JSON.stringify(input)}`);

        const success = await TerminalSessionManager.sendInput(sessionId, input);

        console.log(`[Socket] ✅ Input envoyé: ${sessionId} - success: ${success}`);

        if (callback) {
          callback({ success });
        }
      } catch (error: any) {
        console.error(`[Socket] ❌ Erreur terminal-input:`, error);
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    });

    /**
     * ✅ NOUVEAU: Fermer une session de terminal
     */
    socket.on('close-terminal', async (data: any, callback: any) => {
      try {
        const { sessionId } = data;

        console.log(`[Socket] 🔌 close-terminal: ${sessionId}`);

        await TerminalSessionManager.closeSession(sessionId);

        console.log(`[Socket] ✅ Terminal fermé: ${sessionId}`);

        if (callback) {
          callback({ success: true });
        }
      } catch (error: any) {
        console.error(`[Socket] ❌ Erreur close-terminal:`, error);
        if (callback) {
          callback({ success: false, error: error.message });
        }
      }
    });

    /**
     * ✅ NOUVEAU: Obtenir les stats des sessions
     */
    socket.on('terminal-stats', (callback: any) => {
      try {
        const stats = TerminalSessionManager.getStats();
        console.log(`[Socket] 📊 Stats: ${JSON.stringify(stats)}`);
        callback({ success: true, data: stats });
      } catch (error: any) {
        console.error(`[Socket] ❌ Erreur terminal-stats:`, error);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * ✅ NOUVEAU: Déconnexion du socket
     */
    socket.on('disconnect', () => {
      console.log(`[Socket] 👋 DISCONNECT: ${socket.id}`);
      // ✅ NOUVEAU: Les sessions restent ouvertes (utiliser le timeout)
    });
  });

  console.log('[Socket] ✅ Terminal sockets initialisés');
}
