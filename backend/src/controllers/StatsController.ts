import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';

export class StatsController {
  static async getUserStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      // Compter les conversations
      const conversationsResult = await query(
        'SELECT COUNT(*) as count FROM conversations WHERE user_id = $1',
        [userId]
      );
      const totalConversations = parseInt(conversationsResult.rows[0].count);

      // Compter les messages
      const messagesResult = await query(
        'SELECT COUNT(*) as count FROM messages WHERE user_id = $1',
        [userId]
      );
      const totalMessages = parseInt(messagesResult.rows[0].count);

      // Compter les serveurs SSH
      const serversResult = await query(
        'SELECT COUNT(*) as count FROM ssh_servers WHERE user_id = $1',
        [userId]
      );
      const totalServers = parseInt(serversResult.rows[0].count);

      // Connexions actives (0 pour l'instant)
      const activeConnections = 0;

      // Activité récente (vide pour l'instant)
      const recentActivity: any[] = [];

      return res.json({
        success: true,
        data: {
          totalConversations,
          totalMessages,
          totalServers,
          activeConnections,
          recentActivity
        }
      });

    } catch (error: any) {
      console.error('Erreur lors de la récupération des stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: error.message
      });
    }
  }
}