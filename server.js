const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques du build
app.use(express.static(path.join(__dirname, 'build')));

// Route pour toutes les requêtes - rediriger vers index.html
app.get('*', (req, res) => {
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('All routes will be served by React Router');
}); 