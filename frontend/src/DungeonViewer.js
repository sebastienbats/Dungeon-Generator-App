import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * DungeonViewer - Composant dédié au rendu du donjon
 * Version avec diagnostic amélioré et fallback
 */
const DungeonViewer = ({ 
  onInstanceReady, 
  onStatus, 
  isLoaded: externalIsLoaded,
  isLoading: externalIsLoading 
}) => {
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [initError, setInitError] = useState(null);
  const [initAttempts, setInitAttempts] = useState(0);
  const generatorRef = useRef(null);
  const isMountedRef = useRef(true);
  const initAttemptedRef = useRef(false);
  const cleanupRef = useRef(null);
  const forceInitTimeoutRef = useRef(null);

  // Fonction de nettoyage sécurisée
  const safeCleanup = useCallback((container) => {
    if (!container) return;
    
    try {
      if (generatorRef.current) {
        try {
          if (generatorRef.current.svg && generatorRef.current.svg.parentNode) {
            generatorRef.current.svg.parentNode.removeChild(generatorRef.current.svg);
          }
        } catch (e) {}
        generatorRef.current = null;
      }
      
      while (container.firstChild) {
        try {
          container.removeChild(container.firstChild);
        } catch (e) {
          break;
        }
      }
    } catch (e) {}
  }, []);

  // Fonction de diagnostic
  const logDiagnostic = useCallback(() => {
    console.log('🔍 DIAGNOSTIC:');
    console.log('  - containerRef.current:', containerRef.current);
    console.log('  - containerRef.current?.children:', containerRef.current?.children);
    console.log('  - typeof window.DungeonGenerator:', typeof window.DungeonGenerator);
    console.log('  - isLoaded:', isLoaded);
    console.log('  - initError:', initError);
    console.log('  - initAttempts:', initAttempts);
    console.log('  - generatorRef.current:', generatorRef.current);
  }, [isLoaded, initError, initAttempts]);

  // Initialiser le générateur
  const initGenerator = useCallback(() => {
    try {
      setInitAttempts(prev => prev + 1);
      
      if (!isMountedRef.current) {
        console.log('🔴 Composant démonté');
        return;
      }

      const container = containerRef.current;
      if (!container) {
        console.warn('⚠️ Container non disponible, réessai dans 500ms');
        setTimeout(initGenerator, 500);
        return;
      }

      console.log(`🔄 Tentative d'initialisation #${initAttempts + 1}`);
      logDiagnostic();

      // Vérifier la bibliothèque
      if (typeof window.DungeonGenerator !== 'function') {
        console.warn('⏳ DungeonGenerator non disponible');
        setTimeout(initGenerator, 500);
        return;
      }

      // Nettoyer le conteneur
      safeCleanup(container);

      // Créer un wrapper
      const wrapper = document.createElement('div');
      wrapper.id = 'dungeon-wrapper';
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = 'center';
      wrapper.style.alignItems = 'center';
      wrapper.style.minHeight = '400px';
      container.appendChild(wrapper);

      console.log('🏗️ Wrapper créé, tentative de création de l\'instance...');

      // Créer l'instance
      const instance = new window.DungeonGenerator({
        container: wrapper,
        tileSize: 32,
        width: 50,
        height: 40,
        customTileTypes: [
          { id: 'tresor', color: '#f1c40f', label: 'Trésor', icon: '💰' },
          { id: 'piege', color: '#e74c3c', label: 'Piège', icon: '⚔️' },
          { id: 'portail', color: '#8e44ad', label: 'Portail', icon: '🌀' },
          { id: 'autel', color: '#9b59b6', label: 'Autel', icon: '🕯️' },
          { id: 'bibliotheque', color: '#3498db', label: 'Bibliothèque', icon: '📚' }
        ]
      });

      // Vérifier l'instance
      if (!instance) {
        throw new Error('L\'instance DungeonGenerator est null');
      }
      
      if (typeof instance.generate !== 'function') {
        throw new Error('L\'instance DungeonGenerator n\'a pas la méthode generate');
      }

      generatorRef.current = instance;
      setIsLoaded(true);
      setInitError(null);
      
      if (onInstanceReady) {
        onInstanceReady(instance);
      }
      if (onStatus) {
        onStatus('✅ Prêt', 'success');
      }

      console.log('✅ DungeonGenerator initialisé avec succès');
      console.log('📐 Dimensions:', instance.width, 'x', instance.height);
      console.log('🖼️ SVG créé:', !!instance.svg);

      // Vérifier que le SVG est bien dans le DOM
      setTimeout(() => {
        const svgInContainer = container.querySelector('svg');
        console.log('🔍 Vérification SVG dans le conteneur:', !!svgInContainer);
        if (!svgInContainer) {
          console.warn('⚠️ Aucun SVG trouvé dans le conteneur après initialisation');
        }
      }, 100);

    } catch (error) {
      console.error('❌ Erreur d\'initialisation:', error);
      setInitError(error.message);
      if (onStatus) {
        onStatus(`❌ Erreur: ${error.message}`, 'error');
      }
      
      // Réessayer si moins de 10 tentatives
      if (initAttempts < 10 && isMountedRef.current) {
        console.log(`🔄 Nouvelle tentative dans 1s (${initAttempts}/10)`);
        setTimeout(initGenerator, 1000);
      } else {
        console.error('❌ Échec après 10 tentatives');
        // Créer un donjon de secours manuellement
        createFallbackDungeon();
      }
    }
  }, [onInstanceReady, onStatus, safeCleanup, initAttempts, logDiagnostic]);

  // Créer un donjon de secours en cas d'échec
  const createFallbackDungeon = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    console.log('🆘 Création d\'un donjon de secours...');

    try {
      // Nettoyer le conteneur
      safeCleanup(container);

      // Créer un SVG manuellement
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('viewBox', '0 0 800 600');
      svg.style.backgroundColor = '#1a1a2e';
      svg.style.minHeight = '400px';

      // Dessiner un donjon simple
      const colors = ['#2d3436', '#636e72', '#4a4a4a', '#3d3d3d'];
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 15; j++) {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          const x = i * 40 + Math.random() * 10;
          const y = j * 40 + Math.random() * 10;
          rect.setAttribute('x', x);
          rect.setAttribute('y', y);
          rect.setAttribute('width', 30 + Math.random() * 10);
          rect.setAttribute('height', 30 + Math.random() * 10);
          rect.setAttribute('fill', colors[Math.floor(Math.random() * colors.length)]);
          rect.setAttribute('stroke', '#1a1a2e');
          rect.setAttribute('stroke-width', '1');
          svg.appendChild(rect);
        }
      }

      container.appendChild(svg);

      // Créer un wrapper
      const wrapper = document.createElement('div');
      wrapper.id = 'dungeon-wrapper-fallback';
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = 'center';
      wrapper.style.alignItems = 'center';
      wrapper.style.minHeight = '400px';
      wrapper.style.flexDirection = 'column';
      wrapper.style.gap = '1rem';
      wrapper.style.color = '#888';
      wrapper.style.textAlign = 'center';
      wrapper.innerHTML = `
        <span style="font-size: 3rem;">⚠️</span>
        <p>Donjon de secours généré</p>
        <p style="font-size: 0.8rem; color: #555;">Le générateur principal n'a pas pu s'initialiser</p>
        <button onclick="window.location.reload()" style="
          padding: 0.5rem 1.5rem;
          background: #6c5ce7;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
        ">🔄 Recharger</button>
      `;
      container.appendChild(wrapper);

      console.log('✅ Donjon de secours créé');

    } catch (error) {
      console.error('❌ Erreur lors de la création du donjon de secours:', error);
    }
  }, [safeCleanup]);

  // Effet principal d'initialisation
  useEffect(() => {
    isMountedRef.current = true;
    
    if (initAttemptedRef.current) {
      return;
    }
    initAttemptedRef.current = true;

    cleanupRef.current = containerRef.current;

    // Attendre que le DOM soit complètement chargé
    const startInit = () => {
      console.log('🚀 Démarrage de l\'initialisation');
      // Attendre un peu pour que React ait fini de monter
      setTimeout(initGenerator, 300);
    };

    if (document.readyState === 'complete') {
      startInit();
    } else {
      window.addEventListener('load', startInit);
    }

    // Forcer l'initialisation après 5 secondes si elle n'a pas démarré
    forceInitTimeoutRef.current = setTimeout(() => {
      if (!isLoaded && !initError && isMountedRef.current) {
        console.log('⏰ Timeout: Forçage de l\'initialisation');
        initGenerator();
      }
    }, 5000);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('load', startInit);
      if (forceInitTimeoutRef.current) {
        clearTimeout(forceInitTimeoutRef.current);
      }
      
      if (cleanupRef.current) {
        safeCleanup(cleanupRef.current);
      }
      cleanupRef.current = null;
    };
  }, [initGenerator, safeCleanup]);

  // Forcer le rendu quand externalIsLoaded change
  useEffect(() => {
    if (externalIsLoaded && !isLoaded && !initError && initAttempts < 10) {
      console.log('🔄 Re-initialisation forcée');
      initGenerator();
    }
  }, [externalIsLoaded, isLoaded, initError, initAttempts, initGenerator]);

  // Effet de diagnostic continu
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoaded && isMountedRef.current) {
        const container = containerRef.current;
        if (container && container.children.length === 0) {
          console.warn('⚠️ Le conteneur est toujours vide après 3 secondes');
          // Réessayer l'initialisation
          if (initAttempts < 10) {
            initGenerator();
          }
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoaded, initAttempts, initGenerator]);

  // Exposer les méthodes de diagnostic sur la fenêtre
  useEffect(() => {
    window.__dungeonDiagnostic = {
      container: containerRef.current,
      isLoaded,
      initError,
      initAttempts,
      generator: generatorRef.current,
      retry: initGenerator,
      cleanup: () => safeCleanup(containerRef.current),
      log: logDiagnostic
    };
    
    return () => {
      delete window.__dungeonDiagnostic;
    };
  }, [containerRef, isLoaded, initError, initAttempts, initGenerator, safeCleanup, logDiagnostic]);

  return (
    <div 
      ref={containerRef} 
      className="dungeon-viewer"
      style={{
        width: '100%',
        minHeight: '400px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#1a1a2e',
        borderRadius: '16px',
        border: '1px solid #2a2a4a',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {!isLoaded && !externalIsLoaded && !initError && (
        <div className="dungeon-placeholder" style={{ 
          color: '#555',
          textAlign: 'center',
          padding: '3rem',
          width: '100%'
        }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🏗️</span>
          <p>Chargement du générateur...</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#444' }}>
            Tentative {Math.min(initAttempts + 1, 10)}/10
          </p>
          <div style={{ 
            marginTop: '1rem',
            width: '200px',
            height: '4px',
            background: '#2a2a4a',
            borderRadius: '2px',
            marginLeft: 'auto',
            marginRight: 'auto',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min((initAttempts / 10) * 100, 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #f7971e, #ffd200)',
              borderRadius: '2px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {initError && (
        <div style={{ 
          color: '#d63031',
          textAlign: 'center',
          padding: '2rem',
          width: '100%'
        }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>⚠️</span>
          <p style={{ fontWeight: 'bold' }}>Erreur d'initialisation</p>
          <p style={{ fontSize: '0.9rem', color: '#888' }}>{initError}</p>
          <button 
            onClick={() => {
              setInitAttempts(0);
              setInitError(null);
              initGenerator();
            }}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1.5rem',
              background: '#6c5ce7',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            🔄 Réessayer
          </button>
        </div>
      )}

      {externalIsLoading && isLoaded && (
        <div className="loading-overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(26, 26, 46, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '16px',
          gap: '1rem',
          zIndex: 10
        }}>
          <div className="loading-spinner" style={{
            width: '50px',
            height: '50px',
            border: '4px solid #2a2a4a',
            borderTopColor: '#f7971e',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#888' }}>Génération en cours...</p>
        </div>
      )}
    </div>
  );
};

export default DungeonViewer;
