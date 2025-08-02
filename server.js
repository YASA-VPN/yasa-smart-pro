const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// تنظیم مسیر فایل‌های استاتیک
app.use(express.static('views'));

// روت اصلی (صفحه اول)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// اجرای سرور
app.listen(PORT, () => {
  console.log(`YASA SMART PRO running on port ${PORT}`);
});