import React, { useRef, useState, useCallback, useEffect } from 'react';
import DungeonControls from './DungeonControls';
import DungeonViewer from './DungeonViewer';

function App() {
  const [status, setStatus] = useState({ message: 'Prêt à générer un donjon', type: 'info' });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [initError, setInitError] = useState(null);
  const [history, setHistory] = useState({ canUndo: false, canRedo: false });
  const [exportsList, setExportsList] = useState([]);
  const isMountedRef = useRef(true);
  const generatorRef = useRef(null);
  const forceInitTimeoutRef = useRef(null);
  
  const setStatusMessage = useCallback((message, type = 'info') => {
    if (isMountedRef.current) {
      setStatus({ message, type });
    }
  }, []);

  // Récupérer les exports
  const getExports = useCallback(async () => {
    try {
      const response = await fetch('/api/exports');
      const data = await response.json();
      if (data.success) {
        return data.exports;
      }
      return [];
    } catch (error) {
      console.error('❌ Erreur de récupération des exports:', error);
      return [];
    }
  }, []);

  // Supprimer un export
  const deleteExport = useCallback(async (filename) => {
    try {
      const response = await fetch(`/api/exports/${filename}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setStatusMessage(`🗑️ Fichier supprimé: ${filename}`, 'info');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur de suppression:', error);
      setStatusMessage(`❌ Erreur: ${error.message}`, 'error');
      return false;
    }
  }, [setStatusMessage]);

  // Rafraîchir la liste des exports
  const refreshExports = useCallback(async () => {
    if (!isMountedRef.current) return;
    const exports = await getExports();
    if (exports && isMountedRef.current) {
      setExportsList(exports);
    }
  }, [getExports]);

  // Gestionnaire d'instance prête
  const handleInstanceReady = useCallback((instance) => {
    generatorRef.current = instance;
    setIsLoaded(true);
    setInitError(null);
    
    if (instance) {
      setHistory({
        canUndo: typeof instance.undo === 'function',
        canRedo: typeof instance.redo === 'function'
      });
    }
  }, []);

  // Gestionnaire d'erreur d'initialisation
  const handleInitError = useCallback((error) => {
    setInitError(error);
    setStatusMessage(`❌ Erreur d'initialisation: ${error}`, 'error');
  }, [setStatusMessage]);

  // Charger les exports au démarrage
  useEffect(() => {
    isMountedRef.current = true;
    
    // Si le générateur est chargé, charger les exports
    if (isLoaded) {
      refreshExports();
    }
    
    return () => {
      isMountedRef.current = false;
      if (forceInitTimeoutRef.current) {
        clearTimeout(forceInitTimeoutRef.current);
        forceInitTimeoutRef.current = null;
      }
    };
  }, [isLoaded, refreshExports]);

  // Forcer l'initialisation après un délai si le générateur n'est pas chargé
  useEffect(() => {
    // Nettoyer le timeout précédent
    if (forceInitTimeoutRef.current) {
      clearTimeout(forceInitTimeoutRef.current);
      forceInitTimeoutRef.current = null;
    }

    // Si déjà chargé ou en erreur, ne pas forcer
    if (isLoaded || initError) {
      return;
    }

    console.log('⏰ Planification du forçage d\'initialisation dans 5 secondes...');

    // Forcer l'initialisation après 5 secondes
    forceInitTimeoutRef.current = setTimeout(() => {
      if (!isLoaded && !initError && isMountedRef.current) {
        console.log('⏰ Forçage de l\'initialisation depuis App');
        
        // Vérifier si les outils de diagnostic sont disponibles
        if (window.diagnostic && typeof window.diagnostic.forceInit === 'function') {
          window.diagnostic.forceInit();
        } else {
          console.warn('⚠️ Outils de diagnostic non disponibles, tentative manuelle...');
          
          // Tentative manuelle
          const viewer = document.querySelector('.dungeon-viewer');
          if (viewer && typeof window.DungeonGenerator === 'function') {
            try {
              // Nettoyer le conteneur
              while (viewer.firstChild) {
                try {
                  viewer.removeChild(viewer.firstChild);
                } catch (e) {
                  break;
                }
              }
              
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
              
              if (instance && typeof instance.generate === 'function') {
                generatorRef.current = instance;
                setIsLoaded(true);
                setInitError(null);
                setHistory({
                  canUndo: typeof instance.undo === 'function',
                  canRedo: typeof instance.redo === 'function'
                });
                setStatusMessage('✅ Prêt (forcé)', 'success');
                console.log('✅ Instance créée manuellement avec succès');
              }
            } catch (error) {
              console.error('❌ Erreur lors de la création manuelle:', error);
              setStatusMessage(`❌ Erreur: ${error.message}`, 'error');
            }
          } else {
            console.warn('⚠️ Impossible de créer l\'instance manuellement');
          }
        }
      }
    }, 5000);

    return () => {
      if (forceInitTimeoutRef.current) {
        clearTimeout(forceInitTimeoutRef.current);
        forceInitTimeoutRef.current = null;
      }
    };
  }, [isLoaded, initError, setStatusMessage]);

  // Génération du donjon
  const handleGenerate = useCallback(async (algorithm, params) => {
    if (!isMountedRef.current) return;
    if (!generatorRef.current) {
      setStatusMessage('❌ Générateur non initialisé', 'error');
      return;
    }

    setIsLoading(true);
    setStatusMessage(`🔄 Génération avec ${algorithm}...`, 'info');
    
    try {
      const instance = generatorRef.current;
      instance.generate(algorithm, params, false);
      
      setHistory({
        canUndo: typeof instance.undo === 'function',
        canRedo: typeof instance.redo === 'function'
      });
      
      if (isMountedRef.current) {
        setStatusMessage(`✅ Donjon généré avec succès! (${algorithm})`, 'success');
        refreshExports();
      }
    } catch (error) {
      console.error('❌ Erreur de génération:', error);
      if (isMountedRef.current) {
        setStatusMessage(`❌ Erreur: ${error.message}`, 'error');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [setStatusMessage, refreshExports]);

  // Ajout d'une annotation
  const handleAddAnnotation = useCallback((x, y, text, color = '#ffd700', fontSize = 14) => {
    if (!generatorRef.current) {
      setStatusMessage('❌ Générateur non initialisé', 'error');
      return;
    }
    try {
      generatorRef.current.addAnnotation(x, y, text, color, fontSize);
      setStatusMessage(`📝 Annotation ajoutée à (${x}, ${y})`, 'info');
    } catch (error) {
      console.error('❌ Erreur d\'annotation:', error);
      setStatusMessage(`❌ Erreur: ${error.message}`, 'error');
    }
  }, [setStatusMessage]);

  // Annulation
  const handleUndo = useCallback(() => {
    if (!generatorRef.current) return;
    try {
      const success = generatorRef.current.undo();
      if (success) {
        setHistory({
          canUndo: typeof generatorRef.current.undo === 'function',
          canRedo: typeof generatorRef.current.redo === 'function'
        });
        setStatusMessage('↩️ Annulation effectuée', 'info');
      }
    } catch (error) {
      console.error('❌ Erreur d\'annulation:', error);
      setStatusMessage(`❌ Erreur: ${error.message}`, 'error');
    }
  }, [setStatusMessage]);

  // Rétablissement
  const handleRedo = useCallback(() => {
    if (!generatorRef.current) return;
    try {
      const success = generatorRef.current.redo();
      if (success) {
        setHistory({
          canUndo: typeof generatorRef.current.undo === 'function',
          canRedo: typeof generatorRef.current.redo === 'function'
        });
        setStatusMessage('↪️ Rétablissement effectué', 'info');
      }
    } catch (error) {
      console.error('❌ Erreur de rétablissement:', error);
      setStatusMessage(`❌ Erreur: ${error.message}`, 'error');
    }
  }, [setStatusMessage]);

  // Export SVG
  const handleExportSVG = useCallback(() => {
    if (!generatorRef.current) {
      setStatusMessage('❌ Générateur non initialisé', 'error');
      return;
    }
    try {
      const filename = `donjon_${Date.now()}.svg`;
      generatorRef.current.exportSVG(filename);
      setStatusMessage(`📄 SVG exporté: ${filename}`, 'success');
      refreshExports();
    } catch (error) {
      console.error('❌ Erreur d\'export SVG:', error);
      setStatusMessage(`❌ Erreur: ${error.message}`, 'error');
    }
  }, [setStatusMessage, refreshExports]);

  // Export PNG
  const handleExportPNG = useCallback(async () => {
    if (!generatorRef.current) {
      setStatusMessage('❌ Générateur non initialisé', 'error');
      return;
    }
    try {
      const filename = `donjon_${Date.now()}.png`;
      await generatorRef.current.exportPNG(filename);
      setStatusMessage(`🖼️ PNG exporté: ${filename}`, 'success');
      refreshExports();
    } catch (error) {
      console.error('❌ Erreur d\'export PNG:', error);
      setStatusMessage(`❌ Erreur: ${error.message}`, 'error');
    }
  }, [setStatusMessage, refreshExports]);

  // Impression
  const handlePrint = useCallback(() => {
    if (!generatorRef.current) {
      setStatusMessage('❌ Générateur non initialisé', 'error');
      return;
    }
    try {
      generatorRef.current.print();
      setStatusMessage('🖨️ Impression en cours...', 'info');
    } catch (error) {
      console.error('❌ Erreur d\'impression:', error);
      setStatusMessage(`❌ Erreur: ${error.message}`, 'error');
    }
  }, [setStatusMessage]);

  // Suppression d'un export
  const handleDeleteExport = useCallback(async (filename) => {
    const success = await deleteExport(filename);
    if (success) {
      refreshExports();
    }
  }, [deleteExport, refreshExports]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          🏰 Générateur de Donjon
          <span className="badge">Procédural</span>
        </h1>
        <div className="status-indicator">
          <span className={`status-dot ${isLoaded ? 'ready' : 'loading'}`} />
          {isLoaded ? '✅ Bibliothèque chargée' : '⏳ Chargement...'}
        </div>
      </header>

      <main className="app-main">
        <DungeonControls
          onGenerate={handleGenerate}
          onExportSVG={handleExportSVG}
          onExportPNG={handleExportPNG}
          onPrint={handlePrint}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onAddAnnotation={handleAddAnnotation}
          onRefreshExports={refreshExports}
          onDeleteExport={handleDeleteExport}
          isLoading={isLoading}
          history={history}
          exports={exportsList}
          isLoaded={isLoaded}
        />

        <DungeonViewer
          onInstanceReady={handleInstanceReady}
          onStatus={setStatusMessage}
          isLoaded={isLoaded}
          isLoading={isLoading}
        />

        {status.message && (
          <div className={`status-message ${status.type}`}>
            {status.message}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
