import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

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

// Configuration de Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = ['http://localhost:5173', 'http://192.168.136.149:5173'];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingInterval: parseInt(process.env.WS_PING_INTERVAL || '30000'),
  pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '5000')
});

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
      health: '/api/health'
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

// Configuration de Socket.IO
io.on('connection', (socket) => {
  console.log(`✅ Nouveau client WebSocket connecté: ${socket.id}`);

  // Authentification du socket
  const token = socket.handshake.auth.token;
  let userId: number | null = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre-secret-super-secure-change-moi-en-prod') as any;
      userId = decoded.id;
      socket.data.userId = userId;
      console.log(`✅ Socket authentifié pour l'utilisateur ${userId}`);
    } catch (error) {
      console.error('❌ Erreur d\'authentification socket:', error);
    }
  }

  // Events Chat
  socket.on('join_conversation', (conversationId: number) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`Client ${socket.id} a rejoint la conversation ${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId: number) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`Client ${socket.id} a quitté la conversation ${conversationId}`);
  });

  socket.on('new_message', (data: { conversationId: number; message: any }) => {
    io.to(`conversation_${data.conversationId}`).emit('message_received', data.message);
  });

  socket.on('typing', (data: { conversationId: number; username: string }) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_typing', data);
  });

  socket.on('stop_typing', (data: { conversationId: number }) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_stop_typing', data);
  });

  // Events SSH
  socket.on('ssh_command', async (data: { serverId: string; command: string }) => {
    if (!userId) {
      socket.emit('ssh_error', {
        serverId: data.serverId,
        error: 'Non authentifié'
      });
      return;
    }

    try {
      const serverId = parseInt(data.serverId);
      console.log(`🔧 Exécution commande SSH sur serveur ${serverId}: ${data.command}`);
      
      const result = await SSHService.executeCommand(serverId, data.command, userId);
      
      socket.emit('ssh_output', {
        serverId: data.serverId,
        output: result.output
      });

      // Notifier si erreur
      if (result.exitCode !== 0) {
        socket.emit('ssh_error', {
          serverId: data.serverId,
          error: result.error || 'Commande échouée'
        });
      }
    } catch (error: any) {
      console.error('❌ Erreur SSH:', error);
      socket.emit('ssh_error', {
        serverId: data.serverId,
        error: error.message
      });
    }
  });

  socket.on('ssh_connect', async (data: { serverId: string }) => {
    if (!userId) {
      socket.emit('ssh_error', {
        serverId: data.serverId,
        error: 'Non authentifié'
      });
      return;
    }

    try {
      const serverId = parseInt(data.serverId);
      console.log(`🔌 Connexion SSH au serveur ${serverId}`);
      
      const result = await SSHService.connect(serverId);
      
      if (result.success) {
        socket.emit('ssh_connected', {
          serverId: data.serverId
        });
      } else {
        socket.emit('ssh_error', {
          serverId: data.serverId,
          error: result.message
        });
      }
    } catch (error: any) {
      console.error('❌ Erreur connexion SSH:', error);
      socket.emit('ssh_error', {
        serverId: data.serverId,
        error: error.message
      });
    }
  });

  socket.on('ssh_disconnect', async (data: { serverId: string }) => {
    try {
      const serverId = parseInt(data.serverId);
      console.log(`🔌 Déconnexion SSH du serveur ${serverId}`);
      
      await SSHService.disconnect(serverId);
      
      socket.emit('ssh_disconnected', {
        serverId: data.serverId
      });
    } catch (error: any) {
      console.error('❌ Erreur déconnexion SSH:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client WebSocket déconnecté: ${socket.id}`);
  });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    // Connexion à Redis
    await connectRedis();
    console.log('✅ Redis connecté');

    // Test PostgreSQL
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connecté');

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