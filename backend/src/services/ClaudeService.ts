import Anthropic from '@anthropic-ai/sdk';
import { MessageModel } from '../models/Message';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

export class ClaudeService {
  // Créer un client Anthropic avec une clé API
  private static createClient(apiKey: string): Anthropic {
    return new Anthropic({
      apiKey: apiKey,
    });
  }

  // Envoyer un message à Claude et obtenir une réponse
  static async sendMessage(
    message: string,
    userApiKey: string,
    conversationId?: number,
    systemPrompt?: string
  ): Promise<string> {
    try {
      if (!userApiKey) {
        throw new Error('Clé API Claude non configurée. Veuillez l\'ajouter dans les paramètres.');
      }

      const anthropic = this.createClient(userApiKey);

      // Récupérer l'historique de conversation si un ID est fourni
      let messages: ChatMessage[] = [];
      
      if (conversationId) {
        const history = await MessageModel.getConversationHistory(conversationId, 20);
        messages = history
          .filter(msg => msg.role !== 'system')
          .map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }));
      }

      // Ajouter le nouveau message
      messages.push({
        role: 'user',
        content: message
      });

      // Définir le prompt système par défaut
      const defaultSystemPrompt = `Tu es AiSystant, un assistant IA expert en DevOps, développement et administration système.
Tu peux aider les utilisateurs avec:
- Le développement de code (Python, JavaScript, TypeScript, etc.)
- L'administration système et les commandes Linux/Unix
- La résolution de problèmes techniques
- Les bonnes pratiques DevOps et CI/CD
- La documentation et l'explication de concepts techniques

Sois précis, clair et professionnel. Fournis des exemples de code quand c'est pertinent.
Utilise le markdown pour formater tes réponses.`;

      // Appeler l'API Claude
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        system: systemPrompt || defaultSystemPrompt,
        messages: messages
      });

      // Extraire le contenu de la réponse
      const textContent = response.content.find(block => block.type === 'text');
      
      if (!textContent || textContent.type !== 'text') {
        throw new Error('Aucune réponse textuelle reçue de Claude');
      }

      return textContent.text;

    } catch (error: any) {
      console.error('Erreur lors de l\'appel à Claude:', error);
      
      if (error.status === 401) {
        throw new Error('Clé API Anthropic invalide. Vérifiez votre configuration dans les paramètres.');
      } else if (error.status === 429) {
        throw new Error('Limite de taux atteinte. Veuillez réessayer dans quelques instants.');
      } else if (error.status === 500) {
        throw new Error('Erreur serveur Anthropic. Veuillez réessayer plus tard.');
      }
      
      throw new Error(`Erreur Claude AI: ${error.message}`);
    }
  }

  // Générer un titre de conversation basé sur les premiers messages
  static async generateConversationTitle(messages: string[], userApiKey: string): Promise<string> {
    try {
      if (!userApiKey) {
        return 'Nouvelle conversation';
      }

      const anthropic = this.createClient(userApiKey);

      const prompt = `Génère un titre court et descriptif (maximum 50 caractères) pour une conversation qui commence par ces messages:

${messages.slice(0, 3).join('\n---\n')}

Réponds uniquement avec le titre, sans guillemets ni ponctuation finale.`;

      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const textContent = response.content.find(block => block.type === 'text');
      
      if (!textContent || textContent.type !== 'text') {
        return 'Nouvelle conversation';
      }

      return textContent.text.trim().slice(0, 50);

    } catch (error) {
      console.error('Erreur lors de la génération du titre:', error);
      return 'Nouvelle conversation';
    }
  }

  // Analyser une commande et suggérer des améliorations
  static async analyzeCommand(command: string, userApiKey: string): Promise<{
    safe: boolean;
    explanation: string;
    suggestions?: string[];
  }> {
    try {
      if (!userApiKey) {
        return {
          safe: false,
          explanation: 'Clé API Claude non configurée'
        };
      }

      const anthropic = this.createClient(userApiKey);

      const prompt = `Analyse cette commande système et détermine si elle est sûre à exécuter:

\`\`\`bash
${command}
\`\`\`

Réponds au format JSON avec:
{
  "safe": true/false,
  "explanation": "explication de ce que fait la commande",
  "suggestions": ["suggestions d'amélioration si nécessaire"]
}`;

      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const textContent = response.content.find(block => block.type === 'text');
      
      if (!textContent || textContent.type !== 'text') {
        return {
          safe: false,
          explanation: 'Impossible d\'analyser la commande'
        };
      }

      // Parser la réponse JSON
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        safe: false,
        explanation: 'Réponse inattendue de l\'IA'
      };

    } catch (error) {
      console.error('Erreur lors de l\'analyse de la commande:', error);
      return {
        safe: false,
        explanation: 'Erreur lors de l\'analyse'
      };
    }
  }

  // Vérifier si l'API Claude est configurée
  static isConfigured(userApiKey?: string): boolean {
    return !!userApiKey && userApiKey.length > 0;
  }
}
