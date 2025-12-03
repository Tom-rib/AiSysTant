import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SSHTerminalService } from '../services/SSHTerminalService';
import { SSHService } from '../services/SSHService';

const router = Router();

/**
 * ✅ NOUVEAU: POST /api/ssh/execute
 * Exécute une commande dans une session SSH persistante
 * Body: { serverId, command }
 * Retourne: { success, code, stdout, stderr, cwd }
 */
router.post('/execute', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { serverId, command } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    if (!serverId || !command) {
      return res.status(400).json({
        success: false,
        message: 'serverId et command sont requis'
      });
    }

    // ✅ NOUVEAU: Vérifier que l'utilisateur possède ce serveur
    const server = await SSHService.getServerById(serverId);
    if (!server || server.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé à ce serveur'
      });
    }

    // ✅ NOUVEAU: Exécuter la commande dans la session persistante
    console.log(`[API] Exécution de: ${command} sur serveur ${serverId}`);
    const result = await SSHTerminalService.executeCommand(serverId, userId, command);

    return res.json({
      success: true,
      code: result.code,
      stdout: result.stdout,
      stderr: result.stderr,
      cwd: result.cwd
    });
  } catch (error: any) {
    console.error('[API] Erreur lors de l\'exécution:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de l\'exécution de la commande'
    });
  }
});

/**
 * ✅ NOUVEAU: GET /api/ssh/current-dir/:serverId
 * Obtient le répertoire courant d'une session SSH
 * Retourne: { success, cwd }
 */
router.get('/current-dir/:serverId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const serverId = parseInt(req.params.serverId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    if (!serverId || isNaN(serverId)) {
      return res.status(400).json({
        success: false,
        message: 'serverId invalide'
      });
    }

    // ✅ NOUVEAU: Vérifier que l'utilisateur possède ce serveur
    const server = await SSHService.getServerById(serverId);
    if (!server || server.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé à ce serveur'
      });
    }

    // ✅ NOUVEAU: Obtenir le répertoire courant
    const cwd = await SSHTerminalService.getCurrentDir(serverId, userId);

    return res.json({
      success: true,
      cwd
    });
  } catch (error: any) {
    console.error('[API] Erreur lors de la récupération du répertoire:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du répertoire courant'
    });
  }
});

/**
 * ✅ NOUVEAU: POST /api/ssh/disconnect
 * Ferme la session SSH persistante
 * Body: { serverId }
 * Retourne: { success }
 */
router.post('/disconnect', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { serverId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    if (!serverId) {
      return res.status(400).json({
        success: false,
        message: 'serverId est requis'
      });
    }

    // ✅ NOUVEAU: Vérifier que l'utilisateur possède ce serveur
    const server = await SSHService.getServerById(serverId);
    if (!server || server.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé à ce serveur'
      });
    }

    // ✅ NOUVEAU: Fermer la connexion
    console.log(`[API] Fermeture de la connexion au serveur ${serverId}`);
    await SSHTerminalService.closeConnection(serverId, userId);

    return res.json({
      success: true,
      message: 'Déconnecté avec succès'
    });
  } catch (error: any) {
    console.error('[API] Erreur lors de la déconnexion:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la déconnexion'
    });
  }
});

/**
 * ✅ NOUVEAU: GET /api/ssh/stats
 * Obtient les statistiques des connexions actives
 * Debug uniquement - retirer en production
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    const stats = SSHTerminalService.getConnectionStats();
    return res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
