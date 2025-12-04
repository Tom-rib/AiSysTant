import express, { Request, Response } from 'express'
import cors from 'cors'
import axios from 'axios'
import path from 'path'
import fs from 'fs'

const app = express()
const ADMIN_PORT = parseInt(process.env.ADMIN_PORT || '3002', 10)
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

app.use(cors())
app.use(express.json())

// Déterminer le chemin du dossier admin-panel
const adminPanelPath = path.join(__dirname, '../../admin-panel')
console.log('📁 Admin Panel Path:', adminPanelPath)
console.log('📄 Folder exists:', fs.existsSync(adminPanelPath))
console.log('📄 index.html exists:', fs.existsSync(path.join(adminPanelPath, 'index.html')))

// Servir le fichier HTML statique
app.use(express.static(adminPanelPath))

// Route pour la racine - servir index.html explicitement
app.get('/', (req: Request, res: Response) => {
  const filePath = path.join(adminPanelPath, 'index.html')
  console.log('GET / - Serving:', filePath)
  res.sendFile(filePath)
})

// Login endpoint - valide les credentials et retourne token si admin
app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    console.log(`\n🔐 Login attempt: ${email}`)

    // Appeler le backend pour login
    console.log(`📡 Calling backend: ${BACKEND_URL}/api/auth/login`)
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password })
    
    const { token, user } = response.data.data

    console.log(`✅ Backend response: role = ${user.role}`)

    // Vérifier que c'est un admin
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      console.log(`❌ Admin access denied - role is: ${user.role}`)
      return res.status(403).json({
        success: false,
        message: `Accès refusé. Votre rôle est: ${user.role}. Vous devez être administrateur.`,
        role: user.role
      })
    }

    console.log(`✅ Admin access GRANTED for ${email}`)
    res.json({
      success: true,
      data: { token, user }
    })
  } catch (error: any) {
    console.error('❌ Login error:', error.message)
    res.status(401).json({
      success: false,
      message: error.response?.data?.message || error.message || 'Erreur de connexion au backend'
    })
  }
})

// Proxy toutes les requêtes /api/admin vers le backend
app.use('/api/admin', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization
    console.log(`\n📡 Admin API request: ${req.method} ${req.path}`)
    
    if (!token) {
      console.log('❌ No token provided')
      return res.status(401).json({ error: 'No token' })
    }
    
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

    console.log(`✅ Backend response: ${response.status}`)
    res.json(response.data)
  } catch (error: any) {
    console.error(`❌ Admin API error:`, error.message)
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: error.message }
    })
  }
})

app.listen(ADMIN_PORT, '0.0.0.0', () => {
  console.log(`\n✅ Admin Panel Server ready!`)
  console.log(`📡 Listening on: http://0.0.0.0:${ADMIN_PORT}`)
  console.log(`🌐 Access from: http://192.168.136.149:${ADMIN_PORT}`)
  console.log(`📍 Backend URL: ${BACKEND_URL}\n`)
})




