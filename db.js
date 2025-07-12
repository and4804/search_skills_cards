// Simple SQLite wrapper using better-sqlite3
import Database from 'better-sqlite3';

// Lazily create in-memory DB (or file if you prefer)
export const db = new Database(':memory:');

// Schema definitions (matches prompt)
const schemaSQL = `
CREATE TABLE users (
  user_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  cards TEXT,
  email TEXT NOT NULL,
  about_me TEXT
);

CREATE TABLE cards (
  card_id TEXT PRIMARY KEY,
  card_name TEXT NOT NULL,
  status TEXT,
  card_image TEXT,
  number_of_holders INTEGER DEFAULT 1,
  trading_status TEXT,
  trading_history TEXT
);
`;

db.exec(schemaSQL);

// Seed test data (10 users, a few cards each)
import { randomUUID } from 'crypto';

function randomRating() {
  return Math.floor(Math.random() * 5) + 1; // 1-5
}

function createCard(name, rating = 3, trading_status = 'open') {
  const id = randomUUID();
    const imgUrl = `https://via.placeholder.com/320x180.png?text=${encodeURIComponent(name)}`;
  db.prepare(`INSERT INTO cards (card_id, card_name, status, card_image, trading_status, trading_history) VALUES (?,?,?,?,?,?)`)
    .run(id, name, rating.toString(), imgUrl, trading_status, JSON.stringify([]));
  return id;
}

function addUser(username, email, about, skillNames) {
  const uid = randomUUID();
    const cardIds = skillNames.map(name => createCard(name, randomRating()));
  db.prepare(`INSERT INTO users (user_id, username, cards, email, about_me) VALUES (?,?,?,?,?)`)
    .run(uid, username, JSON.stringify(cardIds), email, about);
}

addUser('Alice', 'alice@example.com', 'Full-stack dev & baker', ['JavaScript', 'Baking']);
addUser('Bob', 'bob@example.com', 'Pythonista & guitarist', ['Python', 'Guitar']);
addUser('Cara', 'cara@example.com', 'UX designer', ['UI/UX', 'Sketch']);
addUser('Dan', 'dan@example.com', 'Data scientist', ['Machine Learning', 'R']);
addUser('Eve', 'eve@example.com', 'Chef', ['Italian Cooking', 'Food Photography']);
addUser('Finn', 'finn@example.com', 'Mobile dev', ['Flutter', 'Kotlin']);
addUser('Gina', 'gina@example.com', 'Content writer', ['Copywriting', 'SEO']);
addUser('Hugo', 'hugo@example.com', 'DevOps', ['Docker', 'Kubernetes']);
addUser('Ivy', 'ivy@example.com', 'Yoga coach', ['Yoga', 'Meditation']);
addUser('Jax', 'jax@example.com', '3D artist', ['Blender', '3D Modeling']);

export function searchCards(term) {
  const sql = `
    SELECT u.user_id, u.username,
           c.card_id, c.card_name, c.status, c.card_image,
           c.number_of_holders, c.trading_status
    FROM users u,
         json_each(u.cards) AS uc,
         cards c
    WHERE c.card_id = uc.value
      AND LOWER(c.card_name) LIKE '%' || LOWER(?) || '%'
      AND c.trading_status = 'open'
  `;
  return db.prepare(sql).all(term);
}
