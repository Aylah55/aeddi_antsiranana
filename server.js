const express = require('express');
const path = require('path');
const app = express();

// Servir les fichiers statiques du build React
app.use(express.static(path.join(__dirname, 'build')));

// Pour toutes les autres routes, servir l'index.html du build React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur Node en écoute sur le port ${PORT}`);
}); 