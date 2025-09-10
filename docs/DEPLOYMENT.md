# Guida al Deployment - Visual Gram Lab

Questa guida fornisce istruzioni dettagliate per il deployment dell'applicazione Visual Gram Lab su diverse piattaforme.

## 📋 Indice

- [Prerequisiti](#prerequisiti)
- [Configurazione Supabase](#configurazione-supabase)
- [Deployment su Vercel](#deployment-su-vercel)
- [Deployment su Netlify](#deployment-su-netlify)
- [Deployment su Railway](#deployment-su-railway)
- [Deployment su VPS](#deployment-su-vps)
- [Configurazione Domini](#configurazione-domini)
- [Monitoraggio e Logs](#monitoraggio-e-logs)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisiti

### 1. Account e Servizi Richiesti
- **GitHub** - Repository del codice
- **Supabase** - Database e autenticazione
- **Provider di hosting** (Vercel, Netlify, Railway, etc.)

### 2. Strumenti Locali
```bash
# Node.js 18+
node --version

# npm o yarn
npm --version

# Git
git --version

# Supabase CLI (opzionale)
npm install -g supabase
```

### 3. Preparazione del Codice
```bash
# Clona il repository
git clone <repository-url>
cd visual-gram-lab-main

# Installa dipendenze
npm install

# Test build locale
npm run build

# Verifica che il build funzioni
npm run preview
```

## 🗄️ Configurazione Supabase

### 1. Creazione Progetto Supabase
1. Vai su [supabase.com](https://supabase.com)
2. Crea un nuovo progetto
3. Salva le credenziali:
   - **Project URL**
   - **Anon Key**
   - **Service Role Key** (per operazioni admin)

### 2. Configurazione Database
```bash
# Se hai Supabase CLI installato
supabase login
supabase link --project-ref your-project-ref

# Esegui le migrazioni
supabase db push
```

**Oppure** esegui manualmente le migrazioni dal dashboard Supabase:
1. Vai su **SQL Editor**
2. Esegui i file SQL da `supabase/migrations/`

### 3. Configurazione Storage
1. Vai su **Storage** nel dashboard Supabase
2. Crea un bucket chiamato `project-media`
3. Imposta come **pubblico**
4. Configura le policy di sicurezza:

```sql
-- Policy per visualizzazione file
CREATE POLICY "Anyone can view project media" ON storage.objects
FOR SELECT USING (bucket_id = 'project-media');

-- Policy per upload file
CREATE POLICY "Authenticated users can upload project media" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-media');

-- Policy per aggiornamento file
CREATE POLICY "Users can update their own project media" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'project-media');

-- Policy per eliminazione file
CREATE POLICY "Users can delete their own project media" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'project-media');
```

### 4. Configurazione Autenticazione
1. Vai su **Authentication** > **Settings**
2. Configura **Site URL** con il dominio di produzione
3. Aggiungi **Redirect URLs** per il tuo dominio
4. Configura **Email templates** se necessario

## 🚀 Deployment su Vercel

### 1. Preparazione
```bash
# Assicurati che il build funzioni
npm run build

# Commit e push del codice
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Connessione a Vercel
1. Vai su [vercel.com](https://vercel.com)
2. Connetti il tuo account GitHub
3. Importa il repository
4. Vercel rileverà automaticamente le impostazioni Vite

### 3. Configurazione Variabili d'Ambiente
Nel dashboard Vercel, vai su **Settings** > **Environment Variables**:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Configurazione Build
Vercel dovrebbe rilevare automaticamente:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. Deploy
1. Clicca **Deploy**
2. Vercel costruirà e deployerà l'app
3. Riceverai un URL di preview
4. Dopo il test, promuovi a produzione

### 6. Configurazione Dominio Personalizzato
1. Vai su **Settings** > **Domains**
2. Aggiungi il tuo dominio
3. Configura i DNS records come indicato
4. Aggiorna le impostazioni Supabase con il nuovo dominio

## 🌐 Deployment su Netlify

### 1. Preparazione
```bash
# Crea file netlify.toml nella root
cat > netlify.toml << EOF
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
EOF

git add netlify.toml
git commit -m "Add Netlify configuration"
git push origin main
```

### 2. Connessione a Netlify
1. Vai su [netlify.com](https://netlify.com)
2. Connetti il tuo account GitHub
3. Seleziona il repository
4. Netlify rileverà le impostazioni dal file `netlify.toml`

### 3. Configurazione Variabili d'Ambiente
Nel dashboard Netlify:
1. Vai su **Site settings** > **Environment variables**
2. Aggiungi le variabili:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Deploy
1. Netlify costruirà automaticamente l'app
2. Riceverai un URL di preview
3. Dopo il test, il deploy sarà live

## 🚂 Deployment su Railway

### 1. Preparazione
```bash
# Crea file railway.json
cat > railway.json << EOF
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

git add railway.json
git commit -m "Add Railway configuration"
git push origin main
```

### 2. Connessione a Railway
1. Vai su [railway.app](https://railway.app)
2. Connetti il tuo account GitHub
3. Crea un nuovo progetto
4. Seleziona il repository

### 3. Configurazione
1. Railway rileverà automaticamente Node.js
2. Configura le variabili d'ambiente nel dashboard
3. Railway costruirà e deployerà l'app

## 🖥️ Deployment su VPS

### 1. Preparazione Server
```bash
# Aggiorna il sistema
sudo apt update && sudo apt upgrade -y

# Installa Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installa Nginx
sudo apt install nginx -y

# Installa PM2 per process management
sudo npm install -g pm2
```

### 2. Configurazione Applicazione
```bash
# Clona il repository
git clone <repository-url>
cd visual-gram-lab-main

# Installa dipendenze
npm install

# Crea file .env
cat > .env << EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
EOF

# Build dell'applicazione
npm run build
```

### 3. Configurazione Nginx
```bash
# Crea configurazione Nginx
sudo cat > /etc/nginx/sites-available/visual-gram-lab << EOF
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/visual-gram-lab-main/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        # Proxy per API se necessario
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Abilita il sito
sudo ln -s /etc/nginx/sites-available/visual-gram-lab /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Configurazione SSL con Let's Encrypt
```bash
# Installa Certbot
sudo apt install certbot python3-certbot-nginx -y

# Ottieni certificato SSL
sudo certbot --nginx -d your-domain.com

# Test rinnovo automatico
sudo certbot renew --dry-run
```

### 5. Configurazione PM2 (se necessario)
```bash
# Crea file ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'visual-gram-lab',
    script: 'npm',
    args: 'run preview',
    cwd: '/path/to/visual-gram-lab-main',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Avvia con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🌍 Configurazione Domini

### 1. DNS Configuration
Configura i seguenti record DNS:

```
# Record A per il dominio principale
A    @           your-server-ip
A    www         your-server-ip

# Record CNAME per sottodomini (opzionale)
CNAME api        your-domain.com
CNAME admin      your-domain.com
```

### 2. Aggiornamento Supabase
Nel dashboard Supabase:
1. Vai su **Authentication** > **Settings**
2. Aggiorna **Site URL** con il dominio di produzione
3. Aggiungi **Redirect URLs**:
   - `https://your-domain.com`
   - `https://your-domain.com/auth/callback`

### 3. Configurazione CORS
Se necessario, configura CORS in Supabase:
1. Vai su **Settings** > **API**
2. Aggiungi il dominio alle **Allowed Origins**

## 📊 Monitoraggio e Logs

### 1. Vercel Analytics
```bash
# Installa Vercel Analytics
npm install @vercel/analytics

# Aggiungi al main.tsx
import { Analytics } from '@vercel/analytics/react';

// Nel componente App
<Analytics />
```

### 2. Error Tracking con Sentry
```bash
# Installa Sentry
npm install @sentry/react @sentry/vite-plugin

# Configura in vite.config.ts
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "your-org",
      project: "your-project",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
});
```

### 3. Logs di Produzione
```bash
# Per Vercel
vercel logs

# Per Netlify
netlify logs

# Per Railway
railway logs

# Per VPS con PM2
pm2 logs visual-gram-lab
```

## 🔧 Troubleshooting

### Problemi Comuni

#### 1. Build Fallisce
```bash
# Verifica Node.js version
node --version

# Pulisci cache
rm -rf node_modules package-lock.json
npm install

# Verifica dipendenze
npm audit fix
```

#### 2. Errori Supabase
```bash
# Verifica configurazione
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test connessione
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" $VITE_SUPABASE_URL/rest/v1/
```

#### 3. Problemi di Routing
```bash
# Verifica configurazione redirect
# Per Vercel: vercel.json
# Per Netlify: netlify.toml
# Per Nginx: configurazione server
```

#### 4. Errori di Storage
- Verifica policy Supabase Storage
- Controlla permessi bucket
- Verifica CORS configuration

### Debug Checklist
- [ ] Variabili d'ambiente configurate correttamente
- [ ] Build locale funziona
- [ ] Supabase database configurato
- [ ] Storage bucket creato e configurato
- [ ] DNS records configurati
- [ ] SSL certificato valido
- [ ] CORS configurato correttamente

### Comandi di Debug
```bash
# Test build locale
npm run build && npm run preview

# Verifica bundle size
npm run build -- --analyze

# Test API Supabase
curl -H "apikey: your-key" https://your-project.supabase.co/rest/v1/projects

# Verifica logs in produzione
# (comandi specifici per piattaforma)
```

## 📈 Performance e Ottimizzazione

### 1. Bundle Analysis
```bash
# Installa analyzer
npm install --save-dev rollup-plugin-visualizer

# Aggiungi a vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // ... altri plugin
    visualizer({
      filename: 'dist/stats.html',
      open: true,
    }),
  ],
});
```

### 2. Lazy Loading
```typescript
// Implementa lazy loading per componenti pesanti
const LazyComponent = lazy(() => import('./HeavyComponent'));

// Usa con Suspense
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

### 3. Image Optimization
```typescript
// Usa componenti ottimizzati per le immagini
import { Image } from 'next/image'; // Se usi Next.js
// Oppure implementa lazy loading personalizzato
```

### 4. Caching Strategy
```bash
# Configura cache headers
# Per Vercel: vercel.json
# Per Netlify: _headers file
# Per Nginx: configurazione server
```

---

Questa guida copre tutti gli aspetti principali del deployment di Visual Gram Lab. Per problemi specifici o domande aggiuntive, consulta la documentazione della piattaforma scelta o apri una issue su GitHub.
