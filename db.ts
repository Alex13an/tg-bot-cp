import Database from "bun:sqlite";

const db = new Database('users.db')

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY UNIQUE,
    chat_id INTEGER UNIQUE,
    fio TEXT,
    phone TEXT,
    status TEXT,
    sub_type NUMBER
  )
`).run()

export default db
