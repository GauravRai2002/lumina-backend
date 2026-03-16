import { createClient, Client } from "@libsql/client";

let dbClient: Client | null = null;

export function getDb(): Client {
  if (!dbClient) {
    dbClient = createClient({
      url: process.env.TURSO_DB_URL as string,
      authToken: process.env.TURSO_DB_AUTH_TOKEN as string,
    });
  }
  return dbClient;
}

export async function initDb(client: Client) {
  // Execute table creations one by one as executeMultiple or execute doesn't always support multiple statements reliably without executeMultiple API
  await client.execute(`
    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      source_type TEXT NOT NULL,
      raw_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS generated_content (
      id TEXT PRIMARY KEY,
      material_id TEXT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS flashcard_reviews (
      id TEXT PRIMARY KEY,
      material_id TEXT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
      card_index INTEGER NOT NULL,
      ease_factor REAL DEFAULT 2.5,
      interval_days INTEGER DEFAULT 0,
      repetitions INTEGER DEFAULT 0,
      next_review DATETIME,
      last_reviewed DATETIME
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      material_id TEXT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Material helpers
export async function createMaterial(id: string, title: string, sourceType: string, rawText: string) {
  const db = getDb();
  await db.execute({
    sql: "INSERT INTO materials (id, title, source_type, raw_text) VALUES (?, ?, ?, ?)",
    args: [id, title, sourceType, rawText]
  });
}

export async function getMaterial(id: string) {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT * FROM materials WHERE id = ?",
    args: [id]
  });
  return result.rows[0] as unknown as {
    id: string;
    title: string;
    source_type: string;
    raw_text: string;
    created_at: string;
  } | undefined;
}

export async function getAllMaterials() {
  const db = getDb();
  const result = await db.execute("SELECT id, title, source_type, created_at FROM materials ORDER BY created_at DESC");
  return result.rows as unknown as { id: string; title: string; source_type: string; created_at: string }[];
}

export async function deleteMaterial(id: string) {
  const db = getDb();
  await db.execute({
    sql: "DELETE FROM materials WHERE id = ?",
    args: [id]
  });
}

// Generated content helpers
export async function saveGeneratedContent(id: string, materialId: string, type: string, content: string) {
  const db = getDb();
  await db.execute({
    sql: "INSERT OR REPLACE INTO generated_content (id, material_id, type, content) VALUES (?, ?, ?, ?)",
    args: [id, materialId, type, content]
  });
}

export async function getGeneratedContent(materialId: string, type: string) {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT * FROM generated_content WHERE material_id = ? AND type = ? ORDER BY created_at DESC LIMIT 1",
    args: [materialId, type]
  });
  return result.rows[0] as unknown as {
    id: string;
    material_id: string;
    type: string;
    content: string;
    created_at: string;
  } | undefined;
}

// Flashcard review helpers
export async function getFlashcardReviews(materialId: string) {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT * FROM flashcard_reviews WHERE material_id = ? ORDER BY card_index",
    args: [materialId]
  });
  return result.rows as unknown as {
    id: string;
    material_id: string;
    card_index: number;
    ease_factor: number;
    interval_days: number;
    repetitions: number;
    next_review: string | null;
    last_reviewed: string | null;
  }[];
}

export async function upsertFlashcardReview(
  id: string,
  materialId: string,
  cardIndex: number,
  easeFactor: number,
  intervalDays: number,
  repetitions: number,
  nextReview: string
) {
  const db = getDb();
  await db.execute({
    sql: `
      INSERT INTO flashcard_reviews (id, material_id, card_index, ease_factor, interval_days, repetitions, next_review, last_reviewed)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        ease_factor = excluded.ease_factor,
        interval_days = excluded.interval_days,
        repetitions = excluded.repetitions,
        next_review = excluded.next_review,
        last_reviewed = datetime('now')
    `,
    args: [id, materialId, cardIndex, easeFactor, intervalDays, repetitions, nextReview]
  });
}

// Chat message helpers
export async function saveChatMessage(id: string, materialId: string, role: string, content: string) {
  const db = getDb();
  await db.execute({
    sql: "INSERT INTO chat_messages (id, material_id, role, content) VALUES (?, ?, ?, ?)",
    args: [id, materialId, role, content]
  });
}

export async function getChatHistory(materialId: string) {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT * FROM chat_messages WHERE material_id = ? ORDER BY created_at ASC",
    args: [materialId]
  });
  return result.rows as unknown as {
    id: string;
    material_id: string;
    role: string;
    content: string;
    created_at: string;
  }[];
}
