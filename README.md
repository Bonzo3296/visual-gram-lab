# Visual Gram Lab 📸

**Visual Gram Lab** è un'applicazione web moderna per creare, visualizzare e condividere anteprime di contenuti Instagram. L'app permette di progettare post, caroselli e reel con un'interfaccia intuitiva e funzionalità avanzate di editing e preview.

## ✨ Caratteristiche Principali

### 🎨 Tipi di Contenuto Supportati
- **Post**: Immagini singole con caption personalizzabile
- **Carosello**: Fino a 10 immagini in sequenza
- **Reel**: Video con controlli di editing avanzati

### 🛠️ Funzionalità di Editing
- **Upload Drag & Drop**: Caricamento intuitivo di immagini e video
- **Caption Editor**: Editor avanzato con contatori hashtag/mention
- **Preview Multi-vista**: Feed, dettaglio, griglia profilo, full-screen
- **Export PNG**: Esportazione ad alta risoluzione delle anteprime
- **Gestione Progetti**: Salvataggio, caricamento e duplicazione

### 🔄 Integrazione Supabase
- **Database PostgreSQL**: Storage sicuro dei progetti
- **Autenticazione**: Sistema di login/logout
- **Storage Files**: Gestione media con Supabase Storage
- **Condivisione Pubblica**: Link pubblici per progetti
- **Sistema Commenti**: Feedback clienti/agenzia
- **Calendario**: Programmazione pubblicazioni
- **Archivio**: Gestione progetti salvati

### 🎯 Interfaccia Utente
- **Design Instagram-like**: UI fedele all'estetica Instagram
- **Tema Chiaro/Scuro**: Supporto per entrambi i temi
- **Responsive**: Ottimizzato per desktop e mobile
- **Componenti shadcn/ui**: Design system moderno e accessibile

## 🚀 Tecnologie Utilizzate

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Tipizzazione statica
- **Vite** - Build tool veloce
- **Tailwind CSS** - Styling utility-first
- **shadcn/ui** - Componenti UI moderni
- **Zustand** - State management leggero
- **React Router** - Navigazione SPA
- **React Query** - Gestione stato server
- **React Dropzone** - Upload drag & drop
- **html2canvas** - Export immagini

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Database relazionale
- **Row Level Security** - Sicurezza dati
- **Supabase Storage** - File storage
- **Supabase Auth** - Autenticazione

### Tools & Utilities
- **ESLint** - Linting codice
- **PostCSS** - Processing CSS
- **Autoprefixer** - Compatibilità browser
- **Lucide React** - Icone moderne

## 📋 Prerequisiti

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 o **yarn** >= 1.22.0
- **Account Supabase** (per database e storage)

## 🛠️ Installazione e Setup

### 1. Clona il Repository
```bash
git clone <repository-url>
cd visual-gram-lab-main
```

### 2. Installa le Dipendenze
```bash
npm install
# oppure
yarn install
```

### 3. Configurazione Supabase

#### 3.1 Crea un Progetto Supabase
1. Vai su [supabase.com](https://supabase.com)
2. Crea un nuovo progetto
3. Salva l'URL e la chiave anonima

#### 3.2 Configura le Variabili d'Ambiente
Crea un file `.env.local` nella root del progetto:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 3.3 Esegui le Migrazioni Database
```bash
# Installa Supabase CLI
npm install -g supabase

# Login a Supabase
supabase login

# Link al progetto
supabase link --project-ref your-project-ref

# Esegui le migrazioni
supabase db push
```

#### 3.4 Configura Storage Bucket
Nel dashboard Supabase:
1. Vai su **Storage**
2. Crea un bucket chiamato `project-media`
3. Imposta come pubblico
4. Configura le policy di sicurezza

### 4. Avvia l'Applicazione
```bash
npm run dev
# oppure
yarn dev
```

L'applicazione sarà disponibile su `http://localhost:5173`

## 🏗️ Struttura del Progetto

```
src/
├── components/           # Componenti React
│   ├── ui/              # Componenti UI base (shadcn/ui)
│   ├── preview/         # Componenti preview Instagram
│   ├── AppHeader.tsx    # Header applicazione
│   ├── CaptionPanel.tsx # Editor caption
│   ├── ProjectBar.tsx   # Barra azioni progetto
│   ├── ProjectTypeTabs.tsx # Selezione tipo contenuto
│   ├── ShareButton.tsx  # Condivisione progetti
│   └── UploaderPanel.tsx # Upload media
├── hooks/               # Custom React hooks
├── integrations/        # Integrazioni esterne
│   └── supabase/        # Configurazione Supabase
├── lib/                 # Utilities e helpers
├── pages/               # Pagine applicazione
│   ├── Index.tsx        # Homepage principale
│   ├── Archive.tsx      # Archivio progetti
│   ├── Calendar.tsx     # Calendario pubblicazioni
│   ├── PublicProject.tsx # Vista progetto pubblico
│   └── NotFound.tsx     # Pagina 404
├── services/            # Servizi API
│   └── projectService.ts # API progetti
├── store/               # State management
│   └── useProjectStore.ts # Store Zustand
└── App.tsx              # Componente root
```

## 🗄️ Schema Database

### Tabella `projects`
```sql
- id: uuid (PK)
- owner: uuid (FK to auth.users)
- type: text ('post', 'carousel', 'reel')
- title: text
- caption: text
- media: jsonb (array file + metadata)
- cover: jsonb (cover image data)
- render: jsonb (settings rendering)
- profile: jsonb (profile data)
- settings: jsonb (app settings)
- approved: boolean
- feedback: text
- scheduled_date: date
- approved_at: timestamp
- created_at: timestamp
- updated_at: timestamp
```

### Tabella `comments`
```sql
- id: uuid (PK)
- project_id: uuid (FK to projects)
- author_role: text ('client', 'agency')
- author_name: text
- body: text
- created_at: timestamp
```

### Tabella `calendar_items`
```sql
- id: uuid (PK)
- project_id: uuid (FK to projects)
- scheduled_date: date
- scheduled_time: time
- platform: text
- note: text
- created_at: timestamp
```

## 🔧 Scripts Disponibili

```bash
# Sviluppo
npm run dev          # Avvia server sviluppo

# Build
npm run build        # Build produzione
npm run build:dev    # Build sviluppo

# Linting
npm run lint         # Esegui ESLint

# Preview
npm run preview      # Preview build locale
```

## 🎨 Personalizzazione

### Temi e Stili
L'applicazione utilizza un sistema di design personalizzato basato su Instagram:

- **Colori**: Definiti in `tailwind.config.ts`
- **Font**: Font Instagram-like personalizzato
- **Componenti**: shadcn/ui con customizzazioni

### Aggiungere Nuovi Tipi di Contenuto
1. Aggiorna il tipo `Project['type']` in `useProjectStore.ts`
2. Aggiungi il case nel componente `ProjectTypeTabs`
3. Implementa la logica di upload in `UploaderPanel`
4. Crea il componente preview corrispondente

## 📱 API e Integrazioni

### Supabase Client
```typescript
import { supabase } from "@/integrations/supabase/client";

// Esempi di utilizzo
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('owner', userId);
```

### Servizi Progetto
```typescript
import { 
  saveProject, 
  getProjectById, 
  addComment,
  scheduleProject 
} from "@/services/projectService";
```

## 🚀 Deployment

### Vercel (Raccomandato)
1. Connetti il repository a Vercel
2. Configura le variabili d'ambiente
3. Deploy automatico su push

### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Configura variabili d'ambiente

### Altri Provider
L'app è compatibile con qualsiasi provider che supporti:
- Node.js 18+
- Build statici Vite
- Variabili d'ambiente

## 🔒 Sicurezza

### Row Level Security (RLS)
- **Progetti**: Utenti possono gestire solo i propri progetti
- **Commenti**: Pubblicamente leggibili, inserimento libero
- **Storage**: Policy per upload/gestione file

### Autenticazione
- **Supabase Auth**: Sistema completo di autenticazione
- **JWT Tokens**: Gestione automatica sessioni
- **Protezione Route**: Middleware di autenticazione

## 🐛 Troubleshooting

### Problemi Comuni

#### Errore di Connessione Supabase
```bash
# Verifica configurazione
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

#### Problemi di Upload
- Verifica policy storage Supabase
- Controlla dimensioni file (max 100MB)
- Verifica formati supportati

#### Errori di Build
```bash
# Pulisci cache
rm -rf node_modules
rm -rf dist
npm install
npm run build
```

## 🤝 Contribuire

1. Fork del repository
2. Crea un branch feature (`git checkout -b feature/amazing-feature`)
3. Commit delle modifiche (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## 📞 Supporto

Per supporto e domande:
- **Issues**: Apri una issue su GitHub
- **Documentazione**: Consulta questa README
- **Community**: Partecipa alle discussioni

---

**Visual Gram Lab** - Crea anteprime Instagram perfette in pochi click! 🚀