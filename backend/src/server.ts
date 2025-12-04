import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import path from 'path';

// Configuration
dotenv.config();

// Import des routes
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import sshRoutes from './routes/ssh';
import statsRoutes from './routes/stats';
import settingsRoutes from './routes/settings';
// ✅ NOUVEAU: Importer les routes du terminal SSH
import sshTerminalRoutes from './routes/ssh-terminal';
// ✅ NOUVEAU: Importer les routes du shell SSH persistant
import sshShellRoutes from './routes/ssh-shell';
// ✅ NOUVEAU: Importer les routes des groupes de serveurs
import serverGroupsRoutes from './routes/server-groups';
// ✅ NOUVEAU: Importer les routes admin
import adminRoutes from './routes/admin';
// ✅ NOUVEAU: Importer les handlers Socket.io pour le terminal
import { setupTerminalSockets } from './sockets/terminal';

// Import des configurations
import pool from './config/database';
import { connectRedis } from './config/redis';
import redisClient from './config/redis';

// Import des services
import { SSHService } from './services/SSHService';

// Import des middlewares
import { authenticate } from './middleware/auth';

// Configuration de l'application
const app = express();
const httpServer = createServer(app);
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

// ✅ CORRIGÉ: Configuration de Socket.IO sans middleware d'auth (on vérifie à la main dans setupTerminalSockets)
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000', 
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'http://192.168.136.149:5173',
        'http://192.168.136.149:3000',
        'http://172.18.0.1:5173',
        'http://172.18.0.1:3000',
        'http://192.168.1.100:5173',
        'http://192.168.1.100:3000',
      ];
      
      // Accepter aussi si pas d'origin (serveur interne) ou si c'est une IP locale
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Origin non autorisée: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
    allowEIO3: true  // ✅ CORRIGÉ: Accepter EIO3 aussi
  } as any,
  pingInterval: parseInt(process.env.WS_PING_INTERVAL || '25000'),
  pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '60000'),
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
  maxHttpBufferSize: 1e7
});

// ✅ NOUVEAU: Initialiser les sockets du terminal (FUSIONNE tous les handlers)
setupTerminalSockets(io);

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS - Configuration correcte pour plusieurs origines
const allowedOrigins = [
  'http://localhost:5173',
  'http://192.168.136.149:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (comme curl, Postman)
    if (!origin) return callback(null, true);
    
    // Vérifier si l'origine est autorisée
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Serve admin panel HTML
app.get('/admin-panel', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../admin-panel/index.html'))
});

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'AiSystant API v1.0.0',
    endpoints: {
      auth: '/api/auth',
      chat: '/api/chat',
      ssh: '/api/ssh',
      stats: '/api/stats',
      admin: '/api/admin',
      health: '/api/health',
      adminPanel: '/admin-panel'
    }
  });
});

// Health check
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    
    let redisStatus = 'connected';
    try {
      await redisClient.ping();
    } catch {
      redisStatus = 'disconnected';
    }
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: redisStatus,
        api: 'running'
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Service indisponible'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ssh', sshRoutes);
// ✅ NOUVEAU: Routes du terminal SSH interactif
app.use('/api/ssh-terminal', sshTerminalRoutes);
// ✅ NOUVEAU: Routes du shell SSH persistant
app.use('/api/ssh-shell', sshShellRoutes);
// ✅ NOUVEAU: Routes des groupes de serveurs
app.use('/api/server-groups', serverGroupsRoutes);
// ✅ NOUVEAU: Routes admin
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/settings', settingsRoutes);

// Gestion des routes non trouvées
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Gestion des erreurs globale
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Erreur globale:', err);
  
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Fonction de migration
const runMigrations = async () => {
  try {
    console.log('🔄 Exécution des migrations...');

    // Table des utilisateurs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(255),
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table des conversations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table des messages
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table des serveurs SSH
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ssh_servers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        host VARCHAR(255) NOT NULL,
        port INTEGER DEFAULT 22,
        username VARCHAR(100) NOT NULL,
        password VARCHAR(255),
        private_key TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table des commandes exécutées
    await pool.query(`
      CREATE TABLE IF NOT EXISTS command_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        server_id INTEGER REFERENCES ssh_servers(id) ON DELETE SET NULL,
        command TEXT NOT NULL,
        output TEXT,
        status VARCHAR(20),
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table des paramètres utilisateur
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        setting_name VARCHAR(255) NOT NULL,
        setting_value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, setting_name)
      );
    `);

    // Table des groupes de serveurs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS server_groups (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        icon VARCHAR(10),
        color VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table des membres du groupe (jointure)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS server_group_members (
        id SERIAL PRIMARY KEY,
        group_id INTEGER NOT NULL REFERENCES server_groups(id) ON DELETE CASCADE,
        server_id INTEGER NOT NULL REFERENCES ssh_servers(id) ON DELETE CASCADE,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(group_id, server_id)
      );
    `);

    // Créer les index
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation 
      ON messages(conversation_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_user 
      ON conversations(user_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_ssh_servers_user 
      ON ssh_servers(user_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_settings_lookup
      ON user_settings(user_id, setting_name);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_server_groups_user
      ON server_groups(user_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_server_group_members_group
      ON server_group_members(group_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_server_group_members_server
      ON server_group_members(server_id);
    `);

    console.log('✅ Migrations exécutées avec succès');
  } catch (error) {
    console.error('⚠️ Erreur lors de la migration:', error);
  }
};

// Démarrage du serveur
const startServer = async () => {
  try {
    // Connexion à Redis
    try {
      await connectRedis();
      console.log('✅ Redis connecté');
    } catch (error) {
      console.warn('⚠️ Redis non disponible');
    }

    // Test PostgreSQL
    try {
      await pool.query('SELECT NOW()');
      console.log('✅ PostgreSQL connecté');
      
      // Exécuter les migrations
      await runMigrations();
    } catch (error) {
      console.warn('⚠️ PostgreSQL non disponible - API limitée');
    }

    // Démarrage du serveur
    httpServer.listen(PORT, HOST, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🚀 AiSystant Backend démarré !');
      console.log(`📡 API: http://${HOST}:${PORT}`);
      console.log(`🔌 WebSocket: ws://${HOST}:${PORT}`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion arrêt gracieux
let isShuttingDown = false;

process.on('SIGTERM', async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log('SIGTERM reçu, arrêt du serveur...');
  httpServer.close(async () => {
    try {
      await SSHService.disconnectAll();
      await pool.end();
      await redisClient.quit();
      console.log('Serveur arrêté proprement');
      process.exit(0);
    } catch (error) {
      console.error('Erreur lors de l\'arrêt:', error);
      process.exit(1);
    }
  });
});

process.on('SIGINT', async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log('\nSIGINT reçu, arrêt du serveur...');
  httpServer.close(async () => {
    try {
      await SSHService.disconnectAll();
      await pool.end();
      await redisClient.quit();
      console.log('Serveur arrêté proprement');
      process.exit(0);
    } catch (error) {
      console.error('Erreur lors de l\'arrêt:', error);
      process.exit(1);
    }
  });
});

startServer();

export { app, io };