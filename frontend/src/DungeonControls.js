import React, { useState, useEffect } from 'react';
import './DungeonControls.css';

const ALGORITHMS = {
  'rooms': {
    label: '🏠 Salles + couloirs en L',
    params: {
      numRooms: { label: 'Nombre de salles', min: 3, max: 30, default: 12 },
      minRoomSize: { label: 'Taille min salle', min: 2, max: 8, default: 3 },
      maxRoomSize: { label: 'Taille max salle', min: 4, max: 15, default: 7 }
    }
  },
  'bsp': {
    label: '🌳 BSP',
    params: {
      minRoomSize: { label: 'Taille min salle', min: 2, max: 6, default: 3 },
      maxRoomSize: { label: 'Taille max salle', min: 4, max: 12, default: 6 },
      maxDepth: { label: 'Profondeur max', min: 2, max: 8, default: 4 }
    }
  },
  'sinuous': {
    label: '🌀 Couloirs sinueux',
    params: {
      steps: { label: 'Pas', min: 100, max: 2000, default: 500 },
      turnProbability: { label: 'Probabilité de tourner', min: 0.1, max: 0.9, step: 0.05, default: 0.3 },
      roomProbability: { label: 'Probabilité de salle', min: 0.01, max: 0.2, step: 0.01, default: 0.05 },
      minRoomSize: { label: 'Taille min salle', min: 2, max: 6, default: 3 },
      maxRoomSize: { label: 'Taille max salle', min: 4, max: 10, default: 5 }
    }
  },
  'cellular': {
    label: '🕳️ Automates cellulaires',
    params: {
      density: { label: 'Densité initiale', min: 0.3, max: 0.7, step: 0.05, default: 0.45 },
      iterations: { label: 'Itérations', min: 3, max: 10, default: 5 },
      birthLimit: { label: 'Seuil naissance', min: 2, max: 5, default: 4 },
      deathLimit: { label: 'Seuil mort', min: 2, max: 5, default: 3 }
    }
  },
  'drunkard': {
    label: '🚶 Drunkard\'s Walk',
    params: {
      steps: { label: 'Pas par marcheur', min: 50, max: 500, default: 200 },
      walkers: { label: 'Nombre de marcheurs', min: 1, max: 20, default: 5 },
      roomChance: { label: 'Chance de salle', min: 0.01, max: 0.1, step: 0.01, default: 0.04 },
      directionChange: { label: 'Changement direction', min: 0.1, max: 0.9, step: 0.05, default: 0.5 }
    }
  },
  'dla': {
    label: '🌿 DLA Central Attractor',
    params: {
      particles: { label: 'Particules', min: 50, max: 500, default: 150 },
      radius: { label: 'Rayon attracteur', min: 1, max: 5, default: 2 },
      spawnRadius: { label: 'Rayon d\'apparition', min: 5, max: 20, default: 12 }
    }
  },
  'dla-symmetry': {
    label: '🔄 DLA Symétrie',
    params: {
      particles: { label: 'Particules', min: 50, max: 500, default: 150 },
      radius: { label: 'Rayon attracteur', min: 1, max: 5, default: 2 },
      spawnRadius: { label: 'Rayon d\'apparition', min: 5, max: 20, default: 12 },
      symmetry: { label: 'Symétrie', options: ['x', 'y', 'both'], default: 'both' }
    }
  }
};

const DungeonControls = ({ 
  onGenerate, 
  onExportSVG, 
  onExportPNG, 
  onPrint,
  onUndo,
  onRedo,
  onAddAnnotation,
  isLoading,
  history
}) => {
  const [selectedAlgo, setSelectedAlgo] = useState('rooms');
  const [params, setParams] = useState({});
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [annotation, setAnnotation] = useState({ x: 10, y: 10, text: 'Entrée', color: '#ffd700' });

  // Initialiser les paramètres par défaut
  useEffect(() => {
    if (ALGORITHMS[selectedAlgo]) {
      const defaultParams = {};
      Object.entries(ALGORITHMS[selectedAlgo].params).forEach(([key, config]) => {
        defaultParams[key] = config.default;
      });
      setParams(defaultParams);
    }
  }, [selectedAlgo]);

  const handleAlgoChange = (e) => {
    setSelectedAlgo(e.target.value);
  };

  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = () => {
    onGenerate(selectedAlgo, params);
  };

  const handleAnnotationAdd = () => {
    onAddAnnotation(annotation.x, annotation.y, annotation.text, annotation.color);
    setShowAnnotation(false);
  };

  const renderParamInput = (key, config) => {
    const value = params[key] !== undefined ? params[key] : config.default;

    if (config.options) {
      return (
        <select 
          value={value} 
          onChange={(e) => handleParamChange(key, e.target.value)}
          className="param-select"
        >
          {config.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    return (
      <div className="param-input-group">
        <input
          type="range"
          min={config.min}
          max={config.max}
          step={config.step || 1}
          value={value}
          onChange={(e) => handleParamChange(key, parseFloat(e.target.value))}
          className="param-slider"
        />
        <span className="param-value">{value}</span>
      </div>
    );
  };

  return (
    <div className="dungeon-controls">
      <div className="controls-row">
        <div className="control-group">
          <label>Algorithme</label>
          <select 
            value={selectedAlgo} 
            onChange={handleAlgoChange}
            className="algo-select"
          >
            {Object.entries(ALGORITHMS).map(([key, algo]) => (
              <option key={key} value={key}>{algo.label}</option>
            ))}
          </select>
        </div>

        <div className="control-group params-group">
          <label>Paramètres</label>
          <div className="params-grid">
            {Object.entries(ALGORITHMS[selectedAlgo]?.params || {}).map(([key, config]) => (
              <div key={key} className="param-item">
                <span className="param-label">{config.label}</span>
                {renderParamInput(key, config)}
              </div>
            ))}
          </div>
        </div>

        <div className="control-group actions-group">
          <button 
            onClick={handleGenerate} 
            disabled={isLoading}
            className="btn btn-generate"
          >
            {isLoading ? '⏳ Génération...' : '🎲 Générer'}
          </button>
        </div>
      </div>

      <div className="controls-row controls-row-actions">
        <div className="control-group">
          <button 
            onClick={() => setShowAnnotation(!showAnnotation)}
            className="btn btn-annotation"
          >
            📝 Annotation
          </button>
          
          {showAnnotation && (
            <div className="annotation-panel">
              <input
                type="number"
                value={annotation.x}
                onChange={(e) => setAnnotation({ ...annotation, x: parseInt(e.target.value) || 0 })}
                placeholder="X"
                className="annotation-input"
              />
              <input
                type="number"
                value={annotation.y}
                onChange={(e) => setAnnotation({ ...annotation, y: parseInt(e.target.value) || 0 })}
                placeholder="Y"
                className="annotation-input"
              />
              <input
                type="text"
                value={annotation.text}
                onChange={(e) => setAnnotation({ ...annotation, text: e.target.value })}
                placeholder="Texte"
                className="annotation-input"
              />
              <input
                type="color"
                value={annotation.color}
                onChange={(e) => setAnnotation({ ...annotation, color: e.target.value })}
                className="annotation-color"
              />
              <button onClick={handleAnnotationAdd} className="btn btn-small btn-add">
                Ajouter
              </button>
            </div>
          )}
        </div>

        <div className="control-group">
          <button 
            onClick={onUndo} 
            disabled={!history?.canUndo}
            className="btn btn-history"
          >
            ↩️ Annuler
          </button>
          <button 
            onClick={onRedo} 
            disabled={!history?.canRedo}
            className="btn btn-history"
          >
            ↪️ Rétablir
          </button>
        </div>

        <div className="control-group export-group">
          <button onClick={onExportSVG} className="btn btn-export-svg">
            📄 SVG
          </button>
          <button onClick={onExportPNG} className="btn btn-export-png">
            🖼️ PNG
          </button>
          <button onClick={onPrint} className="btn btn-export-print">
            🖨️ Imprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DungeonControls;
