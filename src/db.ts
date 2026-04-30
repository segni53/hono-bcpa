import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';


const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name'),
  email: text('email'),
});


const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT
  );
`);


export async function createUser(name: string, email: string) {
  return db.insert(users).values({ name, email }).run();
}


export async function getUsers() {
  return db.select().from(users).all();
}

export async function updateUser(id: number, name: string, email: string) {
  return db.update(users).set({ name, email }).where(users.id.eq(id)).run();
}

export async function deleteUser(id: number) {
  return db.delete(users).where(users.id.eq(id)).run();
}
