// build-iife.js - Script pour convertir la bibliothèque en IIFE
const fs = require('fs');
const path = require('path');

// Lire le fichier original
const sourcePath = path.join(__dirname, 'public', 'dungeon-generator.js');
const targetPath = path.join(__dirname, 'public', 'dungeon-generator.iife.js');

try {
  let content = fs.readFileSync(sourcePath, 'utf8');
  
  // Supprimer les déclarations export/import
  content = content.replace(/^export\s+/gm, '');
  content = content.replace(/^import\s+.*?;/gm, '');
  
  // Envelopper dans une IIFE
  const iifeContent = `
// IIFE Version of Dungeon Generator
(function() {
  'use strict';
  
  ${content}
  
  // Exposer la classe globalement
  if (typeof window !== 'undefined') {
    window.DungeonGenerator = DungeonGenerator;
  }
  
  // Support CommonJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DungeonGenerator;
  }
})();
`;
  
  fs.writeFileSync(targetPath, iifeContent);
  console.log('✅ Version IIFE créée avec succès!');
  console.log(`📁 Fichier: ${targetPath}`);
} catch (error) {
  console.error('❌ Erreur:', error.message);
}
