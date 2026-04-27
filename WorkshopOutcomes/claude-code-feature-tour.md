# Tour delle feature Claude Code — Meridian Workshop

---

## 1. Slash Commands — `.claude/commands/`

Un comando slash è un file Markdown in `.claude/commands/<nome>.md`. Quando scrivi `/nome` nel prompt, Claude legge quel file e lo esegue come istruzione. È il modo per incapsulare procedure ripetibili in un'interfaccia a una parola.

**Comandi presenti nel repo:**

| Comando | File | Cosa fa |
|---|---|---|
| `/start` | `commands/start.md` | Killa le porte 3000/8001, avvia FastAPI + Vite in background |
| `/stop` | `commands/stop.md` | Ferma i server |
| `/test` | `commands/test.md` | Lancia la suite Playwright |
| `/optimize` | `commands/optimize.md` | Scan completo del codebase: dead code, import inutilizzati, duplicati |
| `/demo-branch` | `commands/demo-branch.md` | Setup rapido per demo su branch isolato |
| `/reset-branch` | `commands/reset-branch.md` | Reset dello stato per re-run del workshop |

**Come funziona internamente** — `/start` contiene questo:

```markdown
Kill any existing servers on ports 3000 and 8001, then start both
the backend (FastAPI on port 8001) and frontend (Vite on port 3000).

Backend: cd server && uv run python main.py
Frontend: cd client && npm run dev
```

Claude legge il Markdown, interpreta le istruzioni, ed esegue i comandi bash appropriati. Non è scripting — è linguaggio naturale strutturato.

**Quando crearli:** ogni procedura che ripeti più di due volte in un progetto (setup ambiente, deploy, seed database, run specifici test). Il file vive nel repo → è versionato, condiviso con il team, disponibile a tutti i membri che usano Claude Code sullo stesso progetto.

**Comandi built-in da conoscere** (non in `.claude/commands/`, ma sempre disponibili):
- `/compact` — comprime la cronologia del contesto mantenendo i fatti chiave
- `/model` — cambia il modello nella sessione corrente
- `/mcp` — mostra i server MCP connessi
- `/memory` — gestisce le memorie persistenti
- `/help` — lista completa

---

## 2. Custom Agents — `.claude/agents/`

Un agente custom è un file Markdown con frontmatter YAML in `.claude/agents/<nome>.md`. Definisce un'istanza specializzata di Claude con: scope preciso, set di tool permessi, modello, e system prompt dedicato. Viene invocato via `Agent tool` (da Claude) o esplicitamente nel prompt.

**Tre agenti nel repo:**

### `vue-expert.md` — Frontmatter
```yaml
name: vue-expert
description: Vue 3 frontend specialist for features, UI components, styling
tools: Read, Write, Edit, Glob, Grep, Bash, mcp__playwright__*
model: sonnet
color: orange
```

Il system prompt insegna all'agente: scope (solo `client/src/`), pattern obbligatori (`v-for :key` su ID unici, validazione date, computed vs methods), anti-pattern da evitare, e una checklist di troubleshooting Vue. L'agente **non tocca** `server/` — è un constraint esplicito nel prompt.

### `security-auditor.md` — Frontmatter
```yaml
name: security-auditor
description: Fast security review focusing on critical vulnerabilities
tools: Read, Grep, Glob   # nessun Write/Edit: solo lettura
model: haiku              # modello più veloce per pattern matching
color: blue
```

Haiku per la velocità (pattern grep su file modificati), strumenti limitati a sola lettura per design — un auditor non deve mai modificare il codice che sta revisionando.

### `code-reviewer.md`
Simile al security auditor ma focalizzato su qualità del codice: consistenza dei pattern, edge cases, Vue best practices.

**Il valore del parallelismo** — durante R2 abbiamo lanciato tutti e tre in simultanea. Ogni agente opera in un contesto separato, non vede il lavoro degli altri, quindi i finding sono genuinamente indipendenti. La parallelizzazione non era solo una questione di velocità: è diversità di prospettiva.

**Quando creare un agente custom vs delegare direttamente:**
- **Agente custom** — task ricorrente, scope ben definito, pattern specifici del progetto da rispettare, oppure vuoi limitare i tool disponibili per sicurezza
- **Delega diretta** — task one-shot, nessun pattern specifico, non vale la pena scrivere un system prompt

---

## 3. Skills — `.claude/skills/`

Una skill è un template di prompt riutilizzabile per task strutturati. Diversamente dai comandi (che eseguono procedure), le skill forniscono **linee guida e pattern** che Claude usa come riferimento quando esegue un certo tipo di lavoro.

**La skill presente:**

```
.claude/skills/backend-api-test/SKILL.md
```

Contiene: struttura directory dei test, 10 pattern con codice esempio (happy path, filter testing, cross-endpoint validation, data type validation...), naming conventions, fixture disponibili, valori di test validi (warehouses, categories, statuses).

**Come si usa:** si invoca nel prompt citando esplicitamente la skill — es. "Usa la skill backend-api-test per scrivere i test per `/api/restocking`". Claude carica `SKILL.md` come contesto aggiuntivo e lo applica durante la generazione del codice.

**Risultato concreto nel workshop:** invocando la skill per `test_restocking.py`, i 16 test generati seguivano esattamente la struttura documentata — classe `TestRestockingEndpoints`, sezioni commentate (happy path / structure / business logic / filters / edge cases), naming convention `test_<comportamento>_<aspettativa>`. Senza la skill, avremmo ottenuto test funzionalmente equivalenti ma stilisticamente inconsistenti con il resto della suite.

**Differenza con un agente:**
- Un **agente** è un'istanza separata con il suo contesto, i suoi tool, il suo modello
- Una **skill** è un documento di riferimento che viene incorporato nel contesto corrente — Claude rimane lo stesso, ma ha "letto il manuale" prima di iniziare

**Quando è utile:** pattern che vuoi standardizzare nel team (come scrivere test, come strutturare un endpoint, come nominare variabili) ma che non vuoi ripetere in ogni prompt. La skill vive nel repo → è la "house style" del progetto.

---

## 4. Hooks — `.claude/hooks/`

Gli hook sono script shell eseguiti automaticamente in risposta a eventi del ciclo di vita di Claude Code. Nessuna configurazione nel prompt — sono sempre attivi, silenziosi, e bloccanti o non-bloccanti a scelta.

**Hook configurato: `post-tool-use.sh`**

```bash
# Trigger: dopo OGNI tool call (Read, Write, Edit, Bash, ...)
# Exit code 0: permette sempre il proseguimento

LOGS_DIR="${CLAUDE_PROJECT_DIR}/logs"
LOG_FILE="${LOGS_DIR}/tool-usage-$(date +%Y-%m-%d).log"

echo "=== Tool Usage: $TIMESTAMP ===" >> "$LOG_FILE"
echo "Tool: $TOOL_NAME" >> "$LOG_FILE"
echo "Input: $TOOL_INPUT" >> "$LOG_FILE"
```

Ogni tool call viene loggata in `.claude/logs/tool-usage-YYYY-MM-DD.log`. Utile per audit trail, debugging di sessioni complesse, o per capire retrospettivamente cosa ha fatto Claude.

**Gli eventi disponibili:**

| Evento | Quando scatta | Uso tipico |
|---|---|---|
| `PreToolUse` | Prima di ogni tool | Bloccare operazioni su file sensibili |
| `PostToolUse` | Dopo ogni tool | Logging, linting automatico |
| `UserPromptSubmit` | Quando invii un messaggio | Pre-commit checks, validazione |
| `Stop` | Quando Claude finisce | Notifiche, cleanup |
| `SubagentStop` | Quando un subagent finisce | Aggregare risultati |
| `SessionStart` | Inizio sessione | Setup ambiente |

**Exit codes:**
- `0` → l'azione procede normalmente
- `2` → l'azione viene **bloccata** (il messaggio stderr viene mostrato a Claude)
- Qualsiasi altro valore → errore, ma l'azione prosegue

**Esempio concreto di hook bloccante** (non implementato, ma mostrativo):

```bash
#!/bin/bash
# PreToolUse: blocca scritture su file .env
TOOL=$(echo "$INPUT" | jq -r '.tool_name')
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

if [[ "$TOOL" == "Write" || "$TOOL" == "Edit" ]] && [[ "$FILE" == *".env"* ]]; then
  echo "Hook blocked: cannot write to .env files" >&2
  exit 2
fi
exit 0
```

Claude riceverebbe "Hook blocked: cannot write to .env files" e non potrebbe procedere con la scrittura.

---

## 5. Permissions — `.claude/settings.local.json`

Il file definisce quali comandi bash Claude può eseguire **senza chiedere conferma** all'utente. È un allowlist esplicito — tutto il resto richiede approvazione manuale.

```json
{
  "permissions": {
    "allow": [
      "Bash(git add *)",
      "Bash(git commit -m ' *)",
      "Bash(npm run *)",
      "Bash(npx playwright *)",
      "Bash(git worktree *)"
    ]
  }
}
```

**Il principio:** pattern glob, non comandi esatti. `Bash(npm run *)` permette qualsiasi `npm run <script>` senza prompt, ma `npm install <pacchetto>` richiederebbe approvazione perché non matcha.

**Perché è importante:** senza permissions configurate, ogni tool call richiede conferma dell'utente — corretto per sicurezza, ma rallenta il flusso in un progetto dove i comandi sicuri sono noti. Il file `.local.json` non viene committato (è in `.gitignore` di default) — è configurazione per-macchina, non per-repo.

---

## 6. Worktrees — riassunto tecnico

```bash
# Struttura risultante:
git worktree add ../meridian-workshop-backlog -b feature/backlog-nav
# → crea /meridian-workshop-backlog/  con branch feature/backlog-nav
# → /meridian-workshop/ rimane su main
# → stesso .git, indice separato

git worktree list
# /Projects/meridian-workshop          a38adef [main]
# /Projects/meridian-workshop-backlog  a38adef [feature/backlog-nav]

git worktree remove ../meridian-workshop-backlog  # rimozione
git branch -d feature/backlog-nav                 # pulizia branch
```

**Cosa li rende diversi da un branch normale:**
- Un `git checkout` cambia i file nella directory corrente
- Un worktree crea una directory parallela — puoi avere due processi attivi (es. dev server su `:3000` e `:3001`) senza nessun `stash`
- Ogni worktree ha il suo `index` e `HEAD` separati — commit su uno non impattano l'altro finché non fai merge

---

## 7. Playwright MCP — test da DOM live

Il Playwright MCP è un server MCP già configurato in `.mcp.json` nel repo. Quando approvato al lancio di Claude Code ("approve project MCP servers"), i tool `mcp__playwright__*` diventano disponibili nella sessione.

**Tool principali:**

| Tool | Cosa fa |
|---|---|
| `browser_navigate` | Naviga a un URL nel browser controllato |
| `browser_snapshot` | Restituisce l'accessibility tree del DOM corrente (con `ref` per ogni elemento) |
| `browser_click` | Clicca su un elemento via `ref` |
| `browser_fill_form` | Compila un form |
| `browser_take_screenshot` | Screenshot della pagina corrente |

**Il flusso usato nel workshop:**

1. `browser_navigate('/restocking')` — apre la pagina
2. `browser_snapshot()` — ispeziona il DOM; restituisce struttura ad albero con tutti gli elementi accessibili, i loro ruoli, testi e `ref`
3. Da quello snapshot: identifica i selettori reali (es. `.stat-card.success` per il budget card, `getByPlaceholder(/enter budget/i)` per l'input)
4. Scrive i test Playwright usando quei selettori — già verificati sul DOM live
5. Esegue i test via CLI per conferma finale

**Differenza chiave rispetto alla CLI:**

Con la CLI i selettori vengono inferiti dal codice sorgente (es. "il template usa `class="stat-card success"` quindi uso `.stat-card.success`"). Con il MCP vengono letti dall'accessibility tree del DOM renderizzato — considera il CSS, i `v-if`, i componenti dinamici. Il caso concreto nel workshop: `getByText('Within Budget')` avrebbe restituito 3 elementi (label del card + 2 badge nella tabella) → strict mode violation. Il DOM snapshot mostrava subito la struttura effettiva e il selettore corretto.

**Come attivare:**
1. Aprire Claude Code nella directory del repo
2. Al prompt iniziale "approve project MCP servers" → approvare
3. Verificare con `/mcp` che `playwright` sia nello stato `connected`
4. I tool sono ora disponibili e Claude li usa automaticamente quando appropriato

---

## Mappa delle feature per scenario

| Scenario | Feature da usare |
|---|---|
| Avviare l'ambiente di sviluppo | `/start` (slash command) |
| Task frontend ripetitivo e ben definito | `vue-expert` (custom agent) |
| Review sicurezza prima di un merge | `security-auditor` (custom agent) |
| Scrivere test backend con pattern standard | `backend-api-test` (skill) |
| Scrivere test E2E con selettori verificati sul DOM | Playwright MCP (`mcp__playwright__*`) |
| Prevenire scritture accidentali su file critici | Hook `PreToolUse` con exit 2 |
| Audit trail di tutto quello che Claude ha fatto | Hook `PostToolUse` → log file |
| Prototipare una feature rischiosa senza toccare main | Worktree su branch dedicato |
| Liberare finestra di contesto a metà sessione | `/compact` |
| Cambiare modello per un task specifico | `/model` |
| Verificare MCP server connessi | `/mcp` |
| Operazioni GitHub (PR, issue, commenti) | GitHub MCP (richiede PAT con scope `repo` in `GITHUB_PERSONAL_ACCESS_TOKEN`) |
