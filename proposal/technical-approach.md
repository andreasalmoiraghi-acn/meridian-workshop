# Technical Approach
**RFP #MC-2026-0417 — Meridian Components**

---

Il sistema attuale è funzionante ma incompleto: il team Operations lavora con un modulo Reports non affidabile, senza la visibilità necessaria per decisioni di acquisto, e il team IT non può approvare modifiche in assenza di copertura di test. Il nostro approccio sblocca prima i vincoli operativi e tecnici esistenti — R3 e R1 — e costruisce le nuove funzionalità su basi solide e verificabili.

Il diagramma architetturale dello stato attuale e futuro del sistema è allegato in `architecture-diagram.html`.

---

## Architettura del sistema

Il sistema è composto da due livelli principali: un frontend single-page in **Vue 3** (porta 3000) e un backend API in **Python FastAPI** (porta 8001), con dati gestiti tramite file JSON strutturati. Non è presente un database relazionale — la persistenza è file-based, adeguata al volume attuale e alla natura distribuita dei tre magazzini.

```
Browser
  └─ Vue 3 SPA (Vite, porta 3000)
       ├─ Viste: Dashboard, Inventory, Orders, Demand, Spending, Reports, [Restocking]
       ├─ Componenti condivisi: FilterBar, Modali, LanguageSwitcher
       ├─ Composables: useFilters, useI18n, useAuth
       └─ api.js  ──────────────────────────────────────────────────────►  FastAPI (porta 8001)
                                                                              ├─ /api/inventory
                                                                              ├─ /api/orders
                                                                              ├─ /api/demand
                                                                              ├─ /api/spending/*
                                                                              ├─ /api/reports/*
                                                                              ├─ /api/backlog
                                                                              ├─ /api/tasks
                                                                              └─ /api/restocking  [nuovo]
                                                                                    └─ server/data/*.json
```

Il sistema di filtri (magazzino, categoria, periodo, stato ordine) è centralizzato nel composable `useFilters` e propagato a tutte le viste tramite `FilterBar`. L'internazionalizzazione è gestita da un sistema custom con file di traduzione separati per lingua (`en`, `ja`).

---

## Infrastruttura

### Stato attuale

L'RFP (§2) indica che il sistema è attualmente **ospitato internamente** su infrastruttura Meridian. Le note di handoff del vendor precedente confermano uno stack leggero: processo Node.js per il frontend (Vite, porta 3000) e processo Python per il backend (FastAPI, porta 8001), con persistenza su file JSON locali. Non è documentata alcuna configurazione di reverse proxy, load balancer o sistema di deployment automatizzato.

### Requisiti per l'engagement

Per garantire un ciclo di sviluppo e rilascio controllato, l'engagement richiede i seguenti ambienti:

| Ambiente | Scopo | Requisiti minimi |
|---|---|---|
| **Sviluppo** | Lavoro del vendor, iterazioni quotidiane | Accesso remoto al repository sorgente |
| **Staging** | Validazione interna e review con Meridian prima di ogni rilascio | Server con Node.js 18+, Python 3.11+, rete accessibile al team Meridian |
| **Produzione** | Sistema in uso dal team Operations | Ambiente esistente Meridian; procedure di deploy da concordare con IT |

Il passaggio da staging a produzione richiede un processo di approvazione formale da parte del team IT Meridian prima di ogni rilascio.

### Raccomandazioni

L'assenza di un database relazionale è adeguata allo stato attuale. Se il volume di dati o il numero di utenti concorrenti dovesse crescere significativamente, una migrazione a un database strutturato è consigliabile come evoluzione futura — fuori scope per questo engagement ma documentata in R4 come punto aperto per il team IT.

**Dipendenze esterne:**
- Conferma da IT dell'infrastruttura di hosting attuale (server, OS, porte esposte) — necessaria entro settimana 1
- Provisioning ambiente di staging da parte di Meridian IT — necessario entro inizio settimana 3 (blocca rilascio Fase 2)
- Accesso al repository sorgente per il vendor — necessario al kick-off

---

## R1 — Remediation del modulo Reports

**Problema:** il modulo Reports è stato consegnato incompleto dal vendor precedente. I filtri globali non sono applicati, le chiamate API non seguono il pattern centralizzato del resto dell'applicazione, le stringhe non sono internazionalizzate e sono presenti inconsistenze nei formatter dei dati.

**Intervento:**

| Componente | Azione |
|---|---|
| `Reports.vue` | Collegamento al composable `useFilters` per applicare i filtri globali |
| `api.js` | Aggiunta degli endpoint Reports al client centralizzato |
| Backend `/api/reports/*` | Estensione con supporto ai parametri di filtro (magazzino, periodo) |
| Stringhe UI | Migrazione al sistema i18n esistente (`en.js`, `ja.js`) |
| Formatter numeri | Allineamento alle utility condivise già presenti |
| Logging | Rimozione del rumore di console non intenzionale |

Ogni modifica viene coperta dai test automatizzati (R3) prima del rilascio in produzione.

**Dipendenze esterne:**
- Conferma da Operations dei requisiti di business attesi dal modulo Reports (metriche, filtri, formati) — necessaria entro settimana 2 per non bloccare l'audit
- Ambiente di staging disponibile per la validazione prima del rilascio (vedi sezione Infrastruttura)

---

## R2 — Restocking recommendations

**Approccio in due fasi:**

**Fase 1 — Definizione della logica di business** (con il team Operations)
Prima di scrivere una riga di codice, documentiamo le regole operative: soglie di riordino per categoria e magazzino, peso della domanda storica vs. forecast, gestione del budget ceiling fornito dall'operatore. Questo produce una specifica funzionale validata da Meridian.

**Fase 2 — Implementazione**

| Componente | Descrizione |
|---|---|
| `Restocking.vue` | Nuova vista con input budget, tabella raccomandazioni, filtro per magazzino |
| `RestockingDetailModal.vue` | Dettaglio ordine d'acquisto raccomandato con breakdown per SKU |
| `api.js` | Nuovo metodo `getRestockingRecommendations(budget, warehouse)` |
| Backend `/api/restocking` | Endpoint che aggrega dati di stock, demand forecast e backlog; restituisce lista ordinata di raccomandazioni d'acquisto con priorità e costo stimato |
| Routing | Aggiunta della voce Restocking alla navigazione principale |

L'endpoint backend accede ai dati già presenti nel sistema (inventario, domanda, backlog) senza richiedere nuove sorgenti dati. La logica di raccomandazione è parametrica e configurabile senza modifiche al codice.

**Dipendenze esterne:**
- Disponibilità del referente Operations (presumibilmente R. Tanaka) per la sessione di definizione delle regole di business — necessaria in settimana 1–2; il mancato allineamento in questa finestra ritarda l'avvio della Fase 3
- Conferma delle soglie di riordino e della logica di priorità: se Meridian non dispone di regole documentate, il vendor facilita un workshop strutturato (mezza giornata) per estrarle

---

## R3 — Test automatizzati

**Framework:** Playwright, per copertura browser end-to-end con supporto a flussi multi-step e assertion su stato UI.

**Flussi coperti (da concordare con IT prima dell'avvio):**

| Flusso | Priorità |
|---|---|
| Reports: applicazione filtri e verifica dati restituiti | Alta |
| Restocking: inserimento budget e validazione raccomandazioni | Alta |
| Inventory: navigazione e dettaglio prodotto | Media |
| Orders: filtro per stato e magazzino | Media |
| Switch lingua (EN/JA) e verifica traduzione | Media |

I test sono organizzati per vista, eseguibili in CI e documentati per consentire al team IT di Meridian di estenderli autonomamente. Vengono avviati in parallelo con R1 e aggiornati a ogni nuovo deliverable.

**Dipendenze esterne:**
- Definizione dei flussi critici da parte di IT Meridian — necessaria entro settimana 1 per non bloccare il setup
- Ambiente di staging raggiungibile dall'infrastruttura di esecuzione dei test
- Eventuale pipeline CI già esistente in Meridian: se presente, i test verranno integrati; se assente, il vendor proporrà una configurazione minimale

---

## R4 — Documentazione architetturale

Produrremo un documento interattivo in formato HTML che copre: stack tecnologico, flussi dati tra frontend e backend, elenco degli endpoint API con parametri, struttura dei componenti frontend e pattern di estensione. Il documento è calibrato per il team IT di Meridian — non presuppone conoscenza del codebase — e viene consegnato prima della chiusura dell'engagement.

**Dipendenze esterne:**
- Accesso al sistema in esecuzione per la verifica del comportamento runtime (non solo del codice sorgente)
- Disponibilità del team IT per una sessione di review del documento prima della consegna finale — mezza giornata stimata

---

## Desired items (D1–D3)

**D1 — UI modernization:** nella fase iniziale dell'engagement presenteremo una proposta visiva (palette, tipografia, layout) da concordare con Meridian prima di qualsiasi implementazione. Le modifiche vengono applicate tramite il sistema di design token già presente nel codebase, limitando l'impatto sulle viste esistenti.

> **Dipendenze:** conferma del referente design/brand di Meridian e fornitura di eventuali linee guida visive — necessaria entro settimana 5 per non bloccare l'implementazione in Fase 3.

**D2 — Internazionalizzazione:** il sistema i18n è già operativo per Dashboard, Inventory, Orders, Demand e Spending. L'estensione copre i moduli mancanti (Reports, Restocking) e le eventuali lingue aggiuntive da concordare, senza modificare l'infrastruttura esistente.

> **Dipendenze:** conferma delle lingue target e fornitura dei glossari di traduzione da parte di Meridian (in particolare per il team Tokyo) — necessaria entro settimana 6.

**D3 — Dark mode:** sviluppo su branch isolato, senza impatto sul sistema in produzione. Il tema viene attivato tramite variabili CSS, con selezione persistita per postazione. Zero rischio di regressione sulle viste correnti fino alla validazione finale.

> **Dipendenze:** nessuna dipendenza esterna bloccante. Richiede approvazione visiva da parte di Operations prima del merge.

---

## Sicurezza

L'applicazione è un sistema interno, accessibile dalla rete Meridian. L'approccio alla sicurezza per questo engagement si articola su tre livelli:

**Hardening dell'esistente**
- Revisione delle configurazioni CORS (attualmente aperte): restrizione agli host autorizzati Meridian
- Verifica dell'assenza di credenziali o dati sensibili nel codice sorgente o nei file di dati
- Revisione dei log applicativi per escludere esposizione involontaria di dati operativi

**Pratiche di sviluppo sicuro**
- Validazione degli input sugli endpoint API nuovi e modificati (R1, R2)
- Nessun dato utente inserito direttamente in template HTML senza sanitizzazione (prevenzione XSS)
- Dependency audit delle librerie frontend e backend prima del rilascio finale

**Governance**
- Security review automatica su ogni modifica al codebase tramite l'agente `security-auditor` integrato nel workflow di sviluppo
- Nessuna credenziale di sistema nei file di configurazione — gestione tramite variabili d'ambiente

> **Dipendenze esterne:** fornitura da parte di IT Meridian delle policy di sicurezza interne applicabili (whitelist host, requisiti di autenticazione, politiche di logging) — necessaria entro settimana 1.

---

## Integration testing

I test di integrazione verificano il comportamento del sistema end-to-end: dal frontend, attraverso le API, fino ai dati restituiti. Si distinguono dai test unitari (singoli componenti isolati) e dai test E2E Playwright (flussi utente nel browser).

**Scope:**
- Correttezza delle risposte API per ogni endpoint modificato o nuovo (R1, R2)
- Coerenza dei dati tra frontend e backend dopo l'applicazione dei filtri
- Comportamento degli endpoint in condizioni limite: filtri combinati, dati assenti, parametri non validi

**Approccio:**
I test di integrazione vengono scritti in parallelo allo sviluppo, uno strato sotto i test E2E Playwright. Ogni nuovo endpoint (R2) e ogni endpoint modificato (R1) viene coperto prima del rilascio in staging. I test fanno parte del repository e vengono consegnati come asset permanente insieme ai test E2E.

**Strumenti:** test suite Python (pytest) per il backend FastAPI; test Playwright per la verifica del flusso dati frontend-backend.

> **Dipendenze esterne:** ambiente di staging con dati rappresentativi del comportamento atteso — necessario entro settimana 3. Se i dati di staging differiscono significativamente da quelli di produzione, alcuni test potrebbero richiedere calibrazione post-UAT.

---

## Approccio UAT

L'User Acceptance Testing è la fase in cui il team Meridian valida che i deliverable soddisfino i requisiti operativi reali, non solo le specifiche tecniche.

**Struttura:**

| Fase UAT | Timing | Partecipanti | Oggetto |
|---|---|---|---|
| UAT intermedio | Fine settimana 5 (dopo R1) | Operations + IT | Modulo Reports e test automatizzati base |
| UAT principale | Fine settimana 9 (dopo R2) | Operations + IT | Sistema completo: R1, R2, R3, R4 |
| UAT finale | Settimana 10 | Operations | Item desiderati approvati (D1–D3) |

**Processo per ogni sessione UAT:**
1. Il vendor prepara un ambiente di staging aggiornato e una checklist di accettazione per ogni requisito
2. Il team Operations esegue i flussi operativi reali (non scenari di test costruiti) e segnala eventuali scostamenti
3. Il vendor categorizza i feedback: bloccante (fix obbligatorio prima del rilascio), migliorativo (pianificato in fase successiva), fuori scope
4. Il rilascio in produzione avviene solo dopo sign-off esplicito da Operations e IT

**Criteri di accettazione:** concordati con Meridian al kick-off sulla base dei requisiti R1–R4. Nessun requisito obbligatorio viene chiuso senza approvazione formale.

> **Dipendenze esterne:** disponibilità del team Operations per le sessioni UAT nelle finestre indicate (stimato: mezza giornata per UAT intermedio, una giornata per UAT principale) — da confermare al kick-off e da inserire nel calendario Meridian con anticipo.

---

## Approccio generale

Ogni fase dell'engagement prevede momenti di validazione con i referenti di Meridian prima di procedere. Le decisioni funzionali vengono prese con il team Operations; le decisioni di governance tecnica con IT. Nessun deliverable viene chiuso senza approvazione esplicita. L'obiettivo non è solo consegnare i requisiti dell'RFP, ma lasciare a Meridian un sistema che il proprio team sappia gestire e fare evolvere in autonomia.
