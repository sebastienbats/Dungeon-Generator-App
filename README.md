# 🏰 Dungeon Generator App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)

> Une application web complète pour la génération procédurale de donjons avec interface React et backend Node.js

## 📖 Table des matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Technologies utilisées](#-technologies-utilisées)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Structure du projet](#-structure-du-projet)
- [API Backend](#-api-backend)
- [Composants React](#-composants-react)
- [Algorithmes de génération](#-algorithmes-de-génération)
- [Personnalisation](#-personnalisation)
- [Captures d'écran](#-captures-décran)
- [Contribution](#-contribution)
- [Licence](#-licence)

---

## 🎯 Aperçu

**Dungeon Generator App** est une application web complète permettant de générer procéduralement des donjons en utilisant la bibliothèque [`procedural-dungeon-generator-library`](https://github.com/sebastienbats/procedural-dungeon-generator-library). L'application offre une interface utilisateur moderne, responsive et intuitive avec un backend Node.js pour la sauvegarde des exports.

---

## 🚀 Fonctionnalités

### 🎮 Gestion des donjons
- **7 algorithmes de génération** intégrés (salles, BSP, couloirs sinueux, automates cellulaires, Drunkard's Walk, DLA, DLA symétrie)
- **Paramètres ajustables** pour chaque algorithme avec sliders interactifs
- **Génération en temps réel** avec feedback visuel et indicateur de chargement
- **Système d'annotations** pour marquer des points d'intérêt (entrée, trésor, etc.)
- **Historique complet** avec annulation/rétablissement (undo/redo)
- **Tuiles personnalisables** avec couleurs et icônes emojis

### 📤 Export et partage
- **Export SVG** - Format vectoriel haute qualité pour une édition ultérieure
- **Export PNG** - Format image avec support de la transparence
- **Impression** - Optimisée pour l'impression papier avec mise en page adaptée
- **Sauvegarde sur serveur** - Export automatique des fichiers sur le backend
- **Téléchargement local** - Sauvegarde directe sur l'ordinateur de l'utilisateur
- **Gestion des exports** - Visualisation et suppression des fichiers sauvegardés

### 🎨 Interface utilisateur
- **Design responsive** - S'adapte parfaitement à tous les écrans (mobile, tablette, desktop)
- **Thème sombre** moderne et confortable pour une utilisation prolongée
- **Contrôles intuitifs** avec sliders, sélecteurs et boutons organisés
- **Feedback visuel** avec messages de statut (succès, erreur, information)
- **Indicateur de chargement** pour les opérations longues (génération, export)

### 🔧 Personnalisation avancée
- **Calques superposés** - Sol, murs, objets, annotations, couloirs
- **Règles Graph Grammar** - Créez vos propres règles de génération
- **Salles et couloirs personnalisés** - Types et styles modifiables
- **Symétries** - Axiale et rotationnelle

---

## 🏗 Architecture

### Diagramme d'architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌────────────────┐    ┌────────────────┐ │
│  │    App.js    │───▶│DungeonControls │───▶│  DungeonGenerator│ │
│  │  (Principal) │    │   (Contrôles)  │    │   (Générateur)  │ │
│  └──────────────┘    └────────────────┘    └────────────────┘ │
│         │                                       │              │
│         ▼                                       ▼              │
│  ┌──────────────┐                      ┌──────────────────┐   │
│  │  Status Bar  │                      │  Bibliothèque    │   │
│  │  (Messages)  │                      │  DungeonGenerator│   │
│  └──────────────┘                      │  (externe)       │   │
│                                        └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP (Axios)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND (Node.js)                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌────────────────┐    ┌────────────────┐ │
│  │  server.js   │───▶│  API Routes    │───▶│  File System  │ │
│  │  (Express)   │    │  (Endpoints)   │    │  (Storage)    │ │
│  └──────────────┘    └────────────────┘    └────────────────┘ │
│                                                   │             │
│                                                   ▼             │
│                                           ┌──────────────────┐ │
│                                           │  exports/        │ │
│                                           │  .svg / .png    │ │
│                                           └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Flux de données

1. **Génération**: L'utilisateur sélectionne un algorithme et ajuste ses paramètres
2. **Traitement**: Le générateur React utilise la bibliothèque DungeonGenerator
3. **Rendu**: Le SVG est généré et rendu dans le conteneur DOM
4. **Visualisation**: L'utilisateur peut voir le donjon en temps réel
5. **Export**: Les données sont exportées en SVG ou PNG
6. **Sauvegarde**: Le backend sauvegarde les fichiers sur le serveur

---

## 💻 Technologies utilisées

### Frontend
| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| [React](https://reactjs.org/) | 18.x | Framework UI avec hooks personnalisés |
| [Axios](https://axios-http.com/) | 1.x | Client HTTP pour les appels API |
| [CSS3](https://developer.mozilla.org/fr/docs/Web/CSS) | - | Styles responsive avec Flexbox/Grid |
| [ES6 Modules](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Modules) | - | Modularisation du code |

### Backend
| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| [Node.js](https://nodejs.org/) | 18.x | Runtime JavaScript côté serveur |
| [Express](https://expressjs.com/) | 4.x | Framework web pour les routes API |
| [Multer](https://github.com/expressjs/multer) | 1.x | Gestion des fichiers uploadés |
| [CORS](https://github.com/expressjs/cors) | 2.x | Cross-Origin Resource Sharing |

### Bibliothèques externes
| Bibliothèque | Description |
|--------------|-------------|
| [procedural-dungeon-generator-library](https://github.com/sebastienbats/procedural-dungeon-generator-library) | Moteur de génération de donjons sans dépendances |

---

## 📦 Installation

### Prérequis
- Node.js 18 ou supérieur
- npm 9 ou supérieur
- Git (optionnel pour le clonage)

### Cloner le projet

```bash
git clone https://github.com/sebastienbats/dungeon-generator-app.git
cd dungeon-generator-app
```

### Installer les dépendances

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### Télécharger la bibliothèque de génération

```bash
cd frontend/public
curl -O https://raw.githubusercontent.com/sebastienbats/procedural-dungeon-generator-library/main/dungeon-generator.js
```

### Configurer l'environnement

Créez un fichier `.env` dans le dossier `backend`:

```env
PORT=5000
NODE_ENV=development
MAX_FILE_SIZE=10000000
EXPORT_DIR=./exports
CORS_ORIGIN=http://localhost:3000
```

---

## 🎮 Utilisation

### Démarrer l'application

#### Backend (port 5000)
```bash
cd backend
npm run dev  # Mode développement avec hot-reload
# ou
npm start    # Mode production
```

#### Frontend (port 3000)
```bash
cd frontend
npm start
```

L'application sera accessible sur `http://localhost:3000`.

### Guide d'utilisation

1. **Choisir un algorithme** dans le menu déroulant
2. **Ajuster les paramètres** à l'aide des sliders interactifs
3. **Cliquer sur "Générer"** pour créer un donjon
4. **Ajouter des annotations** en cliquant sur le bouton dédié
5. **Exporter** le donjon en SVG ou PNG
6. **Imprimer** ou **sauvegarder** sur le serveur

### Exemple de workflow

```javascript
// 1. Génération d'un donjon avec l'algorithme "rooms"
const params = {
  numRooms: 12,
  minRoomSize: 3,
  maxRoomSize: 7
}
generateDungeon('rooms', params)

// 2. Ajout d'une annotation
addAnnotation(5, 5, '🏰 Entrée', '#ffd700', 16)

// 3. Ajout d'une autre annotation
addAnnotation(15, 20, '💎 Trésor', '#f1c40f', 14)

// 4. Export en SVG
exportSVG('mon-donjon')

// 5. Export en PNG
exportPNG('mon-donjon')
```

---

## 📁 Structure du projet

```
dungeon-generator-app/
├── backend/                          # Backend Node.js
│   ├── exports/                      # Fichiers exportés (SVG, PNG)
│   ├── server.js                     # Serveur Express principal
│   ├── package.json                  # Dépendances backend
│   └── .env                          # Variables d'environnement
│
├── frontend/                         # Frontend React
│   ├── public/
│   │   ├── index.html               # Page HTML principale
│   │   └── dungeon-generator.js     # Bibliothèque de génération
│   ├── src/
│   │   ├── App.js                   # Composant principal
│   │   ├── App.css                  # Styles globaux
│   │   ├── DungeonGenerator.js      # Hook personnalisé
│   │   ├── DungeonControls.js       # Composant des contrôles
│   │   ├── DungeonControls.css      # Styles des contrôles
│   │   └── index.js                 # Point d'entrée React
│   └── package.json                  # Dépendances frontend
│
├── .gitignore                         # Fichiers ignorés par Git
├── README.md                          # Documentation complète
└── LICENSE                            # Licence MIT
```

### Description des fichiers

| Fichier | Description |
|---------|-------------|
| `App.js` | Composant racine qui orchestre l'application et gère l'état global |
| `App.css` | Styles globaux, mise en page responsive, thème sombre |
| `DungeonGenerator.js` | Hook personnalisé qui encapsule la logique de génération |
| `DungeonControls.js` | Interface utilisateur des contrôles (algorithmes, paramètres, actions) |
| `DungeonControls.css` | Styles des contrôles, responsive, animations |
| `server.js` | Serveur Express avec routes API pour la sauvegarde |
| `dungeon-generator.js` | Bibliothèque externe de génération de donjons |

---

## 🔌 API Backend

### Endpoints disponibles

#### `POST /api/save-svg`
Sauvegarde un fichier SVG sur le serveur.

**Corps de la requête:**
```json
{
  "svg": "<svg xmlns='http://www.w3.org/2000/svg'>...</svg>",
  "filename": "mon-donjon.svg"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "SVG sauvegardé avec succès",
  "url": "/exports/mon-donjon.svg",
  "filename": "mon-donjon.svg"
}
```

**Réponse (400):**
```json
{
  "error": "Données SVG manquantes"
}
```

#### `POST /api/save-png`
Sauvegarde un fichier PNG sur le serveur (données base64).

**Corps de la requête:**
```json
{
  "image": "data:image/png;base64,iVBORw0KGgo...",
  "filename": "mon-donjon.png"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "PNG sauvegardé avec succès",
  "url": "/exports/mon-donjon.png",
  "filename": "mon-donjon.png"
}
```

#### `GET /api/exports`
Liste tous les fichiers exportés présents sur le serveur.

**Réponse (200):**
```json
[
  {
    "name": "donjon-1704067200000.svg",
    "url": "/exports/donjon-1704067200000.svg",
    "size": 45678,
    "created": "2024-01-01T12:00:00.000Z"
  },
  {
    "name": "donjon-1704067260000.png",
    "url": "/exports/donjon-1704067260000.png",
    "size": 98765,
    "created": "2024-01-01T12:01:00.000Z"
  }
]
```

#### `DELETE /api/exports/:filename`
Supprime un fichier exporté du serveur.

**Réponse (200):**
```json
{
  "success": true,
  "message": "Fichier supprimé"
}
```

**Réponse (404):**
```json
{
  "error": "Fichier non trouvé"
}
```

---

## 🎨 Composants React

### `App` - Composant principal

**Rôle:** Orchestre l'ensemble de l'application et gère l'état global.

**État:**
| Propriété | Type | Description |
|-----------|------|-------------|
| `status` | `{message, type}` | Message de statut avec type (info, success, error) |
| `isLoading` | `boolean` | État de chargement des opérations |
| `history` | `{canUndo, canRedo}` | État de l'historique (annulation/rétablissement) |

**Hooks:**
- `useDungeonGenerator()`: Hook personnalisé pour la logique de génération

### `DungeonControls` - Contrôles UI

**Rôle:** Interface utilisateur pour tous les contrôles et actions.

**Props:**
| Propriété | Type | Description |
|-----------|------|-------------|
| `onGenerate` | `(algo, params) => void` | Fonction de génération |
| `onExportSVG` | `() => void` | Export en SVG |
| `onExportPNG` | `() => void` | Export en PNG |
| `onPrint` | `() => void` | Impression |
| `onUndo` | `() => void` | Annulation |
| `onRedo` | `() => void` | Rétablissement |
| `onAddAnnotation` | `(x, y, text, color) => void` | Ajout d'annotation |
| `isLoading` | `boolean` | État de chargement |
| `history` | `{canUndo, canRedo}` | État de l'historique |

### `useDungeonGenerator` - Hook personnalisé

**Rôle:** Encapsule toute la logique de génération et d'export.

**Paramètres:**
| Propriété | Type | Description |
|-----------|------|-------------|
| `containerRef` | `React.RefObject` | Référence au conteneur DOM |
| `onGenerate` | `() => void` | Callback après génération |
| `onExport` | `(data) => void` | Callback après export |
| `onStatus` | `(msg, type) => void` | Callback de statut |

**Retourne:**
| Propriété | Type | Description |
|-----------|------|-------------|
| `isLoaded` | `boolean` | Bibliothèque chargée |
| `isLoading` | `boolean` | Opération en cours |
| `generateDungeon` | `(algo, params) => Promise` | Génère un donjon |
| `exportSVG` | `(filename) => Promise` | Export en SVG |
| `exportPNG` | `(filename) => Promise` | Export en PNG |
| `printDungeon` | `() => void` | Impression |
| `undo` | `() => void` | Annuler |
| `redo` | `() => void` | Rétablir |
| `addAnnotation` | `(x, y, text, color, size) => void` | Ajouter une annotation |
| `addCustomTile` | `(id, color, label, icon) => void` | Ajouter une tuile |

---

## 🧮 Algorithmes de génération

### 1. 🏠 Salles + couloirs en L (`rooms`)

Salles rectangulaires classiques reliées par des couloirs en L.

**Paramètres:**
| Nom | Plage | Défaut | Description |
|-----|-------|--------|-------------|
| `numRooms` | 3-30 | 12 | Nombre de salles à générer |
| `minRoomSize` | 2-8 | 3 | Taille minimale d'une salle |
| `maxRoomSize` | 4-15 | 7 | Taille maximale d'une salle |

### 2. 🌳 BSP (`bsp`)

Partitionnement binaire de l'espace pour des agencements hiérarchiques.

**Paramètres:**
| Nom | Plage | Défaut | Description |
|-----|-------|--------|-------------|
| `minRoomSize` | 2-6 | 3 | Taille minimale d'une salle |
| `maxRoomSize` | 4-12 | 6 | Taille maximale d'une salle |
| `maxDepth` | 2-8 | 4 | Profondeur maximale du partitionnement |

### 3. 🌀 Couloirs sinueux (`sinuous`)

Chemins aléatoires sinueux avec salles occasionnelles.

**Paramètres:**
| Nom | Plage | Défaut | Description |
|-----|-------|--------|-------------|
| `steps` | 100-2000 | 500 | Nombre de pas du chemin |
| `turnProbability` | 0.1-0.9 | 0.3 | Probabilité de tourner |
| `roomProbability` | 0.01-0.2 | 0.05 | Probabilité de créer une salle |
| `minRoomSize` | 2-6 | 3 | Taille minimale d'une salle |
| `maxRoomSize` | 4-10 | 5 | Taille maximale d'une salle |

### 4. 🕳️ Automates cellulaires (`cellular`)

Structures organiques de type caverne (règle B4/S3).

**Paramètres:**
| Nom | Plage | Défaut | Description |
|-----|-------|--------|-------------|
| `density` | 0.3-0.7 | 0.45 | Densité initiale des cellules |
| `iterations` | 3-10 | 5 | Nombre d'itérations de l'automate |
| `birthLimit` | 2-5 | 4 | Seuil de naissance |
| `deathLimit` | 2-5 | 3 | Seuil de mort |

### 5. 🚶 Drunkard's Walk (`drunkard`)

Marches aléatoires multiples qui creusent des tunnels.

**Paramètres:**
| Nom | Plage | Défaut | Description |
|-----|-------|--------|-------------|
| `steps` | 50-500 | 200 | Pas par marcheur |
| `walkers` | 1-20 | 5 | Nombre de marcheurs |
| `roomChance` | 0.01-0.1 | 0.04 | Chance de créer une salle |
| `directionChange` | 0.1-0.9 | 0.5 | Probabilité de changer de direction |

### 6. 🌿 DLA Central Attractor (`dla`)

Agrégation limitée par diffusion - structures dendritiques.

**Paramètres:**
| Nom | Plage | Défaut | Description |
|-----|-------|--------|-------------|
| `particles` | 50-500 | 150 | Nombre de particules |
| `radius` | 1-5 | 2 | Rayon de l'attracteur |
| `spawnRadius` | 5-20 | 12 | Rayon d'apparition |

### 7. 🔄 DLA Symmetry (`dla-symmetry`)

DLA avec symétrie axiale (x, y ou les deux).

**Paramètres:**
| Nom | Plage | Défaut | Description |
|-----|-------|--------|-------------|
| `particles` | 50-500 | 150 | Nombre de particules |
| `radius` | 1-5 | 2 | Rayon de l'attracteur |
| `spawnRadius` | 5-20 | 12 | Rayon d'apparition |
| `symmetry` | `'x'`, `'y'`, `'both'` | `'both'` | Axe de symétrie |

---

## 🎨 Personnalisation

### Ajouter des tuiles personnalisées

```javascript
const customTiles = [
  { id: 'tresor', color: '#f1c40f', label: 'Trésor', icon: '💰' },
  { id: 'piege', color: '#e74c3c', label: 'Piège', icon: '⚔️' },
  { id: 'portail', color: '#8e44ad', label: 'Portail', icon: '🌀' },
  { id: 'autel', color: '#9b59b6', label: 'Autel', icon: '🕯️' },
  { id: 'bibliotheque', color: '#3498db', label: 'Bibliothèque', icon: '📚' }
];

// Dans le constructeur
const instance = new DungeonGenerator({
  container: containerRef.current,
  tileSize: 32,
  width: 50,
  height: 40,
  customTileTypes: customTiles  // <-- Ajout des tuiles personnalisées
});
```

### Ajouter des calques

```javascript
// Ajouter un calque 'mobilier'
dungeon.addLayer('mobilier', true);

// Ajouter des tuiles au calque
dungeon.addTile('mobilier', 'tresor', 10, 10);
dungeon.addTile('mobilier', 'piege', 15, 20);
dungeon.addTile('mobilier', 'bibliotheque', 25, 15);

// Ajouter un calque 'ennemis'
dungeon.addLayer('ennemis', true);
dungeon.addTile('ennemis', 'monstre', 8, 12);
```

### Règles Graph Grammar personnalisées

```javascript
// Définir des règles personnalisées
const mesRegles = [
  // Règle 1: Ajouter une salle avec une porte
  (ctx) => {
    const pos = ctx.findFreeDirection(ctx.node);
    if (pos) {
      const newNode = ctx.createNode(pos.x, pos.y, 'salle');
      ctx.addCorridor(ctx.node, newNode, 'door', { hasDoor: true });
    }
  },
  
  // Règle 2: Ajouter une symétrie
  (ctx) => {
    ctx.addSymmetrical(ctx.node, 'x');
  },
  
  // Règle 3: Ajouter un trésor
  (ctx) => {
    const pos = ctx.findFreeDirection(ctx.node);
    if (pos) {
      const newNode = ctx.createNode(pos.x, pos.y, 'tresor');
      ctx.addCorridor(ctx.node, newNode, 'standard');
    }
  },
  
  // Règle 4: Couloir large avec portes
  (ctx) => {
    const pos = ctx.findFreeDirection(ctx.node);
    if (pos) {
      ctx.addCorridor(ctx.node, {
        x: pos.x,
        y: pos.y
      }, 'large', { hasDoors: true });
    }
  }
];

// Utiliser les règles
dungeon.generate('graph-grammar', {
  iterations: 10,
  rules: mesRegles,
  spacing: 4,
  startType: 'entree'
});
```

### Modifier l'apparence

```javascript
// Personnaliser la taille des tuiles
const dungeon = new DungeonGenerator({
  container: document.getElementById('map'),
  tileSize: 40,        // Taille en pixels (défaut: 40)
  width: 60,           // Largeur en tuiles (défaut: 50)
  height: 40           // Hauteur en tuiles (défaut: 50)
});

// Ajouter une barre d'échelle
dungeon.setScale(true, 'm', 20);  // Visible, unité mètres, 20px par mètre

// Exporter avec un nom personnalisé
dungeon.exportSVG('chateau-fort.svg');
```

---

## 📸 Captures d'écran

### Interface principale
![Interface principale](https://via.placeholder.com/800x500/1a1a2e/f7971e?text=Interface+Principale)

### Contrôles d'algorithmes
![Contrôles](https://via.placeholder.com/800x400/1a1a2e/6c5ce7?text=Contrôles+et+Paramètres)

### Exemple de génération
![Exemple donjon](https://via.placeholder.com/800x500/1a1a2e/00b894?text=Exemple+de+Génération)

### Export et sauvegarde
![Export](https://via.placeholder.com/800x400/1a1a2e/fdcb6e?text=Export+et+Sauvegarde)

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment participer :

### Processus de contribution

1. **Fork** le projet sur GitHub
2. **Créez votre branche** (`git checkout -b feature/AmazingFeature`)
3. **Commitez vos changements** (`git commit -m 'Add some AmazingFeature'`)
4. **Push vers la branche** (`git push origin feature/AmazingFeature`)
5. **Ouvrez une Pull Request**

### Règles de contribution

- ✅ Suivez le style de code existant
- ✅ Ajoutez des commentaires pour le code complexe
- ✅ Mettez à jour la documentation (README.md)
- ✅ Testez vos modifications avant de soumettre
- ✅ Utilisez des messages de commit clairs et descriptifs

### Guide de style

**JavaScript:**
- Utilisez ES6+ (const, let, arrow functions, destructuring)
- Nommez les variables et fonctions en camelCase
- Utilisez des noms descriptifs et explicites

**CSS:**
- Utilisez des classes avec la convention BEM
- Maintenez la cohérence avec le thème sombre existant
- Assurez-vous que le design reste responsive

**React:**
- Utilisez des hooks fonctionnels (pas de classes)
- Décomposez les composants en unités réutilisables
- Gérez les effets secondaires avec useEffect

---

## 📝 Licence

Distribué sous licence MIT. Voir `LICENSE` pour plus d'informations.

```
MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Remerciements

- **[Sébastien Bats](https://github.com/sebastienbats)** pour la bibliothèque de génération de donjons
- **Tous les contributeurs** de la bibliothèque originale
- **La communauté open-source** pour les outils et bibliothèques utilisés

---

## 📞 Contact

- **Auteur**: [Votre Nom]
- **GitHub**: [@votre-username](https://github.com/votre-username)
- **Email**: votre.email@exemple.com

---

## 🔗 Liens utiles

- [Bibliothèque de génération de donjons](https://github.com/sebastienbats/procedural-dungeon-generator-library)
- [Documentation React](https://reactjs.org/docs/getting-started.html)
- [Documentation Node.js](https://nodejs.org/en/docs/)
- [Documentation Express](https://expressjs.com/fr/)
- [Documentation Axios](https://axios-http.com/docs/intro)

---

## 📊 Statut du projet

![Status](https://img.shields.io/badge/Status-Actif-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Tests](https://img.shields.io/badge/Tests-En%20cours-yellow)
![Documentation](https://img.shields.io/badge/Documentation-Complete-brightgreen)

---

<div align="center">

### ⭐ N'oubliez pas de mettre une étoile si vous aimez ce projet !

**Fait avec ❤️ et 🎲 par la communauté**


</div>

---
