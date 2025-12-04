import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { generateToken } from '../middleware/auth';
import { redisUtils } from '../config/redis';

export class AuthController {
  // Inscription d'un nouvel utilisateur
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password, avatar_url } = req.body;

      // Validation
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Tous les champs sont requis'
        });
      }

      // Vérifier la longueur du mot de passe
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins 6 caractères'
        });
      }

      // Vérifier si l'email existe déjà
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
      }

      // Vérifier si le username existe déjà
      const existingUsername = await UserModel.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Ce nom d\'utilisateur est déjà pris'
        });
      }

      // Créer l'utilisateur
      const user = await UserModel.create({
        username,
        email,
        password,
        avatar_url
      });

      // Générer un token
      const token = generateToken(user.id, user.username, user.email, user.role);

      // Stocker la session dans Redis
      await redisUtils.setSession(user.id.toString(), {
        username: user.username,
        email: user.email,
        role: user.role
      });

      return res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar_url: user.avatar_url,
            role: user.role
          },
          token
        }
      });

    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'inscription',
        error: error.message
      });
    }
  }

  // Connexion d'un utilisateur
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email et mot de passe requis'
        });
      }

      // Trouver l'utilisateur
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Vérifier le mot de passe
      const isValidPassword = await UserModel.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Générer un token
      const token = generateToken(user.id, user.username, user.email, user.role);

      // Stocker la session dans Redis (non-bloquant, c'est OK si ça échoue)
      try {
        await redisUtils.setSession(user.id.toString(), {
          username: user.username,
          email: user.email,
          role: user.role
        });
      } catch (redisError) {
        console.warn('⚠️ Redis session save failed (continuing without cache):', (redisError as any).message);
      }

      return res.json({
        success: true,
        message: 'Connexion réussie',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar_url: user.avatar_url,
            role: user.role
          },
          token
        }
      });

    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la connexion',
        error: error.message
      });
    }
  }

  // Déconnexion
  static async logout(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (userId) {
        // Supprimer la session de Redis
        await redisUtils.deleteSession(userId.toString());
      }

      return res.json({
        success: true,
        message: 'Déconnexion réussie'
      });

    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la déconnexion',
        error: error.message
      });
    }
  }

  // Obtenir les informations de l'utilisateur connecté
  static async me(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié'
        });
      }

      // Récupérer les informations complètes
      const fullUser = await UserModel.findById(user.id);

      if (!fullUser) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur introuvable'
        });
      }

      return res.json({
        success: true,
        data: {
          id: fullUser.id,
          username: fullUser.username,
          email: fullUser.email,
          avatar_url: fullUser.avatar_url,
          role: fullUser.role,
          created_at: fullUser.created_at
        }
      });

    } catch (error: any) {
      console.error('Erreur lors de la récupération du profil:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du profil',
        error: error.message
      });
    }
  }
}
