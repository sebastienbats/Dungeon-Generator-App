import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

// Charger la bibliothèque depuis le CDN ou local
const loadDungeonLibrary = () => {
  return new Promise((resolve, reject) => {
    if (window.DungeonGenerator) {
      resolve(window.DungeonGenerator);
      return;
    }
    
    // Charger le script depuis le CDN (à adapter selon votre hébergement)
    const script = document.createElement('script');
    script.src = '/dungeon-generator.js'; // Placez le fichier dans public/
    script.onload = () => {
      if (window.DungeonGenerator) {
        resolve(window.DungeonGenerator);
      } else {
        reject(new Error('La bibliothèque DungeonGenerator n\'a pas été trouvée'));
      }
    };
    script.onerror = () => reject(new Error('Erreur de chargement de la bibliothèque'));
    document.head.appendChild(script);
  });
};

const DungeonGenerator = ({ 
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

  // Initialisation de la bibliothèque
  useEffect(() => {
    const initLibrary = async () => {
      try {
        setIsLoading(true);
        await loadDungeonLibrary();
        
        if (!containerRef.current) {
          throw new Error('Container non disponible');
        }

        // Créer l'instance du générateur
        const DungeonGen = window.DungeonGenerator;
        const instance = new DungeonGen({
          container: containerRef.current,
          tileSize: 32,
          width: 50,
          height: 40
        });
        
        generatorRef.current = instance;
        setDungeon(instance);
        setIsLoaded(true);
        setIsLoading(false);
        
        // Mettre à jour l'état de l'historique
        updateHistoryState(instance);
        
        onStatus?.('Prêt', 'info');
      } catch (error) {
        console.error('Erreur d\'initialisation:', error);
        setIsLoading(false);
        onStatus?.(`Erreur: ${error.message}`, 'error');
      }
    };

    initLibrary();
    
    return () => {
      // Nettoyage
      if (generatorRef.current) {
        try {
          generatorRef.current.container.innerHTML = '';
        } catch (e) {}
      }
    };
  }, []);

  const updateHistoryState = (instance) => {
    if (instance) {
      setHistory({
        canUndo: instance.undo && typeof instance.undo === 'function',
        canRedo: instance.redo && typeof instance.redo === 'function'
      });
    }
  };

  const generateDungeon = async (algorithm, params) => {
    if (!generatorRef.current) {
      onStatus?.('Générateur non initialisé', 'error');
      return;
    }

    try {
      setIsLoading(true);
      onStatus?.(`Génération avec ${algorithm}...`, 'info');
      
      const instance = generatorRef.current;
      
      // Générer le donjon
      instance.generate(algorithm, params, false);
      
      // Mettre à jour l'historique
      updateHistoryState(instance);
      
      // Forcer le rendu
      instance.render();
      
      setIsLoading(false);
      onStatus?.(`Donjon généré avec succès! (${algorithm})`, 'success');
      onGenerate?.(instance);
    } catch (error) {
      console.error('Erreur de génération:', error);
      setIsLoading(false);
      onStatus?.(`Erreur: ${error.message}`, 'error');
    }
  };

  const addAnnotation = (x, y, text, color = '#ffd700', fontSize = 14) => {
    if (!generatorRef.current) return;
    try {
      generatorRef.current.addAnnotation(x, y, text, color, fontSize);
      generatorRef.current.render();
      onStatus?.(`Annotation ajoutée à (${x}, ${y})`, 'info');
    } catch (error) {
      onStatus?.(`Erreur d'annotation: ${error.message}`, 'error');
    }
  };

  const undo = () => {
    if (!generatorRef.current) return;
    try {
      generatorRef.current.undo();
      generatorRef.current.render();
      updateHistoryState(generatorRef.current);
      onStatus?.('Annulation effectuée', 'info');
    } catch (error) {
      onStatus?.(`Erreur: ${error.message}`, 'error');
    }
  };

  const redo = () => {
    if (!generatorRef.current) return;
    try {
      generatorRef.current.redo();
      generatorRef.current.render();
      updateHistoryState(generatorRef.current);
      onStatus?.('Rétablissement effectué', 'info');
    } catch (error) {
      onStatus?.(`Erreur: ${error.message}`, 'error');
    }
  };

  const exportSVG = async (filename = 'donjon.svg') => {
    if (!generatorRef.current) {
      onStatus?.('Générateur non initialisé', 'error');
      return;
    }
    
    try {
      const instance = generatorRef.current;
      
      // Méthode 1: Utiliser l'export natif
      if (instance.exportSVG) {
        instance.exportSVG(filename);
        onStatus?.(`SVG exporté: ${filename}`, 'success');
        onExport?.({ type: 'svg', filename, data: null });
        return;
      }
      
      // Méthode 2: Récupérer le SVG depuis le DOM
      const svgElement = containerRef.current?.querySelector('svg');
      if (!svgElement) {
        throw new Error('Aucun SVG trouvé');
      }
      
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      
      // Télécharger
      const link = document.createElement('a');
      link.href = URL.createObjectURL(svgBlob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      onStatus?.(`SVG exporté: ${filename}`, 'success');
      onExport?.({ type: 'svg', filename, data: svgData });
      
      // Sauvegarder sur le serveur
      await saveToServer(svgData, filename, 'svg');
      
    } catch (error) {
      console.error('Erreur d\'export SVG:', error);
      onStatus?.(`Erreur: ${error.message}`, 'error');
    }
  };

  const exportPNG = async (filename = 'donjon.png') => {
    if (!generatorRef.current) {
      onStatus?.('Générateur non initialisé', 'error');
      return;
    }
    
    try {
      const instance = generatorRef.current;
      
      // Méthode 1: Utiliser l'export natif
      if (instance.exportPNG) {
        instance.exportPNG(filename);
        onStatus?.(`PNG exporté: ${filename}`, 'success');
        onExport?.({ type: 'png', filename, data: null });
        return;
      }
      
      // Méthode 2: Convertir SVG en PNG via canvas
      const svgElement = containerRef.current?.querySelector('svg');
      if (!svgElement) {
        throw new Error('Aucun SVG trouvé');
      }
      
      // Obtenir les dimensions
      const rect = svgElement.getBoundingClientRect();
      const width = rect.width || svgElement.viewBox?.baseVal?.width || 800;
      const height = rect.height || svgElement.viewBox?.baseVal?.height || 600;
      
      // Créer un canvas
      const canvas = document.createElement('canvas');
      canvas.width = width * 2; // 2x pour la qualité
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      
      // Dessiner le SVG sur le canvas
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        
        // Exporter en PNG
        const pngData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngData;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        onStatus?.(`PNG exporté: ${filename}`, 'success');
        onExport?.({ type: 'png', filename, data: pngData });
        
        // Sauvegarder sur le serveur
        saveToServer(pngData, filename, 'png');
      };
      img.onerror = () => {
        throw new Error('Erreur lors du chargement du SVG');
      };
      img.src = url;
      
    } catch (error) {
      console.error('Erreur d\'export PNG:', error);
      onStatus?.(`Erreur: ${error.message}`, 'error');
    }
  };

  const saveToServer = async (data, filename, type) => {
    try {
      const endpoint = type === 'svg' ? '/api/save-svg' : '/api/save-png';
      const payload = type === 'svg' 
        ? { svg: data, filename } 
        : { image: data, filename };
      
      const response = await axios.post(endpoint, payload);
      
      if (response.data.success) {
        console.log(`📁 Fichier sauvegardé sur le serveur: ${response.data.url}`);
        onStatus?.(`📁 Sauvegardé: ${response.data.filename}`, 'info');
      }
    } catch (error) {
      console.error('Erreur de sauvegarde sur le serveur:', error);
      // Ne pas bloquer l'export local
    }
  };

  const printDungeon = () => {
    if (!generatorRef.current) {
      onStatus?.('Générateur non initialisé', 'error');
      return;
    }
    
    try {
      if (generatorRef.current.print) {
        generatorRef.current.print();
        onStatus?.('Impression en cours...', 'info');
      } else {
        // Fallback: imprimer la fenêtre
        window.print();
      }
    } catch (error) {
      onStatus?.(`Erreur d'impression: ${error.message}`, 'error');
    }
  };

  const addCustomTile = (id, color, label, icon) => {
    if (!generatorRef.current) {
      onStatus?.('Générateur non initialisé', 'error');
      return;
    }
    
    // Les tuiles personnalisées sont passées au constructeur
    // On peut les ajouter dynamiquement via le registre interne
    try {
      const instance = generatorRef.current;
      if (instance.tileRegistry) {
        instance.tileRegistry[id] = { color, label, icon };
        onStatus?.(`Tuile "${id}" ajoutée`, 'success');
      } else {
        throw new Error('Registre de tuiles non disponible');
      }
    } catch (error) {
      onStatus?.(`Erreur: ${error.message}`, 'error');
    }
  };

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
    addCustomTile,
    history
  };
};

export default DungeonGenerator;
