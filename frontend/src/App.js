import React, { useRef, useState, useCallback, useEffect } from 'react';
import DungeonControls from './DungeonControls';
import useDungeonGenerator from './DungeonGenerator';

function App() {
  // Utiliser un ref pour le conteneur
  const containerRef = useRef(null);
  const [status, setStatus] = useState({ message: 'Prêt à générer un donjon', type: 'info' });
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState({ canUndo: false, canRedo: false });
  const [exportsList, setExportsList] = useState([]);
  const isMountedRef = useRef(true);
  
  const setStatusMessage = useCallback((message, type = 'info') => {
    if (isMountedRef.current) {
      setStatus({ message, type });
    }
  }, []);

  const {
    isLoaded,
    generateDungeon,
    addAnnotation,
    undo,
    redo,
    exportSVG,
    exportPNG,
    printDungeon,
    getExports,
    deleteExport,
    history: historyState
  } = useDungeonGenerator({
    containerRef,
    onGenerate: () => {},
    onExport: () => {
      if (isMountedRef.current) {
        refreshExports();
      }
    },
    onStatus: setStatusMessage
  });

  // Mettre à jour l'état de l'historique
  useEffect(() => {
    if (historyState && isMountedRef.current) {
      setHistory(historyState);
    }
  }, [historyState]);

  // Rafraîchir la liste des exports
  const refreshExports = useCallback(async () => {
    if (!isMountedRef.current) return;
    const exports = await getExports();
    if (exports && isMountedRef.current) {
      setExportsList(exports);
    }
  }, [getExports]);

  // Charger les exports au démarrage
  useEffect(() => {
    isMountedRef.current = true;
    if (isLoaded) {
      refreshExports();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [isLoaded, refreshExports]);

  const handleGenerate = useCallback(async (algorithm, params) => {
    if (!isMountedRef.current) return;
    setIsLoading(true);
    await generateDungeon(algorithm, params);
    if (isMountedRef.current) {
      setIsLoading(false);
    }
  }, [generateDungeon]);

  const handleDeleteExport = useCallback(async (filename) => {
    if (!isMountedRef.current) return;
    const success = await deleteExport(filename);
    if (success && isMountedRef.current) {
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
          onExportSVG={() => exportSVG()}
          onExportPNG={() => exportPNG()}
          onPrint={printDungeon}
          onUndo={undo}
          onRedo={redo}
          onAddAnnotation={addAnnotation}
          onRefreshExports={refreshExports}
          onDeleteExport={handleDeleteExport}
          isLoading={isLoading}
          history={history}
          exports={exportsList}
          isLoaded={isLoaded}
        />

        {/* Conteneur pour le donjon - avec key pour forcer le re-rendu */}
        <div 
          className="dungeon-container" 
          ref={containerRef}
          key="dungeon-container"
        >
          {!isLoaded && (
            <div className="dungeon-placeholder">
              <span>🏗️</span>
              <p>Chargement du générateur...</p>
            </div>
          )}
          {isLoaded && (
            <div className="dungeon-placeholder" id="dungeon-placeholder">
              <span>🗺️</span>
              <p>Sélectionnez un algorithme et cliquez sur "Générer"</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#555' }}>
                Utilisez les contrôles pour explorer les différents styles de donjons
              </p>
            </div>
          )}
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner" />
              <p style={{ color: '#888' }}>Génération en cours...</p>
            </div>
          )}
        </div>

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
