import React, { useEffect, useRef, useState } from 'react';

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
  const generatorRef = useRef(null);
  const isMountedRef = useRef(true);
  const initAttemptedRef = useRef(false);

  // Initialiser le générateur une seule fois
  useEffect(() => {
    isMountedRef.current = true;
    
    // Éviter les initialisations multiples
    if (initAttemptedRef.current) {
      return;
    }
    initAttemptedRef.current = true;

    const initGenerator = () => {
      try {
        if (!isMountedRef.current) return;
        if (!containerRef.current) {
          console.warn('⚠️ Container non disponible');
          return;
        }

        // Vérifier que la bibliothèque est disponible
        if (typeof window.DungeonGenerator !== 'function') {
          console.warn('⏳ DungeonGenerator pas encore chargé...');
          // Réessayer plus tard
          setTimeout(initGenerator, 200);
          return;
        }

        // Nettoyer le conteneur
        if (containerRef.current) {
          while (containerRef.current.firstChild) {
            try {
              containerRef.current.removeChild(containerRef.current.firstChild);
            } catch (e) {
              break;
            }
          }
        }

        // Créer le wrapper
        const wrapper = document.createElement('div');
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.display = 'flex';
        wrapper.style.justifyContent = 'center';
        wrapper.style.alignItems = 'center';
        wrapper.style.minHeight = '400px';
        containerRef.current.appendChild(wrapper);

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

        generatorRef.current = instance;
        setDungeonInstance(instance);
        setIsLoaded(true);
        
        if (onInstanceReady) {
          onInstanceReady(instance);
        }
        if (onStatus) {
          onStatus('✅ Prêt', 'success');
        }

        console.log('✅ DungeonGenerator initialisé avec succès');

      } catch (error) {
        console.error('❌ Erreur d\'initialisation:', error);
        if (onStatus) {
          onStatus(`❌ Erreur: ${error.message}`, 'error');
        }
        // Réessayer après un délai
        setTimeout(initGenerator, 1000);
      }
    };

    // Démarrer l'initialisation après un court délai
    const timeoutId = setTimeout(initGenerator, 100);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timeoutId);
      
      // Nettoyer l'instance
      if (generatorRef.current) {
        try {
          if (generatorRef.current.svg && generatorRef.current.svg.parentNode) {
            try {
              generatorRef.current.svg.parentNode.removeChild(generatorRef.current.svg);
            } catch (e) {}
          }
        } catch (e) {}
        generatorRef.current = null;
      }
      
      // Nettoyer le conteneur
      if (containerRef.current) {
        try {
          while (containerRef.current.firstChild) {
            try {
              containerRef.current.removeChild(containerRef.current.firstChild);
            } catch (e) {
              break;
            }
          }
        } catch (e) {}
      }
    };
  }, [onInstanceReady, onStatus]);

  // Exposer les méthodes via ref
  useEffect(() => {
    if (dungeonInstance && onInstanceReady) {
      onInstanceReady(dungeonInstance);
    }
  }, [dungeonInstance, onInstanceReady]);

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
        borderRadius: '8px',
        position: 'relative'
      }}
    >
      {!isLoaded && !externalIsLoaded && (
        <div className="dungeon-placeholder" style={{ 
          color: '#555',
          textAlign: 'center',
          padding: '3rem',
          width: '100%'
        }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🏗️</span>
          <p>Chargement du générateur...</p>
        </div>
      )}
      {externalIsLoading && (
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
          borderRadius: '8px',
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
