# Minyan Finder - Configuration Publicitaire

## Statut actuel
**Mode : NON LUCRATIF**
Les publicités sont actuellement **désactivées**.

## Types de publicités prévues

### 1. Voyages
- Voyages en Israël (Pessah, Souccot)
- Oumrah
- Voyages organisés pour la communauté

### 2. Épiceries Casher
- Livraison à domicile
- Produits casher en ligne
- Boulangeries casher

### 3. Services
- Mohel
- Sofer (écriture de Sifrei Torah)
- Cours de Hébreu
- Services funéraires

### 4. Événements
- Galas de charité
- Soirées communautaires
- Conférences

### 5. Apprentissage
- Cours de Torah en ligne
- Yechivot
- Séminaires

## Ciblage

### Par localisation
- Villes spécifiques (Paris, Lyon, Marseille...)
- Rayon autour de l'utilisateur

### Par communauté
- Ashkénaze
- Séfarade
- Tous

### Par intérêt
- Basé sur les pages visitées
- Tables de Minyan fréquentées

## Activation

Pour activer les publicités, modifier dans `src/data/adsConfig.ts` :

```typescript
export const sampleAds: AdConfig[] = [
  {
    enabled: true,  // ← Passer à true
    type: 'travel',
    // ...
  }
];
```

Ou appeler la fonction :
```typescript
import { enableAds } from './data/adsConfig';
enableAds();
```

## Revenus potentiels

| Type | Revenu estimé/mois |
|------|-------------------|
| Voyages | 500-2000€ |
| Épiceries | 300-1000€ |
| Services | 200-800€ |
| Événements | 100-500€ |
| **Total** | **1100-4300€** |

## Éthique

- Publicités uniquement pour la communauté juive
- Pas de publicités pendant Chabbat
- Marquage clair "Publicité"
- Possibilité de masquer

## Partenariats potentiels

- Agences de voyage juives
- Épiceries casher (Hyper Casher, etc.)
- Organisations communautaires
- Yechivot et séminaires
