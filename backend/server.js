const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Dossier pour les exports
const exportsDir = path.join(__dirname, 'exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir);
}

// Servir les exports statiques
app.use('/exports', express.static(exportsDir));

// Route pour sauvegarder le SVG
app.post('/api/save-svg', (req, res) => {
  try {
    const { svg, filename } = req.body;
    
    if (!svg) {
      return res.status(400).json({ error: 'Données SVG manquantes' });
    }
    
    const name = filename || `dungeon_${Date.now()}.svg`;
    const filePath = path.join(exportsDir, name);
    
    // Nettoyer le SVG des données inutiles si nécessaire
    const cleanSvg = svg.replace(/data:image\/svg\+xml;base64,[^\"]*/, '');
    
    fs.writeFileSync(filePath, cleanSvg);
    
    res.json({
      success: true,
      message: 'SVG sauvegardé avec succès',
      url: `/exports/${name}`,
      filename: name
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du SVG:', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde du SVG' });
  }
});

// Route pour sauvegarder le PNG (données base64)
app.post('/api/save-png', (req, res) => {
  try {
    const { image, filename } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'Données image manquantes' });
    }
    
    // Extraire les données base64
    const base64Data = image.replace(/^data:image\/png;base64,/, '');
    const name = filename || `dungeon_${Date.now()}.png`;
    const filePath = path.join(exportsDir, name);
    
    fs.writeFileSync(filePath, base64Data, 'base64');
    
    res.json({
      success: true,
      message: 'PNG sauvegardé avec succès',
      url: `/exports/${name}`,
      filename: name
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du PNG:', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde du PNG' });
  }
});

// Route pour obtenir la liste des exports
app.get('/api/exports', (req, res) => {
  try {
    const files = fs.readdirSync(exportsDir);
    const exports = files.map(file => ({
      name: file,
      url: `/exports/${file}`,
      size: fs.statSync(path.join(exportsDir, file)).size,
      created: fs.statSync(path.join(exportsDir, file)).mtime
    }));
    res.json(exports);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la lecture des exports' });
  }
});

// Route pour supprimer un export
app.delete('/api/exports/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(exportsDir, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Fichier supprimé' });
    } else {
      res.status(404).json({ error: 'Fichier non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
});
