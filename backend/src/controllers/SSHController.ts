import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SSHService } from '../services/SSHService';

export class SSHController {
  // Créer un nouveau serveur SSH
  static async createServer(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { name, host, port, username, password, private_key } = req.body;

      // Validation
      if (!name || !host || !username) {
        return res.status(400).json({
          success: false,
          message: 'Nom, hôte et nom d\'utilisateur requis'
        });
      }

      if (!password && !private_key) {
        return res.status(400).json({
          success: false,
          message: 'Mot de passe ou clé privée requis'
        });
      }

      const server = await SSHService.createServer(userId, {
        name,
        host,
        port: port || 22,
        username,
        password,
        private_key
      });

      return res.status(201).json({
        success: true,
        message: 'Serveur SSH créé',
        data: {
          id: server.id,
          name: server.name,
          host: server.host,
          port: server.port,
          username: server.username
        }
      });

    } catch (error: any) {
      console.error('Erreur lors de la création du serveur SSH:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du serveur SSH',
        error: error.message
      });
    }
  }

  // Obtenir tous les serveurs de l'utilisateur
  static async getServers(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const servers = await SSHService.getServersByUserId(userId);

      // Ne pas renvoyer les mots de passe
      const sanitizedServers = servers.map(server => ({
        id: server.id,
        name: server.name,
        host: server.host,
        port: server.port,
        username: server.username,
        connected: SSHService.isConnected(server.id)
      }));

      return res.json({
        success: true,
        data: sanitizedServers
      });

    } catch (error: any) {
      console.error('Erreur lors de la récupération des serveurs:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des serveurs',
        error: error.message
      });
    }
  }

  // Obtenir un serveur spécifique
  static async getServer(req: AuthRequest, res: Response) {
    try {
      const serverId = parseInt(req.params.id);
      const server = await SSHService.getServerById(serverId);

      if (!server) {
        return res.status(404).json({
          success: false,
          message: 'Serveur introuvable'
        });
      }

      // Vérifier que le serveur appartient à l'utilisateur
      if (server.user_id !== req.user!.id) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      return res.json({
        success: true,
        data: {
          id: server.id,
          name: server.name,
          host: server.host,
          port: server.port,
          username: server.username,
          connected: SSHService.isConnected(server.id)
        }
      });

    } catch (error: any) {
      console.error('Erreur lors de la récupération du serveur:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du serveur',
        error: error.message
      });
    }
  }

  // Mettre à jour un serveur
  static async updateServer(req: AuthRequest, res: Response) {
    try {
      const serverId = parseInt(req.params.id);
      const server = await SSHService.getServerById(serverId);

      if (!server) {
        return res.status(404).json({
          success: false,
          message: 'Serveur introuvable'
        });
      }

      if (server.user_id !== req.user!.id) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      const updatedServer = await SSHService.updateServer(serverId, req.body);

      return res.json({
        success: true,
        message: 'Serveur mis à jour',
        data: {
          id: updatedServer!.id,
          name: updatedServer!.name,
          host: updatedServer!.host,
          port: updatedServer!.port,
          username: updatedServer!.username
        }
      });

    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du serveur:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du serveur',
        error: error.message
      });
    }
  }

  // Supprimer un serveur
  static async deleteServer(req: AuthRequest, res: Response) {
    try {
      const serverId = parseInt(req.params.id);
      const server = await SSHService.getServerById(serverId);

      if (!server) {
        return res.status(404).json({
          success: false,
          message: 'Serveur introuvable'
        });
      }

      if (server.user_id !== req.user!.id) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      await SSHService.deleteServer(serverId);

      return res.json({
        success: true,
        message: 'Serveur supprimé'
      });

    } catch (error: any) {
      console.error('Erreur lors de la suppression du serveur:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du serveur',
        error: error.message
      });
    }
  }

  // Se connecter à un serveur
  static async connect(req: AuthRequest, res: Response) {
    try {
      const serverId = parseInt(req.params.id);
      const server = await SSHService.getServerById(serverId);

      if (!server) {
        return res.status(404).json({
          success: false,
          message: 'Serveur introuvable'
        });
      }

      if (server.user_id !== req.user!.id) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      const result = await SSHService.connect(serverId);

      return res.json({
        success: result.success,
        message: result.message
      });

    } catch (error: any) {
      console.error('Erreur lors de la connexion SSH:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la connexion SSH',
        error: error.message
      });
    }
  }

  // Se déconnecter d'un serveur
  static async disconnect(req: AuthRequest, res: Response) {
    try {
      const serverId = parseInt(req.params.id);
      const server = await SSHService.getServerById(serverId);

      if (!server) {
        return res.status(404).json({
          success: false,
          message: 'Serveur introuvable'
        });
      }

      if (server.user_id !== req.user!.id) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      await SSHService.disconnect(serverId);

      return res.json({
        success: true,
        message: 'Déconnecté'
      });

    } catch (error: any) {
      console.error('Erreur lors de la déconnexion SSH:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la déconnexion SSH',
        error: error.message
      });
    }
  }

  // Exécuter une commande
  static async executeCommand(req: AuthRequest, res: Response) {
    try {
      const serverId = parseInt(req.params.id);
      const { command } = req.body;
      const userId = req.user!.id;

      if (!command) {
        return res.status(400).json({
          success: false,
          message: 'Commande requise'
        });
      }

      const server = await SSHService.getServerById(serverId);

      if (!server) {
        return res.status(404).json({
          success: false,
          message: 'Serveur introuvable'
        });
      }

      if (server.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      const result = await SSHService.executeCommand(serverId, command, userId);

      return res.json({
        success: result.exitCode === 0,
        data: result
      });

    } catch (error: any) {
      console.error('Erreur lors de l\'exécution de la commande:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'exécution de la commande',
        error: error.message
      });
    }
  }

  // Obtenir l'historique des commandes
  static async getCommandHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const serverId = req.query.server_id ? parseInt(req.query.server_id as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const history = await SSHService.getCommandHistory(userId, serverId, limit);

      return res.json({
        success: true,
        data: history
      });

    } catch (error: any) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'historique',
        error: error.message
      });
    }
  }

  // Tester une connexion
  static async testConnection(req: AuthRequest, res: Response) {
    try {
      const { host, port, username, password, private_key } = req.body;

      if (!host || !username) {
        return res.status(400).json({
          success: false,
          message: 'Hôte et nom d\'utilisateur requis'
        });
      }

      if (!password && !private_key) {
        return res.status(400).json({
          success: false,
          message: 'Mot de passe ou clé privée requis'
        });
      }

      const config = {
        host,
        port: port || 22,
        username,
        password,
        privateKey: private_key
      };

      const result = await SSHService.testConnection(config);

      return res.json({
        success: result.success,
        message: result.message,
        latency: result.latency
      });

    } catch (error: any) {
      console.error('Erreur lors du test de connexion:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du test de connexion',
        error: error.message
      });
    }
  }

  // Obtenir les informations système
  static async getSystemInfo(req: AuthRequest, res: Response) {
    try {
      const serverId = parseInt(req.params.id);
      const server = await SSHService.getServerById(serverId);

      if (!server) {
        return res.status(404).json({
          success: false,
          message: 'Serveur introuvable'
        });
      }

      if (server.user_id !== req.user!.id) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      const systemInfo = await SSHService.getSystemInfo(serverId);

      return res.json({
        success: true,
        data: systemInfo
      });

    } catch (error: any) {
      console.error('Erreur lors de la récupération des infos système:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des infos système',
        error: error.message
      });
    }
  }

  // Lire un fichier
  static async readFile(req: AuthRequest, res: Response) {
    try {
      const serverId = parseInt(req.params.id);
      const { filePath } = req.body;
      const userId = req.user!.id;

      if (!filePath) {
        return res.status(400).json({
          success: false,
          message: 'Chemin du fichier requis'
        });
      }

      const server = await SSHService.getServerById(serverId);
      if (!server || server.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      const content = await SSHService.readFile(serverId, filePath);
      return res.json({
        success: true,
        data: { content }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la lecture du fichier',
        error: error.message
      });
    }
  }

  // Écrire/modifier un fichier
  static async writeFile(req: AuthRequest, res: Response) {
    try {
      const serverId = parseInt(req.params.id);
      const { filePath, content } = req.body;
      const userId = req.user!.id;

      if (!filePath || content === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Chemin du fichier et contenu requis'
        });
      }

      const server = await SSHService.getServerById(serverId);
      if (!server || server.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      await SSHService.writeFile(serverId, filePath, content);
      return res.json({
        success: true,
        message: 'Fichier créé/modifié avec succès'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'écriture du fichier',
        error: error.message
      });
    }
  }

  // Installer un paquet
  static async installPackage(req: AuthRequest, res: Response) {
    try {
      const serverId = parseInt(req.params.id);
      const { packageName } = req.body;
      const userId = req.user!.id;

      if (!packageName) {
        return res.status(400).json({
          success: false,
          message: 'Nom du paquet requis'
        });
      }

      const server = await SSHService.getServerById(serverId);
      if (!server || server.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      const result = await SSHService.installPackage(serverId, packageName);
      return res.json({
        success: result.exitCode === 0,
        data: result
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'installation du paquet',
        error: error.message
      });
    }
  }
}
