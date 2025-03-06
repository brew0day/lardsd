// index.js (CommonJS style)
const express = require('express');
const KillBot = require('killbot.to');

const app = express();
// Sur Render, process.env.PORT est fourni ; sinon 3000 en local
const PORT = process.env.PORT || 3000;

// Votre clé API KillBot
const apiKey = '225e7b97-524c-45d6-800c-aa7e3831a1ab';
const config = 'default';
const killBot = new KillBot(apiKey, config);

app.get('/', (req, res) => {
  killBot.checkReq(req)
    .then(result => {
      if (result.block) {
        // Bloque l’utilisateur
        // On peut renvoyer un faux 404 ou un 403
        res.status(403).json({ message: 'Access denied' });
      } else {
        // Autorise l’utilisateur
        // On peut renvoyer un JSON ou rediriger
        const location = result.IPlocation;
        res.json({ message: 'Welcome', location });
      }
    })
    .catch(error => {
      console.error('KillBot error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});