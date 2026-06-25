import React, { useRef, useState, useCallback, useEffect } from 'react';
import DungeonControls from './DungeonControls';
import DungeonViewer from './DungeonViewer';

function App() {
  const [status, setStatus] = useState({ message: 'Prêt à générer un donjon', type: 'info' });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [history, setHistory] = useState({ canUndo: false, canRedo: false });
  const [exportsList, setExportsList] = useState([]);
  const isMountedRef = useRef(true);
  const generatorRef = useRef(null);
  
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
    
    // Mettre à jour l'historique
    if (instance) {
      setHistory({
        canUndo: typeof instance.undo === 'function',
        canRedo: typeof instance.redo === 'function'
      });
    }
  }, []);

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
      
      // Mettre à jour l'historique
      setHistory({
        canUndo: typeof instance.undo === 'function',
        canRedo: typeof instance.redo === 'function'
      });
      
      if (isMountedRef.current) {
        setStatusMessage(`✅ Donjon généré avec succès! (${algorithm})`, 'success');
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
  }, [setStatusMessage]);

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
