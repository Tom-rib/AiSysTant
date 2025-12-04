import pool from '../config/database';
import bcrypt from 'bcrypt';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  avatar_url?: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  avatar_url?: string;
}

export class UserModel {
  // Créer un nouvel utilisateur
  static async create(userData: CreateUserInput): Promise<User> {
    const { username, email, password, avatar_url } = userData;
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO users (username, email, password, avatar_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, avatar_url, role, created_at, updated_at`,
      [username, email, hashedPassword, avatar_url]
    );
    
    return result.rows[0];
  }

  // Trouver un utilisateur par email
  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  // Trouver un utilisateur par username
  static async findByUsername(username: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  }

  // Trouver un utilisateur par ID
  static async findById(id: number): Promise<User | null> {
    const result = await pool.query(
      'SELECT id, username, email, avatar_url, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  // Vérifier le mot de passe
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Mettre à jour un utilisateur
  static async update(id: number, updates: Partial<User>): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${index}
       RETURNING id, username, email, avatar_url, role, created_at, updated_at`,
      values
    );

    return result.rows[0] || null;
  }

  // Supprimer un utilisateur
  static async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Obtenir tous les utilisateurs
  static async findAll(): Promise<User[]> {
    const result = await pool.query(
      'SELECT id, username, email, avatar_url, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }
}