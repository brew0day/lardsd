const express = require('express');
const KillBot = require('killbot.to');

const app = express();

// Remplace 'your_api_key' par votre véritable clé API de KillBot.to
const apiKey = '225e7b97-524c-45d6-800c-aa7e3831a1ab';
const config = 'default';
const killBot = new KillBot(apiKey, config);

app.get('/', (req, res) => {
    killBot.checkReq(req)
        .then(result => {
            if (result.block) {
                // Bloquer l'utilisateur
                res.status(403).json({ message: 'Access denied' });
            } else {
                // Autoriser l'utilisateur
                let location = result.IPlocation; // Obtenir la localisation IP
                res.json({ message: 'Welcome', location: location });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});