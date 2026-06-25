import React, { useEffect, useRef, useState, useCallback, forwardRef } from 'react';

/**
 * DungeonViewer - Composant dédié au rendu du donjon
 * Version avec gestion robuste du cycle de vie
 */
const DungeonViewer = forwardRef(({ 
  onInstanceReady, 
  onStatus, 
  isLoaded: externalIsLoaded,
  isLoading: externalIsLoading 
}, ref) => {
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [initError, setInitError] = useState(null);
  const [initAttempts, setInitAttempts] = useState(0);
  const generatorRef = useRef(null);
  const isMountedRef = useRef(true);
  const initAttemptedRef = useRef(false);
  const wrapperRef = useRef(null);
  const initTimeoutRef = useRef(null);
  const cleanupTimeoutRef = useRef(null);

  console.log('🔄 DungeonViewer monté');

  // Exposer la ref au parent
  React.useImperativeHandle(ref, () => ({
    container: containerRef.current,
    wrapper: wrapperRef.current,
    generator: generatorRef.current,
    isLoaded,
    initError,
    retry: () => {
      setInitAttempts(0);
      setInitError(null);
      initGenerator();
    },
    cleanup: safeCleanup,
    getSVG: () => {
      const wrapper = wrapperRef.current;
      if (wrapper) {
        return wrapper.querySelector('svg');
      }
      return null;
    }
  }));

  // Fonction de nettoyage sécurisée
  const safeCleanup = useCallback(() => {
    console.log('🧹 Nettoyage du conteneur');
    const container = containerRef.current;
    if (!container) return;
    
    try {
      if (generatorRef.current) {
        console.log('  - Nettoyage du générateur');
        try {
          if (generatorRef.current.svg && generatorRef.current.svg.parentNode) {
            generatorRef.current.svg.parentNode.removeChild(generatorRef.current.svg);
          }
        } catch (e) {}
        generatorRef.current = null;
      }
      
      if (wrapperRef.current && wrapperRef.current.parentNode) {
        console.log('  - Nettoyage du wrapper');
        try {
          wrapperRef.current.parentNode.removeChild(wrapperRef.current);
        } catch (e) {}
        wrapperRef.current = null;
      }
      
      console.log('  - Nettoyage du conteneur (innerHTML)');
      container.innerHTML = '';
      console.log('✅ Nettoyage terminé');
    } catch (e) {
      console.warn('⚠️ Erreur lors du nettoyage:', e);
    }
  }, []);

  // Initialiser le générateur
  const initGenerator = useCallback(() => {
    const attempt = initAttempts + 1;
    setInitAttempts(attempt);
    
    console.log(`🔄 Tentative d'initialisation #${attempt}`);
    
    if (!isMountedRef.current) {
      console.log('🔴 Composant démonté');
      return;
    }

    const container = containerRef.current;
    if (!container) {
      console.warn('⚠️ Container non disponible');
      if (attempt < 10) {
        initTimeoutRef.current = setTimeout(initGenerator, 500);
      }
      return;
    }

    console.log('  - Container:', container);
    console.log('  - window.DungeonGenerator:', typeof window.DungeonGenerator);

    if (typeof window.DungeonGenerator !== 'function') {
      console.warn('⏳ DungeonGenerator non disponible');
      if (attempt < 10) {
        initTimeoutRef.current = setTimeout(initGenerator, 500);
      }
      return;
    }

    try {
      // Nettoyer le conteneur
      safeCleanup();

      // Créer un wrapper
      console.log('🏗️ Création du wrapper');
      const wrapper = document.createElement('div');
      wrapper.id = 'dungeon-wrapper';
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      wrapper.style.minHeight = '400px';
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = 'center';
      wrapper.style.alignItems = 'center';
      wrapper.style.position = 'relative';
      
      container.appendChild(wrapper);
      wrapperRef.current = wrapper;
      console.log('  - Wrapper créé et ajouté');

      // Créer l'instance
      console.log('🏗️ Création de l\'instance DungeonGenerator');
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

      if (!instance) {
        throw new Error('L\'instance DungeonGenerator est null');
      }
      
      if (typeof instance.generate !== 'function') {
        throw new Error('L\'instance DungeonGenerator n\'a pas la méthode generate');
      }

      generatorRef.current = instance;
      window.__dungeonInstance = instance;
      setIsLoaded(true);
      setInitError(null);
      
      console.log('✅ DungeonGenerator initialisé avec succès');
      console.log('  - Dimensions:', instance.width, 'x', instance.height);
      console.log('  - SVG créé:', !!instance.svg);
      
      if (onInstanceReady) {
        onInstanceReady(instance);
      }
      if (onStatus) {
        onStatus('✅ Prêt', 'success');
      }

      // Vérifier le SVG après un délai
      cleanupTimeoutRef.current = setTimeout(() => {
        const svgInWrapper = wrapper.querySelector('svg');
        console.log('🔍 Vérification SVG après initialisation:');
        console.log('  - SVG dans le wrapper:', !!svgInWrapper);
        if (svgInWrapper) {
          console.log('  - Dimensions SVG:', svgInWrapper.getAttribute('width'), 'x', svgInWrapper.getAttribute('height'));
          console.log('  - Enfants SVG:', svgInWrapper.children.length);
        }
      }, 200);

    } catch (error) {
      console.error('❌ Erreur d\'initialisation:', error);
      setInitError(error.message);
      if (onStatus) {
        onStatus(`❌ Erreur: ${error.message}`, 'error');
      }
      
      if (attempt < 10 && isMountedRef.current) {
        console.log(`🔄 Nouvelle tentative dans 1s (${attempt}/10)`);
        initTimeoutRef.current = setTimeout(initGenerator, 1000);
      }
    }
  }, [onInstanceReady, onStatus, safeCleanup, initAttempts]);

  // Initialisation immédiate sans attendre le DOM
  useEffect(() => {
    console.log('📦 useEffect principal - montage');
    isMountedRef.current = true;
    
    // Démarrer l'initialisation immédiatement
    const startInit = () => {
      console.log('🚀 Démarrage immédiat de l\'initialisation');
      initGenerator();
    };

    // Démarrer après un court délai pour permettre au DOM de se stabiliser
    initTimeoutRef.current = setTimeout(startInit, 100);

    return () => {
      console.log('🧹 Nettoyage du useEffect');
      isMountedRef.current = false;
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
        cleanupTimeoutRef.current = null;
      }
      // Ne pas nettoyer le conteneur ici pour éviter les conflits
    };
  }, [initGenerator]);

  return (
    <div 
      ref={containerRef} 
      className="dungeon-viewer"
      style={{
        width: '100%',
        minHeight: '400px',
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
          width: '100%',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🏗️</span>
          <p>Chargement du générateur...</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#444' }}>
            Tentative {Math.min(initAttempts + 1, 10)}/10
          </p>
        </div>
      )}

      {initError && (
        <div style={{ 
          color: '#d63031',
          textAlign: 'center',
          padding: '2rem',
          width: '100%',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
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
});

DungeonViewer.displayName = 'DungeonViewer';

export default DungeonViewer;
