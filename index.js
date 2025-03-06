// index.js

const express = require('express');
const app = express();

// Render te fournit une variable d'environnement PORT
// ou 3000 par défaut en local
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from Node on Render!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});