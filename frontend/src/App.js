import React, { useRef, useState, useCallback } from 'react';
import DungeonControls from './DungeonControls';
import useDungeonGenerator from './DungeonGenerator';

function App() {
  const containerRef = useRef(null);
  const [status, setStatus] = useState({ message: 'Prêt à générer un donjon', type: 'info' });
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState({ canUndo: false, canRedo: false });
  
  const setStatusMessage = (message, type = 'info') => {
    setStatus({ message, type });
  };

  const {
    generateDungeon,
    addAnnotation,
    undo,
    redo,
    exportSVG,
    exportPNG,
    printDungeon,
    isLoaded,
    history: historyState
  } = useDungeonGenerator({
    containerRef,
    onGenerate: () => {},
    onExport: () => {},
    onStatus: setStatusMessage
  });

  // Mettre à jour l'état de l'historique
  React.useEffect(() => {
    if (historyState) {
      setHistory(historyState);
    }
  }, [historyState]);

  const handleGenerate = useCallback(async (algorithm, params) => {
    setIsLoading(true);
    await generateDungeon(algorithm, params);
    setIsLoading(false);
  }, [generateDungeon]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          🏰 Générateur de Donjon
          <span className="badge">Procédural</span>
        </h1>
        <div style={{ fontSize: '0.85rem', color: '#888' }}>
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
          isLoading={isLoading}
          history={history}
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
