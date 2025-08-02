const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// مسیر public برای فایل‌های استاتیک (مثل index.html)
app.use(express.static(path.join(__dirname, 'public')));

// مسیر اصلی (اختیاری)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// استارت سرور
app.listen(port, () => {
  console.log(`🚀 YASA SMART PRO running on port ${port}`);
});