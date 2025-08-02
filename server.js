const express = require('express');
const app = express();
const db = require('./db');
const authRoutes = require('./auth'); // مسیر ثبت‌نام

app.use(express.json());
app.use('/api', authRoutes); // استفاده از مسیر auth

app.get('/', (req, res) => {
  res.send('YASA SMART PRO API is running.');
});

// اگر پورت از env نیومد، روی 3000 بالا بیاد
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});