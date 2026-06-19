import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';

/**
 * Hook personnalisé pour la génération de donjons
 * Utilise la bibliothèque DungeonGenerator chargée dans index.html
 */
const useDungeonGenerator = ({ 
  containerRef, 
  onGenerate, 
  onExport, 
  onStatus 
}) => {
  const [dungeon, setDungeon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [history, setHistory] = useState({ canUndo: false, canRedo: false });
  
  const generatorRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Wrapper pour onStatus
  const setStatus = useCallback((message, type = 'info') => {
    if (onStatus) {
      onStatus(message, type);
    }
  }, [onStatus]);

  // Mise à jour de l'historique
  const updateHistoryState = useCallback((instance) => {
    if (instance) {
      setHistory({
        canUndo: typeof instance.undo === 'function',
        canRedo: typeof instance.redo === 'function'
      });
    }
  }, []);

  // Sauvegarde sur le serveur
  const saveToServer = useCallback(async (data, filename, type) => {
    try {
      const endpoint = type === 'svg' ? '/api/save-svg' : '/api/save-png';
      const payload = type === 'svg' 
        ? { svg: data, filename } 
        : { image: data, filename };
      
      const response = await axios.post(endpoint, payload);
      
      if (response.data.success) {
        console.log(`📁 Fichier sauvegardé: ${response.data.url}`);
        setStatus(`📁 Sauvegardé: ${response.data.filename}`, 'info');
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur de sauvegarde:', error);
      setStatus(`❌ Erreur de sauvegarde: ${error.message}`, 'error');
      return null;
    }
  }, [setStatus]);

  // Création de l'instance
  const createInstance = useCallback(() => {
    try {
      if (!containerRef.current) {
        setStatus('❌ Container non disponible', 'error');
        return;
      }

      // Vérifier que la bibliothèque est disponible
      if (typeof window.DungeonGenerator !== 'function') {
        setStatus('❌ DungeonGenerator non disponible', 'error');
        return;
      }

      const instance = new window.DungeonGenerator({
        container: containerRef.current,
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
      setDungeon(instance);
      setIsLoaded(true);
      
      updateHistoryState(instance);
      setStatus('✅ Prêt', 'success');
      
    } catch (error) {
      console.error('❌ Erreur de création:', error);
      setStatus(`❌ Erreur: ${error.message}`, 'error');
    }
  }, [containerRef, setStatus, updateHistoryState]);

  // Initialisation de la bibliothèque
  useEffect(() => {
    const initLibrary = () => {
      try {
        // Vérifier si la bibliothèque est disponible
        if (typeof window.DungeonGenerator !== 'function') {
          // Attendre que le script soit chargé
          checkIntervalRef.current = setInterval(() => {
            if (typeof window.DungeonGenerator === 'function') {
              clearInterval(checkIntervalRef.current);
              checkIntervalRef.current = null;
              createInstance();
            }
          }, 100);
          
          // Timeout après 5 secondes
          timeoutRef.current = setTimeout(() => {
            if (checkIntervalRef.current) {
              clearInterval(checkIntervalRef.current);
              checkIntervalRef.current = null;
              setStatus('❌ La bibliothèque DungeonGenerator n\'a pas été trouvée', 'error');
            }
          }, 5000);
          
          return;
        }

        createInstance();

      } catch (error) {
        console.error('❌ Erreur d\'initialisation:', error);
        setStatus(`❌ Erreur: ${error.message}`, 'error');
      }
    };

    // Initialiser après le chargement du DOM
    if (document.readyState === 'complete') {
      initLibrary();
    } else {
      window.addEventListener('load', initLibrary);
    }
    
    return () => {
      window.removeEventListener('load', initLibrary);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (generatorRef.current) {
        try {
          generatorRef.current.container.innerHTML = '';
        } catch (e) {
          // Ignorer les erreurs de nettoyage
        }
      }
    };
  }, [containerRef, createInstance, setStatus]);

  // Génération du donjon
  const generateDungeon = useCallback((algorithm, params) => {
    if (!generatorRef.current) {
      setStatus('❌ Générateur non initialisé', 'error');
      return Promise.reject(new Error('Générateur non initialisé'));
    }

    return new Promise((resolve) => {
      try {
        setIsLoading(true);
        setStatus(`🔄 Génération avec ${algorithm}...`, 'info');
        
        const instance = generatorRef.current;
        instance.generate(algorithm, params, false);
        
        updateHistoryState(instance);
        
        setIsLoading(false);
        setStatus(`✅ Donjon généré avec succès! (${algorithm})`, 'success');
        if (onGenerate) {
          onGenerate(instance);
        }
        resolve(instance);
      } catch (error) {
        console.error('❌ Erreur de génération:', error);
        setIsLoading(false);
        setStatus(`❌ Erreur: ${error.message}`, 'error');
        reject(error);
      }
    });
  }, [setStatus, updateHistoryState, onGenerate]);

  // Ajout d'une annotation
  const addAnnotation = useCallback((x, y, text, color = '#ffd700', fontSize = 14) => {
    if (!generatorRef.current) {
      setStatus('❌ Générateur non initialisé', 'error');
      return;
    }
    try {
      generatorRef.current.addAnnotation(x, y, text, color, fontSize);
      setStatus(`📝 Annotation ajoutée à (${x}, ${y})`, 'info');
    } catch (error) {
      console.error('❌ Erreur d\'annotation:', error);
      setStatus(`❌ Erreur d'annotation: ${error.message}`, 'error');
    }
  }, [setStatus]);

  // Annulation
  const undo = useCallback(() => {
    if (!generatorRef.current) {
      setStatus('❌ Générateur non initialisé', 'error');
      return;
    }
    try {
      const success = generatorRef.current.undo();
      if (success) {
        updateHistoryState(generatorRef.current);
        setStatus('↩️ Annulation effectuée', 'info');
      }
    } catch (error) {
      console.error('❌ Erreur d\'annulation:', error);
      setStatus(`❌ Erreur: ${error.message}`, 'error');
    }
  }, [setStatus, updateHistoryState]);

  // Rétablissement
  const redo = useCallback(() => {
    if (!generatorRef.current) {
      setStatus('❌ Générateur non initialisé', 'error');
      return;
    }
    try {
      const success = generatorRef.current.redo();
      if (success) {
        updateHistoryState(generatorRef.current);
        setStatus('↪️ Rétablissement effectué', 'info');
      }
    } catch (error) {
      console.error('❌ Erreur de rétablissement:', error);
      setStatus(`❌ Erreur: ${error.message}`, 'error');
    }
  }, [setStatus, updateHistoryState]);

  // Export SVG
  const exportSVG = useCallback(async (filename = 'donjon.svg') => {
    if (!generatorRef.current) {
      setStatus('❌ Générateur non initialisé', 'error');
      return;
    }
    
    try {
      const instance = generatorRef.current;
      
      // Exporter localement
      const success = instance.exportSVG(filename);
      
      if (success) {
        setStatus(`📄 SVG exporté: ${filename}`, 'success');
        
        if (onExport) {
          onExport({ type: 'svg', filename, data: null });
        }
        
        // Récupérer le SVG pour la sauvegarde serveur
        const svgElement = containerRef.current?.querySelector('svg');
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          await saveToServer(svgData, filename, 'svg');
        }
      } else {
        setStatus('❌ Erreur lors de l\'export SVG', 'error');
      }
      
    } catch (error) {
      console.error('❌ Erreur d\'export SVG:', error);
      setStatus(`❌ Erreur: ${error.message}`, 'error');
    }
  }, [containerRef, setStatus, onExport, saveToServer]);

  // Export PNG
  const exportPNG = useCallback(async (filename = 'donjon.png') => {
    if (!generatorRef.current) {
      setStatus('❌ Générateur non initialisé', 'error');
      return;
    }
    
    try {
      const instance = generatorRef.current;
      
      // Exporter localement
      const success = await instance.exportPNG(filename);
      
      if (success) {
        setStatus(`🖼️ PNG exporté: ${filename}`, 'success');
        
        if (onExport) {
          onExport({ type: 'png', filename, data: null });
        }
        
        // Récupérer le PNG pour la sauvegarde serveur
        const pngData = await instance.getPNGData();
        if (pngData) {
          await saveToServer(pngData, filename, 'png');
        }
      } else {
        setStatus('❌ Erreur lors de l\'export PNG', 'error');
      }
      
    } catch (error) {
      console.error('❌ Erreur d\'export PNG:', error);
      setStatus(`❌ Erreur: ${error.message}`, 'error');
    }
  }, [setStatus, onExport, saveToServer]);

  // Impression
  const printDungeon = useCallback(() => {
    if (!generatorRef.current) {
      setStatus('❌ Générateur non initialisé', 'error');
      return;
    }
    
    try {
      generatorRef.current.print();
      setStatus('🖨️ Impression en cours...', 'info');
    } catch (error) {
      console.error('❌ Erreur d\'impression:', error);
      setStatus(`❌ Erreur d'impression: ${error.message}`, 'error');
    }
  }, [setStatus]);

  // Récupération des exports depuis le serveur
  const getExports = useCallback(async () => {
    try {
      const response = await axios.get('/api/exports');
      if (response.data.success) {
        return response.data.exports;
      }
      return [];
    } catch (error) {
      console.error('❌ Erreur de récupération des exports:', error);
      setStatus(`❌ Erreur: ${error.message}`, 'error');
      return [];
    }
  }, [setStatus]);

  // Suppression d'un export
  const deleteExport = useCallback(async (filename) => {
    try {
      const response = await axios.delete(`/api/exports/${filename}`);
      if (response.data.success) {
        setStatus(`🗑️ Fichier supprimé: ${filename}`, 'info');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur de suppression:', error);
      setStatus(`❌ Erreur: ${error.message}`, 'error');
      return false;
    }
  }, [setStatus]);

  return {
    isLoaded,
    isLoading,
    dungeon,
    generator: generatorRef.current,
    generateDungeon,
    addAnnotation,
    undo,
    redo,
    exportSVG,
    exportPNG,
    printDungeon,
    getExports,
    deleteExport,
    history
  };
};

export default useDungeonGenerator;
