import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PersistentShellManager } from '../services/PersistentShell';
import { SSHService } from '../services/SSHService';

const router = Router();

/**
 * ✅ NOUVEAU: POST /api/ssh/execute
 * Exécute une commande dans un shell persistant
 */
router.post('/execute', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { serverId, command } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié',
      });
    }

    if (!serverId || !command) {
      return res.status(400).json({
        success: false,
        message: 'serverId et command sont requis',
      });
    }

    // ✅ NOUVEAU: Vérifier que l'utilisateur possède ce serveur
    const server = await SSHService.getServerById(serverId);
    if (!server || server.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé',
      });
    }

    // ✅ NOUVEAU: Exécuter la commande dans le shell persistant
    console.log(`[API] Exécution: ${command} sur serveur ${serverId}`);
    const result = await PersistentShellManager.executeCommand(serverId, userId, command);

    return res.json({
      success: result.success,
      output: result.output,
      cwd: result.cwd,
      error: result.error,
    });
  } catch (error: any) {
    console.error('[API] Erreur:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de l\'exécution',
    });
  }
});

/**
 * ✅ NOUVEAU: GET /api/ssh/current-dir/:serverId
 * Obtient le répertoire courant
 */
router.get('/current-dir/:serverId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const serverId = parseInt(req.params.serverId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié',
      });
    }

    if (!serverId || isNaN(serverId)) {
      return res.status(400).json({
        success: false,
        message: 'serverId invalide',
      });
    }

    // ✅ NOUVEAU: Vérifier l'accès
    const server = await SSHService.getServerById(serverId);
    if (!server || server.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé',
      });
    }

    // ✅ NOUVEAU: Obtenir le répertoire courant
    const cwd = await PersistentShellManager.getCurrentDir(serverId, userId);

    return res.json({
      success: true,
      cwd,
    });
  } catch (error: any) {
    console.error('[API] Erreur:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * ✅ NOUVEAU: POST /api/ssh/disconnect
 * Ferme la session persistante
 */
router.post('/disconnect', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { serverId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié',
      });
    }

    if (!serverId) {
      return res.status(400).json({
        success: false,
        message: 'serverId est requis',
      });
    }

    // ✅ NOUVEAU: Vérifier l'accès
    const server = await SSHService.getServerById(serverId);
    if (!server || server.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé',
      });
    }

    // ✅ NOUVEAU: Fermer la session
    console.log(`[API] Déconnexion du serveur ${serverId}`);
    await PersistentShellManager.closeSession(serverId, userId);

    return res.json({
      success: true,
      message: 'Déconnecté',
    });
  } catch (error: any) {
    console.error('[API] Erreur:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * ✅ NOUVEAU: GET /api/ssh/stats
 * Obtient les stats (debug)
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié',
      });
    }

    const stats = PersistentShellManager.getStats();
    return res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
