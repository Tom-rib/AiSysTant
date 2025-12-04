import pool from './database';

// Script de migration pour créer les tables
const migrate = async () => {
  try {
    console.log('🚀 Début de la migration de la base de données...');

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
    console.log('✅ Table users créée');

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
    console.log('✅ Table conversations créée');

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
    console.log('✅ Table messages créée');

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
    console.log('✅ Table ssh_servers créée');

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
    console.log('✅ Table command_history créée');

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
    console.log('✅ Table user_settings créée');

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
    console.log('✅ Table server_groups créée');

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
    console.log('✅ Table server_group_members créée');

    // Index pour améliorer les performances
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
    console.log('✅ Index créés');

    console.log('🎉 Migration terminée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
};

// Exécuter la migration
migrate();
