import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * DungeonViewer - Composant dédié au rendu du donjon
 * Version avec isolation totale pour éviter les conflits DOM avec React
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
  const wrapperRef = useRef(null);

  // Fonction de nettoyage sécurisée
  const safeCleanup = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    try {
      // Nettoyer le générateur
      if (generatorRef.current) {
        try {
          // Essayer de nettoyer le SVG
          if (generatorRef.current.svg && generatorRef.current.svg.parentNode) {
            try {
              generatorRef.current.svg.parentNode.removeChild(generatorRef.current.svg);
            } catch (e) {
              // Ignorer
            }
          }
        } catch (e) {
          // Ignorer
        }
        generatorRef.current = null;
      }
      
      // Nettoyer le wrapper
      if (wrapperRef.current && wrapperRef.current.parentNode) {
        try {
          wrapperRef.current.parentNode.removeChild(wrapperRef.current);
        } catch (e) {
          // Ignorer
        }
        wrapperRef.current = null;
      }
      
      // Nettoyer le conteneur - méthode alternative
      try {
        // Utiliser innerHTML pour un nettoyage complet
        container.innerHTML = '';
      } catch (e) {
        // Si innerHTML échoue, supprimer les enfants un par un
        while (container.firstChild) {
          try {
            container.removeChild(container.firstChild);
          } catch (e) {
            break;
          }
        }
      }
    } catch (e) {
      // Ignorer les erreurs de nettoyage
    }
  }, []);

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
        console.warn('⚠️ Container non disponible');
        setTimeout(initGenerator, 500);
        return;
      }

      console.log(`🔄 Tentative d'initialisation #${initAttempts + 1}`);

      // Vérifier la bibliothèque
      if (typeof window.DungeonGenerator !== 'function') {
        console.warn('⏳ DungeonGenerator non disponible');
        setTimeout(initGenerator, 500);
        return;
      }

      // Nettoyer le conteneur
      safeCleanup();

      // Créer un wrapper - utiliser un élément simple
      const wrapper = document.createElement('div');
      wrapper.id = 'dungeon-wrapper';
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      wrapper.style.minHeight = '400px';
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = 'center';
      wrapper.style.alignItems = 'center';
      wrapper.style.position = 'relative';
      
      // Ajouter le wrapper au conteneur
      container.appendChild(wrapper);
      wrapperRef.current = wrapper;

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

      // Vérifier que le SVG est bien dans le DOM
      setTimeout(() => {
        const svgInWrapper = wrapper.querySelector('svg');
        console.log('🔍 SVG dans le wrapper:', !!svgInWrapper);
        if (svgInWrapper) {
          console.log('📐 SVG dimensions:', svgInWrapper.getAttribute('width'), 'x', svgInWrapper.getAttribute('height'));
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
      }
    }
  }, [onInstanceReady, onStatus, safeCleanup, initAttempts]);

  // Effet principal d'initialisation
  useEffect(() => {
    isMountedRef.current = true;
    
    if (initAttemptedRef.current) {
      return;
    }
    initAttemptedRef.current = true;

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
      
      // Nettoyer le conteneur
      safeCleanup();
    };
  }, [initGenerator, safeCleanup]);

  // Effet pour le nettoyage lors du démontage
  useEffect(() => {
    return () => {
      safeCleanup();
    };
  }, [safeCleanup]);

  // Exposer les méthodes de diagnostic sur la fenêtre
  useEffect(() => {
    window.__dungeonDiagnostic = {
      container: containerRef.current,
      wrapper: wrapperRef.current,
      isLoaded,
      initError,
      initAttempts,
      generator: generatorRef.current,
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
    };
    
    return () => {
      delete window.__dungeonDiagnostic;
    };
  }, [containerRef, isLoaded, initError, initAttempts, initGenerator, safeCleanup]);

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
};

export default DungeonViewer;
