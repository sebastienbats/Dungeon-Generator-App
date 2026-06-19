// convert-to-iife.js - Conversion complète en IIFE
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Conversion de la bibliothèque en IIFE...');

// 1. Lire le fichier original
const sourceFile = path.join(__dirname, 'public', 'dungeon-generator.js');
const tempFile = path.join(__dirname, 'public', 'dungeon-generator.temp.js');
const outputFile = path.join(__dirname, 'public', 'dungeon-generator.iife.js');

try {
  // Lire le contenu original
  let content = fs.readFileSync(sourceFile, 'utf8');
  
  // 2. Supprimer les déclarations export
  content = content.replace(/export\s+default\s+/g, '');
  content = content.replace(/export\s+{/g, '');
  content = content.replace(/export\s+const\s+/g, 'const ');
  content = content.replace(/export\s+function\s+/g, 'function ');
  content = content.replace(/export\s+class\s+/g, 'class ');
  
  // 3. Supprimer les imports
  content = content.replace(/import\s+.*?from\s+['"][^'"]+['"];?\s*/g, '');
  
  // 4. Ajouter le wrapper IIFE
  const iifeWrapper = `
// IIFE Version of Dungeon Generator - Converted for browser use
(function(global) {
  'use strict';

  // Dependencies placeholder
  const module = { exports: {} };
  const exports = module.exports;

  ${content}

  // Expose to global scope
  if (typeof global.DungeonGenerator === 'undefined') {
    global.DungeonGenerator = DungeonGenerator || module.exports;
  }

})(typeof window !== 'undefined' ? window : this);
`;
  
  // 5. Écrire le fichier IIFE
  fs.writeFileSync(outputFile, iifeWrapper);
  
  console.log('✅ Version IIFE créée avec succès!');
  console.log(`📁 Fichier: ${outputFile}`);
  
  // 6. Nettoyer
  if (fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile);
  }
  
  console.log('\n📋 Instructions:');
  console.log('1. Le fichier IIFE est disponible dans public/dungeon-generator.iife.js');
  console.log('2. Modifiez index.html pour charger ce fichier');
  console.log('3. Redémarrez l\'application');
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}
