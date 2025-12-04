import express, { Request, Response } from 'express'
import cors from 'cors'
import axios from 'axios'
import path from 'path'

const app = express()
const ADMIN_PORT = 3000
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

app.use(cors())
app.use(express.json())

// Servir le fichier HTML statique
app.use(express.static(path.join(__dirname, '../../admin-panel')))

// Login endpoint - valide les credentials et retourne token si admin
app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Appeler le backend pour login
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password })
    
    const { token, user } = response.data.data

    console.log(`Login attempt: ${email}, role: ${user.role}`)

    // Vérifier que c'est un admin
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      console.log(`❌ Admin access denied for ${email} - role: ${user.role}`)
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Vous devez être administrateur.',
        role: user.role
      })
    }

    console.log(`✅ Admin access granted for ${email}`)
    // OK - retourner le token et user
    res.json({
      success: true,
      data: { token, user }
    })
  } catch (error: any) {
    console.error('Login error:', error.message)
    res.status(401).json({
      success: false,
      message: error.response?.data?.message || 'Erreur de connexion'
    })
  }
})

// Proxy toutes les autres requêtes admin vers le backend
app.use('/api/admin', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization
    
    const response = await axios({
      method: req.method as any,
      url: `${BACKEND_URL}/api/admin${req.path}`,
      headers: {
        Authorization: token,
        'Content-Type': 'application/json'
      },
      data: req.body,
      params: req.query
    })

    res.json(response.data)
  } catch (error: any) {
    console.error('Admin API error:', error.message)
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Erreur serveur' }
    )
  }
})

app.listen(ADMIN_PORT, () => {
  console.log(`✅ Admin Panel running on http://0.0.0.0:${ADMIN_PORT}`)
  console.log(`📡 Access at: http://localhost:${ADMIN_PORT}`)
})

