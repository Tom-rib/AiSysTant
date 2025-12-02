import Anthropic from '@anthropic-ai/sdk';

// ✅ NOUVEAU: Interface pour la réponse structurée de Claude
export interface AICommandResponse {
  intent: 'monitoring' | 'action' | 'query';
  confidence: number;
  parameters: {
    server?: string;
    serverId?: number;
    action?: string;
  };
  riskLevel: 'low' | 'medium' | 'high';
  shouldAutoExecute: boolean;
  explanation: string;
  commandToExecute?: string;
}

// ✅ NOUVEAU: Interface pour le résultat d'exécution
export interface CommandExecutionResult {
  stdout: string;
  stderr?: string;
  code: number;
  command: string;
}

const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

export class AIEngine {
  private static createClient(apiKey: string): Anthropic {
    return new Anthropic({
      apiKey: apiKey,
    });
  }

  // ✅ NOUVEAU: Prompt système avec instruction JSON
  private static readonly SYSTEM_PROMPT = `Tu es AiSystant, un agent IA expert en DevOps et administration système.

Tu dois TOUJOURS répondre UNIQUEMENT avec du JSON valide (sans texte avant ni après) au format suivant:
{
  "intent": "monitoring" | "action" | "query",
  "confidence": 0.0-1.0,
  "parameters": {
    "server": "nom_serveur_ou_id",
    "serverId": numéro_id_si_connu,
    "action": "description_de_l_action"
  },
  "riskLevel": "low" | "medium" | "high",
  "shouldAutoExecute": true/false,
  "explanation": "Explication en français de ce que tu vas faire",
  "commandToExecute": "commande_shell_exacte_à_exécuter_ou_null"
}

RÈGLES POUR riskLevel ET shouldAutoExecute:

**FAIBLE RISQUE (shouldAutoExecute = true):**
- ls, la, l, find, cat, grep, tail, head, wc, du, df, ps, top, netstat, lsof
- systemctl status, systemctl is-active, docker ps, docker logs
- pwd, whoami, date, uptime, uname, hostnames
- git status, git log, npm list, pip list
- curl (GET uniquement), wget (lecture uniquement)
- ✅ apt list, apt search, apt update (lecture/cache)
- ✅ sudo apt list, sudo apt search, sudo apt update

**MOYEN RISQUE (shouldAutoExecute = false, demande confirmation):**
- systemctl restart, systemctl reload, systemctl start (certains services)
- docker start, docker stop, docker restart
- npm install (packages spécifiques)
- git pull, git fetch
- Configuration changes (modifying files)
- ✅ apt install package, apt upgrade, apt remove (avec sudo)
- ✅ sudo apt install, sudo apt upgrade, sudo apt autoremove

**HAUT RISQUE (shouldAutoExecute = false, refuser):**
- systemctl stop, reboot, shutdown, poweroff
- rm, rm -rf, mv (destructeur), del
- systemctl disable, systemctl mask
- docker rm, docker rmi, docker volume rm
- kill -9, killall
- chmod -R 777, chown modifications à root
- reboot, halt
- ❌ sudo rm -rf, sudo reboot, sudo shutdown (destructeur avec privileges)

EXEMPLES DE RÉPONSE VALIDE:

Utilisateur: "Montre les fichiers"
RÉPONSE JSON:
{
  "intent": "monitoring",
  "confidence": 0.95,
  "parameters": {"action": "list_files"},
  "riskLevel": "low",
  "shouldAutoExecute": true,
  "explanation": "Je vais lister les fichiers du répertoire courant",
  "commandToExecute": "ls -la"
}

Utilisateur: "Liste les paquets disponibles"
RÉPONSE JSON:
{
  "intent": "monitoring",
  "confidence": 0.95,
  "parameters": {"action": "list_packages"},
  "riskLevel": "low",
  "shouldAutoExecute": true,
  "explanation": "Je vais afficher les paquets disponibles dans apt",
  "commandToExecute": "apt list --available"
}

Utilisateur: "Update apt"
RÉPONSE JSON:
{
  "intent": "action",
  "confidence": 0.9,
  "parameters": {"action": "update_apt_cache"},
  "riskLevel": "low",
  "shouldAutoExecute": true,
  "explanation": "Je vais mettre à jour le cache apt",
  "commandToExecute": "sudo apt update"
}

Utilisateur: "Installe nginx"
RÉPONSE JSON:
{
  "intent": "action",
  "confidence": 0.9,
  "parameters": {"action": "install_package", "package": "nginx"},
  "riskLevel": "medium",
  "shouldAutoExecute": false,
  "explanation": "Tu dois confirmer l'installation de nginx car cela va modifier le système",
  "commandToExecute": "sudo apt install -y nginx"
}

Utilisateur: "Upgrade tous les paquets"
RÉPONSE JSON:
{
  "intent": "action",
  "confidence": 0.85,
  "parameters": {"action": "upgrade_system"},
  "riskLevel": "medium",
  "shouldAutoExecute": false,
  "explanation": "Tu dois confirmer la mise à jour du système car cela peut casser des services",
  "commandToExecute": "sudo apt upgrade -y"
}

Utilisateur: "Redémarre nginx"
RÉPONSE JSON:
{
  "intent": "action",
  "confidence": 0.9,
  "parameters": {"action": "restart_service", "server": "nginx"},
  "riskLevel": "medium",
  "shouldAutoExecute": false,
  "explanation": "Tu dois confirmer le redémarrage de nginx car c'est une action qui peut impacter le service",
  "commandToExecute": "sudo systemctl restart nginx"
}

Utilisateur: "Supprime le répertoire /tmp"
RÉPONSE JSON:
{
  "intent": "action",
  "confidence": 0.9,
  "parameters": {"action": "delete_directory"},
  "riskLevel": "high",
  "shouldAutoExecute": false,
  "explanation": "DANGER: Cette action est destructrice et irreversible. Je refuse de l'exécuter.",
  "commandToExecute": null
}

Utilisateur: "Quels sont tes capacités?"
RÉPONSE JSON:
{
  "intent": "query",
  "confidence": 0.95,
  "parameters": {"action": "get_info"},
  "riskLevel": "low",
  "shouldAutoExecute": false,
  "explanation": "C'est une question sans commande à exécuter",
  "commandToExecute": null
}`;

  // ✅ NOUVEAU: Analyser la commande et retourner une réponse structurée
  static async parseCommand(message: string, userApiKey: string): Promise<AICommandResponse> {
    try {
      console.log(`[AIEngine] Parsing command: "${message}"`);

      const anthropic = this.createClient(userApiKey);

      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1000,
        system: this.SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      });

      const textContent = response.content.find(block => block.type === 'text');

      if (!textContent || textContent.type !== 'text') {
        throw new Error('Aucune réponse textuelle reçue de Claude');
      }

      // ✅ NOUVEAU: Parser la réponse JSON
      const jsonText = textContent.text.trim();
      console.log(`[AIEngine] Claude response: ${jsonText.substring(0, 200)}...`);

      const parsed: AICommandResponse = JSON.parse(jsonText);

      // ✅ NOUVEAU: Validation
      if (!parsed.riskLevel) {
        throw new Error('riskLevel manquant dans la réponse');
      }

      // ✅ NOUVEAU: Logique de shouldAutoExecute basée sur riskLevel
      if (parsed.riskLevel === 'low') {
        parsed.shouldAutoExecute = true;
      } else if (parsed.riskLevel === 'medium' || parsed.riskLevel === 'high') {
        parsed.shouldAutoExecute = false;
      }

      console.log(`[AIEngine] Parsed: intent=${parsed.intent}, risk=${parsed.riskLevel}, autoExecute=${parsed.shouldAutoExecute}, command=${parsed.commandToExecute}`);

      return parsed;

    } catch (error: any) {
      console.error('[AIEngine] Error parsing command:', error);
      throw new Error(`Erreur lors de l'analyse de la commande: ${error.message}`);
    }
  }

  // ✅ NOUVEAU: Expliquer le résultat d'exécution à Claude
  static async explainResult(
    result: CommandExecutionResult,
    userApiKey: string
  ): Promise<string> {
    try {
      console.log(`[AIEngine] Explaining result: code=${result.code}, stdout length=${result.stdout.length}`);

      const anthropic = this.createClient(userApiKey);

      const prompt = `La commande suivante a été exécutée:
Commande: ${result.command}
Code de sortie: ${result.code}
Résultat:
${result.stdout}
${result.stderr ? `Erreur:\n${result.stderr}` : ''}

Explique brièvement le résultat en français. Sois concis (2-3 phrases max).`;

      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 500,
        system: 'Tu es un expert en administration système. Explique les résultats de commandes en français de manière claire et concise.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const textContent = response.content.find(block => block.type === 'text');

      if (!textContent || textContent.type !== 'text') {
        return 'Commande exécutée avec succès.';
      }

      return textContent.text.trim();

    } catch (error: any) {
      console.error('[AIEngine] Error explaining result:', error);
      return `Commande exécutée (code ${result.code}). ${result.stderr || result.stdout.substring(0, 100)}`;
    }
  }
}
