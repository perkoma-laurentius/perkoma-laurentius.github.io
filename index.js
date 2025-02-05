const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Sajikan file statis dari folder "html"
app.use(express.static(path.join(__dirname, 'html')));

// Rute tanpa ekstensi .html
app.get('/auth-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'auth-login.html'));
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
