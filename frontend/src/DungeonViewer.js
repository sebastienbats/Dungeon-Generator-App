import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * DungeonViewer - Composant dédié au rendu du donjon
 * Version avec diagnostic amélioré pour résoudre les problèmes d'initialisation
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
  const [initAttempts, setInitAttempts] = useState(0);
  const generatorRef = useRef(null);
  const isMountedRef = useRef(true);
  const initAttemptedRef = useRef(false);
  const cleanupRef = useRef(null);

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
        // Réessayer après un délai
        setTimeout(initGenerator, 500);
        return;
      }

      // Nettoyer le conteneur
      safeCleanup(container);

      // Créer un wrapper avec un ID pour le débogage
      const wrapper = document.createElement('div');
      wrapper.id = 'dungeon-wrapper';
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = 'center';
      wrapper.style.alignItems = 'center';
      wrapper.style.minHeight = '400px';
      container.appendChild(wrapper);

      console.log('🏗️ Création de l\'instance DungeonGenerator...');
      
      // Créer l'instance avec des options
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

      // Vérifier que l'instance est valide
      if (!instance || typeof instance.generate !== 'function') {
        throw new Error('L\'instance DungeonGenerator n\'est pas valide');
      }

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
      console.log('📐 Dimensions:', instance.width, 'x', instance.height);

    } catch (error) {
      console.error('❌ Erreur:', error);
      setInitError(error.message);
      if (onStatus) {
        onStatus(`❌ Erreur: ${error.message}`, 'error');
      }
      
      // Réessayer si moins de 10 tentatives
      if (initAttempts < 10 && isMountedRef.current) {
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

    cleanupRef.current = containerRef.current;

    // Attendre que le DOM soit complètement chargé
    const startInit = () => {
      console.log('🚀 Démarrage de l\'initialisation');
      initGenerator();
    };

    if (document.readyState === 'complete') {
      setTimeout(startInit, 200);
    } else {
      window.addEventListener('load', startInit);
    }

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('load', startInit);
      
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
            Tentative {initAttempts + 1}/10
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
              width: `${(initAttempts / 10) * 100}%`,
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
