import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ConversationModel } from '../models/Conversation';
import { MessageModel } from '../models/Message';
import { ClaudeService } from '../services/ClaudeService';
import { AIAgentService } from '../services/AIAgentService';
import { SSHService } from '../services/SSHService';
// ✅ NOUVEAU: Importer AIEngine pour l'auto-exécution
import { AIEngine } from '../services/AIEngine';
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
      const { content, useSSHAgent, serverIds } = req.body;

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

      let aiResponse: string = '';
      let executedActions: any[] = [];
      let executionMode: 'auto_executed' | 'awaiting_confirmation' | 'query' = 'query';
      let commandOutput: string | undefined;

      // ✅ NOUVEAU: Mode auto-exécution (nouvelle logique)
      if (!useSSHAgent) {
        try {
          console.log(`[ChatController] Parsing command with AIEngine for: "${content}"`);
          
          // ✅ NOUVEAU: Analyser la commande avec AIEngine
          const parsed = await AIEngine.parseCommand(content, userApiKey);
          console.log(`[ChatController] ParsedCommand result:`, JSON.stringify(parsed, null, 2));

          // ✅ NOUVEAU: Si c'est une query sans commande, répondre normalement
          if (parsed.intent === 'query' || !parsed.commandToExecute) {
            console.log(`[ChatController] Query mode - using normal chat`);
            aiResponse = await ClaudeService.sendMessage(content, userApiKey, conversationId);
            executionMode = 'query';
          }
          // ✅ NOUVEAU: Vérifier shouldAutoExecute et riskLevel === 'low'
          else if (parsed.shouldAutoExecute && parsed.riskLevel === 'low' && parsed.commandToExecute) {
            console.log(`[ChatController] Auto-executing command: "${parsed.commandToExecute}"`);
            
            // ✅ NOUVEAU: Récupérer les serveurs disponibles
            const userServers = await SSHService.getServersByUserId(userId);
            
            // ✅ MODIFIÉ: Utiliser serverIds (array) au lieu de serverId (single)
            let targetServerIds = (serverIds && serverIds.length > 0) 
              ? serverIds 
              : (userServers.length > 0 ? [userServers[0].id] : []);

            if (targetServerIds.length === 0 || userServers.length === 0) {
              // Pas de serveur, utiliser le mode confirmation
              console.log(`[ChatController] No server available, fallback to confirmation mode`);
              aiResponse = await ClaudeService.sendMessage(content, userApiKey, conversationId);
              executionMode = 'awaiting_confirmation';
            } else {
              // ✅ MODIFIÉ: Exécuter sur TOUS les serveurs sélectionnés
              console.log(`[ChatController] Executing on servers ${targetServerIds.join(',')} : ${parsed.commandToExecute}`);
              
              const results: any[] = [];
              for (const serverId of targetServerIds) {
                try {
                  const result = await SSHService.executeCommand(serverId, parsed.commandToExecute, userId);
                  results.push({
                    serverId,
                    command: result.command,
                    stdout: result.output,
                    stderr: result.error,
                    code: result.exitCode
                  });
                  console.log(`[ChatController] Command executed on server ${serverId}: code=${result.exitCode}`);
                } catch (error: any) {
                  results.push({
                    serverId,
                    command: parsed.commandToExecute,
                    error: error.message
                  });
                  console.error(`[ChatController] Error executing on server ${serverId}:`, error);
                }
              }

              // ✅ MODIFIÉ: Formater les résultats de tous les serveurs
              const formattedResults = results.map((r: any) => 
                `[Serveur ${r.serverId}]\nStatus: ${r.code === 0 ? 'Succès' : 'Erreur'}\n${r.stdout || r.error}`
              ).join('\n\n---\n\n');
              
              const combinedResult: any = {
                command: parsed.commandToExecute,
                stdout: formattedResults,
                stderr: results.filter((r: any) => r.code !== 0).map((r: any) => r.stderr || r.error).join('\n'),
                code: results.every((r: any) => r.code === 0) ? 0 : 1
              };
              const explanation = await AIEngine.explainResult(combinedResult, userApiKey);

              // ✅ MODIFIÉ: Sauvegarder
              aiResponse = explanation;
              commandOutput = results.map((r: any) => `[Serveur ${r.serverId}]\n${r.stdout || r.error}`).join('\n\n');
              executionMode = 'auto_executed';

              console.log(`[ChatController] All commands executed successfully`);
            }
          }
          // ✅ NOUVEAU: Mode confirmation pour risque moyen/haut
          else if (parsed.commandToExecute && (parsed.riskLevel === 'medium' || parsed.riskLevel === 'high')) {
            console.log(`[ChatController] Asking for confirmation (risk=${parsed.riskLevel}): "${parsed.commandToExecute}"`);
            aiResponse = `⚠️ **Confirmation requise**\n\n${parsed.explanation}\n\nCommande à exécuter:\n\`\`\`bash\n${parsed.commandToExecute}\n\`\`\`\n\nVeux-tu continuer ?`;
            executionMode = 'awaiting_confirmation';
          }
          // Fallback: répondre normalement
          else {
            aiResponse = await ClaudeService.sendMessage(content, userApiKey, conversationId);
            executionMode = 'query';
          }

        } catch (parseError: any) {
          console.error('[ChatController] Error in auto-execution flow:', parseError);
          // En cas d'erreur, utiliser le mode chat normal
          aiResponse = await ClaudeService.sendMessage(content, userApiKey, conversationId);
          executionMode = 'query';
        }
      }
      // Mode SSH Agent (legacy - garder pour compatibilité)
      else if (useSSHAgent) {
        // Récupérer les serveurs de l'utilisateur
        const userServers = await SSHService.getServersByUserId(userId);
        
        if (userServers.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Aucun serveur SSH configuré'
          });
        }

        // ✅ MODIFIÉ: Passer serverIds à l'agent
        const targetServers = serverIds && serverIds.length > 0
          ? userServers.filter(s => serverIds.includes(s.id))
          : userServers;

        // Exécuter l'agent AI avec capacités SSH
        const agentResult = await AIAgentService.runSSHAgent(
          content,
          conversationId,
          userId,
          userApiKey,
          targetServers
        );

        aiResponse = agentResult.response;
        executedActions = agentResult.executedActions;
        executionMode = 'query';
      }

      // Sauvegarder la réponse de l'IA
      const assistantMessage = await MessageModel.create({
        conversation_id: conversationId,
        content: aiResponse,
        role: 'assistant',
        // ✅ NOUVEAU: Ajouter metadata pour le mode d'exécution
        metadata: {
          executionMode,
          commandOutput,
          executedBy: executionMode === 'auto_executed' ? 'claude_auto' : undefined
        }
      });

      // Générer un titre si c'est le premier message
      const messageCount = await MessageModel.countByConversationId(conversationId);
      if (messageCount === 2) { // Premier échange (user + assistant)
        const title = await ClaudeService.generateConversationTitle([content, aiResponse], userApiKey);
        await ConversationModel.updateTitle(conversationId, title);
      }

      // ✅ NOUVEAU: Retourner le mode d'exécution dans la réponse
      return res.json({
        success: true,
        mode: executionMode,
        data: {
          userMessage,
          assistantMessage,
          executedActions: executedActions.length > 0 ? executedActions : undefined,
          commandOutput: executionMode === 'auto_executed' ? commandOutput : undefined
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
