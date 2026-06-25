# 🏰 Dungeon Generator App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)

> Une application web complète pour la génération procédurale de donjons avec interface React et backend Node.js

![Dungeon Generator Demo](https://via.placeholder.com/800x400/1a1a2e/f7971e?text=🏰+Dungeon+Generator+App)

---

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

**Dungeon Generator App** est une application web complète permettant de générer procéduralement des donjons en utilisant une bibliothèque intégrée. L'application offre une interface utilisateur moderne, responsive et intuitive avec un backend Node.js pour la sauvegarde des exports.

### ✨ Caractéristiques principales

- **7 algorithmes de génération** intégrés dans la bibliothèque
- **Interface React** avec hooks personnalisés
- **Backend Node.js/Express** pour la gestion des exports
- **Design responsive** adapté à tous les écrans
- **Export SVG et PNG** avec sauvegarde automatique

---

## 🚀 Fonctionnalités

### 🎮 Gestion des donjons

| Fonctionnalité | Description |
|----------------|-------------|
| **7 algorithmes** | Salles, BSP, couloirs sinueux, automates cellulaires, Drunkard's Walk, DLA, DLA symétrie |
| **Paramètres ajustables** | Sliders interactifs pour chaque algorithme |
| **Génération en temps réel** | Feedback visuel et indicateur de chargement |
| **Annotations** | Marquez des points d'intérêt (entrée, trésor, etc.) |
| **Historique** | Annulation/rétablissement (undo/redo) complet |
| **Tuiles personnalisables** | Couleurs et icônes emojis |

### 📤 Export et partage

| Fonctionnalité | Description |
|----------------|-------------|
| **Export SVG** | Format vectoriel haute qualité |
| **Export PNG** | Format image avec transparence |
| **Impression** | Optimisée pour l'impression papier |
| **Sauvegarde serveur** | Export automatique sur le backend |
| **Téléchargement local** | Sauvegarde directe sur l'ordinateur |
| **Gestion des exports** | Visualisation et suppression des fichiers |

### 🎨 Interface utilisateur

| Fonctionnalité | Description |
|----------------|-------------|
| **Design responsive** | S'adapte à mobile, tablette et desktop |
| **Thème sombre** | Moderne et confortable |
| **Contrôles intuitifs** | Sliders, sélecteurs et boutons organisés |
| **Feedback visuel** | Messages de statut (succès, erreur, info) |
| **Indicateur de chargement** | Pour les opérations longues |

### 🔧 Personnalisation avancée

- **Calques superposés** - Sol, murs, objets, annotations
- **Règles Graph Grammar** - Créez vos propres règles
- **Salles personnalisées** - Types et styles modifiables
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
│  │  (Principal) │    │   (Contrôles)  │    │   (Hook)        │ │
│  └──────────────┘    └────────────────┘    └────────────────┘ │
│         │                                       │              │
│         ▼                                       ▼              │
│  ┌──────────────┐                      ┌──────────────────┐   │
│  │  Status Bar  │                      │  Bibliothèque    │   │
│  │  (Messages)  │                      │  (Inline dans    │   │
│  └──────────────┘                      │   index.html)    │   │
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

1. **Génération** → L'utilisateur sélectionne un algorithme et ajuste ses paramètres
2. **Traitement** → Le hook React utilise la bibliothèque DungeonGenerator (inline)
3. **Rendu** → Le SVG est généré et rendu dans le conteneur DOM
4. **Visualisation** → L'utilisateur voit le donjon en temps réel
5. **Export** → Les données sont exportées en SVG ou PNG
6. **Sauvegarde** → Le backend sauvegarde les fichiers sur le serveur

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
| **Dungeon Generator** | Bibliothèque intégrée (inline dans index.html) pour la génération de donjons |

---

## 📦 Installation

### Prérequis

- Node.js 18 ou supérieur
- npm 9 ou supérieur
- Git (optionnel)

### Script d'installation
```bash
# Cloner le projet
git clone https://github.com/sebastienbats/Dungeon-Generator-App.git
cd Dungeon-Generator-App
# Installer les dépendances
## Backend
cd backend
npm install
## Frontend
cd ../frontend
npm install
```

### Démarrer l'application
#### Backend (port 5000)
```bash
cd backend
npm run dev      # Mode développement avec hot-reload
# ou
npm start        # Mode production
```
#### Frontend (port 3000)
```bash
cd frontend
npm start
```
L'application sera accessible sur `http://localhost:3000`.

> **Note**: La bibliothèque de génération de donjons est intégrée directement dans `frontend/public/index.html`. Aucun téléchargement supplémentaire n'est nécessaire.

---

## 🎮 Utilisation

### Guide pas à pas

1. **Sélectionner un algorithme** dans le menu déroulant
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

## 📁 Structure du projet
```text
dungeon-generator-app/
├── backend/
│   ├── exports/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── DungeonViewer.js
│   │   ├── DungeonControls.js
│   │   ├── DungeonControls.css
│   │   ├── diagnostic.js
│   │   ├── ErrorBoundary.js
│   │   └── index.js
│   └── package.json
├── .gitignore
└── README.md
```

### Description des fichiers

| Fichier | Description |
|---------|-------------|
| `App.js` | Composant racine qui orchestre l'application |
| `App.css` | Styles globaux, mise en page responsive |
| `DungeonGenerator.js` | Hook personnalisé pour la logique de génération |
| `DungeonControls.js` | Interface des contrôles (algorithmes, paramètres) |
| `DungeonControls.css` | Styles des contrôles, responsive |
| `server.js` | Serveur Express avec routes API |
| `index.html` | Page HTML avec bibliothèque DungeonGenerator inline |

---

## 🔌 API Backend

### Endpoints

#### `POST /api/save-svg`

Sauvegarde un fichier SVG sur le serveur.

**Corps de la requête :**
```json
{
  "svg": "<svg xmlns='http://www.w3.org/2000/svg'>...</svg>",
  "filename": "mon-donjon.svg"
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "SVG sauvegardé avec succès",
  "url": "/exports/mon-donjon.svg",
  "filename": "mon-donjon.svg"
}
```

#### `POST /api/save-png`

Sauvegarde un fichier PNG sur le serveur (données base64).

**Corps de la requête :**
```json
{
  "image": "data:image/png;base64,iVBORw0KGgo...",
  "filename": "mon-donjon.png"
}
```

#### `GET /api/exports`

Liste tous les fichiers exportés présents sur le serveur.

**Réponse (200) :**
```json
{
  "success": true,
  "count": 5,
  "exports": [
    {
      "name": "donjon-1704067200000.svg",
      "url": "/exports/donjon-1704067200000.svg",
      "size": 45678,
      "sizeFormatted": "44.6 KB",
      "created": "2024-01-01T12:00:00.000Z",
      "createdFormatted": "01/01/2024 12:00:00",
      "type": "SVG"
    }
  ]
}
```

#### `DELETE /api/exports/:filename`

Supprime un fichier exporté du serveur.

#### `GET /api/exports/download/:filename`

Télécharge un fichier exporté.

---

## 🎨 Composants React

### `App` - Composant principal

**Rôle :** Orchestre l'ensemble de l'application et gère l'état global.

**État :**
| Propriété | Type | Description |
|-----------|------|-------------|
| `status` | `{message, type}` | Message de statut (info, success, error) |
| `isLoading` | `boolean` | État de chargement |
| `history` | `{canUndo, canRedo}` | État de l'historique |
| `exportsList` | `Array` | Liste des exports sauvegardés |

### `DungeonControls` - Contrôles UI

**Rôle :** Interface utilisateur pour tous les contrôles et actions.

**Props :**
| Propriété | Type | Description |
|-----------|------|-------------|
| `onGenerate` | `(algo, params) => void` | Fonction de génération |
| `onExportSVG` | `() => void` | Export en SVG |
| `onExportPNG` | `() => void` | Export en PNG |
| `onPrint` | `() => void` | Impression |
| `onUndo` | `() => void` | Annulation |
| `onRedo` | `() => void` | Rétablissement |
| `onAddAnnotation` | `(x, y, text, color) => void` | Ajout d'annotation |
| `onRefreshExports` | `() => void` | Rafraîchir les exports |
| `onDeleteExport` | `(filename) => void` | Supprimer un export |
| `isLoading` | `boolean` | État de chargement |
| `isLoaded` | `boolean` | Bibliothèque chargée |
| `history` | `{canUndo, canRedo}` | État de l'historique |
| `exports` | `Array` | Liste des exports |

### `useDungeonGenerator` - Hook personnalisé

**Rôle :** Encapsule toute la logique de génération et d'export.

**Paramètres :**
| Propriété | Type | Description |
|-----------|------|-------------|
| `containerRef` | `React.RefObject` | Référence au conteneur DOM |
| `onGenerate` | `() => void` | Callback après génération |
| `onExport` | `(data) => void` | Callback après export |
| `onStatus` | `(msg, type) => void` | Callback de statut |

**Retourne :**
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
| `getExports` | `() => Promise` | Liste des exports |
| `deleteExport` | `(filename) => Promise` | Supprimer un export |
| `history` | `{canUndo, canRedo}` | État de l'historique |

---

## 🧮 Algorithmes de génération

### 1. 🏠 Salles + couloirs en L (`rooms`)

Salles rectangulaires classiques reliées par des couloirs en L.

| Paramètre | Plage | Défaut | Description |
|-----------|-------|--------|-------------|
| `numRooms` | 3-30 | 12 | Nombre de salles |
| `minRoomSize` | 2-8 | 3 | Taille minimale |
| `maxRoomSize` | 4-15 | 7 | Taille maximale |

### 2. 🌳 BSP (`bsp`)

Partitionnement binaire de l'espace pour des agencements hiérarchiques.

| Paramètre | Plage | Défaut | Description |
|-----------|-------|--------|-------------|
| `minRoomSize` | 2-6 | 3 | Taille minimale |
| `maxRoomSize` | 4-12 | 6 | Taille maximale |
| `maxDepth` | 2-8 | 4 | Profondeur maximale |

### 3. 🌀 Couloirs sinueux (`sinuous`)

Chemins aléatoires sinueux avec salles occasionnelles.

| Paramètre | Plage | Défaut | Description |
|-----------|-------|--------|-------------|
| `steps` | 100-2000 | 500 | Nombre de pas |
| `turnProbability` | 0.1-0.9 | 0.3 | Probabilité de tourner |
| `roomProbability` | 0.01-0.2 | 0.05 | Probabilité de salle |
| `minRoomSize` | 2-6 | 3 | Taille minimale |
| `maxRoomSize` | 4-10 | 5 | Taille maximale |

### 4. 🕳️ Automates cellulaires (`cellular`)

Structures organiques de type caverne (règle B4/S3).

| Paramètre | Plage | Défaut | Description |
|-----------|-------|--------|-------------|
| `density` | 0.3-0.7 | 0.45 | Densité initiale |
| `iterations` | 3-10 | 5 | Nombre d'itérations |
| `birthLimit` | 2-5 | 4 | Seuil de naissance |
| `deathLimit` | 2-5 | 3 | Seuil de mort |

### 5. 🚶 Drunkard's Walk (`drunkard`)

Marches aléatoires multiples qui creusent des tunnels.

| Paramètre | Plage | Défaut | Description |
|-----------|-------|--------|-------------|
| `steps` | 50-500 | 200 | Pas par marcheur |
| `walkers` | 1-20 | 5 | Nombre de marcheurs |
| `roomChance` | 0.01-0.1 | 0.04 | Chance de salle |
| `directionChange` | 0.1-0.9 | 0.5 | Changement direction |

### 6. 🌿 DLA Central Attractor (`dla`)

Agrégation limitée par diffusion - structures dendritiques.

| Paramètre | Plage | Défaut | Description |
|-----------|-------|--------|-------------|
| `particles` | 50-500 | 150 | Nombre de particules |
| `radius` | 1-5 | 2 | Rayon attracteur |
| `spawnRadius` | 5-20 | 12 | Rayon d'apparition |

### 7. 🔄 DLA Symmetry (`dla-symmetry`)

DLA avec symétrie axiale (x, y ou les deux).

| Paramètre | Plage | Défaut | Description |
|-----------|-------|--------|-------------|
| `particles` | 50-500 | 150 | Nombre de particules |
| `radius` | 1-5 | 2 | Rayon attracteur |
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

// Utilisation dans le constructeur
const instance = new DungeonGenerator({
  container: containerRef.current,
  tileSize: 32,
  width: 50,
  height: 40,
  customTileTypes: customTiles
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
```

### Ajouter des annotations

```javascript
// Annotation simple
addAnnotation(5, 5, '🏰 Entrée', '#ffd700', 16);

// Annotation avec couleur personnalisée
addAnnotation(10, 15, '💎 Trésor', '#f1c40f', 14);
```

### Modifier l'apparence du donjon

```javascript
// Personnaliser la taille des tuiles
const dungeon = new DungeonGenerator({
  container: document.getElementById('map'),
  tileSize: 40,        // Taille en pixels
  width: 60,           // Largeur en tuiles
  height: 40           // Hauteur en tuiles
});

// Ajouter une barre d'échelle
dungeon.setScale(true, 'm', 20);
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

Les contributions sont les bienvenues !

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
- ✅ Testez vos modifications
- ✅ Utilisez des messages de commit clairs

### Guide de style

**JavaScript :**
- Utilisez ES6+ (const, let, arrow functions, destructuring)
- Nommez les variables et fonctions en camelCase
- Utilisez des noms descriptifs

**CSS :**
- Utilisez des classes avec la convention BEM
- Maintenez la cohérence avec le thème sombre
- Assurez-vous que le design reste responsive

**React :**
- Utilisez des hooks fonctionnels
- Décomposez les composants en unités réutilisables
- Gérez les effets secondaires avec useEffect

---

## 📝 Licence

Distribué sous licence MIT. Voir `LICENSE` pour plus d'informations.

```
MIT License

Copyright (c) 2024 Sébastien BATS

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

- **Sébastien BATS** - Auteur de la bibliothèque de génération de donjons
- **Tous les contributeurs** de la communauté open-source
- **Les utilisateurs** pour leurs retours et suggestions

---

## 📞 Contact

- **Auteur** : Sébastien BATS
- **GitHub** : [@sebastienbats](https://github.com/sebastienbats)
- **Projet** : [Dungeon-Generator-App](https://github.com/sebastienbats/Dungeon-Generator-App)

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
![Tests](https://img.shields.io/badge/Tests-Passés-brightgreen)
![Documentation](https://img.shields.io/badge/Documentation-Complete-brightgreen)

---

<div align="center">

### ⭐ N'oubliez pas de mettre une étoile si vous aimez ce projet !

**Fait avec ❤️ et 🎲 par la communauté**

</div>
