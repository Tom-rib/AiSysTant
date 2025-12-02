import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth'
import { query } from '../config/database'
import crypto from 'crypto'

const router = Router()

// Middleware pour vérifier l'authentification
router.use(authMiddleware)

// Fonction pour chiffrer la clé API
const encryptApiKey = (apiKey: string, encryptionKey: string): string => {
  const algorithm = 'aes-256-cbc'
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(encryptionKey, 'hex'), iv)
  let encrypted = cipher.update(apiKey, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

// Fonction pour déchiffrer la clé API
const decryptApiKey = (encryptedApiKey: string, encryptionKey: string): string => {
  const algorithm = 'aes-256-cbc'
  const parts = encryptedApiKey.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = parts[1]
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(encryptionKey, 'hex'), iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

// GET: Vérifier si l'utilisateur a une clé API configurée
router.get('/claude-key', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié'
      })
    }

    const result = await query(
      'SELECT id FROM user_settings WHERE user_id = $1 AND setting_name = $2',
      [userId, 'claude_api_key']
    )

    res.json({
      success: true,
      hasKey: result.rows.length > 0
    })
  } catch (error: any) {
    console.error('Erreur lors de la vérification de la clé API:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    })
  }
})

// POST: Sauvegarder ou mettre à jour la clé API Claude
router.post('/claude-key', async (req: Request, res: Response) => {
  try {
    const { claudeApiKey } = req.body
    const userId = (req as any).user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié'
      })
    }

    if (!claudeApiKey || claudeApiKey.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Clé API Claude requise'
      })
    }

    // Valider le format de la clé (doit commencer par sk-ant-)
    if (!claudeApiKey.startsWith('sk-ant-')) {
      return res.status(400).json({
        success: false,
        message: 'Format de clé API invalide. La clé doit commencer par sk-ant-'
      })
    }

    // Générer une clé de chiffrement à partir du secret JWT
    const encryptionKey = crypto
      .createHash('sha256')
      .update(process.env.JWT_SECRET || 'votre-secret-super-secure-change-moi-en-prod')
      .digest('hex')
      .substring(0, 64)

    // Chiffrer la clé API
    const encryptedKey = encryptApiKey(claudeApiKey.trim(), encryptionKey)

    // Vérifier si une clé existe déjà
    const existingKey = await query(
      'SELECT id FROM user_settings WHERE user_id = $1 AND setting_name = $2',
      [userId, 'claude_api_key']
    )

    if (existingKey.rows.length > 0) {
      // Mettre à jour la clé existante
      await query(
        'UPDATE user_settings SET setting_value = $1, updated_at = NOW() WHERE user_id = $2 AND setting_name = $3',
        [encryptedKey, userId, 'claude_api_key']
      )
    } else {
      // Insérer une nouvelle clé
      await query(
        'INSERT INTO user_settings (user_id, setting_name, setting_value, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
        [userId, 'claude_api_key', encryptedKey]
      )
    }

    res.json({
      success: true,
      message: 'Clé API Claude sauvegardée avec succès'
    })
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde de la clé API:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la sauvegarde'
    })
  }
})

// Fonction pour récupérer la clé API Claude pour un utilisateur
export const getClaudeApiKey = async (userId: number): Promise<string | null> => {
  try {
    const result = await query(
      'SELECT setting_value FROM user_settings WHERE user_id = $1 AND setting_name = $2',
      [userId, 'claude_api_key']
    )

    if (result.rows.length === 0) {
      return null
    }

    const encryptedKey = result.rows[0].setting_value
    const encryptionKey = crypto
      .createHash('sha256')
      .update(process.env.JWT_SECRET || 'votre-secret-super-secure-change-moi-en-prod')
      .digest('hex')
      .substring(0, 64)

    return decryptApiKey(encryptedKey, encryptionKey)
  } catch (error: any) {
    console.error('Erreur lors de la récupération de la clé API:', error)
    return null
  }
}

export default router
