import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import db from '../config/database';

const router = Router();

// ==========================================
// POST - Create server group
// ==========================================
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, icon, color, description } = req.body;

    if (!name || !icon || !color) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.query(
      `INSERT INTO server_groups (user_id, name, icon, color, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, icon, color, description, created_at`,
      [userId, name, icon, color, description || null]
    );

    res.status(201).json({
      id: result.rows[0].id,
      name: result.rows[0].name,
      icon: result.rows[0].icon,
      color: result.rows[0].color,
      description: result.rows[0].description,
      servers: []
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// ==========================================
// GET - List all groups for user
// ==========================================
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const result = await db.query(
      `SELECT sg.id, sg.name, sg.icon, sg.color, sg.description
       FROM server_groups sg
       WHERE sg.user_id = $1
       ORDER BY sg.created_at DESC`,
      [userId]
    );

    // Get servers for each group
    const groups = await Promise.all(
      result.rows.map(async (group: any) => {
        const serversResult = await db.query(
          `SELECT server_id FROM server_group_members
           WHERE group_id = $1`,
          [group.id]
        );
        return {
          ...group,
          servers: serversResult.rows.map(r => r.server_id)
        };
      })
    );

    res.json(groups);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// ==========================================
// GET - Get single group by ID
// ==========================================
router.get('/:groupId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { groupId } = req.params;

    const result = await db.query(
      `SELECT id, name, icon, color, description
       FROM server_groups
       WHERE id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const group = result.rows[0];

    // Get servers in this group
    const serversResult = await db.query(
      `SELECT server_id FROM server_group_members
       WHERE group_id = $1`,
      [groupId]
    );

    res.json({
      ...group,
      servers: serversResult.rows.map(r => r.server_id)
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// ==========================================
// PUT - Update server group
// ==========================================
router.put('/:groupId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { groupId } = req.params;
    const { name, icon, color, description } = req.body;

    // Check ownership
    const ownerResult = await db.query(
      'SELECT user_id FROM server_groups WHERE id = $1',
      [groupId]
    );

    if (!ownerResult.rows[0] || ownerResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await db.query(
      `UPDATE server_groups
       SET name = COALESCE($1, name),
           icon = COALESCE($2, icon),
           color = COALESCE($3, color),
           description = COALESCE($4, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, name, icon, color, description`,
      [name, icon, color, description, groupId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// ==========================================
// DELETE - Delete server group
// ==========================================
router.delete('/:groupId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { groupId } = req.params;

    // Check ownership
    const ownerResult = await db.query(
      'SELECT user_id FROM server_groups WHERE id = $1',
      [groupId]
    );

    if (!ownerResult.rows[0] || ownerResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete group members first
    await db.query(
      'DELETE FROM server_group_members WHERE group_id = $1',
      [groupId]
    );

    // Delete group
    await db.query(
      'DELETE FROM server_groups WHERE id = $1',
      [groupId]
    );

    res.json({ message: 'Group deleted' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// ==========================================
// POST - Add server to group
// ==========================================
router.post('/:groupId/servers', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { groupId } = req.params;
    const { serverId } = req.body;

    if (!serverId) {
      return res.status(400).json({ error: 'Server ID required' });
    }

    // Check group ownership
    const groupResult = await db.query(
      'SELECT user_id FROM server_groups WHERE id = $1',
      [groupId]
    );

    if (!groupResult.rows[0] || groupResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check server ownership
    const serverResult = await db.query(
      'SELECT user_id FROM ssh_servers WHERE id = $1',
      [serverId]
    );

    if (!serverResult.rows[0] || serverResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Remove from other groups first
    await db.query(
      `DELETE FROM server_group_members
       WHERE server_id = $1 AND group_id != $2`,
      [serverId, groupId]
    );

    // Add to this group
    await db.query(
      `INSERT INTO server_group_members (group_id, server_id)
       VALUES ($1, $2)
       ON CONFLICT (group_id, server_id) DO NOTHING`,
      [groupId, serverId]
    );

    res.json({ message: 'Server added to group' });
  } catch (error) {
    console.error('Add server to group error:', error);
    res.status(500).json({ error: 'Failed to add server to group' });
  }
});

// ==========================================
// DELETE - Remove server from group
// ==========================================
router.delete('/:groupId/servers/:serverId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { groupId, serverId } = req.params;

    // Check group ownership
    const groupResult = await db.query(
      'SELECT user_id FROM server_groups WHERE id = $1',
      [groupId]
    );

    if (!groupResult.rows[0] || groupResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.query(
      'DELETE FROM server_group_members WHERE group_id = $1 AND server_id = $2',
      [groupId, serverId]
    );

    res.json({ message: 'Server removed from group' });
  } catch (error) {
    console.error('Remove server from group error:', error);
    res.status(500).json({ error: 'Failed to remove server from group' });
  }
});

export default router;
