import { NodeSSH } from 'node-ssh';
import { query } from '../config/database';

export interface SSHServer {
  id: number;
  user_id: number;
  name: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  private_key?: string;
}

export interface SSHConnectionConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
}

export interface CommandResult {
  command: string;
  output: string;
  error?: string;
  exitCode: number;
  executedAt: Date;
}

export class SSHService {
  private static connections: Map<number, NodeSSH> = new Map();

  // Créer une nouvelle configuration de serveur SSH
  static async createServer(userId: number, config: {
    name: string;
    host: string;
    port: number;
    username: string;
    password?: string;
    private_key?: string;
  }): Promise<SSHServer> {
    const result = await query(
      `INSERT INTO ssh_servers (user_id, name, host, port, username, password, private_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, config.name, config.host, config.port, config.username, 
       config.password || null, config.private_key || null]
    );
    
    return result.rows[0];
  }

  // Obtenir tous les serveurs d'un utilisateur
  static async getServersByUserId(userId: number): Promise<SSHServer[]> {
    const result = await query(
      'SELECT id, user_id, name, host, port, username, created_at, updated_at FROM ssh_servers WHERE user_id = $1',
      [userId]
    );
    
    return result.rows;
  }

  // Obtenir un serveur par ID
  static async getServerById(serverId: number): Promise<SSHServer | null> {
    const result = await query(
      'SELECT * FROM ssh_servers WHERE id = $1',
      [serverId]
    );
    
    return result.rows[0] || null;
  }

  // Mettre à jour un serveur
  static async updateServer(serverId: number, updates: Partial<SSHServer>): Promise<SSHServer | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'user_id' && key !== 'created_at') {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    });

    if (fields.length === 0) return null;

    values.push(serverId);
    const result = await query(
      `UPDATE ssh_servers 
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${index} 
       RETURNING *`,
      values
    );
    
    return result.rows[0] || null;
  }

  // Supprimer un serveur
  static async deleteServer(serverId: number): Promise<boolean> {
    // Fermer la connexion si elle existe
    await this.disconnect(serverId);
    
    const result = await query(
      'DELETE FROM ssh_servers WHERE id = $1',
      [serverId]
    );
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Se connecter à un serveur SSH
  static async connect(serverId: number): Promise<{ success: boolean; message: string }> {
    try {
      // Récupérer les infos du serveur
      const server = await this.getServerById(serverId);
      if (!server) {
        return { success: false, message: 'Serveur introuvable' };
      }

      // Vérifier si déjà connecté
      if (this.connections.has(serverId)) {
        return { success: true, message: 'Déjà connecté' };
      }

      // Créer une nouvelle connexion
      const ssh = new NodeSSH();
      
      const config: SSHConnectionConfig = {
        host: server.host,
        port: server.port,
        username: server.username,
      };

      // Ajouter le mot de passe OU la clé privée
      if (server.password) {
        config.password = server.password;
      } else if (server.private_key) {
        config.privateKey = server.private_key;
      } else {
        return { success: false, message: 'Aucune méthode d\'authentification configurée' };
      }

      // Se connecter
      await ssh.connect(config);
      
      // Stocker la connexion
      this.connections.set(serverId, ssh);

      return { success: true, message: 'Connecté avec succès' };

    } catch (error: any) {
      console.error('Erreur de connexion SSH:', error);
      return { 
        success: false, 
        message: `Erreur de connexion: ${error.message}` 
      };
    }
  }

  // Se déconnecter d'un serveur
  static async disconnect(serverId: number): Promise<void> {
    const ssh = this.connections.get(serverId);
    if (ssh) {
      ssh.dispose();
      this.connections.delete(serverId);
    }
  }

  // Vérifier si connecté
  static isConnected(serverId: number): boolean {
    return this.connections.has(serverId);
  }

  // Exécuter une commande sur un serveur
  static async executeCommand(
    serverId: number, 
    command: string,
    userId: number
  ): Promise<CommandResult> {
    const executedAt = new Date();
    
    try {
      // Vérifier la connexion
      if (!this.isConnected(serverId)) {
        const connectResult = await this.connect(serverId);
        if (!connectResult.success) {
          throw new Error(connectResult.message);
        }
      }

      const ssh = this.connections.get(serverId);
      if (!ssh) {
        throw new Error('Connexion SSH introuvable');
      }

      // Exécuter la commande
      const result = await ssh.execCommand(command);

      const commandResult: CommandResult = {
        command,
        output: result.stdout || result.stderr,
        error: result.stderr || undefined,
        exitCode: result.code || 0,
        executedAt
      };

      // Sauvegarder dans l'historique
      await query(
        `INSERT INTO command_history (user_id, server_id, command, output, status, executed_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId, 
          serverId, 
          command, 
          commandResult.output, 
          result.code === 0 ? 'success' : 'error',
          executedAt
        ]
      );

      return commandResult;

    } catch (error: any) {
      console.error('Erreur d\'exécution de commande:', error);
      
      const errorResult: CommandResult = {
        command,
        output: '',
        error: error.message,
        exitCode: 1,
        executedAt
      };

      // Sauvegarder l'erreur dans l'historique
      await query(
        `INSERT INTO command_history (user_id, server_id, command, output, status, executed_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, serverId, command, error.message, 'error', executedAt]
      );

      return errorResult;
    }
  }

  // Obtenir l'historique des commandes
  static async getCommandHistory(
    userId: number, 
    serverId?: number, 
    limit: number = 50
  ): Promise<any[]> {
    let queryStr = `
      SELECT ch.*, s.name as server_name, s.host
      FROM command_history ch
      LEFT JOIN ssh_servers s ON ch.server_id = s.id
      WHERE ch.user_id = $1
    `;
    
    const params: any[] = [userId];
    
    if (serverId) {
      queryStr += ' AND ch.server_id = $2';
      params.push(serverId);
      queryStr += ` ORDER BY ch.executed_at DESC LIMIT $3`;
      params.push(limit);
    } else {
      queryStr += ` ORDER BY ch.executed_at DESC LIMIT $2`;
      params.push(limit);
    }

    const result = await query(queryStr, params);
    return result.rows;
  }

  // Tester une connexion SSH
  static async testConnection(config: SSHConnectionConfig): Promise<{ 
    success: boolean; 
    message: string;
    latency?: number;
  }> {
    const ssh = new NodeSSH();
    const startTime = Date.now();
    
    try {
      await ssh.connect(config);
      const latency = Date.now() - startTime;
      
      // Exécuter une commande simple pour tester
      const result = await ssh.execCommand('echo "test"');
      
      ssh.dispose();
      
      if (result.code === 0) {
        return { 
          success: true, 
          message: 'Connexion réussie',
          latency
        };
      } else {
        return { 
          success: false, 
          message: 'Échec de l\'exécution de commande test' 
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: `Erreur: ${error.message}` 
      };
    }
  }

  // Obtenir les informations système d'un serveur
  static async getSystemInfo(serverId: number): Promise<any> {
    try {
      if (!this.isConnected(serverId)) {
        const connectResult = await this.connect(serverId);
        if (!connectResult.success) {
          throw new Error(connectResult.message);
        }
      }

      const ssh = this.connections.get(serverId);
      if (!ssh) {
        throw new Error('Connexion SSH introuvable');
      }

      // Exécuter plusieurs commandes pour obtenir les infos système
      const [hostname, uptime, memory, disk, cpu] = await Promise.all([
        ssh.execCommand('hostname'),
        ssh.execCommand('uptime -p'),
        ssh.execCommand('free -h | grep Mem'),
        ssh.execCommand('df -h / | tail -1'),
        ssh.execCommand('nproc')
      ]);

      return {
        hostname: hostname.stdout.trim(),
        uptime: uptime.stdout.trim(),
        memory: memory.stdout.trim(),
        disk: disk.stdout.trim(),
        cpuCores: cpu.stdout.trim()
      };
    } catch (error: any) {
      throw new Error(`Erreur lors de la récupération des infos système: ${error.message}`);
    }
  }

  // Télécharger un fichier depuis le serveur
  static async downloadFile(serverId: number, remotePath: string, localPath: string): Promise<void> {
    try {
      if (!this.isConnected(serverId)) {
        const connectResult = await this.connect(serverId);
        if (!connectResult.success) {
          throw new Error(connectResult.message);
        }
      }

      const ssh = this.connections.get(serverId);
      if (!ssh) {
        throw new Error('Connexion SSH introuvable');
      }

      await ssh.getFile(localPath, remotePath);
      console.log(`✅ Fichier téléchargé: ${remotePath} → ${localPath}`);
    } catch (error: any) {
      throw new Error(`Erreur lors du téléchargement: ${error.message}`);
    }
  }

  // Uploader un fichier vers le serveur
  static async uploadFile(serverId: number, localPath: string, remotePath: string): Promise<void> {
    try {
      if (!this.isConnected(serverId)) {
        const connectResult = await this.connect(serverId);
        if (!connectResult.success) {
          throw new Error(connectResult.message);
        }
      }

      const ssh = this.connections.get(serverId);
      if (!ssh) {
        throw new Error('Connexion SSH introuvable');
      }

      await ssh.putFile(localPath, remotePath);
      console.log(`✅ Fichier uploadé: ${localPath} → ${remotePath}`);
    } catch (error: any) {
      throw new Error(`Erreur lors de l'upload: ${error.message}`);
    }
  }

  // Lire le contenu d'un fichier
  static async readFile(serverId: number, remotePath: string): Promise<string> {
    try {
      if (!this.isConnected(serverId)) {
        const connectResult = await this.connect(serverId);
        if (!connectResult.success) {
          throw new Error(connectResult.message);
        }
      }

      const ssh = this.connections.get(serverId);
      if (!ssh) {
        throw new Error('Connexion SSH introuvable');
      }

      const result = await ssh.execCommand(`cat "${remotePath}"`);
      if (result.code !== 0) {
        throw new Error(result.stderr || 'Impossible de lire le fichier');
      }
      return result.stdout;
    } catch (error: any) {
      throw new Error(`Erreur lors de la lecture: ${error.message}`);
    }
  }

  // Créer ou modifier un fichier
  static async writeFile(serverId: number, remotePath: string, content: string): Promise<void> {
    try {
      if (!this.isConnected(serverId)) {
        const connectResult = await this.connect(serverId);
        if (!connectResult.success) {
          throw new Error(connectResult.message);
        }
      }

      const ssh = this.connections.get(serverId);
      if (!ssh) {
        throw new Error('Connexion SSH introuvable');
      }

      // Utiliser echo pour écrire le fichier
      const escapedContent = content.replace(/"/g, '\\"').replace(/\$/g, '\\$');
      const result = await ssh.execCommand(`cat > "${remotePath}" << 'EOF'\n${content}\nEOF`);
      
      if (result.code !== 0) {
        throw new Error(result.stderr || 'Impossible d\'écrire le fichier');
      }
      console.log(`✅ Fichier créé/modifié: ${remotePath}`);
    } catch (error: any) {
      throw new Error(`Erreur lors de l'écriture: ${error.message}`);
    }
  }

  // Installer un paquet
  static async installPackage(serverId: number, packageName: string): Promise<CommandResult> {
    try {
      // Détecter le gestionnaire de paquets
      const ssh = this.connections.get(serverId);
      if (!ssh) {
        throw new Error('Connexion SSH introuvable');
      }

      // Vérifier le système
      const systemCheck = await ssh.execCommand('[ -f /etc/debian_version ] && echo debian || echo other');
      const isDebian = systemCheck.stdout.trim() === 'debian';

      // ✅ MODIFIÉ: Rendre non-interactive avec DEBIAN_FRONTEND
      const command = isDebian 
        ? `sudo DEBIAN_FRONTEND=noninteractive apt-get update && sudo DEBIAN_FRONTEND=noninteractive apt-get install -y ${packageName}`
        : `sudo yum install -y ${packageName}`;

      console.log(`[SSHService] Installing ${packageName} on server ${serverId}: ${command}`);
      const result = await ssh.execCommand(command);

      console.log(`[SSHService] Install result - code: ${result.code}, stdout: ${result.stdout.substring(0, 100)}`);

      return {
        command,
        output: result.stdout,
        error: result.stderr,
        exitCode: result.code || 0,
        executedAt: new Date()
      };
    } catch (error: any) {
      console.error(`[SSHService] Install error:`, error);
      return {
        command: `install ${packageName}`,
        output: '',
        error: error.message,
        exitCode: 1,
        executedAt: new Date()
      };
    }
  }

  // ✅ NOUVEAU: Désinstaller un paquet
  static async uninstallPackage(serverId: number, packageName: string): Promise<CommandResult> {
    try {
      // Détecter le gestionnaire de paquets
      const ssh = this.connections.get(serverId);
      if (!ssh) {
        throw new Error('Connexion SSH introuvable');
      }

      // Vérifier le système
      const systemCheck = await ssh.execCommand('[ -f /etc/debian_version ] && echo debian || echo other');
      const isDebian = systemCheck.stdout.trim() === 'debian';

      // ✅ MODIFIÉ: Rendre entièrement non-interactive
      const command = isDebian 
        ? `sudo DEBIAN_FRONTEND=noninteractive apt-get remove --purge -y ${packageName} && sudo DEBIAN_FRONTEND=noninteractive apt-get autoremove --purge -y`
        : `sudo yum remove -y ${packageName}`;

      console.log(`[SSHService] Uninstalling ${packageName} on server ${serverId}: ${command}`);
      const result = await ssh.execCommand(command);

      console.log(`[SSHService] Uninstall result - code: ${result.code}, stdout: ${result.stdout.substring(0, 100)}`);

      return {
        command,
        output: result.stdout,
        error: result.stderr,
        exitCode: result.code || 0,
        executedAt: new Date()
      };
    } catch (error: any) {
      console.error(`[SSHService] Uninstall error:`, error);
      return {
        command: `uninstall ${packageName}`,
        output: '',
        error: error.message,
        exitCode: 1,
        executedAt: new Date()
      };
    }
  }

  // Déconnecter tous les serveurs
  static async disconnectAll(): Promise<void> {
    for (const [serverId, ssh] of this.connections.entries()) {
      ssh.dispose();
      this.connections.delete(serverId);
    }
  }
}
