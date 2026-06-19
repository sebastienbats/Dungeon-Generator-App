import React, { useRef, useState, useCallback } from 'react';
import DungeonControls from './DungeonControls';
import useDungeonGenerator from './DungeonGenerator';

function App() {
  const containerRef = useRef(null);
  const [status, setStatus] = useState({ message: 'Prêt à générer un donjon', type: 'info' });
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState({ canUndo: false, canRedo: false });
  const [exportsList, setExportsList] = useState([]);
  
  const setStatusMessage = useCallback((message, type = 'info') => {
    setStatus({ message, type });
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
      // Rafraîchir la liste des exports après un export
      refreshExports();
    },
    onStatus: setStatusMessage
  });

  // Mettre à jour l'état de l'historique
  React.useEffect(() => {
    if (historyState) {
      setHistory(historyState);
    }
  }, [historyState]);

  // Rafraîchir la liste des exports
  const refreshExports = useCallback(async () => {
    const exports = await getExports();
    if (exports) {
      setExportsList(exports);
    }
  }, [getExports]);

  // Charger les exports au démarrage
  React.useEffect(() => {
    if (isLoaded) {
      refreshExports();
    }
  }, [isLoaded, refreshExports]);

  const handleGenerate = useCallback(async (algorithm, params) => {
    setIsLoading(true);
    await generateDungeon(algorithm, params);
    setIsLoading(false);
  }, [generateDungeon]);

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

        <div className="dungeon-container" ref={containerRef}>
          {!isLoaded && (
            <div className="dungeon-placeholder">
              <span>🏗️</span>
              <p>Chargement du générateur...</p>
            </div>
          )}
          {isLoaded && (
            <div className="dungeon-placeholder">
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
