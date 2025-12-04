import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_tres_securise';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

// Générer un token JWT
export const generateToken = (userId: number, username: string, email: string, role: string): string => {
  return jwt.sign(
    { id: userId, username, email, role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

// Vérifier un token JWT
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware d'authentification
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant'
      });
    }

    const token = authHeader.substring(7); // Enlever "Bearer "
    
    // Vérifier le token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }

    // Vérifier que l'utilisateur existe toujours
    const user = await UserModel.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'authentification'
    });
  }
};

// Middleware pour vérifier le rôle admin
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Non authentifié'
    });
  }
  
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    console.log(`❌ Admin access denied for user: ${req.user.email}, role: ${req.user.role}`);
    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Droits administrateur requis.',
      userRole: req.user.role
    });
  }
  
  console.log(`✅ Admin access granted for user: ${req.user.email}, role: ${req.user.role}`);
  next();
};
