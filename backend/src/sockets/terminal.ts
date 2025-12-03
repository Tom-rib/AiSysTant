import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { TerminalSessionManager } from '../services/TerminalSessionManager';
import { SSHService } from '../services/SSHService';

// ✅ NOUVEAU: Setup des sockets pour le terminal
export function setupTerminalSockets(io: SocketIOServer) {
  // ✅ NOUVEAU: Nettoyage périodique des sessions inactives
  setInterval(() => {
    console.log('[Socket] Nettoyage sessions inactives...');
    TerminalSessionManager.closeInactiveSessions();
  }, 60 * 1000); // Toutes les minutes

  // ✅ CORRIGÉ: UN SEUL io.on('connection') qui FUSIONNE tout!
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] ✅ CONNECT: ${socket.id}`);

    // ✅ CORRIGÉ: Authentification robuste
    let finalUserId: number | null = null;
    const token = (socket.handshake.auth as any)?.token;
    const userId = (socket.handshake.auth as any)?.userId;

    // Essayer le userId direct
    if (userId) {
      finalUserId = parseInt(userId);
    }
    // Sinon décoder le token
    else if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        finalUserId = decoded.id;
        console.log(`[Socket] ✅ UserId décodé du token: ${finalUserId}`);
      } catch (error) {
        console.error(`[Socket] ❌ Erreur décodage token:`, error);
      }
    }

    console.log(`[Socket] Auth: userId=${finalUserId}, token=${!!token}`);

    /**
     * ✅ EVENTS CHAT (du ancien server.ts)
     */
    socket.on('join_conversation', (conversationId: number) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`[Socket] Client ${socket.id} a rejoint la conversation ${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId: number) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`[Socket] Client ${socket.id} a quitté la conversation ${conversationId}`);
    });

    socket.on('new_message', (data: { conversationId: number; message: any }) => {
      io.to(`conversation_${data.conversationId}`).emit('message_received', data.message);
    });

    socket.on('typing', (data: { conversationId: number; username: string }) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_typing', data);
    });

    socket.on('stop_typing', (data: { conversationId: number }) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_stop_typing', data);
    });

    /**
     * ✅ EVENTS SSH LEGACY (du ancien server.ts)
     */
    socket.on('ssh_command', async (data: { serverId: string; command: string }) => {
      if (!finalUserId) {
        socket.emit('ssh_error', {
          serverId: data.serverId,
          error: 'Non authentifié'
        });
        return;
      }

      try {
        const serverId = parseInt(data.serverId);
        console.log(`[Socket] 🔧 Exécution commande SSH sur serveur ${serverId}: ${data.command}`);
        
        const result = await SSHService.executeCommand(serverId, data.command, finalUserId);
        
        socket.emit('ssh_output', {
          serverId: data.serverId,
          output: result.output
        });

        if (result.exitCode !== 0) {
          socket.emit('ssh_error', {
            serverId: data.serverId,
            error: result.error || 'Commande échouée'
          });
        }
      } catch (error: any) {
        console.error('[Socket] ❌ Erreur SSH:', error);
        socket.emit('ssh_error', {
          serverId: data.serverId,
          error: error.message
        });
      }
    });

    socket.on('ssh_connect', async (data: { serverId: string }) => {
      if (!finalUserId) {
        socket.emit('ssh_error', {
          serverId: data.serverId,
          error: 'Non authentifié'
        });
        return;
      }

      try {
        const serverId = parseInt(data.serverId);
        console.log(`[Socket] 🔌 Connexion SSH au serveur ${serverId}`);
        
        const result = await SSHService.connect(serverId);
        
        if (result.success) {
          socket.emit('ssh_connected', {
            serverId: data.serverId
          });
        } else {
          socket.emit('ssh_error', {
            serverId: data.serverId,
            error: result.message
          });
        }
      } catch (error: any) {
        console.error('[Socket] ❌ Erreur connexion SSH:', error);
        socket.emit('ssh_error', {
          serverId: data.serverId,
          error: error.message
        });
      }
    });

    socket.on('ssh_disconnect', async (data: { serverId: string }) => {
      try {
        const serverId = parseInt(data.serverId);
        console.log(`[Socket] 🔌 Déconnexion SSH du serveur ${serverId}`);
        
        await SSHService.disconnect(serverId);
        
        socket.emit('ssh_disconnected', {
          serverId: data.serverId
        });
      } catch (error: any) {
        console.error('[Socket] ❌ Erreur déconnexion SSH:', error);
      }
    });

    /**
     * ✅ EVENTS TERMINAL (nouveau)
     */
    socket.on('terminal-create', async (data: any, callback: any) => {
      try {
        const { sessionId, serverId, serverName } = data;

        console.log(`[Socket] 📡 terminal-create: ${sessionId}`, {
          serverId,
          serverName,
          socketId: socket.id,
        });

        if (!finalUserId) {
          return callback({ success: false, error: 'Non authentifié' });
        }

        // Vérifier l'accès au serveur
        const server = await SSHService.getServerById(serverId);
        if (!server) {
          console.error(`[Socket] ❌ Serveur non trouvé: ${serverId}`);
          return callback({ success: false, error: 'Serveur non trouvé' });
        }

        if (server.user_id !== finalUserId) {
          console.error(`[Socket] ❌ Accès refusé pour user ${finalUserId} au serveur ${serverId}`);
          return callback({ success: false, error: 'Accès refusé' });
        }

        // Créer la session
        console.log(`[Socket] 🔌 Création session SSH: ${sessionId}`);
        const result = await TerminalSessionManager.createSession(
          sessionId,
          socket.id,
          serverId,
          finalUserId,
          serverName
        );

        console.log(`[Socket] 📝 Résultat création: ${sessionId}`, result);

        // Si succès, écouter les données du stream
        if (result.success) {
          const session = TerminalSessionManager.getSession(sessionId);
          if (session) {
            console.log(`[Socket] 👂 Écoute stream: ${sessionId}`);

            session.stream.on('data', (data: Buffer) => {
              console.log(
                `[Socket] 📤 Envoi output: ${sessionId} - ${data.length} bytes`
              );
              socket.emit('terminal-output', {
                sessionId,
                data: data.toString(),
              });
            });

            session.stream.on('error', (error: any) => {
              console.error(`[Socket] ⚠️ Erreur stream: ${sessionId}`, error);
              socket.emit('terminal-error', {
                sessionId,
                message: error.message,
              });
            });

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
     * ✅ DISCONNECT
     */
    socket.on('disconnect', () => {
      console.log(`[Socket] 👋 DISCONNECT: ${socket.id}`);
    });
  });

  console.log('[Socket] ✅ Terminal sockets initialisés');
}
