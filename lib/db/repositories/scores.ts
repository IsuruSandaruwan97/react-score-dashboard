import { getDatabase } from '../client';
import { PlayerResult } from './results';

export interface Score {
  id?: number;
  playerId: string;
  judgeId: string;
  criterionId: string;
  round: string;
  points: number;
  enteredBy: string;
  enteredAt: string;
}

export async function getScoresByRound(round: string): Promise<Score[]> {
  const db = await getDatabase();
  const rows = await db.query('SELECT * FROM scores WHERE round = ?', [round]);
  return rows.map(mapScoreFromDb);
}

export async function getScoresByPlayer(
  playerId: string,
  round: string
): Promise<Score[]> {
  const db = await getDatabase();
  const rows = await db.query(
    'SELECT * FROM scores WHERE player_id = ? AND round = ?',
    [playerId, round]
  );
  return rows.map(mapScoreFromDb);
}

export async function getWinners(): Promise<PlayerResult[]> {
  const db = await getDatabase();
  const rows = await db.query(
    `
    SELECT s.player_id,p.username, SUM(s.points) AS total_points
    FROM scores s
    JOIN players p ON p.id = s.player_id
    WHERE p.status = "active"
    AND s.round= "finals"
    GROUP BY s.player_id
    ORDER BY total_points DESC
    LIMIT 10
    `
  );

  return rows.map(mapWinnersFromDB);
}

export async function upsertScore(
  score: Omit<Score, 'id' | 'enteredAt'>
): Promise<void> {
  const db = await getDatabase();

  // Check if score exists
  const existing = await db.get(
    'SELECT id FROM scores WHERE player_id = ? AND judge_id = ? AND criterion_id = ? AND round = ?',
    [score.playerId, score.judgeId, score.criterionId, score.round]
  );

  if (existing) {
    await db.run(
      `UPDATE scores SET points = ?, entered_by = ?, entered_at = CURRENT_TIMESTAMP
       WHERE player_id = ? AND judge_id = ? AND criterion_id = ? AND round = ?`,
      [
        score.points,
        score.enteredBy,
        score.playerId,
        score.judgeId,
        score.criterionId,
        score.round,
      ]
    );
  } else {
    await db.run(
      `INSERT INTO scores (player_id, judge_id, criterion_id, round, points, entered_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        score.playerId,
        score.judgeId,
        score.criterionId,
        score.round,
        score.points,
        score.enteredBy,
      ]
    );
  }
}

export async function deleteScoresByPlayer(playerId: string): Promise<void> {
  const db = await getDatabase();
  await db.run('DELETE FROM scores WHERE player_id = ?', [playerId]);
}

function mapScoreFromDb(row: any): Score {
  return {
    id: row.id,
    playerId: row.player_id,
    judgeId: row.judge_id,
    criterionId: row.criterion_id,
    round: row.round,
    points: row.points,
    enteredBy: row.entered_by,
    enteredAt: row.entered_at,
  };
}

function mapWinnersFromDB(row: any): PlayerResult {
  return {
    username: row.username,
    totalScore: row.total_points,
    rank: null,
    playerId: row.player_id,
    rounds: [],
  };
}
