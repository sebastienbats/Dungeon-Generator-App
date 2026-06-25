import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * DungeonViewer - Composant dédié au rendu du donjon
 * Isolé du reste de l'application pour éviter les conflits DOM
 */
const DungeonViewer = ({ 
  onInstanceReady, 
  onStatus, 
  isLoaded: externalIsLoaded,
  isLoading: externalIsLoading 
}) => {
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dungeonInstance, setDungeonInstance] = useState(null);
  const [initError, setInitError] = useState(null);
  const generatorRef = useRef(null);
  const isMountedRef = useRef(true);
  const initAttemptedRef = useRef(false);
  const cleanupRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 10;

  // Fonction de nettoyage sécurisée
  const safeCleanup = useCallback((container) => {
    if (!container) return;
    
    try {
      // Nettoyer le générateur
      if (generatorRef.current) {
        try {
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
      
      // Nettoyer le conteneur
      while (container.firstChild) {
        try {
          container.removeChild(container.firstChild);
        } catch (e) {
          break;
        }
      }
    } catch (e) {
      // Ignorer les erreurs de nettoyage
    }
  }, []);

  // Initialiser le générateur
  const initGenerator = useCallback(() => {
    try {
      if (!isMountedRef.current) {
        console.log('🔴 Composant démonté, arrêt de l\'initialisation');
        return;
      }

      const container = containerRef.current;
      if (!container) {
        console.warn('⚠️ Container non disponible');
        return;
      }

      // Vérifier que la bibliothèque est disponible
      if (typeof window.DungeonGenerator !== 'function') {
        console.warn(`⏳ DungeonGenerator pas encore chargé (tentative ${retryCountRef.current + 1}/${maxRetries})...`);
        
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          setTimeout(initGenerator, 300);
        } else {
          setInitError('La bibliothèque DungeonGenerator n\'a pas pu être chargée');
          if (onStatus) {
            onStatus('❌ La bibliothèque DungeonGenerator n\'a pas été trouvée', 'error');
          }
        }
        return;
      }

      // Nettoyer le conteneur avant de créer l'instance
      safeCleanup(container);

      // Créer le wrapper
      const wrapper = document.createElement('div');
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = 'center';
      wrapper.style.alignItems = 'center';
      wrapper.style.minHeight = '400px';
      wrapper.id = 'dungeon-wrapper';
      container.appendChild(wrapper);

      // Créer l'instance
      console.log('🏗️ Création de l\'instance DungeonGenerator...');
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

      generatorRef.current = instance;
      setDungeonInstance(instance);
      setIsLoaded(true);
      setInitError(null);
      
      if (onInstanceReady) {
        onInstanceReady(instance);
      }
      if (onStatus) {
        onStatus('✅ Prêt', 'success');
      }

      console.log('✅ DungeonGenerator initialisé avec succès');

    } catch (error) {
      console.error('❌ Erreur d\'initialisation:', error);
      setInitError(error.message);
      if (onStatus) {
        onStatus(`❌ Erreur: ${error.message}`, 'error');
      }
      
      // Réessayer après un délai si le composant est toujours monté
      if (isMountedRef.current && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setTimeout(initGenerator, 1000);
      }
    }
  }, [onInstanceReady, onStatus, safeCleanup]);

  // Effet principal d'initialisation
  useEffect(() => {
    isMountedRef.current = true;
    
    // Éviter les initialisations multiples
    if (initAttemptedRef.current) {
      return;
    }
    initAttemptedRef.current = true;

    // Copier la référence du conteneur pour le cleanup
    cleanupRef.current = containerRef.current;

    // Démarrer l'initialisation
    const initTimeout = setTimeout(initGenerator, 100);

    return () => {
      isMountedRef.current = false;
      clearTimeout(initTimeout);
      
      // Nettoyer avec la référence copiée
      if (cleanupRef.current) {
        safeCleanup(cleanupRef.current);
      }
      cleanupRef.current = null;
    };
  }, [initGenerator, safeCleanup]);

  // Exposer l'instance via la prop onInstanceReady
  useEffect(() => {
    if (dungeonInstance && onInstanceReady) {
      onInstanceReady(dungeonInstance);
    }
  }, [dungeonInstance, onInstanceReady]);

  // Forcer le rendu quand externalIsLoaded change
  useEffect(() => {
    if (externalIsLoaded && !isLoaded && !initError) {
      // Si le composant parent est chargé mais pas nous, réessayer
      if (retryCountRef.current < maxRetries) {
        initGenerator();
      }
    }
  }, [externalIsLoaded, isLoaded, initError, initGenerator]);

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
      {/* État de chargement */}
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
            Tentative {retryCountRef.current + 1}/{maxRetries}
          </p>
        </div>
      )}

      {/* Erreur d'initialisation */}
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
              retryCountRef.current = 0;
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
              cursor: 'pointer'
            }}
          >
            🔄 Réessayer
          </button>
        </div>
      )}

      {/* Overlay de chargement pendant la génération */}
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
