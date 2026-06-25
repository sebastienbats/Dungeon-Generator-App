/**
 * Outils de diagnostic pour le DungeonViewer
 * À utiliser dans la console du navigateur
 */

const dungeonDiagnostic = {
  // Vérifier l'état du composant
  checkStatus: () => {
    console.log('🔍 DIAGNOSTIC DU DUNGEON VIEWER');
    console.log('================================');
    
    // Vérifier le conteneur
    const viewer = document.querySelector('.dungeon-viewer');
    console.log('📦 Conteneur .dungeon-viewer:', viewer);
    
    if (viewer) {
      console.log('  - Enfants:', viewer.children);
      console.log('  - HTML:', viewer.innerHTML.substring(0, 200) + '...');
      
      const wrapper = document.getElementById('dungeon-wrapper');
      console.log('  - Wrapper #dungeon-wrapper:', wrapper);
      
      if (wrapper) {
        const svg = wrapper.querySelector('svg');
        console.log('  - SVG dans le wrapper:', svg);
        if (svg) {
          console.log('    - Dimensions:', svg.getAttribute('width'), 'x', svg.getAttribute('height'));
          console.log('    - Enfants SVG:', svg.children.length);
        }
      }
    }
    
    // Vérifier la bibliothèque
    console.log('📚 window.DungeonGenerator:', typeof window.DungeonGenerator);
    
    // Vérifier React
    const root = document.getElementById('root');
    console.log('🌱 Root React:', root);
    
    console.log('================================');
  },

  // Tenter de forcer l'initialisation
  forceInit: () => {
    console.log('🔄 Tentative de forçage de l\'initialisation...');
    
    // Trouver le conteneur
    const viewer = document.querySelector('.dungeon-viewer');
    if (!viewer) {
      console.error('❌ Conteneur .dungeon-viewer non trouvé');
      return;
    }
    
    // Nettoyer le conteneur
    while (viewer.firstChild) {
      try {
        viewer.removeChild(viewer.firstChild);
      } catch (e) {
        break;
      }
    }
    
    // Vérifier la bibliothèque
    if (typeof window.DungeonGenerator !== 'function') {
      console.error('❌ DungeonGenerator non disponible');
      return;
    }
    
    try {
      // Créer un wrapper
      const wrapper = document.createElement('div');
      wrapper.id = 'dungeon-wrapper';
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      wrapper.style.minHeight = '400px';
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = 'center';
      wrapper.style.alignItems = 'center';
      wrapper.style.position = 'relative';
      viewer.appendChild(wrapper);
      
      console.log('🏗️ Wrapper créé');
      
      // Créer l'instance
      const instance = new window.DungeonGenerator({
        container: wrapper,
        tileSize: 32,
        width: 50,
        height: 40,
        customTileTypes: [
          { id: 'tresor', color: '#f1c40f', label: 'Trésor', icon: '💰' },
          { id: 'piege', color: '#e74c3c', label: 'Piège', icon: '⚔️' },
          { id: 'portail', color: '#8e44ad', label: 'Portail', icon: '🌀' }
        ]
      });
      
      console.log('✅ Instance créée avec succès');
      console.log('📐 Dimensions:', instance.width, 'x', instance.height);
      
      // Stocker l'instance globalement
      window.__dungeonInstance = instance;
      
      // Vérifier le SVG
      setTimeout(() => {
        const svg = wrapper.querySelector('svg');
        console.log('🔍 SVG présent:', !!svg);
        if (svg) {
          console.log('📐 SVG dimensions:', svg.getAttribute('width'), 'x', svg.getAttribute('height'));
          console.log('📊 Nombre de tuiles:', svg.querySelectorAll('rect').length);
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Erreur:', error);
    }
  },

  // Créer un donjon de test simple
  createTestDungeon: () => {
    console.log('🎨 Création d\'un donjon de test...');
    
    const viewer = document.querySelector('.dungeon-viewer');
    if (!viewer) {
      console.error('❌ Conteneur non trouvé');
      return;
    }
    
    // Nettoyer
    while (viewer.firstChild) {
      try {
        viewer.removeChild(viewer.firstChild);
      } catch (e) {
        break;
      }
    }
    
    // Créer un SVG simple
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 800 600');
    svg.style.backgroundColor = '#1a1a2e';
    svg.style.minHeight = '400px';
    
    // Dessiner une grille simple
    const colors = ['#2d3436', '#636e72', '#4a4a4a', '#3d3d3d'];
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 15; j++) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', i * 40 + 5);
        rect.setAttribute('y', j * 40 + 5);
        rect.setAttribute('width', 30);
        rect.setAttribute('height', 30);
        rect.setAttribute('fill', colors[(i + j) % colors.length]);
        rect.setAttribute('stroke', '#1a1a2e');
        rect.setAttribute('stroke-width', '1');
        svg.appendChild(rect);
      }
    }
    
    viewer.appendChild(svg);
    console.log('✅ Donjon de test créé');
  },

  // Nettoyer le conteneur
  cleanup: () => {
    console.log('🧹 Nettoyage du conteneur...');
    const viewer = document.querySelector('.dungeon-viewer');
    if (viewer) {
      while (viewer.firstChild) {
        try {
          viewer.removeChild(viewer.firstChild);
        } catch (e) {
          break;
        }
      }
      console.log('✅ Conteneur nettoyé');
    } else {
      console.log('⚠️ Conteneur non trouvé');
    }
  },

  // Recharger la page avec force
  reload: () => {
    console.log('🔄 Rechargement de la page...');
    window.location.reload();
  },

  // Vérification complète
  fullCheck: function() {
    console.log('🔍 VÉRIFICATION COMPLÈTE');
    console.log('=======================');
    this.checkStatus();
    console.log('-----------------------');
    
    // Vérifier si l'initialisation a réussi
    if (window.__dungeonInstance) {
      console.log('✅ Une instance existe déjà');
      console.log('📐 Dimensions:', window.__dungeonInstance.width, 'x', window.__dungeonInstance.height);
    } else {
      console.log('⚠️ Aucune instance trouvée');
      console.log('🔄 Tentative de forçage...');
      this.forceInit();
    }
    console.log('=======================');
  }
};

// Exposer globalement
window.diagnostic = dungeonDiagnostic;

console.log('✅ Outils de diagnostic disponibles');
console.log('📋 Utilisez diagnostic.fullCheck() pour une vérification complète');
console.log('📋 Utilisez diagnostic.forceInit() pour forcer l\'initialisation');
console.log('📋 Utilisez diagnostic.createTestDungeon() pour créer un donjon de test');
console.log('📋 Utilisez diagnostic.checkStatus() pour vérifier l\'état actuel');
