# Timeline e Governance
**RFP #MC-2026-0417 — Meridian Components**

---

Proponiamo un piano in quattro fasi su 10 settimane, con rilasci intermedi verificabili, prototipi di validazione anticipata e una struttura di governance che mantiene il team Meridian allineato a ogni passaggio. Ogni fase si chiude con una phase-gate review formale prima dell'avvio della successiva.

Le dipendenze esterne bloccanti sono indicate per ciascuna fase: il mancato rispetto delle scadenze indicate può slittare le milestone successive.

---

## Milestone

Le milestone principali dell'engagement, inclusi prototipi e sessioni di validazione anticipata:

| ID | Milestone | Settimana | Tipo | Partecipanti |
|---|---|---|---|---|
| M0 | Kick-off — avvio engagement, allineamento su criteri di accettazione | 1 | Evento | PM vendor + Okafor + Tanaka + IT |
| M1 | R4 consegnato + specifica R2 approvata da Operations | 2 | Deliverable | PM + Tanaka |
| M2 | **Prototipo Reports** su staging — validazione anticipata comportamento filtri | 4 | Prototipo | PM + Operations |
| M3 | UAT intermedio R1 — sign-off Reports e test base | 5 | UAT | Operations + IT |
| M4 | **Demo prototipo Restocking** — validazione logica di raccomandazione prima del completamento | 7 | Prototipo | PM + Tanaka |
| M5 | Rilascio candidato completo in staging (R1 + R2 + R3 + R4) | 8 | Rilascio | Vendor |
| M6 | UAT principale — sign-off sistema completo | 9 | UAT | Operations + IT + Okafor |
| M7 | Go-live in produzione | 10 | Rilascio | IT Meridian + PM vendor |
| M8 | Handoff completato — sessione formazione, documentazione consegnata | 10 | Chiusura | PM + Operations + IT |

**Logica dei prototipi:** M2 e M4 sono sessioni di validazione anticipata — non rilasci formali. L'obiettivo è intercettare scostamenti rispetto alle aspettative operative prima di completare lo sviluppo, riducendo il rischio di rework a fine progetto.

---

## Governance

### Struttura proposta

L'engagement prevede tre livelli di governance, calibrati per frequenza e partecipanti:

| Livello | Cadenza | Durata | Partecipanti | Scopo |
|---|---|---|---|---|
| **SAL operativo** | Settimanale | 30 min | PM vendor + referente IT/Operations Meridian | Avanzamento attività, blocchi, dipendenze in scadenza |
| **Steering** | Bi-settimanale | 60 min | PM vendor + Okafor + Tanaka | Stato milestone, decisioni funzionali, gestione rischi |
| **Phase-gate review** | A fine fase | 90 min | Team allargato (vedi RACI) | Approvazione formale deliverable e autorizzazione fase successiva |

### SAL operativo (settimanale)

Il SAL operativo è il punto di contatto principale tra vendor e Meridian. Ogni sessione produce:
- Aggiornamento stato attività vs. piano
- Lista blocchi aperti e responsabile risoluzione
- Dipendenze in scadenza nella settimana successiva
- Eventuali richieste di cambio scope (escalate allo Steering se approvazione necessaria)

Formato: call remota, 30 minuti. Verbale sintetico distribuito entro fine giornata.

### Steering bi-settimanale

Lo Steering è il tavolo decisionale. Gestisce:
- Approvazione variazioni di scope o timeline
- Escalation di blocchi non risolti a livello operativo
- Allineamento sulle priorità tra Operations e IT in caso di conflitto
- Approvazione prototipi (M2, M4) e avanzamento alle fasi successive

### Gestione delle variazioni

Qualsiasi modifica allo scope concordato segue un processo formale:
1. Il vendor segnala la variazione per iscritto (email o verbale SAL)
2. Entro 3 giorni lavorativi, Meridian esprime approvazione o rifiuto
3. Se approvata, la variazione viene formalizzata con stima di impatto su timeline e costo prima dell'avvio

### Escalation

| Situazione | Escalation a | Entro |
|---|---|---|
| Dipendenza bloccante non risolta a livello operativo | Steering + Okafor | 48h |
| Disaccordo su requisiti funzionali | Tanaka (decisione finale) | SAL successivo |
| Disaccordo su requisiti tecnici/infrastrutturali | IT Meridian + PM vendor | SAL successivo |
| Richiesta variazione scope | Steering | 3 giorni lavorativi |

---

## RACI — Responsabilità

### Team coinvolti

**Vendor:**
| Ruolo | Responsabilità |
|---|---|
| **PM** (Project Manager) | Coordinamento, governance, comunicazione con Meridian, gestione rischi |
| **TL** (Tech Lead) | Architettura, decisioni tecniche, code review, security |
| **FE** (Frontend Developer) | Sviluppo Vue 3 — Reports, Restocking, D1–D3 |
| **BE** (Backend Developer) | Sviluppo FastAPI — endpoint R1, R2, integrazione dati |
| **QA** (Quality Assurance) | Test E2E Playwright, integration test, coordinamento UAT |

**Meridian:**
| Ruolo | Responsabilità |
|---|---|
| **Okafor** (Dir. Procurement) | Governance contrattuale, approvazioni formali, steering |
| **Tanaka** (VP Operations) | Decisioni funzionali, validazione requisiti R2, UAT |
| **IT** (Team IT interno) | Infrastruttura, ambiente staging/produzione, approvazione test, deploy |
| **Tokyo** (Team APAC) | Validazione traduzioni giapponesi (D2) |

### Matrice RACI

Legenda: **R** = Responsible (esegue) · **A** = Accountable (approva) · **C** = Consulted (coinvolto) · **I** = Informed (informato)

| Attività | PM | TL | FE | BE | QA | Okafor | Tanaka | IT | Tokyo |
|---|---|---|---|---|---|---|---|---|---|
| Kick-off e definizione criteri accettazione | R | C | I | I | I | A | C | C | I |
| Architecture review e R4 | C | R | C | C | I | I | I | A | I |
| Provisioning ambiente staging | I | C | I | I | I | I | I | R/A | I |
| Audit e remediation Reports (R1) | C | A | R | R | C | I | C | I | I |
| Definizione regole di business R2 | R | C | I | I | I | I | A | I | I |
| Sviluppo Restocking (R2) | C | A | R | R | C | I | C | I | I |
| Setup e sviluppo test suite (R3) | C | A | C | C | R | I | I | C | I |
| Security review | C | A | C | C | R | I | I | C | I |
| Prototipo Reports — validazione M2 | R | C | R | R | I | I | A | I | I |
| Demo prototipo Restocking — M4 | R | C | R | R | I | I | A | I | I |
| UAT intermedio (M3) | R | I | I | I | R | I | A | C | I |
| UAT principale (M6) | R | I | I | I | R | C | A | A | I |
| Approvazione rilascio in staging | C | R | I | I | R | I | C | A | I |
| Approvazione rilascio in produzione | C | C | I | I | I | A | C | R | I |
| Validazione traduzioni JA (D2) | I | I | C | I | I | I | C | I | A |
| Handoff e formazione (M8) | R | C | C | C | C | I | A | A | I |

---

## Fase 1 — Orientamento e fondamenta (settimane 1–2)

**Obiettivi:**
- Kick-off (M0) con Operations e IT: allineamento su priorità, flussi critici, criteri di accettazione UAT
- Architecture review dell'applicazione esistente → consegna R4 (M1)
- Sessione definizione regole di business Restocking con Tanaka → specifica funzionale approvata (M1)
- Setup infrastruttura di test (R3): framework, ambienti, pipeline

**Deliverable:**
- Documento architetturale (R4) ✓
- Primo set di test automatizzati sui flussi esistenti (R3 — base) ✓
- Specifica funzionale R2 approvata da Operations ✓

**Governance in questa fase:**
- M0 — Kick-off (giorno 1, settimana 1): Steering allargato
- SAL operativo: avvio da settimana 1
- Steering: primo incontro fine settimana 2 per approvazione specifica R2

**Dipendenze esterne — bloccanti:**

| Dipendenza | Richiesta a | Scadenza | Impatto se non rispettata |
|---|---|---|---|
| Accesso al repository sorgente | IT Meridian | Giorno 1 (M0) | Blocca l'avvio dell'engagement |
| Conferma infrastruttura hosting (server, OS, porte) | IT Meridian | Settimana 1 | Ritarda il setup staging |
| Definizione flussi critici per R3 | IT Meridian | Settimana 1 | Ritarda il setup suite di test |
| Sessione regole di business R2 con Tanaka | Operations | Settimana 1–2 | Ritarda M1 e blocca avvio Fase 3 |
| Policy di sicurezza interne | IT Meridian | Settimana 1 | Ritarda la security review |

---

## Fase 2 — Reports remediation (settimane 3–5)

**Obiettivi:**
- Audit completo e remediation modulo Reports (R1)
- Prototipo Reports su staging per validazione anticipata (M2)
- Estensione copertura test su Reports e flussi core (R3)
- UAT intermedio R1 con sign-off formale (M3)

**Deliverable:**
- Prototipo Reports su staging per feedback anticipato (settimana 4) ✓
- Modulo Reports funzionante: filtri, i18n, pattern dati allineati ✓
- Test E2E e integration test su Reports ✓
- Sign-off UAT intermedio (M3) ✓

**Governance in questa fase:**
- M2 — Prototipo Reports (settimana 4): sessione validazione con Operations, 1h
- SAL operativo: settimanale
- Steering: fine settimana 4 (pre-UAT)
- M3 — Phase-gate review fine settimana 5: approvazione formale R1 e autorizzazione Fase 3

**Dipendenze esterne — bloccanti:**

| Dipendenza | Richiesta a | Scadenza | Impatto se non rispettata |
|---|---|---|---|
| Ambiente staging provisionato e accessibile | IT Meridian | Inizio settimana 3 | Blocca M2 e M3 |
| Conferma requisiti di business Reports | Operations | Settimana 2 | Ritarda l'audit R1 |
| Disponibilità Operations per M2 (1h) | Operations | Settimana 4 | Ritarda la validazione anticipata |
| Disponibilità Operations + IT per UAT intermedio M3 (mezza giornata) | Operations + IT | Fine settimana 5 | Ritarda sign-off e sblocco Fase 3 |

---

## Fase 3 — Restocking feature (settimane 6–9)

**Obiettivi:**
- Sviluppo Restocking (R2) sulla base della specifica approvata in M1
- Demo prototipo Restocking per validazione anticipata logica (M4)
- Copertura test R2 (R3)
- Avvio item desiderati D1–D3 in parallelo (se approvati)
- Rilascio candidato completo in staging (M5)
- UAT principale con sign-off formale (M6)

**Deliverable:**
- Demo prototipo Restocking (settimana 7) ✓
- Vista Restocking completa e integrata ✓
- Suite di test aggiornata (E2E + integration) ✓
- Proposta visiva D1 approvata da Meridian ✓
- Avanzamento D2 (i18n) e D3 (dark mode) su branch isolati ✓
- Rilascio candidato completo in staging (M5, settimana 8) ✓

**Governance in questa fase:**
- M4 — Demo prototipo Restocking (settimana 7): sessione validazione con Tanaka, 1h
- SAL operativo: settimanale
- Steering: settimana 7 (post-demo, pre-completamento) e settimana 9 (pre-UAT)
- M6 — Phase-gate review fine settimana 9: approvazione formale sistema completo, autorizzazione go-live

**Dipendenze esterne — bloccanti:**

| Dipendenza | Richiesta a | Scadenza | Impatto se non rispettata |
|---|---|---|---|
| Specifica R2 approvata (M1) | Operations | Fine settimana 2 | Blocca avvio sviluppo Restocking |
| Disponibilità Tanaka per demo M4 (1h) | Operations | Settimana 7 | Ritarda validazione anticipata R2 |
| Approvazione proposta visiva D1 | Referente design/brand Meridian | Settimana 5 | Ritarda implementazione D1 |
| Glossari traduzione D2 (JA) | Team Tokyo / Operations | Settimana 6 | Ritarda o riduce scope D2 |
| Disponibilità Operations + IT + Okafor per UAT M6 (una giornata) | Operations + IT + Okafor | Fine settimana 9 | Ritarda sign-off e blocca Fase 4 |

---

## Fase 4 — Chiusura e handoff (settimana 10)

**Obiettivi:**
- Completamento item desiderati approvati (D1–D3)
- Rilascio in produzione (M7)
- Handoff: documentazione, accessi, sessione formazione team Meridian (M8)
- UAT finale D1–D3 (se applicabile)

**Deliverable:**
- Sistema in produzione con tutti i required completati ✓
- Item desiderati approvati integrati ✓
- Sessione handoff e formazione con Operations e IT ✓
- Documentazione operativa per manutenzione autonoma ✓

**Governance in questa fase:**
- Steering finale: inizio settimana 10 — verifica sign-off UAT M6 e autorizzazione go-live
- M7 — Go-live: gestito da IT Meridian con supporto vendor
- M8 — Chiusura formale dell'engagement: sign-off da Okafor

**Dipendenze esterne — bloccanti:**

| Dipendenza | Richiesta a | Scadenza | Impatto se non rispettata |
|---|---|---|---|
| Sign-off UAT principale M6 | Operations + IT | Inizio settimana 10 | Blocca M7 (go-live) |
| Procedure di deploy concordate | IT Meridian | Settimana 9 | Ritarda M7 |
| Disponibilità Operations per UAT finale D1–D3 (mezza giornata) | Operations | Settimana 10 | Ritarda M8 e chiusura formale |

---

## Riepilogo

| Fase | Settimane | Deliverable principali | Milestone | Dipendenza critica |
|---|---|---|---|---|
| 1 — Orientamento | 1–2 | R4, base R3, specifica R2 | M0 Kick-off · M1 Spec approvata | Accesso repo · sessione R2 con Tanaka |
| 2 — Reports | 3–5 | R1, R3 esteso, UAT intermedio | M2 Prototipo · M3 UAT sign-off | Staging environment · conferma requisiti |
| 3 — Restocking | 6–9 | R2, D1–D3 avviati, UAT principale | M4 Demo · M5 Release candidate · M6 UAT sign-off | Spec R2 approvata · disponibilità UAT |
| 4 — Chiusura | 10 | Go-live, handoff | M7 Go-live · M8 Handoff | Sign-off M6 · procedure deploy |

**Assunzione generale:** kick-off entro 2 settimane dalla firma del contratto. Le dipendenze esterne non rispettate nelle finestre indicate vengono segnalate al successivo SAL operativo e, se bloccanti, escalate allo Steering entro 48 ore.
