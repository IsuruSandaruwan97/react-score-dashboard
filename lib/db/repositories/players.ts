import { getDatabase } from '../client';

export interface Player {
  id: string;
  username: string;
  ign: string;
  discordUsername: string;
  team: string;
  status: string;
  createdAt: string;
}

export async function getAllPlayers(
  orderBy: string = 'Date',
  page: number = 1,
  pageSize: number = 10
): Promise<Player[]> {
  const offset = (page - 1) * pageSize;
  const db = await getDatabase();
  let query = `SELECT * FROM players where status='active' ORDER BY created_at LIMIT ${pageSize} OFFSET ${offset}`;
  if (orderBy?.toLowerCase() === 'score') {
    query = `SELECT 
      p.*,
      COALESCE(fp.total_points, 0) AS total_points
    FROM players p
    LEFT JOIN (
      SELECT 
        s.player_id, 
        SUM(s.points) AS total_points
      FROM scores s
      WHERE s.round = 'qualification'
      GROUP BY s.player_id
    ) fp ON fp.player_id = p.id
    WHERE p.status = 'active'
    ORDER BY COALESCE(fp.total_points, 0) DESC LIMIT ${pageSize} OFFSET ${offset}`;
  }

  const rows = await db.query(query);
  return rows.map(mapPlayerFromDb);
}

export async function getActivePlayerCount(): Promise<number> {
  const db = await getDatabase();
  const countQuery = `SELECT COUNT(*) AS total FROM players WHERE status = 'active';`;
  const rows = await db.query(countQuery);
  return rows?.[0].total || 0;
}

export async function getAllQualifiedPlayers(): Promise<Player[]> {
  const db = await getDatabase();
  const rows = await db.query(`
    SELECT p.*
    FROM players p
    JOIN (
      SELECT s.player_id, SUM(s.points) AS total_points
      FROM scores s
      WHERE s.round = 'qualification'
      GROUP BY s.player_id
    ) fp ON fp.player_id = p.id
    WHERE p.status = 'active'
    ORDER BY fp.total_points DESC
    LIMIT 10
    `);
  return rows.map(mapPlayerFromDb);
}

export async function getPlayerById(id: string): Promise<Player | null> {
  const db = await getDatabase();
  const row = await db.get('SELECT * FROM players WHERE id = ?', [id]);
  return row ? mapPlayerFromDb(row) : null;
}

export async function createPlayer(
  player: Omit<Player, 'createdAt'>
): Promise<void> {
  const db = await getDatabase();
  await db.run(
    `INSERT INTO players (id, username, ign, discord_username, team, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      player.id,
      player.username,
      player.ign,
      player.discordUsername,
      player.team,
      player.status,
    ]
  );
}

export async function updatePlayer(
  id: string,
  updates: Partial<Player>
): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.username !== undefined) {
    fields.push('username = ?');
    values.push(updates.username);
  }
  if (updates.ign !== undefined) {
    fields.push('ign = ?');
    values.push(updates.ign);
  }
  if (updates.discordUsername !== undefined) {
    fields.push('discord_username = ?');
    values.push(updates.discordUsername);
  }
  if (updates.team !== undefined) {
    fields.push('team = ?');
    values.push(updates.team);
  }
  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }

  if (fields.length > 0) {
    values.push(id);
    await db.run(
      `UPDATE players SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }
}

export async function deletePlayer(id: string): Promise<void> {
  const db = await getDatabase();
  await db.run('DELETE FROM players WHERE id = ?', [id]);
}

export async function upsertPlayer(
  player: Omit<Player, 'createdAt'>
): Promise<void> {
  const existing = await getPlayerById(player.id);
  if (existing) {
    await updatePlayer(player.id, player);
  } else {
    await createPlayer(player);
  }
}

function mapPlayerFromDb(row: any): Player {
  return {
    id: row.id,
    username: row.username,
    ign: row.ign,
    discordUsername: row.discord_username,
    team: row.team,
    status: row.status,
    createdAt: row.created_at,
  };
}
