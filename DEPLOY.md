# Configuration de déploiement pour mydavid.io/minian

## URL cible
**https://mydavid.io/minian**

## Configuration Vite

Le fichier `vite.config.ts` doit être modifié pour supporter le sous-chemin `/minian`.

## Étapes de déploiement

### 1. Build de production
```bash
cd /opt/atoms-mignane
npm run build
```

### 2. Configuration du sous-chemin
Dans `vite.config.ts`, ajouter:
```typescript
base: '/minian/',
```

### 3. Déploiement sur le serveur
Copier le contenu du dossier `dist/` vers `/var/www/mydavid.io/minian/` sur le serveur.

### 4. Configuration Nginx
```nginx
server {
    listen 80;
    server_name mydavid.io;
    
    location /minian {
        alias /var/www/mydavid.io/minian;
        try_files $uri $uri/ /minian/index.html;
    }
}
```

## Vérification post-déploiement

- [ ] Site accessible sur https://mydavid.io/minian
- [ ] Routes fonctionnelles (/, /synagogues, /sidour)
- [ ] Assets chargés correctement
- [ ] API Groq fonctionnelle (si clé configurée)
