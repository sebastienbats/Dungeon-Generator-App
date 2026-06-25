import React, { useEffect, useRef, useState, useCallback, forwardRef } from 'react';

/**
 * DungeonViewer - Composant dédié au rendu du donjon
 * Version iframe avec initialisation automatique améliorée
 */
const DungeonViewer = forwardRef(({ 
  onInstanceReady, 
  onStatus, 
  isLoaded: externalIsLoaded,
  isLoading: externalIsLoading 
}, ref) => {
  const iframeRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [initError, setInitError] = useState(null);
  const [initAttempts, setInitAttempts] = useState(0);
  const generatorRef = useRef(null);
  const isMountedRef = useRef(true);
  const initAttemptedRef = useRef(false);
  const wrapperRef = useRef(null);
  const iframeLoadedRef = useRef(false);

  console.log('🔄 DungeonViewer monté (version iframe)');

  // Exposer la ref au parent
  React.useImperativeHandle(ref, () => ({
    iframe: iframeRef.current,
    generator: generatorRef.current,
    isLoaded,
    initError,
    retry: () => {
      setInitAttempts(0);
      setInitError(null);
      iframeLoadedRef.current = false;
      initGenerator();
    },
    getSVG: () => {
      try {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentDocument) {
          return iframe.contentDocument.querySelector('svg');
        }
      } catch (e) {}
      return null;
    }
  }));

  // Initialiser le générateur
  const initGenerator = useCallback(() => {
    const attempt = initAttempts + 1;
    setInitAttempts(attempt);
    
    console.log(`🔄 Tentative d'initialisation #${attempt}`);
    
    if (!isMountedRef.current) {
      console.log('🔴 Composant démonté');
      return;
    }

    const iframe = iframeRef.current;
    if (!iframe) {
      console.warn('⚠️ Iframe non disponible');
      if (attempt < 10) {
        setTimeout(initGenerator, 500);
      }
      return;
    }

    try {
      // Obtenir le document de l'iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        console.warn('⚠️ Document de l\'iframe non disponible');
        if (attempt < 10) {
          setTimeout(initGenerator, 500);
        }
        return;
      }

      console.log('  - Iframe document disponible');

      // Vérifier la bibliothèque dans l'iframe
      const iframeWindow = iframe.contentWindow;
      if (!iframeWindow || typeof iframeWindow.DungeonGenerator !== 'function') {
        console.warn('⏳ DungeonGenerator non disponible dans l\'iframe');
        if (attempt < 10) {
          setTimeout(initGenerator, 500);
        }
        return;
      }

      // Nettoyer l'iframe
      iframeDoc.body.innerHTML = '';

      // Créer un wrapper dans l'iframe
      const wrapper = iframeDoc.createElement('div');
      wrapper.id = 'dungeon-wrapper';
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      wrapper.style.minHeight = '400px';
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = 'center';
      wrapper.style.alignItems = 'center';
      wrapper.style.position = 'relative';
      wrapper.style.background = '#1a1a2e';
      
      iframeDoc.body.appendChild(wrapper);
      iframeDoc.body.style.margin = '0';
      iframeDoc.body.style.padding = '0';
      iframeDoc.body.style.background = '#1a1a2e';
      
      wrapperRef.current = wrapper;
      console.log('  - Wrapper créé dans l\'iframe');

      // Créer l'instance avec la bibliothèque de l'iframe
      console.log('🏗️ Création de l\'instance DungeonGenerator');
      const instance = new iframeWindow.DungeonGenerator({
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
      
      if (onInstanceReady) {
        onInstanceReady(instance);
      }
      if (onStatus) {
        onStatus('✅ Prêt', 'success');
      }

      // Générer un donjon par défaut
      setTimeout(() => {
        try {
          if (instance && typeof instance.generate === 'function') {
            instance.generate('rooms', {
              numRooms: 8,
              minRoomSize: 3,
              maxRoomSize: 6
            });
            console.log('🎲 Donjon par défaut généré');
          }
        } catch (e) {
          console.warn('⚠️ Erreur lors de la génération par défaut:', e);
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
        setTimeout(initGenerator, 1000);
      }
    }
  }, [onInstanceReady, onStatus, initAttempts]);

  // Effet principal d'initialisation
  useEffect(() => {
    console.log('📦 useEffect principal - montage');
    isMountedRef.current = true;
    
    if (initAttemptedRef.current) {
      console.log('  - Initialisation déjà tentée');
      return;
    }
    initAttemptedRef.current = true;

    // Copier la référence de l'iframe pour le cleanup
    const iframe = iframeRef.current;

    // Fonction d'initialisation après chargement de l'iframe
    const handleIframeLoad = () => {
      console.log('✅ Iframe chargé');
      iframeLoadedRef.current = true;
      
      // Attendre que la bibliothèque soit disponible dans l'iframe
      const checkLibrary = () => {
        try {
          const currentIframe = iframeRef.current;
          if (currentIframe && currentIframe.contentWindow) {
            if (typeof currentIframe.contentWindow.DungeonGenerator === 'function') {
              console.log('✅ Bibliothèque disponible dans l\'iframe');
              initGenerator();
              return;
            }
          }
          console.log('⏳ Attente de la bibliothèque dans l\'iframe...');
          setTimeout(checkLibrary, 200);
        } catch (e) {
          console.warn('⚠️ Erreur lors de la vérification:', e);
          setTimeout(checkLibrary, 500);
        }
      };
      
      // Démarrer la vérification
      checkLibrary();
    };

    // Si l'iframe est déjà chargé
    if (iframe && iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      console.log('✅ Iframe déjà chargé');
      setTimeout(handleIframeLoad, 100);
    } else if (iframe) {
      console.log('⏳ Attente du chargement de l\'iframe');
      iframe.addEventListener('load', handleIframeLoad);
    }

    // Timeout de secours
    const timeoutId = setTimeout(() => {
      if (!isLoaded && !initError) {
        console.log('⏰ Timeout: Forçage de l\'initialisation');
        initGenerator();
      }
    }, 5000);

    return () => {
      console.log('🧹 Nettoyage du useEffect');
      isMountedRef.current = false;
      clearTimeout(timeoutId);
      
      // Utiliser la référence copiée pour le cleanup
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
      }
    };
  }, [initGenerator, isLoaded, initError]);

  // Effet pour surveiller les changements de externalIsLoaded
  useEffect(() => {
    if (externalIsLoaded && !isLoaded && !initError) {
      console.log('🔄 Re-initialisation forcée par le parent');
      initGenerator();
    }
  }, [externalIsLoaded, isLoaded, initError, initGenerator]);

  return (
    <div 
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
      <iframe
        ref={iframeRef}
        title="Dungeon Generator"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          border: 'none',
          background: '#1a1a2e'
        }}
        sandbox="allow-scripts allow-same-origin"
        srcDoc={`
          <!DOCTYPE html>
          <html>
            <head>
              <script>
                (function() {
                  try {
                    if (window.parent && window.parent.DungeonGenerator) {
                      window.DungeonGenerator = window.parent.DungeonGenerator;
                      console.log('✅ Bibliothèque copiée depuis le parent');
                    }
                  } catch (e) {
                    console.warn('⚠️ Erreur lors de la copie de la bibliothèque:', e);
                  }
                })();
              </script>
              <style>
                body { margin: 0; padding: 0; background: #1a1a2e; }
                #dungeon-wrapper { 
                  width: 100%; 
                  height: 100%; 
                  min-height: 400px; 
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  position: relative; 
                  background: #1a1a2e;
                }
                .dungeon-placeholder {
                  color: #555;
                  text-align: center;
                  padding: 3rem;
                  width: 100%;
                }
                .dungeon-placeholder span {
                  font-size: 4rem;
                  display: block;
                  margin-bottom: 1rem;
                }
                .dungeon-placeholder p {
                  margin: 0.5rem 0;
                }
              </style>
            </head>
            <body>
              <div id="dungeon-wrapper">
                <div class="dungeon-placeholder">
                  <span>🏗️</span>
                  <p>Chargement du générateur...</p>
                  <p style="font-size: 0.8rem; color: #444;">Initialisation en cours</p>
                </div>
              </div>
            </body>
          </html>
        `}
      />
      
      {initError && (
        <div style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#d63031',
          textAlign: 'center',
          padding: '2rem',
          width: '100%',
          background: 'rgba(26, 26, 46, 0.95)',
          zIndex: 20,
          borderRadius: '16px'
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
