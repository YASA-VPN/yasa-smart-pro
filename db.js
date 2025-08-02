// db.js
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

// مسیر فایل دیتابیس
const adapter = new JSONFile('data.json')
const db = new Low(adapter)

await db.read()

// مقدار اولیه اگه دیتابیس خالیه
db.data ||= { users: [] }

await db.write()

export default db