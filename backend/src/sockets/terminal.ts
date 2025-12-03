import { Server as SocketIOServer, Socket } from 'socket.io';
import { TerminalSessionManager } from '../services/TerminalSessionManager';
import { SSHService } from '../services/SSHService';

// ✅ NOUVEAU: Setup des sockets pour le terminal
export function setupTerminalSockets(io: SocketIOServer) {
  // ✅ NOUVEAU: Nettoyage périodique des sessions inactives
  setInterval(() => {
    TerminalSessionManager.closeInactiveSessions();
  }, 60 * 1000); // Toutes les minutes

  io.on('connection', (socket: Socket) => {
    const userId = (socket.handshake.auth as any).userId;
    console.log(`[Socket] Connecté: ${socket.id} (user: ${userId})`);

    /**
     * ✅ NOUVEAU: Créer une nouvelle session de terminal
     */
    socket.on('terminal-create', async (data: any, callback: any) => {
      try {
        const { sessionId, serverId, serverName } = data;

        console.log(`[Socket] Création terminal: ${sessionId} (socket: ${socket.id})`);

        // ✅ NOUVEAU: Vérifier l'accès au serveur
        const server = await SSHService.getServerById(serverId);
        if (!server || server.user_id !== userId) {
          return callback({ success: false, error: 'Accès refusé' });
        }

        // ✅ NOUVEAU: Créer la session
        const result = await TerminalSessionManager.createSession(
          sessionId,
          socket.id,
          serverId,
          userId,
          serverName
        );

        // ✅ NOUVEAU: Si succès, écouter les données du stream
        if (result.success) {
          const session = TerminalSessionManager.getSession(sessionId);
          if (session) {
            // ✅ NOUVEAU: Envoyer les données UNIQUEMENT à ce client
            session.stream.on('data', (data: Buffer) => {
              socket.emit('terminal-output', {
                sessionId,
                data: data.toString(),
              });
            });
          }
        }

        callback(result);
      } catch (error: any) {
        console.error(`[Socket] Erreur création terminal:`, error);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * ✅ NOUVEAU: Envoyer l'input utilisateur au terminal
     */
    socket.on('terminal-input', async (data: any, callback: any) => {
      try {
        const { sessionId, input } = data;

        const success = await TerminalSessionManager.sendInput(sessionId, input);
        callback({ success });
      } catch (error: any) {
        console.error(`[Socket] Erreur input terminal:`, error);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * ✅ NOUVEAU: Fermer une session de terminal
     */
    socket.on('terminal-close', async (data: any, callback: any) => {
      try {
        const { sessionId } = data;

        console.log(`[Socket] Fermeture terminal: ${sessionId}`);

        await TerminalSessionManager.closeSession(sessionId);
        callback({ success: true });
      } catch (error: any) {
        console.error(`[Socket] Erreur fermeture terminal:`, error);
        callback({ success: false, error: error.message });
      }
    });

    /**
     * ✅ NOUVEAU: Obtenir les stats des sessions
     */
    socket.on('terminal-stats', (callback: any) => {
      try {
        const stats = TerminalSessionManager.getStats();
        callback({ success: true, data: stats });
      } catch (error: any) {
        callback({ success: false, error: error.message });
      }
    });

    /**
     * ✅ NOUVEAU: Déconnexion du socket
     */
    socket.on('disconnect', () => {
      console.log(`[Socket] Déconnecté: ${socket.id}`);
      // ✅ NOUVEAU: Les sessions restent ouvertes (utiliser le timeout)
    });
  });

  console.log('[Socket] Terminal sockets initialisés');
}
