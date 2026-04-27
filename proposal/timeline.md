# Timeline
**RFP #MC-2026-0417 — Meridian Components**

---

Proponiamo un piano in quattro fasi su 10 settimane, con rilasci intermedi verificabili. Ogni fase si chiude con una review formale con i referenti di Meridian prima dell'avvio della successiva.

Le dipendenze esterne bloccanti sono indicate per ciascuna fase: il mancato rispetto delle scadenze indicate può slittare le milestone successive.

---

## Fase 1 — Orientamento e fondamenta (settimane 1–2)

**Obiettivi:**
- Kick-off con Operations e IT per allineare priorità, flussi critici e regole di business Restocking
- Architecture review dell'applicazione esistente → consegna documento R4
- Setup infrastruttura di test (R3): framework, ambienti, pipeline
- Definizione criteri di accettazione UAT per R1–R4

**Deliverable:**
- Documento architetturale (R4) ✓
- Primo set di test automatizzati sui flussi esistenti (R3 — base)
- Specifica funzionale validata per il modulo Restocking (R2)

**Dipendenze esterne — bloccanti:**

| Dipendenza | Richiesta a | Scadenza | Impatto se non rispettata |
|---|---|---|---|
| Accesso al repository sorgente | IT Meridian | Giorno 1 | Blocca l'avvio dell'engagement |
| Conferma infrastruttura hosting (server, OS, porte) | IT Meridian | Settimana 1 | Ritarda il setup ambiente di staging |
| Definizione flussi critici per R3 | IT Meridian | Settimana 1 | Ritarda il setup della suite di test |
| Sessione definizione regole di business R2 | Operations (R. Tanaka) | Settimana 1–2 | Ritarda l'avvio della Fase 3 di 1–2 settimane |
| Policy di sicurezza interne applicabili | IT Meridian | Settimana 1 | Ritarda la security review |

**Note:** R4 viene consegnato in questa fase perché è prerequisito per un onboarding efficace del team IT e per la pianificazione accurata delle fasi successive.

---

## Fase 2 — Reports remediation (settimane 3–5)

**Obiettivi:**
- Audit completo e remediation del modulo Reports (R1)
- Estensione copertura test su Reports e flussi core (R3)
- UAT intermedio con Operations e IT a fine fase

**Deliverable:**
- Modulo Reports funzionante: filtri, internazionalizzazione, pattern dati allineati ✓
- Test E2E e integration test su Reports ✓
- Review con Operations: validazione comportamento atteso prima del rilascio

**Milestone:** primo rilascio in staging per approvazione IT → UAT intermedio (fine settimana 5).

**Dipendenze esterne — bloccanti:**

| Dipendenza | Richiesta a | Scadenza | Impatto se non rispettata |
|---|---|---|---|
| Ambiente di staging provisionato e accessibile | IT Meridian | Inizio settimana 3 | Blocca il rilascio in staging e la milestone UAT intermedio |
| Conferma requisiti di business Reports (metriche, filtri attesi) | Operations | Settimana 2 | Ritarda l'audit R1 e allunga la Fase 2 |
| Disponibilità Operations per UAT intermedio (mezza giornata) | Operations | Fine settimana 5 | Ritarda il sign-off e lo sblocco della Fase 3 |

---

## Fase 3 — Restocking feature (settimane 6–9)

**Obiettivi:**
- Sviluppo della vista Restocking (R2) sulla base della specifica validata in Fase 1
- Copertura test della nuova funzionalità (R3)
- Avvio item desiderati D1–D3 in parallelo (se approvati)
- UAT principale a fine fase

**Deliverable:**
- Vista Restocking completa e integrata ✓
- Suite di test aggiornata (E2E + integration) ✓
- Prima proposta visiva D1 (UI modernization) per approvazione Meridian
- Avanzamento D2 (i18n) e D3 (dark mode) su branch isolati

**Milestone:** rilascio candidato completo → UAT principale (fine settimana 9, una giornata).

**Dipendenze esterne — bloccanti:**

| Dipendenza | Richiesta a | Scadenza | Impatto se non rispettata |
|---|---|---|---|
| Specifica R2 approvata (da Fase 1) | Operations | Fine settimana 2 | Blocca l'avvio dello sviluppo Restocking |
| Approvazione proposta visiva D1 | Referente design/brand Meridian | Settimana 5 | Ritarda l'implementazione D1 oltre la Fase 3 |
| Glossari di traduzione per D2 (JA + eventuali altre lingue) | Team Tokyo / Operations | Settimana 6 | Ritarda o riduce scope D2 |
| Disponibilità Operations + IT per UAT principale (una giornata) | Operations + IT | Fine settimana 9 | Ritarda il sign-off e blocca la Fase 4 |

---

## Fase 4 — Chiusura e handoff (settimana 10)

**Obiettivi:**
- Completamento item desiderati approvati (D1–D3)
- Revisione finale con IT e Operations
- Handoff: documentazione, accessi, sessione di formazione team interno
- UAT finale su D1–D3 (se applicabile)

**Deliverable:**
- Sistema in produzione con tutti i required completati ✓
- Item desiderati approvati integrati ✓
- Sessione di handoff con team Meridian
- Documentazione operativa per manutenzione autonoma

**Dipendenze esterne — bloccanti:**

| Dipendenza | Richiesta a | Scadenza | Impatto se non rispettata |
|---|---|---|---|
| Sign-off UAT principale (da Fase 3) | Operations + IT | Inizio settimana 10 | Blocca il rilascio in produzione |
| Procedure di deploy in produzione concordate | IT Meridian | Settimana 9 | Ritarda il go-live finale |
| Disponibilità Operations per UAT finale D1–D3 (mezza giornata) | Operations | Settimana 10 | Ritarda la chiusura formale dell'engagement |

---

## Riepilogo

| Fase | Settimane | Deliverable principali | Dipendenza critica |
|---|---|---|---|
| 1 — Orientamento | 1–2 | R4 architettura, base R3, specifica R2 | Accesso repo + sessione R2 con Operations |
| 2 — Reports | 3–5 | R1 completo, R3 esteso, UAT intermedio | Staging environment + conferma requisiti Reports |
| 3 — Restocking | 6–9 | R2 completo, D1–D3 avviati, UAT principale | Specifica R2 approvata + disponibilità UAT |
| 4 — Chiusura | 10 | Handoff, D1–D3 completati | Sign-off UAT principale + procedure deploy |

**Assunzione generale:** kick-off entro 2 settimane dalla firma del contratto. Le dipendenze esterne non rispettate nelle finestre indicate vengono gestite con una comunicazione formale al referente Meridian e, se necessario, con una revisione concordata della timeline.
