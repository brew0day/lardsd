// index.js
import express from 'express';
import killbotHandler from './api/killbot.js';

const app = express();
const PORT = process.env.PORT || 3000;

// On définit une route GET sur "/"
app.get('/', async (req, res) => {
  await killbotHandler(req, res);
});

// On pourrait aussi définir d'autres routes si besoin
// ex: app.get('/test', (req, res) => res.send('Hello test') );

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});