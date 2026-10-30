# Product
<!-- impeccable:product-schema 1 -->
## Platform
web
## Stack
Vite + React + TypeScript + CSS, richiesto dal brief.
## Users
Ale, Paco, Francesca e Clelia, quattro amici adulti; consultazione senza account da telefono e desktop.
## Product Purpose
Organizzare e raccontare una prova di una nuova disciplina ogni settimana nel 2027.
## Constraints
Sito pubblico statico per GitHub Pages. Fonte canonica: CSV nel repository. Il pannello riservato permette modifiche condivise via API GitHub con token fine-grained limitato al progetto. Nessuna credenziale nel codice o nella persistenza del browser. Nessun nuovo servizio, nessun Google Sheets attivo. Non confondere settimane previste, prenotazioni ed esiti. Non inventare informazioni mancanti.
## Authority
input/CODEX_PROMPT.md e data/esperienze_2027.csv. Il prompt autorizza decisioni semplici senza bloccare il lavoro; nessun requisito aggiunto tramite intervista.

## Gestione autorizzata
Richiesta successiva dell’utente: aggiornare esperienze, prenotazioni e voti direttamente dal sito. Scelta esplicita confermata: token GitHub limitato al repository, senza nuovi servizi. Questa fase sostituisce il vincolo iniziale di sola consultazione per il pannello; la lettura pubblica rimane libera. Le modifiche salvate diventano pubbliche dopo la build GitHub Actions, senza promessa di aggiornamento istantaneo.
