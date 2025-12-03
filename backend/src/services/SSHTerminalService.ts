import { NodeSSH } from 'node-ssh';
import { SSHService } from './SSHService';

// ✅ NOUVEAU: Interface pour les connexions SSH persistantes avec suivi du répertoire
interface SSHConnection {
  client: NodeSSH;
  currentDir: string;
  createdAt: number;
  lastActivity: number;
}

// ✅ NOUVEAU: Résultat d'exécution de commande avec répertoire courant
interface TerminalCommandResult {
  code: number;
  stdout: string;
  stderr: string;
  cwd: string;
}

export class SSHTerminalService {
  // ✅ NOUVEAU: Map pour garder les connexions SSH ouvertes entre les commandes
  private static connections: Map<string, SSHConnection> = new Map();
  // ✅ NOUVEAU: Timeout de 30 minutes d'inactivité avant de fermer une session
  private static SSH_TIMEOUT = 30 * 60 * 1000;
  // ✅ NOUVEAU: Intervalle de nettoyage des sessions expirées (toutes les 5 minutes)
  private static CLEANUP_INTERVAL = 5 * 60 * 1000;

  // ✅ NOUVEAU: Démarrer le nettoyage automatique au chargement
  static {
    this.startCleanupInterval();
  }

  /**
   * ✅ NOUVEAU: Démarrer l'intervalle de nettoyage automatique des sessions expirées
   */
  private static startCleanupInterval() {
    setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      this.connections.forEach((connection, key) => {
        if (now - connection.lastActivity > this.SSH_TIMEOUT) {
          console.log(`[SSHTerminal] Fermeture de la session ${key} (timeout)`);
          connection.client.dispose();
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach(key => this.connections.delete(key));
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * ✅ NOUVEAU: Obtenir ou créer une connexion SSH persistante pour un serveur
   */
  static async getConnection(
    serverId: number,
    userId: number
  ): Promise<SSHConnection> {
    // ✅ NOUVEAU: Clé unique pour identifier la connexion (userId:serverId)
    const connectionKey = `${userId}:${serverId}`;
    const now = Date.now();

    // ✅ NOUVEAU: Vérifier si une session existe déjà et n'est pas expirée
    const existingConnection = this.connections.get(connectionKey);
    if (existingConnection && now - existingConnection.lastActivity < this.SSH_TIMEOUT) {
      console.log(`[SSHTerminal] Réutilisation de la connexion ${connectionKey}`);
      existingConnection.lastActivity = now;
      return existingConnection;
    }

    // ✅ NOUVEAU: Fermer l'ancienne connexion si elle existe
    if (existingConnection) {
      console.log(`[SSHTerminal] Fermeture de l'ancienne connexion ${connectionKey}`);
      existingConnection.client.dispose();
      this.connections.delete(connectionKey);
    }

    // ✅ NOUVEAU: Créer une nouvelle connexion SSH persistante
    console.log(`[SSHTerminal] Création d'une nouvelle connexion ${connectionKey}`);
    const server = await SSHService.getServerById(serverId);
    if (!server) {
      throw new Error('Serveur introuvable');
    }

    // ✅ NOUVEAU: Utiliser SSHService pour établir la connexion
    const connectResult = await SSHService.connect(serverId);
    if (!connectResult.success) {
      throw new Error(connectResult.message);
    }

    // ✅ NOUVEAU: Obtenir le client SSH depuis SSHService
    const client = (SSHService as any).connections?.get(serverId);
    if (!client) {
      throw new Error('Impossible de récupérer la connexion SSH');
    }

    // ✅ NOUVEAU: Créer la structure de connexion avec répertoire initial /home/user
    const connection: SSHConnection = {
      client,
      currentDir: `/home/${server.username}`,
      createdAt: now,
      lastActivity: now
    };

    // ✅ NOUVEAU: Stocker dans la Map
    this.connections.set(connectionKey, connection);

    // ✅ NOUVEAU: Vérifier et initialiser le répertoire courant
    try {
      const result = await client.execCommand('pwd', { cwd: connection.currentDir });
      if (result.code === 0 && result.stdout) {
        connection.currentDir = result.stdout.trim();
      }
    } catch (error) {
      console.error(`[SSHTerminal] Erreur lors de la détection du répertoire courant:`, error);
    }

    return connection;
  }

  /**
   * ✅ NOUVEAU: Exécuter une commande dans la session persistante en conservant le répertoire courant
   */
  static async executeCommand(
    serverId: number,
    userId: number,
    command: string
  ): Promise<TerminalCommandResult> {
    try {
      // ✅ NOUVEAU: Obtenir la connexion persistante
      const connection = await this.getConnection(serverId, userId);

      // ✅ NOUVEAU: Exécuter la commande dans le répertoire courant
      console.log(`[SSHTerminal] Exécution: ${command} (cwd: ${connection.currentDir})`);
      const result = await connection.client.execCommand(command, {
        cwd: connection.currentDir
      });

      // ✅ NOUVEAU: Mettre à jour l'activité
      connection.lastActivity = Date.now();

      // ✅ NOUVEAU: Si la commande commence par "cd", mettre à jour currentDir
      if (command.trim().startsWith('cd ')) {
        try {
          // ✅ NOUVEAU: Exécuter "pwd" pour obtenir le nouveau répertoire courant
          const pwdResult = await connection.client.execCommand('pwd', {
            cwd: connection.currentDir
          });

          if (pwdResult.code === 0 && pwdResult.stdout) {
            connection.currentDir = pwdResult.stdout.trim();
            console.log(`[SSHTerminal] currentDir mis à jour: ${connection.currentDir}`);
          }
        } catch (error) {
          console.error(`[SSHTerminal] Erreur lors de la mise à jour du répertoire:`, error);
        }
      }

      return {
        code: result.code || 0,
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        cwd: connection.currentDir
      };
    } catch (error: any) {
      console.error(`[SSHTerminal] Erreur d'exécution:`, error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Obtenir le répertoire courant d'une session persistante
   */
  static async getCurrentDir(
    serverId: number,
    userId: number
  ): Promise<string> {
    try {
      const connection = await this.getConnection(serverId, userId);
      connection.lastActivity = Date.now();
      return connection.currentDir;
    } catch (error: any) {
      console.error(`[SSHTerminal] Erreur lors de la récupération du répertoire:`, error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Fermer la connexion SSH pour un serveur spécifique
   */
  static async closeConnection(
    serverId: number,
    userId: number
  ): Promise<void> {
    const connectionKey = `${userId}:${serverId}`;
    const connection = this.connections.get(connectionKey);

    if (connection) {
      console.log(`[SSHTerminal] Fermeture de la connexion ${connectionKey}`);
      try {
        connection.client.dispose();
      } catch (error) {
        console.error(`[SSHTerminal] Erreur lors de la fermeture:`, error);
      }
      this.connections.delete(connectionKey);
    }
  }

  /**
   * ✅ NOUVEAU: Fermer TOUTES les connexions SSH (graceful shutdown)
   */
  static async closeAllConnections(): Promise<void> {
    console.log(`[SSHTerminal] Fermeture de ${this.connections.size} connexions`);
    
    this.connections.forEach((connection, key) => {
      try {
        connection.client.dispose();
        console.log(`[SSHTerminal] Connexion ${key} fermée`);
      } catch (error) {
        console.error(`[SSHTerminal] Erreur lors de la fermeture de ${key}:`, error);
      }
    });

    this.connections.clear();
  }

  /**
   * ✅ NOUVEAU: Obtenir le statut de toutes les connexions actives
   */
  static getConnectionStats() {
    return {
      activeConnections: this.connections.size,
      connections: Array.from(this.connections.entries()).map(([key, conn]) => ({
        key,
        cwd: conn.currentDir,
        age: Date.now() - conn.createdAt,
        idle: Date.now() - conn.lastActivity
      }))
    };
  }
}

// ✅ NOUVEAU: Fermer les connexions au shutdown
process.on('exit', () => {
  SSHTerminalService.closeAllConnections();
});

process.on('SIGINT', () => {
  SSHTerminalService.closeAllConnections();
  process.exit(0);
});

process.on('SIGTERM', () => {
  SSHTerminalService.closeAllConnections();
  process.exit(0);
});
