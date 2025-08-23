# Guide d'utilisation du Mode Sombre

## 🎨 Vue d'ensemble

Le mode sombre a été implémenté dans l'application AEDDI pour améliorer l'expérience utilisateur. Il utilise Tailwind CSS avec des classes conditionnelles et un contexte React pour gérer l'état du thème.

## 🚀 Fonctionnalités

- **Basculement automatique** : Le thème se souvient de votre choix
- **Préférence système** : Utilise automatiquement la préférence de votre système
- **Transitions fluides** : Changement de thème avec animations
- **Persistance** : Votre choix est sauvegardé dans le localStorage

## 🎯 Comment utiliser

### 1. Basculement du thème
- **Page de connexion** : Bouton en haut à droite
- **Dashboard** : Bouton dans le header à côté des notifications

### 2. Classes CSS disponibles

#### Classes de base
```css
/* Arrière-plans */
bg-white dark:bg-gray-800          /* Arrière-plan principal */
bg-gray-50 dark:bg-gray-700        /* Arrière-plan secondaire */
bg-gray-100 dark:bg-gray-600       /* Arrière-plan tertiaire */

/* Textes */
text-gray-800 dark:text-white      /* Texte principal */
text-gray-600 dark:text-gray-300   /* Texte secondaire */
text-gray-500 dark:text-gray-400   /* Texte tertiaire */

/* Bordures */
border-gray-200 dark:border-gray-700
border-gray-300 dark:border-gray-600
```

#### Classes pour les composants
```css
/* Boutons */
bg-blue-500 dark:bg-blue-600
hover:bg-blue-600 dark:hover:bg-blue-700

/* Inputs */
bg-white dark:bg-gray-700
border-gray-300 dark:border-gray-600
text-gray-900 dark:text-white

/* Cartes */
bg-white dark:bg-gray-800
shadow-md dark:shadow-lg
```

## 📝 Exemples d'utilisation

### Carte simple
```jsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
    Titre de la carte
  </h2>
  <p className="text-gray-600 dark:text-gray-300">
    Contenu de la carte
  </p>
</div>
```

### Formulaire
```jsx
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Label
    </label>
    <input
      type="text"
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
    />
  </div>
</div>
```

### Tableau
```jsx
<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
  <thead className="bg-gray-50 dark:bg-gray-700">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
        En-tête
      </th>
    </tr>
  </thead>
  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
        Contenu
      </td>
    </tr>
  </tbody>
</table>
```

## 🔧 Architecture technique

### Fichiers principaux
- `src/contexts/ThemeContext.jsx` : Gestion de l'état du thème
- `src/components/ThemeToggle.jsx` : Bouton de basculement
- `src/styles/darkMode.css` : Variables CSS et styles personnalisés
- `tailwind.config.js` : Configuration Tailwind pour le mode sombre

### Hook personnalisé
```jsx
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      {/* Contenu */}
    </div>
  );
};
```

## 🎨 Palette de couleurs

### Mode clair
- **Arrière-plan principal** : `#ffffff`
- **Arrière-plan secondaire** : `#f8fafc`
- **Texte principal** : `#1e293b`
- **Texte secondaire** : `#64748b`
- **Bordure** : `#e2e8f0`

### Mode sombre
- **Arrière-plan principal** : `#0f172a`
- **Arrière-plan secondaire** : `#1e293b`
- **Texte principal** : `#f8fafc`
- **Texte secondaire** : `#cbd5e1`
- **Bordure** : `#475569`

## 🔄 Migration des composants existants

Pour migrer un composant existant vers le mode sombre :

1. **Identifier les couleurs** : Trouver les classes de couleur
2. **Ajouter les variantes sombres** : Utiliser `dark:` pour chaque classe
3. **Tester** : Vérifier l'apparence dans les deux modes
4. **Optimiser** : Ajuster les contrastes si nécessaire

### Exemple de migration
```jsx
// Avant
<div className="bg-white text-gray-800 border border-gray-200">

// Après
<div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700">
```

## 🚨 Bonnes pratiques

1. **Contraste** : Maintenir un bon contraste dans les deux modes
2. **Cohérence** : Utiliser la même palette de couleurs partout
3. **Accessibilité** : Respecter les standards WCAG
4. **Performance** : Les transitions sont optimisées pour être fluides
5. **Test** : Tester sur différents appareils et navigateurs

## 🐛 Dépannage

### Le thème ne change pas
- Vérifier que `ThemeProvider` entoure l'application
- Vérifier que `darkMode: 'class'` est dans `tailwind.config.js`
- Vérifier que les classes `dark:` sont bien utilisées

### Styles incohérents
- Vérifier que toutes les couleurs ont leur variante sombre
- Utiliser les variables CSS personnalisées si nécessaire
- Vérifier l'ordre des classes CSS

### Performance
- Les transitions sont optimisées pour être fluides
- Éviter les changements de thème trop fréquents
- Utiliser `useMemo` pour les calculs coûteux si nécessaire
