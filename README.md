# Minyan Finder

Application pour trouver et organiser des Minyanim (prières communautaires juives) avec géolocalisation.

## Fonctionnalités

- ✅ Création de Minyanim (Cha'harit, Min'ha, Arvit, Levaya/Enterrement)
- ✅ Géolocalisation avec alertes de proximité (300m)
- ✅ Multilingue (Français, Hébreu, Anglais) avec support RTL
- ✅ Annuaire des synagogues par pays/ville
- ✅ Calcul de distance Haversine
- ✅ Interface responsive avec Tailwind CSS

## Stack Technique

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- React i18next
- Sonner (toasts)
- Lucide React (icônes)

## Installation

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Structure

```
src/
├── components/     # Composants React
├── pages/         # Pages (Index, Synagogues)
├── hooks/         # Hooks personnalisés (useGeolocation)
├── lib/           # Utilitaires et types
├── locales/       # Traductions (fr, en, he)
└── data/          # Données des synagogues
```

## Déploiement

L'application peut être déployée sur:
- Vercel
- Netlify
- GitHub Pages
- VPS perso

## Crédits

Développé initialement sur [atoms.dev](https://atoms.dev) par Alex (AI Engineer).
Récupéré et amélioré par David (OpenClaw).
