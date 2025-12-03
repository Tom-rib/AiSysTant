import { NodeSSH } from 'node-ssh';
import { SSHService } from './SSHService';

// ✅ NOUVEAU: Interface pour une session shell persistante
interface PersistentShellSession {
  client: NodeSSH;
  channel: any;
  currentDir: string;
  buffer: string;
  busy: boolean;
  createdAt: number;
  lastActivity: number;
}

// ✅ NOUVEAU: Interface pour la réponse d'exécution
interface ShellCommandResult {
  success: boolean;
  output: string;
  cwd: string;
  error?: string;
  code?: number;
}

export class PersistentShellManager {
  // ✅ NOUVEAU: Map des sessions shell persistantes par serverId
  private static sessions: Map<string, PersistentShellSession> = new Map();
  // ✅ NOUVEAU: Timeout avant fermeture (30 minutes)
  private static SHELL_TIMEOUT = 30 * 60 * 1000;
  // ✅ NOUVEAU: Timeout pour attendre une réponse de commande
  private static COMMAND_TIMEOUT = 5000;

  /**
   * ✅ NOUVEAU: Obtenir ou créer une session shell persistante
   */
  static async getOrCreateSession(
    serverId: number,
    userId: number
  ): Promise<PersistentShellSession> {
    const key = `${userId}:${serverId}`;
    const now = Date.now();

    // ✅ NOUVEAU: Vérifier si session existe et est valide
    const existing = this.sessions.get(key);
    if (existing && !existing.channel.destroyed && now - existing.lastActivity < this.SHELL_TIMEOUT) {
      console.log(`[PersistentShell] Réutilisation de la session ${key}`);
      existing.lastActivity = now;
      return existing;
    }

    // ✅ NOUVEAU: Fermer l'ancienne session si elle existe
    if (existing) {
      console.log(`[PersistentShell] Fermeture de l'ancienne session ${key}`);
      try {
        existing.channel.close();
        existing.client.dispose();
      } catch (error) {
        console.error(`[PersistentShell] Erreur lors de la fermeture:`, error);
      }
      this.sessions.delete(key);
    }

    // ✅ NOUVEAU: Créer une nouvelle session
    console.log(`[PersistentShell] Création d'une nouvelle session ${key}`);
    const server = await SSHService.getServerById(serverId);
    if (!server) {
      throw new Error('Serveur introuvable');
    }

    // ✅ NOUVEAU: Créer le client SSH
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
      throw new Error('Aucune méthode d\'authentification');
    }

    // ✅ NOUVEAU: Se connecter
    await client.connect(config);
    console.log(`[PersistentShell] Connecté à ${key}`);

    // ✅ NOUVEAU: Ouvrir un shell interactif PERSISTANT
    let channel: any;
    try {
      channel = await client.requestShell();
    } catch (error: any) {
      client.dispose();
      throw new Error(`Impossible d'ouvrir le shell: ${error.message}`);
    }

    // ✅ NOUVEAU: Créer la session
    const session: PersistentShellSession = {
      client,
      channel,
      currentDir: `/home/${server.username}`,
      buffer: '',
      busy: false,
      createdAt: now,
      lastActivity: now,
    };

    // ✅ NOUVEAU: Écouter les données du shell
    channel.on('data', (data: Buffer) => {
      const text = data.toString();
      session.buffer += text;
      console.log(`[PersistentShell] Buffer reçu (${session.buffer.length} chars)`);
    });

    channel.on('close', () => {
      console.log(`[PersistentShell] Shell fermé pour ${key}`);
      this.sessions.delete(key);
    });

    channel.on('error', (error: Error) => {
      console.error(`[PersistentShell] Erreur du shell ${key}:`, error);
      this.sessions.delete(key);
    });

    // ✅ NOUVEAU: Initialiser le shell en envoyant un prompt
    channel.write('export PS1=""\n');
    channel.write('export PS2=""\n');
    
    // ✅ NOUVEAU: Attendre que le shell soit prêt
    await this.waitForShellReady(session);

    // ✅ NOUVEAU: Récupérer le répertoire initial
    try {
      const pwdResult = await this.executeCommandInternal(session, 'pwd');
      if (pwdResult.success) {
        session.currentDir = pwdResult.output.trim();
      }
    } catch (error) {
      console.error(`[PersistentShell] Erreur lors de l'initialisation du pwd:`, error);
    }

    // ✅ NOUVEAU: Stocker la session
    this.sessions.set(key, session);
    return session;
  }

  /**
   * ✅ NOUVEAU: Attendre que le shell soit prêt
   */
  private static async waitForShellReady(session: PersistentShellSession): Promise<void> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(), 500);
      session.buffer = ''; // Vider le buffer initial
    });
  }

  /**
   * ✅ NOUVEAU: Exécuter une commande interne (sans tracer dans le buffer utilisateur)
   */
  private static async executeCommandInternal(
    session: PersistentShellSession,
    command: string
  ): Promise<ShellCommandResult> {
    return this.sendCommand(session, command);
  }

  /**
   * ✅ NOUVEAU: Envoyer une commande au shell et attendre la réponse
   */
  private static async sendCommand(
    session: PersistentShellSession,
    command: string
  ): Promise<ShellCommandResult> {
    // ✅ NOUVEAU: Attendre que la session soit libre
    await this.waitForSessionReady(session);

    // ✅ NOUVEAU: Marquer comme occupée
    session.busy = true;
    session.buffer = '';

    try {
      // ✅ NOUVEAU: Envoyer un marqueur de début
      const marker = `__START_${Date.now()}__`;
      const endMarker = `__END_${Date.now()}__`;

      // ✅ NOUVEAU: Envoyer la commande avec marqueurs
      session.channel.write(`echo "${marker}"\n`);
      session.channel.write(`${command}\n`);
      session.channel.write(`echo "${endMarker}"\n`);

      // ✅ NOUVEAU: Attendre la réponse
      const output = await this.waitForMarker(session, marker, endMarker);

      return {
        success: true,
        output,
        cwd: session.currentDir,
      };
    } catch (error: any) {
      console.error(`[PersistentShell] Erreur lors de l'exécution de la commande:`, error);
      return {
        success: false,
        output: '',
        cwd: session.currentDir,
        error: error.message,
      };
    } finally {
      session.busy = false;
    }
  }

  /**
   * ✅ NOUVEAU: Attendre que la session soit prête
   */
  private static async waitForSessionReady(session: PersistentShellSession): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!session.busy) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 10);

      // ✅ NOUVEAU: Timeout de sécurité
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 1000);
    });
  }

  /**
   * ✅ NOUVEAU: Attendre les marqueurs de début et fin
   */
  private static async waitForMarker(
    session: PersistentShellSession,
    startMarker: string,
    endMarker: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let foundStart = false;
      let output = '';

      const checkBuffer = () => {
        if (!foundStart && session.buffer.includes(startMarker)) {
          foundStart = true;
          const startIdx = session.buffer.indexOf(startMarker) + startMarker.length;
          session.buffer = session.buffer.substring(startIdx);
        }

        if (foundStart && session.buffer.includes(endMarker)) {
          const endIdx = session.buffer.indexOf(endMarker);
          output = session.buffer.substring(0, endIdx).trim();
          clearInterval(timer);
          resolve(output);
        }
      };

      const timer = setInterval(checkBuffer, 50);

      // ✅ NOUVEAU: Timeout
      setTimeout(() => {
        clearInterval(timer);
        if (foundStart) {
          resolve(output);
        } else {
          reject(new Error('Timeout en attendant la réponse du shell'));
        }
      }, this.COMMAND_TIMEOUT);
    });
  }

  /**
   * ✅ NOUVEAU: Exécuter une commande dans la session persistante
   */
  static async executeCommand(
    serverId: number,
    userId: number,
    command: string
  ): Promise<ShellCommandResult> {
    try {
      const session = await this.getOrCreateSession(serverId, userId);

      console.log(`[PersistentShell] Exécution: ${command} (cwd: ${session.currentDir})`);

      // ✅ NOUVEAU: Envoyer la commande
      let result = await this.sendCommand(session, command);

      // ✅ NOUVEAU: Si c'est un "cd", mettre à jour currentDir
      if (command.trim().startsWith('cd ')) {
        try {
          const pwdResult = await this.sendCommand(session, 'pwd');
          if (pwdResult.success) {
            session.currentDir = pwdResult.output.trim();
            console.log(`[PersistentShell] currentDir mis à jour: ${session.currentDir}`);
          }
        } catch (error) {
          console.error(`[PersistentShell] Erreur lors de la mise à jour du pwd:`, error);
        }
      }

      // ✅ NOUVEAU: Mettre à jour l'activité
      session.lastActivity = Date.now();

      return result;
    } catch (error: any) {
      console.error(`[PersistentShell] Erreur lors de l'exécution:`, error);
      return {
        success: false,
        output: '',
        cwd: '',
        error: error.message,
      };
    }
  }

  /**
   * ✅ NOUVEAU: Obtenir le répertoire courant
   */
  static async getCurrentDir(
    serverId: number,
    userId: number
  ): Promise<string> {
    try {
      const session = await this.getOrCreateSession(serverId, userId);
      session.lastActivity = Date.now();
      return session.currentDir;
    } catch (error: any) {
      console.error(`[PersistentShell] Erreur:`, error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Fermer une session
   */
  static async closeSession(serverId: number, userId: number): Promise<void> {
    const key = `${userId}:${serverId}`;
    const session = this.sessions.get(key);

    if (session) {
      console.log(`[PersistentShell] Fermeture de ${key}`);
      try {
        session.channel.close();
        session.client.dispose();
      } catch (error) {
        console.error(`[PersistentShell] Erreur lors de la fermeture:`, error);
      }
      this.sessions.delete(key);
    }
  }

  /**
   * ✅ NOUVEAU: Fermer toutes les sessions
   */
  static async closeAllSessions(): Promise<void> {
    console.log(`[PersistentShell] Fermeture de ${this.sessions.size} sessions`);

    for (const [key, session] of this.sessions.entries()) {
      try {
        session.channel.close();
        session.client.dispose();
        console.log(`[PersistentShell] Session ${key} fermée`);
      } catch (error) {
        console.error(`[PersistentShell] Erreur lors de la fermeture de ${key}:`, error);
      }
    }

    this.sessions.clear();
  }

  /**
   * ✅ NOUVEAU: Obtenir les stats
   */
  static getStats() {
    return {
      activeSessions: this.sessions.size,
      sessions: Array.from(this.sessions.entries()).map(([key, session]) => ({
        key,
        cwd: session.currentDir,
        age: Date.now() - session.createdAt,
        idle: Date.now() - session.lastActivity,
        busy: session.busy,
      })),
    };
  }
}

// ✅ NOUVEAU: Fermer les sessions au shutdown
process.on('exit', () => {
  PersistentShellManager.closeAllSessions();
});

process.on('SIGINT', () => {
  PersistentShellManager.closeAllSessions();
  process.exit(0);
});

process.on('SIGTERM', () => {
  PersistentShellManager.closeAllSessions();
  process.exit(0);
});
