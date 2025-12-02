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
    
    console.log('Parsing response for actions:', response.substring(0, 200) + '...');

    // Regex pour détecter les actions - plus permissive pour gérer les espaces
    const commandRegex = /\[COMMAND:\s*(\d+)\s*:\s*(.+?)\s*\]/g;
    const installRegex = /\[INSTALL:\s*(\d+)\s*:\s*(.+?)\s*\]/g;
    const readFileRegex = /\[READ:\s*(\d+)\s*:\s*(.+?)\s*\]/g;
    const writeFileRegex = /\[WRITE:\s*(\d+)\s*:\s*(.+?)\s*\|\s*(.+?)\s*\]/g;
    const infoRegex = /\[INFO:\s*(\d+)\s*\]/g;

    let match;

    // Extraire les commandes
    while ((match = commandRegex.exec(response)) !== null) {
      const command = match[2].trim();
      console.log(`Found COMMAND action: server ${match[1]}, command: ${command}`);
      actions.push({
        type: 'command',
        serverId: parseInt(match[1]),
        params: { command }
      });
    }

    // Extraire les installations
    while ((match = installRegex.exec(response)) !== null) {
      const packageName = match[2].trim();
      console.log(`Found INSTALL action: server ${match[1]}, package: ${packageName}`);
      actions.push({
        type: 'install',
        serverId: parseInt(match[1]),
        params: { packageName }
      });
    }

    // Extraire les lectures de fichiers
    while ((match = readFileRegex.exec(response)) !== null) {
      const filePath = match[2].trim();
      console.log(`Found READ action: server ${match[1]}, file: ${filePath}`);
      actions.push({
        type: 'read_file',
        serverId: parseInt(match[1]),
        params: { filePath }
      });
    }

    // Extraire les écritures de fichiers
    while ((match = writeFileRegex.exec(response)) !== null) {
      const filePath = match[2].trim();
      const content = match[3].trim();
      console.log(`Found WRITE action: server ${match[1]}, file: ${filePath}`);
      actions.push({
        type: 'write_file',
        serverId: parseInt(match[1]),
        params: { 
          filePath,
          content
        }
      });
    }

    // Extraire les demandes d'info système
    while ((match = infoRegex.exec(response)) !== null) {
      console.log(`Found INFO action: server ${match[1]}`);
      actions.push({
        type: 'info',
        serverId: parseInt(match[1]),
        params: {}
      });
    }

    console.log(`Total actions parsed: ${actions.length}`);
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

    // Vérifier qu'il y a au moins un serveur disponible
    if (!servers || servers.length === 0) {
      throw new Error('Aucun serveur SSH disponible');
    }

    // Construire le prompt système pour l'agent
    const systemPrompt = `Tu es AiSystant, un agent AI expert en DevOps et administration système.
Tu es capable d'exécuter automatiquement des actions SSH sur les serveurs disponibles.

INSTRUCTIONS CRITIQUES - Tu DOIS toujours:
1. Analyser le problème décrit par l'utilisateur
2. Planifier les actions nécessaires
3. INCLURE les actions dans ta réponse en utilisant LES FORMATS EXACTEMENT comme indiqué ci-dessous
4. Expliquer ce que tu vas faire AVANT d'inclure les balises d'action
5. Les balises d'action seront exécutées automatiquement

FORMAT DES ACTIONS (ne change PAS ces formats):
- Exécuter une commande: [COMMAND:SERVER_ID:ta_commande_ici]
- Installer un paquet: [INSTALL:SERVER_ID:nom_du_paquet]
- Lire un fichier: [READ:SERVER_ID:/chemin/du/fichier]
- Écrire un fichier: [WRITE:SERVER_ID:/chemin/fichier|contenu_à_écrire]
- Obtenir les infos système: [INFO:SERVER_ID]

Serveurs disponibles:
${servers.map((s: any) => `- ID ${s.id}: ${s.name} (${s.username}@${s.host}:${s.port})`).join('\n')}

EXEMPLE: Si l'utilisateur demande "Vérifie l'espace disque", tu dois répondre:
"Je vais vérifier l'espace disque sur le serveur XXX. [COMMAND:1:df -h] ou [INFO:1]"

Rappel: Sois précis dans les numéros de serveur et ne modifie JAMAIS les formats des balises.`;

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

      console.log(`Parsed ${actions.length} actions from Claude response`);

      // Exécuter chaque action
      const actionResults: string[] = [];
      for (const action of actions) {
        console.log(`Executing action: ${action.type} on server ${action.serverId}`);
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
