import { ClaudeService } from './ClaudeService';
import { SSHService } from './SSHService';

export interface AIAction {
  type: 'command' | 'install' | 'read_file' | 'write_file' | 'info';
  serverId: number;
  params: any;
}

export class AIAgentService {
  // Analyser la réponse de Claude pour extraire les actions SSH
  static async parseAIResponse(response: string): Promise<AIAction[]> {
    const actions: AIAction[] = [];
    
    // Regex pour détecter les actions
    const commandRegex = /\[COMMAND:(\d+):(.*?)\]/g;
    const installRegex = /\[INSTALL:(\d+):(.*?)\]/g;
    const readFileRegex = /\[READ:(\d+):(.*?)\]/g;
    const writeFileRegex = /\[WRITE:(\d+):(.*?)\|(.*?)\]/g;

    let match;

    // Extraire les commandes
    while ((match = commandRegex.exec(response)) !== null) {
      actions.push({
        type: 'command',
        serverId: parseInt(match[1]),
        params: { command: match[2] }
      });
    }

    // Extraire les installations
    while ((match = installRegex.exec(response)) !== null) {
      actions.push({
        type: 'install',
        serverId: parseInt(match[1]),
        params: { packageName: match[2] }
      });
    }

    // Extraire les lectures de fichiers
    while ((match = readFileRegex.exec(response)) !== null) {
      actions.push({
        type: 'read_file',
        serverId: parseInt(match[1]),
        params: { filePath: match[2] }
      });
    }

    // Extraire les écritures de fichiers
    while ((match = writeFileRegex.exec(response)) !== null) {
      actions.push({
        type: 'write_file',
        serverId: parseInt(match[1]),
        params: { 
          filePath: match[2],
          content: match[3]
        }
      });
    }

    return actions;
  }

  // Exécuter une action SSH
  static async executeAction(action: AIAction, userId: number): Promise<{ success: boolean; output: string; error?: string }> {
    try {
      const server = await SSHService.getServerById(action.serverId);
      
      if (!server || server.user_id !== userId) {
        return {
          success: false,
          output: '',
          error: 'Serveur introuvable ou accès refusé'
        };
      }

      switch (action.type) {
        case 'command': {
          const result = await SSHService.executeCommand(
            action.serverId,
            action.params.command,
            userId
          );
          return {
            success: result.exitCode === 0,
            output: result.output,
            error: result.error
          };
        }

        case 'install': {
          const result = await SSHService.installPackage(
            action.serverId,
            action.params.packageName
          );
          return {
            success: result.exitCode === 0,
            output: result.output,
            error: result.error
          };
        }

        case 'read_file': {
          const content = await SSHService.readFile(
            action.serverId,
            action.params.filePath
          );
          return {
            success: true,
            output: content
          };
        }

        case 'write_file': {
          await SSHService.writeFile(
            action.serverId,
            action.params.filePath,
            action.params.content
          );
          return {
            success: true,
            output: `Fichier écrit: ${action.params.filePath}`
          };
        }

        case 'info': {
          const info = await SSHService.getSystemInfo(action.serverId);
          return {
            success: true,
            output: JSON.stringify(info, null, 2)
          };
        }

        default:
          return {
            success: false,
            output: '',
            error: 'Action inconnue'
          };
      }
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  // Claude agent avec capacités SSH
  static async runSSHAgent(
    message: string,
    conversationId: number,
    userId: number,
    userApiKey: string,
    servers: any[]
  ): Promise<{ response: string; executedActions: any[] }> {
    const executedActions: any[] = [];

    // Construire le prompt système pour l'agent
    const systemPrompt = `Tu es AiSystant, un agent AI expert en DevOps et administration système.
Tu peux analyser des problèmes et exécuter des actions SSH automatiquement pour:
- Installer des paquets
- Exécuter des commandes
- Lire et modifier des fichiers
- Obtenir des informations système

Pour exécuter des actions, utilise ces formats exactement:
[COMMAND:SERVER_ID:commande_à_exécuter]
[INSTALL:SERVER_ID:nom_du_paquet]
[READ:SERVER_ID:/chemin/du/fichier]
[WRITE:SERVER_ID:/chemin/du/fichier|contenu_du_fichier]
[INFO:SERVER_ID]

Serveurs disponibles:
${servers.map((s: any) => `- Serveur ${s.id}: ${s.name} (${s.username}@${s.host}:${s.port})`).join('\n')}

Sois proactif et propose des solutions automatiques. Explique ce que tu vas faire AVANT d'exécuter les actions.`;

    try {
      // Obtenir la réponse initiale de Claude
      const initialResponse = await ClaudeService.sendMessage(
        message,
        userApiKey,
        conversationId,
        systemPrompt
      );

      // Analyser la réponse pour extraire les actions
      const actions = await this.parseAIResponse(initialResponse);

      // Exécuter chaque action
      const actionResults: string[] = [];
      for (const action of actions) {
        const result = await this.executeAction(action, userId);
        actionResults.push(
          `${action.type.toUpperCase()} sur serveur ${action.serverId}: ${result.success ? '✅ Succès' : '❌ Erreur'}\n${result.output || result.error}`
        );
        executedActions.push({
          action,
          result
        });
      }

      // Si des actions ont été exécutées, envoyer un message de suivi à Claude
      let finalResponse = initialResponse;
      if (actions.length > 0) {
        const actionSummary = actionResults.join('\n\n');
        const followUpMessage = `Actions exécutées:\n\n${actionSummary}\n\nVeuillez fournir un résumé final et les prochaines étapes si nécessaire.`;
        
        finalResponse = await ClaudeService.sendMessage(
          followUpMessage,
          userApiKey,
          conversationId,
          systemPrompt
        );
      }

      return {
        response: finalResponse,
        executedActions
      };
    } catch (error: any) {
      throw new Error(`Erreur AI Agent: ${error.message}`);
    }
  }
}
