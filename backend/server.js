const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Dossier pour les exports
const exportsDir = path.join(__dirname, 'exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

// Servir les exports statiques
app.use('/exports', express.static(exportsDir));

// ============================================================
// ROUTES API
// ============================================================

/**
 * POST /api/save-svg
 * Sauvegarde un fichier SVG sur le serveur
 */
app.post('/api/save-svg', (req, res) => {
  try {
    const { svg, filename } = req.body;
    
    if (!svg) {
      return res.status(400).json({ 
        success: false, 
        error: 'Données SVG manquantes' 
      });
    }
    
    const name = filename || `dungeon_${Date.now()}.svg`;
    const filePath = path.join(exportsDir, name);
    
    // Nettoyer le SVG des données inutiles
    const cleanSvg = svg.replace(/data:image\/svg\+xml;base64,[^\"]*/, '');
    
    fs.writeFileSync(filePath, cleanSvg, 'utf8');
    
    res.json({
      success: true,
      message: 'SVG sauvegardé avec succès',
      url: `/exports/${name}`,
      filename: name,
      path: filePath
    });
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde du SVG:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la sauvegarde du SVG',
      details: error.message
    });
  }
});

/**
 * POST /api/save-png
 * Sauvegarde un fichier PNG sur le serveur (données base64)
 */
app.post('/api/save-png', (req, res) => {
  try {
    const { image, filename } = req.body;
    
    if (!image) {
      return res.status(400).json({ 
        success: false, 
        error: 'Données image manquantes' 
      });
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
      filename: name,
      path: filePath
    });
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde du PNG:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la sauvegarde du PNG',
      details: error.message
    });
  }
});

/**
 * GET /api/exports
 * Liste tous les fichiers exportés
 */
app.get('/api/exports', (req, res) => {
  try {
    const files = fs.readdirSync(exportsDir);
    const exports = files
      .filter(file => file.endsWith('.svg') || file.endsWith('.png'))
      .map(file => {
        const stat = fs.statSync(path.join(exportsDir, file));
        return {
          name: file,
          url: `/exports/${file}`,
          size: stat.size,
          sizeFormatted: formatFileSize(stat.size),
          created: stat.mtime,
          createdFormatted: stat.mtime.toLocaleString('fr-FR'),
          type: path.extname(file).substring(1).toUpperCase()
        };
      })
      .sort((a, b) => b.created - a.created);
    
    res.json({
      success: true,
      count: exports.length,
      exports
    });
  } catch (error) {
    console.error('❌ Erreur lors de la lecture des exports:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la lecture des exports',
      details: error.message
    });
  }
});

/**
 * DELETE /api/exports/:filename
 * Supprime un fichier exporté
 */
app.delete('/api/exports/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    
    // Sécurité : empêcher la suppression en dehors du dossier exports
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nom de fichier invalide' 
      });
    }
    
    const filePath = path.join(exportsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        error: 'Fichier non trouvé' 
      });
    }
    
    fs.unlinkSync(filePath);
    
    res.json({ 
      success: true, 
      message: `Fichier "${filename}" supprimé avec succès` 
    });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la suppression',
      details: error.message
    });
  }
});

/**
 * GET /api/exports/:filename
 * Télécharge un fichier exporté
 */
app.get('/api/exports/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nom de fichier invalide' 
      });
    }
    
    const filePath = path.join(exportsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        error: 'Fichier non trouvé' 
      });
    }
    
    res.download(filePath);
  } catch (error) {
    console.error('❌ Erreur lors du téléchargement:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors du téléchargement',
      details: error.message
    });
  }
});

// ============================================================
// UTILITAIRES
// ============================================================

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ============================================================
// DÉMARRAGE
// ============================================================

app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
  console.log(`📁 Dossier d'exports: ${exportsDir}`);
  console.log(`🌐 API disponible sur /api`);
});
