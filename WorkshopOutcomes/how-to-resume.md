# Come riprendere il workshop Meridian — Guida operativa

Questo file contiene i prompt chiave usati durante il workshop del 2026-04-27.
Aprilo in una nuova sessione con `@WorkshopOutcomes/how-to-resume.md` per avere
subito il contesto operativo completo.

---

## Stato al momento del salvataggio

- Tutti i requisiti R1–R4 e D1–D3 consegnati e pushati su `main`
- Remote: `git@github.com:andreasalmoiraghi-acn/meridian-workshop.git`
- Ultimo commit su main: `e23dcbc` (backend restocking tests)
- Test: **32 E2E** (Playwright) + **16 backend** (pytest) — tutti passing
- PR #1 aperta su `delivery/meridian-engagement`: https://github.com/andreasalmoiraghi-acn/meridian-workshop/pull/1
- GitHub App for Claude installata (automated review attivo)
- GitHub PAT salvato in `~/.zshrc` come `GITHUB_PERSONAL_ACCESS_TOKEN` (scope: `repo`)

---

## Avviare l'ambiente

```
/start
```

Oppure manualmente:
```bash
# Backend (porta 8001)
cd server && uv run python main.py

# Frontend (porta 3000)
cd client && npm run dev
```

Verifica: http://localhost:3000 e http://localhost:8001/docs

---

## Prompt usati nelle fasi chiave

### ACT 1 — Proposta

**Leggere l'RFP insieme:**
```
Leggiamo insieme l'RFP che è arrivata: @docs/rfp/MC-2026-0417.md
```

**Research background:**
```
Leggi anche @docs/rfp/meridian-background.md e @docs/rfp/vendor-handoff.md
e dimmi cosa noti sul vendor precedente
```

**Domande di chiarimento:**
```
Prepara 3-5 domande che manderemo a procurement prima di rispondere
```

**Technical approach con Plan Mode:**
```
[Shift+Tab per entrare in Plan Mode]
Scrivi la sezione technical approach della proposta in proposal/technical-approach.md
```

**Capabilities deck:**
```
Genera il capabilities deck come file HTML self-contained in proposal/capabilities-deck.html.
Aprilo nel browser quando hai finito.
```

---

### ACT 2 — Implementazione

**Avvio Act 2:**
```
/start
```

**R1 — Debug Reports:**
```
La pagina Reports ha dei problemi. Esplora il codebase e dimmi cosa trovi
di sbagliato rispetto al resto dell'applicazione.
```

**R4 — Architecture docs:**
```
Esplora il codebase e genera una documentazione dell'architettura attuale
come file HTML in proposal/architecture.html. Aprila nel browser.
```

**R2 — Restocking (con Plan Mode):**
```
[Shift+Tab per Plan Mode]
Dobbiamo implementare una nuova vista Restocking che mostra raccomandazioni
di riordino basate su stock, domanda e un budget massimo impostabile dall'utente.
Serve sia il backend FastAPI che il frontend Vue.
```

**Review multi-agente parallela dopo R2:**
```
Utilizza gli agenti a disposizione per riverificare il codice e verificare
se ci sono ottimizzazioni necessarie. Effettua anche una verifica dal punto
di vista della sicurezza.
```
*(Claude lancia in parallelo: security-auditor, code-reviewer, vue-expert)*

**D3 — Dark mode su worktree:**
```
procediamo su branch dedicato
```
*(Claude crea il worktree, sviluppa dark mode, fa merge)*

**Eseguire i test R3:**
```
esegui i test di R3
```

**D2 — i18n delegato all'agente:**
```
pusha prima su remote. Poi procedi con D1 e D2.
Ingaggia gli agenti a disposizione per i task delegabili.
```

**D1 — UI refresh:**
*(gestito automaticamente dall'agente vue-expert nel prompt precedente)*

---

## Pattern di prompt che funzionano bene

### Delegare a un agente con brief preciso
```
Usa il vue-expert agent per [task specifico].
Vincoli: non cambiare la struttura template, il build deve passare,
modifica solo [lista file].
```

### Chiedere review parallela
```
Lancia in parallelo security-auditor, code-reviewer e vue-expert
sui file modificati in questa sessione. Risolvi tutti i findings
prima di committare.
```

### Worktree per feature isolata
```
Crea un worktree su branch feature/[nome] e implementa [feature].
Quando sei pronto fai merge su main e rimuovi il worktree.
```

### Comprimere il contesto a metà sessione
```
/compact
```

### Verificare MCP connessi
```
/mcp
```

---

## Cosa esplorare in una sessione futura

### ✅ Già usato (sessione di follow-up 2026-04-27)

**Playwright MCP** — usato e documentato in `tests/e2e/restocking-budget-mcp.spec.ts`
- Flusso: `browser_navigate` → `browser_snapshot` (accessibility tree) → selettori da DOM live → test scritti
- 5 test: initial state, $76K budget, greedy allocation (SRV-301 + PSU-508), clear budget, tiny budget
- Attivare nelle prossime sessioni: al lancio di Claude Code, approvare i project MCP servers; poi `/mcp` per conferma

**Backend tests con skill** — usato per `tests/backend/test_restocking.py` (16 test)
- Skill: `.claude/skills/backend-api-test/SKILL.md`
- Edge case documentato: `budget=0` trattato come "no budget" per Python truthiness

**PR + GitHub App**
- PR #1: `delivery/meridian-engagement` → `main`, lasciata aperta come artifact
- GitHub App installata: https://github.com/apps/claude
- GitHub MCP: configurato con PAT in `~/.zshrc`; richiede restart Claude Code per leggere la variabile

---

### Non ancora usato — alto valore

**`/ultrareview`** — review multi-agente cloud dell'intero branch
- Richiede GitHub remote configurato (già fatto)
- Analisi cross-cutting: sicurezza, performance, accessibilità, coerenza API
- Prompt: semplicemente `/ultrareview` dal prompt

**Hook bloccante custom**
- File: `.claude/hooks/pre-tool-use.sh`
- Evento da configurare in `settings.json`: `PreToolUse`
- Esempio utile: bloccare scritture su `.env` o `server/data/`
- Exit code `2` + messaggio stderr → Claude non può procedere

**`/model`** — switch modello nella sessione
- Haiku per task veloci (grep, log, rename)
- Sonnet/Opus per reasoning complesso (algoritmi, debugging)

### Esercizi pratici

**Aggiungere una nuova skill:**
```
Crea una skill in .claude/skills/vue-component/ che documenta
il pattern standard per creare un nuovo view component in questo progetto.
```

**Scrivere test backend con la skill esistente:**
```
Usa la skill backend-api-test per scrivere i test pytest
per l'endpoint /api/restocking in tests/backend/
```

**Reset e redo di un requirement:**
```
/reset-branch
```
*(poi riparti da uno specifico requirement come esercizio)*

---

## File di riferimento utili

| File | Contenuto |
|---|---|
| `docs/rfp/MC-2026-0417.md` | RFP originale con tutti i requisiti |
| `docs/rfp/vendor-handoff.md` | Note del vendor precedente |
| `.claude/agents/*.md` | Definizione degli agenti custom |
| `.claude/commands/*.md` | Slash commands disponibili |
| `.claude/skills/backend-api-test/SKILL.md` | Pattern per test backend |
| `.claude/hooks/README.md` | Documentazione hook disponibili |
| `WorkshopOutcomes/recap-act1-act2-lesson-learned.md` | Recap completo del workshop |
| `WorkshopOutcomes/claude-code-feature-tour.md` | Tour delle feature Claude Code |

---

## Come iniziare una nuova sessione

```
@WorkshopOutcomes/how-to-resume.md

Ho completato il workshop Meridian. Voglio [scegli uno]:
- esplorare il Playwright MCP che non abbiamo usato
- fare un esercizio su [requirement specifico]
- approfondire [feature Claude Code specifica]
```
