import { NodeSSH } from 'node-ssh';
import { SSHService } from './SSHService';

// ✅ NOUVEAU: Interface pour une session de terminal isolée
interface TerminalSession {
  sessionId: string;
  socketId: string;
  userId: number;
  serverId: number;
  serverName: string;
  client: NodeSSH;
  stream: any;
  currentDir: string;
  createdAt: Date;
  lastActivity: Date;
}

export class TerminalSessionManager {
  // ✅ NOUVEAU: Map des sessions par sessionId
  private static sessions: Map<string, TerminalSession> = new Map();
  // ✅ NOUVEAU: Map inverse socketId → sessionId pour lookup rapide
  private static socketToSession: Map<string, string> = new Map();
  // ✅ NOUVEAU: Timeout d'inactivité (30 minutes)
  private static SESSION_TIMEOUT = 30 * 60 * 1000;

  /**
   * ✅ NOUVEAU: Créer une NEW session SSH isolée
   */
  static async createSession(
    sessionId: string,
    socketId: string,
    serverId: number,
    userId: number,
    serverName: string
  ): Promise<{ success: boolean; error?: string; currentDir?: string }> {
    try {
      // ✅ NOUVEAU: Vérifier que la session n'existe pas déjà
      if (this.sessions.has(sessionId)) {
        return { success: false, error: 'Session déjà ouverte' };
      }

      console.log(`[TerminalSession] Création: ${sessionId} (${socketId}) serveur ${serverId}`);

      // ✅ NOUVEAU: Récupérer les infos du serveur
      const server = await SSHService.getServerById(serverId);
      if (!server) {
        return { success: false, error: 'Serveur introuvable' };
      }

      // ✅ NOUVEAU: Créer une NOUVELLE connexion SSH (100% isolée)
      const client = new NodeSSH();
      const config: any = {
        host: server.host,
        port: server.port,
        username: server.username,
      };

      if (server.password) {
        config.password = server.password;
      } else if (server.private_key) {
        config.privateKey = server.private_key;
      } else {
        return { success: false, error: 'Pas d\'authentification' };
      }

      // ✅ NOUVEAU: Se connecter
      await client.connect(config);
      console.log(`[TerminalSession] Connecté: ${sessionId}`);

      // ✅ NOUVEAU: Ouvrir un shell interactif
      let stream: any;
      try {
        stream = await client.requestShell();
      } catch (error: any) {
        client.dispose();
        return { success: false, error: `Shell impossible: ${error.message}` };
      }

      // ✅ NOUVEAU: Initialiser le shell
      stream.write('export PS1=""\n');
      stream.write('export PS2=""\n');

      // ✅ NOUVEAU: Créer la session
      const session: TerminalSession = {
        sessionId,
        socketId,
        userId,
        serverId,
        serverName,
        client,
        stream,
        currentDir: `/home/${server.username}`,
        createdAt: new Date(),
        lastActivity: new Date(),
      };

      // ✅ NOUVEAU: Écouter les données du shell
      stream.on('data', (data: Buffer) => {
        const text = data.toString();
        console.log(`[TerminalSession] Data reçue de ${sessionId}: ${text.length} bytes`);
        // ✅ NOUVEAU: Les données seront envoyées via Socket.io par le handler
      });

      stream.on('close', () => {
        console.log(`[TerminalSession] Shell fermé: ${sessionId}`);
        this.closeSession(sessionId);
      });

      stream.on('error', (error: Error) => {
        console.error(`[TerminalSession] Erreur stream ${sessionId}:`, error);
        this.closeSession(sessionId);
      });

      // ✅ NOUVEAU: Stocker la session
      this.sessions.set(sessionId, session);
      this.socketToSession.set(socketId, sessionId);

      // ✅ NOUVEAU: Attendre que le shell soit prêt
      await new Promise(resolve => setTimeout(resolve, 500));

      // ✅ NOUVEAU: Récupérer le répertoire initial
      try {
        const pwd = await this.executeInShell(sessionId, 'pwd');
        if (pwd) {
          session.currentDir = pwd.trim();
        }
      } catch (error) {
        console.error(`[TerminalSession] Erreur pwd initial:`, error);
      }

      console.log(`[TerminalSession] ✅ Session créée: ${sessionId}`);
      return { success: true, currentDir: session.currentDir };
    } catch (error: any) {
      console.error(`[TerminalSession] Erreur création:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ NOUVEAU: Exécuter une commande dans le shell
   */
  private static async executeInShell(sessionId: string, command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const session = this.sessions.get(sessionId);
      if (!session) {
        reject(new Error('Session non trouvée'));
        return;
      }

      const marker = `__MARKER_${Date.now()}_${Math.random()}__`;
      let buffer = '';

      const onData = (data: Buffer) => {
        buffer += data.toString();
        if (buffer.includes(marker)) {
          session.stream.removeListener('data', onData);
          clearTimeout(timeout);

          const lines = buffer.split('\n');
          const markerIdx = lines.findIndex(l => l.includes(marker));
          const result = lines.slice(0, markerIdx).join('\n');
          resolve(result);
        }
      };

      const timeout = setTimeout(() => {
        session.stream.removeListener('data', onData);
        reject(new Error('Timeout'));
      }, 5000);

      session.stream.on('data', onData);
      session.stream.write(`${command}\n`);
      session.stream.write(`echo "${marker}"\n`);
    });
  }

  /**
   * ✅ NOUVEAU: Envoyer l'input utilisateur au shell
   */
  static async sendInput(sessionId: string, data: string): Promise<boolean> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        console.error(`[TerminalSession] Session non trouvée: ${sessionId}`);
        return false;
      }

      session.stream.write(data);
      session.lastActivity = new Date();

      // ✅ NOUVEAU: Mettre à jour currentDir si c'est un cd
      if (data.trim().startsWith('cd ')) {
        try {
          const pwd = await this.executeInShell(sessionId, 'pwd');
          if (pwd) {
            session.currentDir = pwd.trim();
          }
        } catch (error) {
          console.error(`[TerminalSession] Erreur mise à jour pwd:`, error);
        }
      }

      return true;
    } catch (error: any) {
      console.error(`[TerminalSession] Erreur sendInput:`, error);
      return false;
    }
  }

  /**
   * ✅ NOUVEAU: Fermer une session
   */
  static async closeSession(sessionId: string): Promise<void> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) return;

      console.log(`[TerminalSession] Fermeture: ${sessionId}`);

      // ✅ NOUVEAU: Fermer le stream
      try {
        session.stream.end();
        session.stream.destroy();
      } catch (error) {
        console.error(`[TerminalSession] Erreur fermeture stream:`, error);
      }

      // ✅ NOUVEAU: Fermer le client SSH
      try {
        session.client.dispose();
      } catch (error) {
        console.error(`[TerminalSession] Erreur dispose SSH:`, error);
      }

      // ✅ NOUVEAU: Supprimer des Maps
      this.sessions.delete(sessionId);
      this.socketToSession.delete(session.socketId);

      console.log(`[TerminalSession] ✅ Fermée: ${sessionId}`);
    } catch (error: any) {
      console.error(`[TerminalSession] Erreur closeSession:`, error);
    }
  }

  /**
   * ✅ NOUVEAU: Fermer toutes les sessions d'un utilisateur
   */
  static async closeUserSessions(userId: number): Promise<void> {
    const toClose = Array.from(this.sessions.values())
      .filter(s => s.userId === userId)
      .map(s => s.sessionId);

    for (const sessionId of toClose) {
      await this.closeSession(sessionId);
    }

    console.log(`[TerminalSession] Fermées ${toClose.length} sessions pour user ${userId}`);
  }

  /**
   * ✅ NOUVEAU: Fermer les sessions inactives
   */
  static closeInactiveSessions(timeoutMs: number = this.SESSION_TIMEOUT): void {
    const now = Date.now();
    const toClose: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity.getTime() > timeoutMs) {
        toClose.push(sessionId);
      }
    }

    for (const sessionId of toClose) {
      console.log(`[TerminalSession] Fermeture inactive: ${sessionId}`);
      this.closeSession(sessionId);
    }
  }

  /**
   * ✅ NOUVEAU: Obtenir une session par ID
   */
  static getSession(sessionId: string): TerminalSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * ✅ NOUVEAU: Obtenir une session par socket ID
   */
  static getSessionBySocket(socketId: string): TerminalSession | undefined {
    const sessionId = this.socketToSession.get(socketId);
    return sessionId ? this.sessions.get(sessionId) : undefined;
  }

  /**
   * ✅ NOUVEAU: Obtenir les stats
   */
  static getStats() {
    return {
      totalSessions: this.sessions.size,
      sessions: Array.from(this.sessions.values()).map(s => ({
        sessionId: s.sessionId,
        socketId: s.socketId,
        userId: s.userId,
        serverId: s.serverId,
        serverName: s.serverName,
        currentDir: s.currentDir,
        age: Date.now() - s.createdAt.getTime(),
        idle: Date.now() - s.lastActivity.getTime(),
      })),
    };
  }

  /**
   * ✅ NOUVEAU: Fermer TOUTES les sessions
   */
  static async closeAllSessions(): Promise<void> {
    const sessionIds = Array.from(this.sessions.keys());
    for (const sessionId of sessionIds) {
      await this.closeSession(sessionId);
    }
    console.log(`[TerminalSession] Toutes les sessions fermées`);
  }
}

// ✅ NOUVEAU: Cleanup au shutdown
process.on('exit', () => {
  TerminalSessionManager.closeAllSessions();
});

process.on('SIGINT', () => {
  TerminalSessionManager.closeAllSessions();
  process.exit(0);
});

process.on('SIGTERM', () => {
  TerminalSessionManager.closeAllSessions();
  process.exit(0);
});
