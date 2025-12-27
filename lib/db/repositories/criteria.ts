import { getDatabase } from '../client';

export interface Criterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  type: string[];
}

export async function getAllCriteria(): Promise<Criterion[]> {
  const db = await getDatabase();
  const rows = await db.query(
    'SELECT * FROM criteria WHERE active <> ? ORDER BY display_order',
    [2]
  );
  return rows.map(mapCriterionFromDb);
}

export async function getAllCriteriaByType(type: string): Promise<Criterion[]> {
  const db = await getDatabase();
  const rows = await db.query(
    'SELECT * FROM criteria WHERE JSON_CONTAINS(type, ?) AND active <> ? ORDER BY display_order',
    [JSON.stringify(type), 2]
  );
  return rows.map(mapCriterionFromDb);
}

export async function getActiveCriteria(): Promise<Criterion[]> {
  const db = await getDatabase();
  const rows = await db.query(
    'SELECT * FROM criteria WHERE active = ? ORDER BY display_order',
    [1]
  );
  return rows.map(mapCriterionFromDb);
}

export async function getCriterionById(id: string): Promise<Criterion | null> {
  const db = await getDatabase();
  const row = await db.get('SELECT * FROM criteria WHERE id = ?', [id]);
  return row ? mapCriterionFromDb(row) : null;
}

export async function createCriterion(
  criterion: Omit<Criterion, 'createdAt'>
): Promise<void> {
  const db = await getDatabase();
  await db.run(
    `INSERT INTO criteria (id, name, description, max_points, display_order, active,type)
     VALUES (?, ?, ?, ?, ?, ?,?)`,
    [
      criterion.id,
      criterion.name,
      criterion.description,
      criterion.maxPoints,
      criterion.displayOrder,
      criterion.active ? 1 : 0,
      criterion.type,
    ]
  );
}

export async function updateCriterion(
  id: string,
  updates: Partial<Criterion>
): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.maxPoints !== undefined) {
    fields.push('max_points = ?');
    values.push(updates.maxPoints);
  }
  if (updates.displayOrder !== undefined) {
    fields.push('display_order = ?');
    values.push(updates.displayOrder);
  }
  if (updates.active !== undefined) {
    fields.push('active = ?');
    values.push(updates.active ? 1 : 0);
  }

  if (updates.type !== undefined) {
    fields.push('type = ?');
    values.push(updates.type);
  }

  if (fields.length > 0) {
    values.push(id);
    await db.run(
      `UPDATE criteria SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }
}

export async function deleteCriterion(id: string): Promise<void> {
  const db = await getDatabase();
  await db.run('UPDATE criteria SET active = 2 WHERE id = ?', [id]);
}

export async function reorderCriteria(orderedIds: string[]): Promise<void> {
  const db = await getDatabase();
  for (let i = 0; i < orderedIds.length; i++) {
    await db.run('UPDATE criteria SET display_order = ? WHERE id = ?', [
      i,
      orderedIds[i],
    ]);
  }
}

function mapCriterionFromDb(row: any): Criterion {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    maxPoints: row.max_points,
    displayOrder: row.display_order,
    active: Boolean(row.active),
    createdAt: row.created_at,
    type: row.type,
  };
}
