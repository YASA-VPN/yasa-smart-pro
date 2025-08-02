// register.js
import db from './db.js'
import express from 'express'

const router = express.Router()

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

router.post('/register', async (req, res) => {
  const { name, referrerId } = req.body

  if (!name || !referrerId) {
    return res.status(400).json({ error: 'نام و کد معرف الزامی است.' })
  }

  await db.read()

  const referrer = db.data.users.find(u => u.id === referrerId)

  if (!referrer) {
    return res.status(400).json({ error: 'کد معرف نامعتبر است.' })
  }

  const side = (referrer.left && referrer.right) ? null :
               (!referrer.left ? 'left' : 'right')

  if (!side) {
    return res.status(400).json({ error: 'این معرف ظرفیت ندارد.' })
  }

  const newUser = {
    id: generateId(),
    name,
    referrerId,
    left: null,
    right: null
  }

  db.data.users.push(newUser)
  referrer[side] = newUser.id

  await db.write()

  res.json({ success: true, userId: newUser.id, side })
})

export default router