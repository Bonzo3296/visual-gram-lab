# Guida al Contributo - Visual Gram Lab

Grazie per il tuo interesse a contribuire a Visual Gram Lab! Questa guida ti aiuterà a iniziare con lo sviluppo e a capire come contribuire al progetto.

## 📋 Indice

- [Come Contribuire](#come-contribuire)
- [Setup Sviluppo](#setup-sviluppo)
- [Convenzioni di Codice](#convenzioni-di-codice)
- [Workflow Git](#workflow-git)
- [Testing](#testing)
- [Documentazione](#documentazione)
- [Issue e Bug Report](#issue-e-bug-report)
- [Pull Request](#pull-request)
- [Release Process](#release-process)

## 🤝 Come Contribuire

### Tipi di Contributi
- **🐛 Bug Fixes**: Correzione di bug esistenti
- **✨ Nuove Funzionalità**: Implementazione di nuove caratteristiche
- **📚 Documentazione**: Miglioramento della documentazione
- **🎨 UI/UX**: Miglioramenti all'interfaccia utente
- **⚡ Performance**: Ottimizzazioni di performance
- **🧪 Testing**: Aggiunta di test
- **🔧 Tooling**: Miglioramenti agli strumenti di sviluppo

### Prima di Iniziare
1. **Controlla le Issue esistenti** per vedere se il tuo lavoro è già in corso
2. **Apri una Issue** per discutere grandi cambiamenti
3. **Fork del repository** e clona la tua copia
4. **Crea un branch** per la tua feature/fix

## 🛠️ Setup Sviluppo

### 1. Prerequisiti
```bash
# Node.js 18+
node --version

# npm o yarn
npm --version

# Git
git --version

# Editor consigliato: VS Code con estensioni
# - ES7+ React/Redux/React-Native snippets
# - Tailwind CSS IntelliSense
# - TypeScript Importer
# - Prettier - Code formatter
# - ESLint
```

### 2. Clonazione e Setup
```bash
# Fork del repository su GitHub, poi:
git clone https://github.com/YOUR_USERNAME/visual-gram-lab-main.git
cd visual-gram-lab-main

# Aggiungi upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/visual-gram-lab-main.git

# Installa dipendenze
npm install

# Crea file .env.local
cp .env.example .env.local
# Modifica .env.local con le tue credenziali Supabase
```

### 3. Configurazione Supabase (Sviluppo)
```bash
# Crea un progetto Supabase per sviluppo
# Vai su https://supabase.com e crea un nuovo progetto

# Configura .env.local
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key

# Esegui le migrazioni
npm run db:setup
```

### 4. Avvio Sviluppo
```bash
# Avvia il server di sviluppo
npm run dev

# In un altro terminale, avvia il linter in watch mode
npm run lint:watch

# Per test
npm run test:watch
```

## 📝 Convenzioni di Codice

### 1. TypeScript
```typescript
// ✅ Buono
interface User {
  id: string;
  name: string;
  email: string;
}

const createUser = (userData: Omit<User, 'id'>): User => {
  return {
    id: generateId(),
    ...userData,
  };
};

// ❌ Evita
const createUser = (userData: any) => {
  return {
    id: Math.random(),
    ...userData,
  };
};
```

### 2. React Components
```typescript
// ✅ Componente funzionale con TypeScript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  onClick,
  disabled = false 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        disabled && 'btn-disabled'
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

### 3. Hooks Personalizzati
```typescript
// ✅ Hook con tipizzazione e gestione errori
export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getProjectById(projectId);
        
        if (!cancelled) {
          setProject(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProject();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return { project, loading, error };
}
```

### 4. Styling con Tailwind
```typescript
// ✅ Classi Tailwind organizzate
const buttonClasses = cn(
  // Base styles
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  'disabled:pointer-events-none disabled:opacity-50',
  
  // Variant styles
  {
    'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
    'border border-input bg-background hover:bg-accent': variant === 'outline',
  },
  
  // Size styles
  {
    'h-9 px-3': size === 'sm',
    'h-10 px-4 py-2': size === 'md',
    'h-11 px-8': size === 'lg',
  }
);
```

### 5. Gestione Errori
```typescript
// ✅ Gestione errori robusta
export async function saveProject(project: Project): Promise<string> {
  try {
    validateProject(project);
    
    const projectId = await projectService.save(project);
    
    toast.success('Progetto salvato con successo');
    return projectId;
  } catch (error) {
    console.error('Errore nel salvataggio progetto:', error);
    
    if (error instanceof ValidationError) {
      toast.error('Dati progetto non validi');
    } else if (error instanceof NetworkError) {
      toast.error('Errore di connessione');
    } else {
      toast.error('Errore imprevisto');
    }
    
    throw error;
  }
}
```

## 🌿 Workflow Git

### 1. Branch Naming
```bash
# Formato: tipo/descrizione-breve
feature/user-authentication
bugfix/upload-error-handling
docs/api-documentation
refactor/component-structure
perf/image-optimization
```

### 2. Commit Messages
```bash
# Formato: tipo(scope): descrizione

feat(auth): add user login functionality
fix(upload): handle file size validation
docs(api): update project service documentation
refactor(components): extract reusable button component
perf(images): implement lazy loading
test(store): add unit tests for project store
```

### 3. Workflow Completo
```bash
# 1. Aggiorna il tuo fork
git fetch upstream
git checkout main
git merge upstream/main

# 2. Crea un nuovo branch
git checkout -b feature/new-feature

# 3. Fai i tuoi cambiamenti e committa
git add .
git commit -m "feat(component): add new feature"

# 4. Push del branch
git push origin feature/new-feature

# 5. Crea Pull Request su GitHub
```

### 4. Risoluzione Conflitti
```bash
# Se ci sono conflitti durante il merge
git fetch upstream
git checkout main
git merge upstream/main

# Risolvi i conflitti manualmente
# Poi committa
git add .
git commit -m "resolve merge conflicts"

# Aggiorna il tuo branch feature
git checkout feature/your-feature
git rebase main
```

## 🧪 Testing

### 1. Test Structure
```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── Button.stories.tsx
│   └── ...
├── hooks/
│   ├── useProject.test.ts
│   └── ...
└── services/
    ├── projectService.test.ts
    └── ...
```

### 2. Unit Tests
```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### 3. Integration Tests
```typescript
// projectService.test.ts
import { saveProject, getProjectById } from './projectService';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
jest.mock('@/integrations/supabase/client');

describe('ProjectService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves project successfully', async () => {
    const mockProject = {
      type: 'post' as const,
      title: 'Test Project',
      media: { files: [] },
    };

    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-id' },
            error: null,
          }),
        }),
      }),
    });

    const result = await saveProject(mockProject);
    expect(result).toBe('test-id');
  });
});
```

### 4. E2E Tests (Future)
```typescript
// cypress/integration/project-creation.spec.ts
describe('Project Creation', () => {
  it('creates a new post project', () => {
    cy.visit('/');
    cy.get('[data-testid="project-type-post"]').click();
    cy.get('[data-testid="upload-area"]').click();
    // ... test steps
  });
});
```

## 📚 Documentazione

### 1. JSDoc Comments
```typescript
/**
 * Saves a project to the database
 * @param project - The project to save
 * @returns Promise that resolves to the project ID
 * @throws {ValidationError} When project data is invalid
 * @throws {NetworkError} When network request fails
 * @example
 * ```typescript
 * const project = { type: 'post', title: 'My Post' };
 * const id = await saveProject(project);
 * console.log('Project saved with ID:', id);
 * ```
 */
export async function saveProject(project: Project): Promise<string> {
  // Implementation...
}
```

### 2. README Updates
- Aggiorna la sezione "Features" per nuove funzionalità
- Aggiungi nuove dipendenze alla sezione "Dependencies"
- Aggiorna gli esempi di utilizzo
- Documenta nuove variabili d'ambiente

### 3. API Documentation
- Aggiorna `docs/API.md` per nuovi endpoint
- Documenta nuovi tipi TypeScript
- Aggiungi esempi di utilizzo
- Documenta breaking changes

## 🐛 Issue e Bug Report

### 1. Template Issue
```markdown
## Descrizione
Breve descrizione del problema o feature request.

## Steps to Reproduce (per bug)
1. Vai a '...'
2. Clicca su '...'
3. Scrolla fino a '...'
4. Vedi errore

## Comportamento Atteso
Cosa ti aspettavi che succedesse.

## Screenshots
Se applicabile, aggiungi screenshot per aiutare a spiegare il problema.

## Ambiente
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Safari, Firefox]
- Versione: [e.g. 1.0.0]

## Informazioni Aggiuntive
Qualsiasi altra informazione rilevante.
```

### 2. Labels
- `bug`: Qualcosa non funziona
- `enhancement`: Nuova feature o miglioramento
- `documentation`: Miglioramenti alla documentazione
- `good first issue`: Perfetto per nuovi contributori
- `help wanted`: Richiede aiuto dalla community
- `priority: high`: Priorità alta
- `priority: low`: Priorità bassa

## 🔄 Pull Request

### 1. Template PR
```markdown
## Descrizione
Breve descrizione delle modifiche.

## Tipo di Cambiamento
- [ ] Bug fix (cambiamento che risolve un problema)
- [ ] Nuova feature (cambiamento che aggiunge funzionalità)
- [ ] Breaking change (fix o feature che causerebbe funzionalità esistenti a non funzionare come previsto)
- [ ] Documentazione (aggiornamento alla documentazione)

## Come Testato
Descrivi i test che hai eseguito per verificare le tue modifiche.

## Checklist
- [ ] Il mio codice segue le convenzioni di stile del progetto
- [ ] Ho eseguito una self-review del mio codice
- [ ] Ho commentato il mio codice, particolarmente nelle aree difficili da capire
- [ ] Ho fatto le modifiche corrispondenti alla documentazione
- [ ] Le mie modifiche non generano nuovi warning
- [ ] Ho aggiunto test che dimostrano che il mio fix è efficace o che la mia feature funziona
- [ ] I test nuovi ed esistenti passano localmente con le mie modifiche
- [ ] Qualsiasi modifica dipendente è stata unita e pubblicata
```

### 2. Review Process
1. **Self Review**: Rivedi il tuo codice prima di aprire la PR
2. **CI Checks**: Assicurati che tutti i test passino
3. **Code Review**: Aspetta la review da parte dei maintainer
4. **Address Feedback**: Rispondi ai commenti e fai le modifiche necessarie
5. **Merge**: Una volta approvata, la PR verrà unita

### 3. Criteri di Approvazione
- ✅ Codice ben testato
- ✅ Documentazione aggiornata
- ✅ Nessun breaking change non documentato
- ✅ Performance non degradate
- ✅ Accessibilità mantenuta
- ✅ Compatibilità browser verificata

## 🚀 Release Process

### 1. Versioning (Semantic Versioning)
```
MAJOR.MINOR.PATCH
1.0.0 → 1.0.1 (bug fix)
1.0.1 → 1.1.0 (nuova feature)
1.1.0 → 2.0.0 (breaking change)
```

### 2. Changelog
```markdown
# Changelog

## [1.1.0] - 2024-01-15

### Added
- Nuova funzionalità di condivisione progetti
- Supporto per video in formato MOV

### Changed
- Migliorata performance del caricamento immagini
- Aggiornata UI del pannello caption

### Fixed
- Risolto bug nel salvataggio progetti
- Corretto problema di layout su mobile

### Removed
- Rimosso supporto per browser IE11
```

### 3. Release Steps
```bash
# 1. Aggiorna versioni
npm version patch  # o minor/major

# 2. Aggiorna changelog
# 3. Crea release tag
git tag v1.1.0
git push origin v1.1.0

# 4. Crea GitHub Release
# 5. Deploy automatico (se configurato)
```

## 📞 Supporto

### Canali di Comunicazione
- **GitHub Issues**: Per bug report e feature requests
- **GitHub Discussions**: Per domande e discussioni generali
- **Email**: Per questioni private o sensibili

### Code of Conduct
- Sii rispettoso e inclusivo
- Costruisci su idee altrui
- Accetta feedback costruttivo
- Concentrati su ciò che è meglio per la community

### Riconoscimenti
I contributori verranno riconosciuti in:
- README.md (sezione Contributors)
- CHANGELOG.md (per ogni release)
- GitHub Contributors page

---

Grazie per aver contribuito a Visual Gram Lab! Ogni contributo, grande o piccolo, è apprezzato e aiuta a migliorare il progetto per tutti gli utenti. 🚀
