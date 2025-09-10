# FAQ - Visual Gram Lab

Domande frequenti e risposte per Visual Gram Lab.

## 📋 Indice

- [Generale](#generale)
- [Installazione e Setup](#installazione-e-setup)
- [Utilizzo](#utilizzo)
- [Tecnico](#tecnico)
- [Troubleshooting](#troubleshooting)
- [Contribuire](#contribuire)

## 🤔 Generale

### Cos'è Visual Gram Lab?
Visual Gram Lab è un'applicazione web per creare, visualizzare e condividere anteprime di contenuti Instagram. Permette di progettare post, caroselli e reel con un'interfaccia intuitiva e funzionalità avanzate di editing.

### È gratuito?
Sì, Visual Gram Lab è completamente gratuito e open source. Puoi usarlo senza limitazioni e contribuire al suo sviluppo.

### Quali tipi di contenuto supporta?
- **Post**: Immagini singole con caption personalizzabile
- **Carosello**: Fino a 10 immagini in sequenza
- **Reel**: Video con controlli di editing avanzati

### È necessario un account?
No, puoi usare l'applicazione senza registrarti. Tuttavia, per salvare i progetti nel cloud e accedere a funzionalità avanzate come la condivisione, è consigliabile creare un account.

## 🛠️ Installazione e Setup

### Come installo Visual Gram Lab?
```bash
# Clona il repository
git clone <repository-url>
cd visual-gram-lab-main

# Installa le dipendenze
npm install

# Configura le variabili d'ambiente
cp env.example .env.local
# Modifica .env.local con le tue credenziali Supabase

# Avvia l'applicazione
npm run dev
```

### Ho bisogno di un account Supabase?
Sì, per utilizzare tutte le funzionalità dell'applicazione. Puoi creare un account gratuito su [supabase.com](https://supabase.com).

### Come configuro Supabase?
1. Crea un nuovo progetto su Supabase
2. Esegui le migrazioni database (vedi `docs/API.md`)
3. Configura il bucket storage `project-media`
4. Aggiungi le credenziali al file `.env.local`

### Posso usare l'app senza Supabase?
Sì, ma con funzionalità limitate. Puoi creare progetti e vedere le anteprime, ma non potrai salvarli nel cloud o condividerli.

## 💻 Utilizzo

### Come creo un nuovo progetto?
1. Seleziona il tipo di contenuto (Post, Carosello, Reel)
2. Carica le tue immagini o video
3. Scrivi la caption
4. Personalizza l'anteprima
5. Salva o condividi il progetto

### Quali formati di file sono supportati?
- **Immagini**: JPG, JPEG, PNG, WebP
- **Video**: MP4, MOV
- **Dimensioni**: Fino a 100MB per file

### Come funziona l'editor caption?
L'editor include:
- Contatore caratteri (max 2200)
- Contatori hashtag e mention
- Preview formattazione in tempo reale
- Modalità clamp (2 righe vs 125 caratteri)

### Posso esportare le anteprime?
Sì, puoi esportare le anteprime come immagini PNG ad alta risoluzione cliccando sul pulsante "Esporta PNG".

### Come condivido un progetto?
1. Clicca sul pulsante "Condividi"
2. L'app genererà un link pubblico
3. Condividi il link con chi vuoi
4. Gli altri potranno vedere e commentare il progetto

### Come funziona il sistema di commenti?
I progetti condivisi supportano commenti da:
- **Clienti**: Possono lasciare feedback
- **Agenzie**: Possono rispondere e gestire il progetto

## 🔧 Tecnico

### Quali tecnologie usa?
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI**: shadcn/ui + Radix UI
- **State**: Zustand

### È responsive?
Sì, l'applicazione è completamente responsive e funziona su desktop, tablet e mobile.

### Supporta il tema scuro?
Sì, puoi alternare tra tema chiaro e scuro usando il pulsante nell'header.

### Come funziona il salvataggio?
I progetti vengono salvati:
- **Localmente**: Nel browser (localStorage)
- **Nel cloud**: Su Supabase (se autenticato)

### È sicuro?
Sì, l'applicazione implementa:
- Row Level Security (RLS) su database
- Autenticazione JWT
- Validazione input
- Policy storage sicure

## 🐛 Troubleshooting

### L'app non si avvia
```bash
# Verifica Node.js version (18+)
node --version

# Pulisci cache
rm -rf node_modules package-lock.json
npm install

# Verifica variabili d'ambiente
cat .env.local
```

### Errori di upload file
- Verifica che il file sia in formato supportato
- Controlla che la dimensione sia sotto 100MB
- Assicurati che Supabase Storage sia configurato

### Problemi con Supabase
```bash
# Test connessione
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" $VITE_SUPABASE_URL/rest/v1/

# Verifica migrazioni
# Vai su Supabase Dashboard > SQL Editor
# Esegui le query da supabase/migrations/
```

### L'anteprima non si aggiorna
- Ricarica la pagina
- Verifica che i file siano stati caricati correttamente
- Controlla la console browser per errori

### Problemi di performance
- Chiudi altre tab del browser
- Verifica la connessione internet
- Prova con file più piccoli

## 🤝 Contribuire

### Come posso contribuire?
- **Bug fixes**: Correggi bug esistenti
- **Nuove funzionalità**: Implementa nuove caratteristiche
- **Documentazione**: Migliora la documentazione
- **UI/UX**: Migliora l'interfaccia
- **Testing**: Aggiungi test

### Dove trovo le issue?
Vai su [GitHub Issues](https://github.com/your-repo/issues) per vedere le issue aperte.

### Come apro una Pull Request?
1. Fork del repository
2. Crea un branch per la tua feature
3. Fai le modifiche
4. Apri una Pull Request

### Ci sono issue per principianti?
Sì, cerca le issue con label `good first issue` o `help wanted`.

## 📞 Supporto

### Dove posso chiedere aiuto?
- **GitHub Issues**: Per bug e feature requests
- **GitHub Discussions**: Per domande generali
- **Email**: Per questioni private

### Come segnalo un bug?
1. Vai su GitHub Issues
2. Usa il template "Bug Report"
3. Fornisci dettagli completi
4. Includi screenshot se possibile

### Come suggerisco una nuova funzionalità?
1. Vai su GitHub Issues
2. Usa il template "Feature Request"
3. Descrivi la funzionalità
4. Spiega il caso d'uso

## 🔮 Roadmap

### Funzionalità Pianificate
- **Analytics**: Statistiche progetti
- **Templates**: Modelli predefiniti
- **Collaborazione**: Editing multi-utente
- **Integrazioni**: API social media
- **Mobile App**: App nativa

### Miglioramenti Tecnici
- **PWA**: App installabile
- **Offline**: Funzionalità offline
- **Performance**: Ottimizzazioni avanzate
- **Testing**: Copertura test completa

---

Se non trovi la risposta alla tua domanda, non esitare a [aprire una issue](https://github.com/your-repo/issues) o [iniziare una discussione](https://github.com/your-repo/discussions)!
