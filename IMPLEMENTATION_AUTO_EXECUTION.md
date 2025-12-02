# Auto-Exécution des Commandes SSH - Documentation

## 🎯 Objectif
Implémenter l'auto-exécution automatique des commandes SSH pour les cas à **faible risque**, tout en demandant une confirmation pour les risques moyen/élevé.

## 📋 Fichiers Modifiés

### 1. `backend/src/services/AIEngine.ts` ✅ NOUVEAU

**Responsabilités:**
- Analyser les messages utilisateur avec Claude
- Générer des réponses structurées en JSON
- Évaluer le risque de chaque commande
- Déterminer si l'exécution doit être automatique

**Interfaces:**
```typescript
interface AICommandResponse {
  intent: 'monitoring' | 'action' | 'query'
  confidence: number
  parameters: { server?: string, serverId?: number, action?: string }
  riskLevel: 'low' | 'medium' | 'high'
  shouldAutoExecute: boolean
  explanation: string
  commandToExecute?: string
}

interface CommandExecutionResult {
  stdout: string
  stderr?: string
  code: number
  command: string
}
```

**Méthodes principales:**

#### `parseCommand(message: string, userApiKey: string): Promise<AICommandResponse>`
- Envoie le message à Claude avec un prompt système JSON
- Parse la réponse JSON
- Force `shouldAutoExecute = true` si `riskLevel === 'low'`
- Logs de debug

**Exemple de réponse pour "Montre les fichiers":**
```json
{
  "intent": "monitoring",
  "confidence": 0.95,
  "parameters": { "action": "list_files" },
  "riskLevel": "low",
  "shouldAutoExecute": true,
  "explanation": "Je vais lister les fichiers du répertoire courant",
  "commandToExecute": "ls -la"
}
```

#### `explainResult(result: CommandExecutionResult, userApiKey: string): Promise<string>`
- Fait expliquer le résultat par Claude en français
- Fallback sur un message simple si erreur
- Réponse concise (2-3 phrases max)

---

### 2. `backend/src/controllers/ChatController.ts` ✅ MODIFIÉ

**Changement majeur dans `sendMessage()`:**

#### Avant:
```typescript
// Mode SSH Agent uniquement
if (useSSHAgent) {
  // ...execute AIAgentService
} else {
  aiResponse = await ClaudeService.sendMessage(...)
}
```

#### Après:
```typescript
// ✅ NOUVEAU: Mode auto-exécution par défaut (sauf si useSSHAgent)
if (!useSSHAgent) {
  const parsed = await AIEngine.parseCommand(message, userApiKey)
  
  // Query sans commande
  if (parsed.intent === 'query' || !parsed.commandToExecute) {
    aiResponse = await ClaudeService.sendMessage(...)
    executionMode = 'query'
  }
  // ✅ Auto-exécution (faible risque)
  else if (parsed.shouldAutoExecute && parsed.riskLevel === 'low') {
    const result = await SSHService.executeCommand(...)
    const explanation = await AIEngine.explainResult(result, userApiKey)
    aiResponse = explanation
    commandOutput = result.stdout
    executionMode = 'auto_executed'
  }
  // ⚠️ Confirmation requise (moyen/haut risque)
  else if (parsed.commandToExecute && ...) {
    aiResponse = `⚠️ **Confirmation requise**\n...`
    executionMode = 'awaiting_confirmation'
  }
}
```

**Modes de réponse:**
- `auto_executed`: Commande exécutée automatiquement
- `awaiting_confirmation`: En attente de confirmation
- `query`: Question/réponse normale

**Métadata ajoutées au message:**
```typescript
metadata: {
  executionMode,
  commandOutput,
  executedBy: executionMode === 'auto_executed' ? 'claude_auto' : undefined
}
```

---

### 3. `frontend/src/components/ChatMessage.tsx` ✅ MODIFIÉ

**Nouvelles propriétés:**
```typescript
interface ChatMessageProps {
  message: {
    id: string
    content: string
    role: 'user' | 'assistant' | 'system'
    timestamp: Date | string
    commandOutput?: string          // ✅ NOUVEAU
    executedBy?: 'claude_auto' | 'user_confirmed'  // ✅ NOUVEAU
  }
}
```

**Affichage du badge:**
```typescript
{message.executedBy === 'claude_auto' && (
  <span className="badge-auto">🤖 Claude a exécuté</span>
)}
{message.executedBy === 'user_confirmed' && (
  <span className="badge-confirmed">👤 Tu as confirmé</span>
)}
```

**Affichage du résultat:**
```typescript
{message.commandOutput && (
  <div className="result-box">
    <div className="font-semibold">📤 Résultat:</div>
    <pre>{message.commandOutput}</pre>
  </div>
)}
```

---

### 4. `frontend/src/pages/Chat.tsx` ✅ MODIFIÉ

**Changement dans `sendMessage()`:**

```typescript
const response = await chatAPI.sendMessage(...)
const executionMode = response.data.mode  // ✅ NOUVEAU

// Ajouter metadata au message
const assistantMessageWithMeta = {
  ...data.assistantMessage,
  commandOutput: data.commandOutput,
  executedBy: executionMode === 'auto_executed' ? 'claude_auto' : undefined
}

// Debug logs
if (executionMode === 'auto_executed') {
  console.log('[Chat] ✅ Commande auto-exécutée par Claude')
} else if (executionMode === 'awaiting_confirmation') {
  console.log('[Chat] ⚠️ En attente de confirmation')
}
```

---

## 🔒 Règles de Risque

### ✅ FAIBLE RISQUE (Auto-exécution):
```
- ls, ls -la, find, cat, grep, tail, head
- df, du, ps, top, netstat, lsof
- systemctl status (lecture uniquement)
- docker ps, docker logs
- pwd, whoami, date, uptime
- git status, git log, npm list, pip list
- curl (GET), wget (lecture)
- apt list, apt search
- sudo apt list, sudo apt search
- sudo apt update (mise à jour cache uniquement)
```

### ⚠️ MOYEN RISQUE (Confirmation requise):
```
- systemctl restart, systemctl reload
- systemctl start (certains services)
- docker start, docker stop, docker restart
- npm install
- git pull, git fetch
- Modifications de fichiers
- apt install <package>
- apt upgrade, apt remove, apt autoremove
- sudo apt install, sudo apt upgrade, sudo apt remove
- sudo apt autoremove
```

### ❌ HAUT RISQUE (Refuser):
```
- systemctl stop, reboot, shutdown, poweroff
- rm, rm -rf, mv, del (destructeur)
- systemctl disable, systemctl mask
- docker rm, docker volume rm
- kill -9, killall
- chmod -R 777, chown root
- sudo rm -rf, sudo reboot, sudo shutdown
- sudo poweroff, sudo halt
```

---

## 🧪 Cas de Test

### Test 1: Auto-exécution (Faible risque - ls)
```
User: "Montre les fichiers"
Expected:
✅ Claude exécute 'ls -la'
✅ Affiche les fichiers
✅ Badge "🤖 Claude a exécuté"
✅ Résultat visible dans le chat
```

### Test 2: Auto-exécution (Faible risque - apt)
```
User: "Liste les paquets disponibles"
Expected:
✅ Claude exécute 'apt list --available'
✅ Affiche les paquets
✅ Badge "🤖 Claude a exécuté"
✅ Résultat visible
```

### Test 3: Auto-exécution (Faible risque - sudo apt update)
```
User: "Update apt"
Expected:
✅ Claude exécute 'sudo apt update'
✅ Affiche les updates disponibles
✅ Badge "🤖 Claude a exécuté"
```

### Test 4: Confirmation requise (Moyen risque - apt install)
```
User: "Installe nginx"
Expected:
⚠️ Message "Confirmation requise"
⚠️ Affiche la commande: sudo apt install -y nginx
❌ N'exécute PAS automatiquement
✅ Attend la confirmation de l'utilisateur
```

### Test 5: Confirmation requise (Moyen risque - apt upgrade)
```
User: "Upgrade tous les paquets"
Expected:
⚠️ Message "Confirmation requise"
⚠️ Affiche la commande: sudo apt upgrade -y
❌ N'exécute PAS automatiquement
✅ Demande confirmation
```

### Test 6: Confirmation requise (Moyen risque - systemctl restart)
```
User: "Redémarre nginx"
Expected:
⚠️ Message "Confirmation requise"
⚠️ Affiche la commande: sudo systemctl restart nginx
❌ N'exécute PAS automatiquement
✅ Attend la confirmation
```

### Test 7: Query sans commande
```
User: "Quels sont tes capacités?"
Expected:
✅ Réponse normale d'une question
✅ Pas d'auto-exécution
✅ Mode 'query'
```

### Test 8: Haut risque - Refusé
```
User: "Supprime le répertoire /tmp"
Expected:
❌ Refus d'exécution (HIGH RISK)
✅ Message: "Je refuse d'exécuter cette commande destructrice"
✅ Pas d'auto-exécution
```

---

## 🔍 Debug et Logs

### Backend (console):
```
[AIEngine] Parsing command: "ls -la"
[AIEngine] Claude response: {"intent":"monitoring",...}
[AIEngine] Parsed: intent=monitoring, risk=low, autoExecute=true, command=ls -la
[ChatController] Executing on server 1: ls -la
[ChatController] Command executed successfully: code=0
```

### Frontend (console):
```
[Chat] Response mode: auto_executed
[Chat] ✅ Commande auto-exécutée par Claude
```

---

## 📊 Flux de Requête

```
User Message
    ↓
ChatController.sendMessage()
    ↓
AIEngine.parseCommand()  ← Claude analyzes + evaluates risk
    ↓
[Decision]
    ├─ Query? → Normal Claude response
    ├─ Low risk + auto-execute?
    │   ├─ SSHService.executeCommand()
    │   ├─ AIEngine.explainResult()
    │   └─ Return: mode='auto_executed'
    └─ Medium/High risk?
        └─ Return: mode='awaiting_confirmation' + need approval
    ↓
Frontend receives response
    ├─ If auto_executed → Show badge "🤖 Claude a exécuté"
    ├─ If awaiting_confirmation → Show approval buttons
    └─ If query → Show normal response
    ↓
Display in Chat UI
```

---

## 🚀 Déploiement

1. **Backend:**
   - Créer `AIEngine.ts`
   - Modifier `ChatController.ts`
   - Tests des endpoints

2. **Frontend:**
   - Modifier `ChatMessage.tsx`
   - Modifier `Chat.tsx`
   - Tests du UI

3. **Tests E2E:**
   - Test 1-4 ci-dessus
   - Vérifier les logs
   - Vérifier la DB

---

## 🛠️ Dépendances

- ✅ `@anthropic-ai/sdk` (already installed)
- ✅ `express` (already installed)
- ✅ React/Tailwind (already installed)

Aucune nouvelle dépendance requise!

---

## ⚠️ Notes Importantes

1. **JSON Parsing:**
   - Claude DOIT retourner du JSON valide
   - Le prompt système force ce comportement
   - Fallback sur chat normal si parsing échoue

2. **Sécurité:**
   - Vérifier `server.user_id === userId` avant exécution
   - Log toutes les auto-exécutions
   - Whitelist des commandes "safe"

3. **Performance:**
   - AIEngine appelle Claude 2 fois pour les auto-exec
   - Première fois: analyser + décider
   - Deuxième fois: expliquer le résultat
   - Temps total ~2-3s par message

4. **Futur:**
   - Ajouter confirmation UI avec boutons Oui/Non
   - Historique des commandes auto-exécutées
   - Statistiques du taux d'auto-exec
   - Customisation des règles de risque par utilisateur
