// index.js

const express = require('express');
const app = express();

// Sur Render, process.env.PORT est défini. Sinon, on prend 3000 en local.
const PORT = process.env.PORT || 3000;

// Route GET sur "/"
app.get('/', (req, res) => {
  res.send('Salut, comment tu vas ?');
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});