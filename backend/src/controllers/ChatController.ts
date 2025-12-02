import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ConversationModel } from '../models/Conversation';
import { MessageModel } from '../models/Message';
import { ClaudeService } from '../services/ClaudeService';
import { getClaudeApiKey } from '../routes/settings';

export class ChatController {
  // Créer une nouvelle conversation
  static async createConversation(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { title } = req.body;

      const conversation = await ConversationModel.create({
        user_id: userId,
        title: title || 'Nouvelle conversation'
      });

      return res.status(201).json({
        success: true,
        message: 'Conversation créée',
        data: conversation
      });

    } catch (error: any) {
      console.error('Erreur lors de la création de la conversation:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de la conversation',
        error: error.message
      });
    }
  }

  // Obtenir toutes les conversations de l'utilisateur
  static async getConversations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const conversations = await ConversationModel.findByUserId(userId);

      return res.json({
        success: true,
        data: conversations
      });

    } catch (error: any) {
      console.error('Erreur lors de la récupération des conversations:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des conversations',
        error: error.message
      });
    }
  }

  // Obtenir une conversation spécifique avec ses messages
  static async getConversation(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const conversationId = parseInt(req.params.id);

      // Vérifier que la conversation appartient à l'utilisateur
      const belongsToUser = await ConversationModel.belongsToUser(conversationId, userId);
      if (!belongsToUser) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé à cette conversation'
        });
      }

      const conversation = await ConversationModel.findById(conversationId);
      const messages = await MessageModel.findByConversationId(conversationId);

      return res.json({
        success: true,
        data: {
          conversation,
          messages
        }
      });

    } catch (error: any) {
      console.error('Erreur lors de la récupération de la conversation:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la conversation',
        error: error.message
      });
    }
  }

  // Envoyer un message et obtenir une réponse de Claude
  static async sendMessage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const conversationId = parseInt(req.params.id);
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Le contenu du message est requis'
        });
      }

      // Vérifier que la conversation appartient à l'utilisateur
      const belongsToUser = await ConversationModel.belongsToUser(conversationId, userId);
      if (!belongsToUser) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé à cette conversation'
        });
      }

      // Récupérer la clé API Claude de l'utilisateur
      const userApiKey = await getClaudeApiKey(userId);
      if (!userApiKey) {
        return res.status(503).json({
          success: false,
          message: 'L\'IA Claude n\'est pas configurée. Veuillez ajouter une clé API Anthropic dans les paramètres.'
        });
      }

      // Sauvegarder le message de l'utilisateur
      const userMessage = await MessageModel.create({
        conversation_id: conversationId,
        user_id: userId,
        content,
        role: 'user'
      });

      // Obtenir la réponse de Claude
      const aiResponse = await ClaudeService.sendMessage(content, userApiKey, conversationId);

      // Sauvegarder la réponse de l'IA
      const assistantMessage = await MessageModel.create({
        conversation_id: conversationId,
        content: aiResponse,
        role: 'assistant'
      });

      // Générer un titre si c'est le premier message
      const messageCount = await MessageModel.countByConversationId(conversationId);
      if (messageCount === 2) { // Premier échange (user + assistant)
        const title = await ClaudeService.generateConversationTitle([content, aiResponse], userApiKey);
        await ConversationModel.updateTitle(conversationId, title);
      }

      return res.json({
        success: true,
        data: {
          userMessage,
          assistantMessage
        }
      });

    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi du message',
        error: error.message
      });
    }
  }

  // Mettre à jour le titre d'une conversation
  static async updateConversationTitle(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const conversationId = parseInt(req.params.id);
      const { title } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Le titre est requis'
        });
      }

      // Vérifier que la conversation appartient à l'utilisateur
      const belongsToUser = await ConversationModel.belongsToUser(conversationId, userId);
      if (!belongsToUser) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé à cette conversation'
        });
      }

      const updatedConversation = await ConversationModel.updateTitle(conversationId, title);

      return res.json({
        success: true,
        message: 'Titre mis à jour',
        data: updatedConversation
      });

    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du titre:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du titre',
        error: error.message
      });
    }
  }

  // Supprimer une conversation
  static async deleteConversation(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const conversationId = parseInt(req.params.id);

      // Vérifier que la conversation appartient à l'utilisateur
      const belongsToUser = await ConversationModel.belongsToUser(conversationId, userId);
      if (!belongsToUser) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé à cette conversation'
        });
      }

      await ConversationModel.delete(conversationId);

      return res.json({
        success: true,
        message: 'Conversation supprimée'
      });

    } catch (error: any) {
      console.error('Erreur lors de la suppression de la conversation:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de la conversation',
        error: error.message
      });
    }
  }

  // Analyser une commande avec Claude
  static async analyzeCommand(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { command } = req.body;

      if (!command) {
        return res.status(400).json({
          success: false,
          message: 'La commande est requise'
        });
      }

      // Récupérer la clé API Claude de l'utilisateur
      const userApiKey = await getClaudeApiKey(userId);
      if (!userApiKey) {
        return res.status(503).json({
          success: false,
          message: 'L\'IA Claude n\'est pas configurée. Veuillez ajouter une clé API Anthropic dans les paramètres.'
        });
      }

      const analysis = await ClaudeService.analyzeCommand(command, userApiKey);

      return res.json({
        success: true,
        data: analysis
      });

    } catch (error: any) {
      console.error('Erreur lors de l\'analyse de la commande:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'analyse de la commande',
        error: error.message
      });
    }
  }
}
