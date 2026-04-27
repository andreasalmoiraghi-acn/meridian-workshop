# Workshop Recap — Meridian Components Engagement

---

## ACT 1 — Risposta alla RFP

### Richiesta e obiettivi

Meridian Components ha emesso l'RFP `MC-2026-0417` per modernizzare il loro inventory dashboard. L'obiettivo di Act 1 era produrre un **pacchetto proposta completo** prima di toccare una riga di codice — replicando il processo reale di un'agenzia di consulenza che risponde a un bando.

Output attesi (da RFP §4):
- Executive summary
- Technical approach
- Timeline
- Pricing assumptions
- Capabilities deck (slide)

---

### Cosa è stato fatto

| Step | Output | File |
|---|---|---|
| Lettura RFP | Analisi requisiti R1–R4, D1–D3 | `docs/rfp/MC-2026-0417.md` |
| Background research | Gap analysis vendor precedente | `docs/rfp/meridian-background.md`, `vendor-handoff.md` |
| Clarifying questions | 5 domande a procurement | (in chat) |
| Executive summary | 1 pagina, orientata a Tanaka (VP Ops) | `proposal/executive-summary.md` |
| Technical approach | Narrativa per requirement, con assunzioni | `proposal/technical-approach.md` |
| Timeline | Fasi, milestone, dipendenze | `proposal/timeline.md` |
| Pricing | Assunzioni T&M, rischi, buffer | `proposal/pricing.md` |
| Capabilities deck | HTML self-contained, iterato visivamente | `proposal/capabilities-deck.html` |
| Architecture overview | Diagramma HTML dello stack esistente | `proposal/architecture.html` |

---

### Modalità Claude Code usate

**`@` file reference** — citare direttamente `@docs/rfp/MC-2026-0417.md` nel prompt ha portato il contenuto nel contesto senza dover fare copia-incolla. Utile anche per confrontare più documenti insieme (`@vendor-handoff.md` + `@rfp`).

**Plan Mode (`Shift+Tab`)** — usato prima di scrivere il technical approach. Plan Mode blocca le scritture: Claude propone struttura e outline, tu approvi o riorienti, poi si esegue. Evita di ricevere un documento già scritto che non rispecchia le tue priorità.

**Write tool** — ogni sezione proposta scritta direttamente nel filesystem. Il flusso "draft → feedback → revisione" su ogni sezione prima di passare alla successiva ha evitato il problema classico del "muro di testo" indigeribile.

---

### Cosa avrebbe potuto aiutare (non usato)

**`/compact`** — Act 1 genera molto testo nel contesto (RFP, background docs, bozze). `/compact` chiede a Claude di comprimere la cronologia mantenendo i fatti chiave, liberando finestra di contesto. Da usare dopo aver finito ogni sezione prima di iniziare la successiva, specialmente in sessioni lunghe.

**`AskUserQuestion` tool** — usato parzialmente per le clarifying questions. Avrebbe potuto simulare meglio l'interazione cliente: Claude fa una domanda alla volta (come in un discovery call reale), tu rispondi, le risposte diventano assunzioni formali nel documento. Più realistico del batch "5 domande in una volta".

**`WebSearch` / `WebFetch`** — per contestualizzare il mercato (competitor, standard UI per dashboards B2B) o verificare se le tecnologie citate nel vendor handoff (versioni di FastAPI, Vue) fossero ancora attuali. Utile nella sezione "Relevant Experience" per ancorare le affermazioni.

**`TodoWrite`** — avrebbe aiutato a tracciare le sezioni da completare nella proposta, specialmente se Act 1 venisse spalmato su più sessioni. Ogni sezione come task, marcata completed man mano.

---

---

## ACT 2 — Implementazione dell'engagement

### Richiesta e obiettivi

Dopo aver "vinto il bando", Act 2 è la consegna effettiva: correggere, estendere e documentare il codebase che il vendor precedente ha lasciato incompleto. I requirement dell'RFP diventano statement of work.

Stack: **Vue 3** (Composition API) + **FastAPI** + **Python** backend, **Playwright** per i test.

---

### Cosa è stato fatto

#### R1 — Reports remediation
Il modulo Reports aveva difetti multipli: filtri non collegati ai dati, chiavi i18n mancanti (`nav.reports` hardcoded in inglese), errori console su `/api/tasks` 404, pattern API inconsistenti rispetto al resto dell'app. Risolti audit + fix mirati.

#### R2 — Restocking recommendations
Feature nuova da zero. Backend: endpoint `GET /api/restocking` con modello Pydantic, logica di classificazione priorità (high/medium/low), algoritmo greedy di budget allocation. Frontend: `Restocking.vue` con stats grid, budget bar, tabella completa con badge priorità e stato budget.

Prima di iniziare: **Plan Mode** per allineare struttura dati, algoritmo e UI prima di scrivere codice. Dopo l'implementazione: review parallela con tre agenti.

#### R3 — Automated browser tests
27 test E2E con **Playwright CLI** (`@playwright/test`), 6 spec file che coprono tutti i flussi critici: Dashboard, Inventory, Orders, Reports, Restocking, i18n. Nota: il Playwright MCP non era connesso — soluzione alternativa via CLI, risultato equivalente per l'obiettivo R3.

#### R4 — Architecture documentation
`proposal/architecture.html` — diagramma interattivo dello stack, flussi dati, componenti. Generato esplorando il codebase, scritto come artefatto comprensibile al team IT di Meridian (non solo agli sviluppatori).

#### D3 — Dark mode (prima di D1/D2, su worktree)
Branch isolato `feature/dark-mode` su **git worktree**. `useTheme.js` composable singleton con `localStorage` persistence. CSS custom properties su `[data-theme="dark"]` in App.vue. Merge `--no-ff`, worktree rimosso.

#### D2 — Internazionalizzazione
Delegato al **vue-expert subagent**. 10 file modificati: locale files EN/JA, Backlog.vue, FilterBar.vue, quattro modal components. Zero stringhe hardcoded residue.

#### D1 — UI modernization
Delegato al **vue-expert subagent**. FilterBar convertita da hex literals a CSS variables (dark mode ora funziona ovunque). Design tokens globali aggiunti in App.vue: `.btn-primary`, `.btn-secondary`, `.form-input`, `.empty-state`, accent border su stat cards.

#### Demo worktree formativa
Feature `feature/backlog-nav`: registrazione route + link nav per `Backlog.vue`. Ciclo completo: `worktree add` → sviluppo isolato → build → commit → `merge --no-ff` → `worktree remove`.

---

### Modalità e strumenti Claude Code usati

**Plan Mode (`Shift+Tab`)** — usato prima di R2. Blocca l'esecuzione e forza un passaggio di design: struttura dati, algoritmo, componenti Vue, endpoint FastAPI. Ha evitato un refactor a metà implementazione quando ci siamo resi conto che `recommended_qty` aveva logica diversa per i due tipi di item.

**Subagents** — tre agenti lanciati in parallelo dopo R2:
- `security-auditor`: verifica injection, validazione input, surface exposure
- `code-reviewer`: pattern Vue, consistenza, edge cases
- `vue-expert`: review frontend specifica + successivamente D1 e D2

Ogni agente ha restituito findings indipendenti; tutti risolti prima del commit. Il parallelismo ha ridotto il tempo di review a una singola attesa invece di tre sequenziali.

**Git worktrees** — usati due volte: D3 (dark mode) e la demo formativa. Valore principale: branch isolation senza rinunciare alla possibilità di avere entrambi i dev server attivi contemporaneamente.

**`@` file reference** — per portare nel contesto file specifici durante il debugging di R1 (locale files, componenti Reports) senza dover aprire ogni file separatamente.

**Playwright CLI** — alternativa pragmatica al Playwright MCP non configurato. Stesso risultato per R3, zero dipendenza da configurazione MCP.

---

### Cosa avrebbe potuto aiutare (non usato)

**Playwright MCP** (`.mcp.json` già configurato nel repo) — avrebbe permesso di scrivere i test in modo interattivo: Claude usa gli strumenti `mcp__playwright__*` per navigare l'app in tempo reale, ispezionare il DOM, e generare asserzioni basate su ciò che vede effettivamente. Più potente della CLI per test discovery su UI non documentata. Da attivare: `/mcp` per verificare la connessione, poi riavviare se necessario.

**`/compact`** — Act 2 è lungo. Dopo R2 il contesto era già pesante di schema Pydantic, Vue template, CSS variables. `/compact` avrebbe compresso la storia mantenendo i fatti tecnici chiave (nomi file, decisioni architetturali), rendendo le risposte successive più veloci e precise. Regola pratica: usarlo ogni volta che una fase è completa prima di iniziare la successiva.

**Hook** — il repo ha `.claude/hooks/` configurabile. Uno scenario concreto: un hook `post-edit` che lancia automaticamente `npm run build` ogni volta che Claude modifica un `.vue`, così gli errori di compilazione emergono immediatamente invece che al passo successivo. Oppure un hook che esegue `npx eslint` sui file modificati. Si configura in `settings.json` del progetto.

**`/ultrareview`** — review multi-agente cloud dell'intero branch (non solo dei singoli file). Avrebbe avuto senso prima del push finale su main: analisi cross-cutting di sicurezza, performance, accessibilità, coerenza API. Richiede GitHub remote configurato; si lancia con `/ultrareview` dal prompt.

**Skills (`.claude/skills/`)** — il repo ha una directory skills. Una skill è uno snippet di prompt riutilizzabile invocabile come `/skill-name`. Avrebbe potuto incapsulare pattern ripetuti: "crea un nuovo view Vue con il pattern standard (useFilters + useI18n + loading/error state)" come skill riutilizzabile su R2, D1, e futuri sviluppi.

**`/model`** — possibilità di switchare modello durante la sessione. Per task di scrittura pura (Act 1, doc generation) un modello più veloce è sufficiente; per reasoning complesso (algoritmo greedy R2, debugging R1) si preferisce il modello più capace. Gestire questo esplicitamente invece di usare sempre lo stesso modello avrebbe ottimizzato velocità e costo.

**Worktrees + dev server paralleli** — durante la demo abbiamo creato e mergiato il worktree, ma non abbiamo avviato il dev server *nel* worktree in parallelo a main. In un contesto reale questo è il killer feature: `npm run dev -- --port 3001` nel worktree, confronto visivo live tra main e feature branch in due tab del browser.

---

---

## Lesson Learned e messaggi chiave

### 1. Il contesto è la risorsa più preziosa — gestiscila attivamente
Claude Code non ha memoria persistente tra sessioni, e la finestra di contesto si riempie. `/compact` non è una feature di emergenza — è manutenzione ordinaria. Usarlo dopo ogni fase completata mantiene il modello focalizzato sul lavoro corrente invece che sulla storia del lavoro passato.

### 2. Delega ≠ abdica — brief un agente come un collega, non come un esecutore
I subagent hanno funzionato bene quando il brief era specifico: file esatti, pattern attesi, constraint chiari ("non cambiare la struttura template", "il build deve passare"). Brief vaghi producono lavoro vago. La qualità dell'output dell'agente è proporzionale alla qualità della specifica che gli dai.

### 3. Plan Mode prima di ogni feature non banale
Il costo di Plan Mode è qualche secondo in più. Il beneficio è scoprire i problemi di design *prima* di scrivere 200 righe di codice. In R2 ha evitato un refactor sulla formula `recommended_qty`. È lo stesso motivo per cui un buon sviluppatore disegna prima di scrivere — Claude Code lo rende esplicito e guidato.

### 4. Gli strumenti MCP amplificano quando sono connessi — verificare prima di iniziare
Il Playwright MCP avrebbe cambiato il modo di scrivere i test (interattivo vs statico). Non era connesso e non l'abbiamo scoperto fino a quando era tardi. Pattern da adottare: all'inizio di ogni sessione, `/mcp` per verificare quali server sono attivi, prima di pianificare l'approccio su task che li potrebbero usare.

### 5. I worktree risolvono il problema reale degli esperimenti rischiosi
Lo stash è per "metto via per un momento". Il worktree è per "voglio costruire questo in parallelo senza rischiare main". La distinzione conta quando hai un dev server attivo, test in esecuzione, o un cliente che aspetta la versione stabile.

### 6. La review multi-agente parallela è il pattern più sottovalutato
Tre agenti in parallelo (security, code quality, frontend) hanno trovato cose che un review singolo avrebbe mancato — non per capacità, ma per prospettiva. Il security auditor non pensa alle best practice Vue; il vue-expert non pensa agli header HTTP. La parallelizzazione non è solo velocità: è diversità di angolo di attacco.

### 7. Il flusso narrativo aiuta l'apprendimento, non lo ostacola
Lavorare dentro una narrativa (siamo una società di consulenza, quello è il codice del vendor precedente, Meridian è il cliente) ha reso ogni decisione tecnica contestualizzata. Perché i18n? Perché c'è il magazzino di Tokyo. Perché i test? Perché IT di Meridian li vuole prima di approvare qualunque modifica. Il contesto business rende le scelte tecniche meno arbitrarie e più memorabili.

### 8. Claude Code è un pair programmer, non un code generator
La differenza si vede nei momenti di debugging: non basta "scrivi il codice", serve "questo test fallisce perché il selettore `.stat-value` non esiste in questa vista — guarda `.kpi-value`". Il modello lavora meglio quando riceve feedback precisi su cosa non torna, piuttosto che ricevere istruzioni generiche e dover indovinare il contesto.
