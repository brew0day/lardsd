import express from 'express';
import KillBot from 'killbot.to';

const app = express();
const PORT = process.env.PORT || 3000;

// Votre clé KillBot (token)
const apiKey = '225e7b97-524c-45d6-800c-aa7e3831a1ab';
const config = 'default';
const killBot = new KillBot(apiKey, config);

// Route principale
app.get('/', async (req, res) => {
  try {
    // Vérifie la requête via KillBot
    const result = await killBot.checkReq(req);

    if (result.block) {
      // Si KillBot juge la requête "bloquée", on renvoie un faux 404
      const fake404 = `
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
  <title>404 Not Found</title>
</head>
<body>
  <h1>Not Found</h1>
  <p>The requested URL $requestedPageWithoutQueryString was not found on this server.</p>
  <hr>
  <address>Apache/2.4.57 (Debian) Server at $serverName Port 80</address>
</body></html>`;
      return res.status(404).send(fake404);
    } else {
      // Sinon, on redirige l'utilisateur vers maurpie.com
      res.writeHead(302, { Location: 'https://maurpie.com' });
      return res.end();
    }
  } catch (err) {
    console.error('KillBot error:', err);
    // En cas d'erreur (IP invalide, etc.), on renvoie un code 500
    return res.status(500).send('Internal Server Error');
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});