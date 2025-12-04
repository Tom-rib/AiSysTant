import express, { Request, Response } from 'express'
import cors from 'cors'
import axios from 'axios'

const app = express()
const ADMIN_PORT = 3000
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

app.use(cors())
app.use(express.json())

// Login endpoint - valide les credentials et retourne token si admin
app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Appeler le backend pour login
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password })
    
    const { token, user } = response.data.data

    // Vérifier que c'est un admin
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Vous devez être administrateur.',
        role: user.role
      })
    }

    // OK - retourner le token et user
    res.json({
      success: true,
      data: { token, user }
    })
  } catch (error: any) {
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
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Erreur serveur' }
    )
  }
})

app.listen(ADMIN_PORT, () => {
  console.log(`✅ Admin API server running on http://localhost:${ADMIN_PORT}`)
})
