app.post('/api/register', async (req, res) => {
  const { username, password, ref } = req.body;

  if (!username || !password || !ref) {
    return res.status(400).send('همه فیلدها الزامی هستند.');
  }

  // بررسی موجود بودن کاربر
  const existingUser = await db.get('users').findOne({ username });
  if (existingUser) {
    return res.status(400).send('این نام کاربری قبلاً ثبت شده است.');
  }

  // بررسی وجود معرف
  const refUser = await db.get('users').findOne({ username: ref });
  if (!refUser) {
    return res.status(400).send('کد معرف نامعتبر است.');
  }

  // ثبت کاربر جدید
  const newUser = {
    username,
    password,
    ref,
    balance: 0,
    invest: 20,
    left: null,
    right: null,
    createdAt: new Date()
  };
  await db.get('users').insert(newUser);

  // اتصال به ساختار باینری معرف
  if (!refUser.left) {
    await db.get('users').update({ username: ref }, { $set: { left: username } });
  } else if (!refUser.right) {
    await db.get('users').update({ username: ref }, { $set: { right: username } });
  } else {
    // اگر هر دو پر بودن، فقط ثبت میشه ولی تو ساختار باینری قرار نمی‌گیره
  }

  return res.send('ثبت‌نام با موفقیت انجام شد.');
});