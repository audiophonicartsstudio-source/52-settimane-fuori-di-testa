# PROMPT PRINCIPALE PER CODEX — 52 SETTIMANE FUORI DI TESTA

Agisci come senior full-stack engineer, UX designer e QA. Lavora direttamente in questo progetto e consegna un sito web funzionante, testato e pronto per GitHub Pages. Non fermarti a una spiegazione o a mockup: crea effettivamente i file, implementa, esegui test e documenta avvio e pubblicazione. Se una specifica è ambigua, prendi una decisione semplice e motivata nel README, senza bloccare il lavoro. Non alterare i dati originali per colmare i vuoti.

## 1. Contesto
Il sito si chiama **52 settimane fuori di testa**. Quattro amici adulti — Ale, Paco, Francesca e Clelia — hanno deciso di provare una disciplina nuova ogni settimana del 2027, solo con lezioni di prova (anche a pagamento), senza iscriversi a un intero corso. Zone: Milano, San Donato Milanese, San Giuliano Milanese. Attività variissime: sport, arti marziali, balli, cucito, musica, arte, lingue, teatro, laboratori insoliti. Il calendario è una **bozza da organizzare**, non un calendario di lezioni effettivamente prenotate. L'obiettivo è un sito condivisibile tramite link, bellissimo e fruibile dal telefono, senza account per gli amici.

## 2. File di input obbligatori
- `input/52_settimane_fuori_di_testa_2027.xlsx`: workbook originale, 4 schede (ISTRUZIONI, CALENDARIO 2027, SCUOLE E FONTI, PIANO B), utile per provenienza e verifica.
- `data/esperienze_2027.csv`: dataset tabellare completo di 52 settimane, predisposto per importazione in Google Sheets; è l'input strutturato primario iniziale.
- `data/esperienze_2027.json`: copia normalizzata per il bootstrap del sito e fallback iniziale.
- `data/scuole_fonti_2026.csv`: registry delle fonti e della loro validità documentata al 30 ottobre 2026.
- `docs/SCHEMA_DATI.md`: contratto dati, regole dei valori e criteri dello stato.
- `docs/GUIDA_PUBBLICAZIONE.md`: percorso desiderato per pubblicare e aggiornare.

Non inventare indirizzi, orari, disponibilità, prezzi, corsi confermati né prove gratuite. `0` significa che la fonte originale riporta prova gratuita; campo vuoto significa prezzo sconosciuto. Non dichiarare confermate date che sono solo settimane di progetto. Mantieni gli URL come link esterni e preserva tutte le note.

## 3. Deliverable e stack
Realizza una SPA statica con **Vite + React + TypeScript + CSS**, senza database o backend server permanente. Evita librerie UI pesanti e non necessarie. Valuta piccola libreria icone se utile. `npm ci`, `npm run dev`, `npm run build`, `npm run test` devono funzionare. GitHub Pages deve funzionare anche nella sottocartella `/<nome-repo>/`: configurazione `base` di Vite corretta, asset e route non assoluti. Favorisci una singola pagina con filtri, senza routing server-side; se usi route, gestisci esplicitamente l'hosting statico.

Crea un repository GitHub **separato** da `personalos-mia`/PersonalOS/MIA. Nome suggerito `52-settimane-fuori-di-testa`. Non pubblicare o copiare dati personali non pertinenti. Il sito pubblico può essere visibile a chiunque abbia/indovini il link; non definirlo privato.

## 4. Funzioni MVP
- Intestazione memorabile, microcopy italiano, i quattro nomi, breve regola delle sole lezioni di prova, grafica giocosa ma pulita.
- Dashboard con 52 esperienze totali, completate, future, prenotate, da verificare e percentuale reale di completamento. `Fatto` non si ricava MAI dal calendario: soltanto da `esito` impostato manualmente.
- Sezione 'Prossima esperienza' con data indicativa e, se presente, data/ora effettivamente confermata; non mostrare una data settimanale come prenotazione.
- Vista principale **timeline per mese**, 52 card con titolo, categoria, numero settimana, località, centro, costo €/persona e costo totale x4 SOLO se noto, tipo di prova, stato prenotazione, esito, sorgente.
- Filtri per mese, categoria, comune, stato prenotazione, esito. Ricerca testuale; possibilità di resettare filtri e visualizzare tutte le attività.
- Selettore di vista compatta / dettagliata oppure una griglia calendario mensile, senza sacrificare leggibilità mobile.
- Scheda dettagli attività (drawer o modal accessibile) con sede, note di verifica, URL della fonte, data confermata, note diario, foto esterna opzionale e voti dei quattro (se presenti). Mostrare chiaramente 'Prezzo da verificare' se vuoto; 0 come 'Gratuita' solo se la fonte lo dice, e comunque con avvertenza 'riconfermare per il 2027'.
- Colori e testi di stato leggibili, non affidarsi al solo colore.
- Layout mobile-first; ottimo su Android e desktop; WCAG di base (contrasto, keyboard, focus, etichette e dialog chiudibili da Esc).
- Nessuna registrazione per leggere. Nessun form di modifica dati sul sito in questa versione. Nessuna finta azione 'Segna come fatto' che agisce soltanto nel browser; niente LocalStorage come fonte condivisa. Se vuoi, una dicitura discreta 'Gli aggiornamenti vengono gestiti dal calendario condiviso'.
- Pulsante link esterno 'Apri la scuola' solo se fonte_url non vuoto; evita mappe su indirizzi indefiniti.
- Responsività reale, date italiane e timezone `Europe/Rome`.
- Stato di caricamento, errore recuperabile e indicazione ultimo aggiornamento. In caso di sincronizzazione fallita, usa ultimo snapshot valido e segnala che è potenzialmente non aggiornato.
- Nessuna cartolina/immagine stock obbligatoria; preferisci layout grafico e icone. Per la cronologia futura, mostra foto soltanto se l'URL è pubblico e valido.

## 5. Logica temporale: separare tre concetti
1. **Finestra prevista** (`settimana_inizio`, `settimana_fine`): una settimana indicativa, non è un appuntamento confermato.
2. **Prenotazione** (`stato_prenotazione`, `data_ora_confermata`): può diventare confermata e spostata rispetto alla settimana originale.
3. **Esito reale** (`esito`): `Da fare`, `Fatto`, `Saltato`; si cambia manualmente nel foglio, MAI automaticamente sulla base della data.

Visualizzare un'etichetta temporale automatica distinta: `In programma`, `Questa settimana`, `Settimana trascorsa` oppure `Data confermata` quando c'è una vera data. Una settimana trascorsa con esito `Da fare` non è 'Fatto' e non è automaticamente 'Saltato': mostralo come 'Da aggiornare'. Se `esito=Fatto`, conteggia completata indipendentemente dalla data. Se `esito=Saltato`, non conteggiare completata. Per `data_ora_confermata`, leggere ISO `YYYY-MM-DDTHH:mm` come orario locale di Roma, senza trasformazioni UTC implicite. Gestisci mesi e anni inclusa l'ultima settimana che termina il **2 gennaio 2028**. `Date()` su stringa solo giorno potrebbe portare a shift di timezone: fai parsing locale esplicito.

## 6. Architettura dati e Google Sheets
Vogliamo **una sola fonte di verità** per modifiche future: Google Sheets quando configurato, non due archivi scrivibili concorrenti.
- All'inizio il sito deve funzionare immediatamente con `data/esperienze_2027.json`, senza servizi esterni o credenziali.
- Predisponi collegamento successivo a un Google Sheet con un tab chiamato `ESPERIENZE`, importando le intestazioni esatte del CSV. Tu, sviluppatore, devi documentare come creare/importare il foglio e come pubblicare **solo quel tab** come CSV pubblico. Il file originale Drive può restare condiviso in modifica solo con chi gestisce i dati.
- **Non usare una chiamata fetch cross-origin diretta dal browser come unico modo per leggere Google Sheets**, per possibili limitazioni CORS/caching. Usa GitHub Actions per scaricare server-side il CSV pubblico e generare un `esperienze.json` validato come asset statico a ogni build, su trigger `push`, `workflow_dispatch`, `schedule` (es. 2–4 volte al giorno). Eventuale fetch client-side è solo ottimizzazione verificata e con fallback sicuro.
- Definisci la configurazione `SHEETS_CSV_URL` in modo chiaramente documentato (GitHub Actions Variables o configurazione), per un URL **pubblico**, non una chiave segreta. Quando il link non è configurato, il build lavora sul dataset locale iniziale. Quando configurato, il Sheet è canonico; non modificare il JSON locale come se fosse un secondo database.
- Implementa uno script di sincronizzazione robusto (Python stdlib o Node) che legge il CSV, verifica 52 ID univoci, colonne obbligatorie, date ISO, valori consentiti per stati/esito, URL opzionali, 0 vs prezzo ignoto, voti 1–10 opzionali. Preserva gli ID W01..W52: mai correlare aggiornamenti per numero di riga, perché le righe potrebbero essere ordinate o filtrate nel foglio.
- Quando il download fallisce / il contenuto è vuoto o non valido, NON sovrascrivere l'ultimo snapshot buono. Mostra all'utente un errore di sync (workflow log/README) e pubblica il dato precedente con indicazione di possibile ritardo.
- Produci metadata di origine e `last_successful_sync` reali, mai inventati; consenti aggiornamenti manuali immediati via GitHub Actions 'Run workflow'. I trigger schedulati potrebbero subire ritardi: non promettere aggiornamento istantaneo.
- Evita ogni API key, token, credenziale o Apps Script con editing anonimo. La modifica rimane in Google Sheets con i suoi permessi. Se domani volessimo editing dagli amici sul sito, è una fase 2 con autenticazione e backend, non parte dell'MVP.

## 7. Data quality
Codici prove dal dataset: `P`=prova pubblicata, `S`=stagionale da riconfermare, `V`=da verificare, `A`=accesso singolo (non prova formale), `I`=idea da trovare. Queste categorie indicano **certezza della formula**, NON la disponibilità nel 2027.
In particolare non confondere prove scolastiche pubblicate nell'autunno 2026 con prenotazioni nel 2027; non chiamare 'lezione confermata' nessuna attività importata. Inizialmente tutti gli esiti sono `Da fare`. Controlla che statistiche e costi non trattino i campi vuoti come zero; se il prezzo è sconosciuto, il totale è sconosciuto.

## 8. Design
Direzione: diario sociale di quattro amici, un po' folle, dinamico, ma non infantile. Preferenza per titolo forte, tipografia leggibile, card eleganti, colori allegri usati con misura e timeline con stati chiari. Tema accessibile chiaro, con accento petrolio/arancio o analogo; microinterazioni leggere senza animazioni invadenti. Su mobile la timeline e i filtri devono funzionare con una mano. Aggiungi una sezione 'Le nostre avventure' che mostri soltanto eventi realmente completati, con voto medio calcolato quando ci sono voti; nessun finto contenuto.

## 9. Pubblicazione e documentazione
- `README.md` per avvio, comandi, struttura e regole.
- `docs/SETUP_GOOGLE_SHEETS.md`: creare Sheet; import CSV; pubblicare CSV solo del tab ESPERIENZE; controllare URL; editare dati; avviare sync manuale; verificare l'ultimo aggiornamento e risolvere errori; avvertenza privacy dati pubblicati.
- `docs/DEPLOY_GITHUB_PAGES.md`: creare repo separato, caricare file, impostare Pages->Build and deployment->GitHub Actions, verificare workflow, ricavare URL, testare da telefono/desktop.
- `docs/MODELLO_DATI.md`: riferirsi al file schema di input, non creare un secondo schema in conflitto.
- Workflow `.github/workflows/deploy.yml` implementato e funzionante con permessi minimi necessari.
- `npm run check` (TypeScript/lint), test unitari per conteggi, filtri, date, date dell'ultima settimana, costi 0/sconosciuti, stati; test end-to-end base con Playwright se praticabile senza complicare eccessivamente.
- Verificare contenuto esatto: 52 attività, prime/ultime settimane corrette, tutti i link originali, nessuna prenotazione preimpostata, quattro partecipanti corretti. Testare generazione production e path di GitHub Pages.

## 10. Modalità di lavoro di Codex
1. Ispeziona gli input e annota eventuali incongruenze reali (senza sostituirle con fantasia).
2. Definisci uno schema TS e un normalizzatore dati fedele al CSV.
3. Implementa layout e componenti modulari (Dashboard, Filters, Timeline, ActivityCard, ActivityDetail, Adventures, Footer).
4. Implementa import/sync robusti e GitHub Action.
5. Testa localmente, esegui build e correggi errori.
6. Restituisci riepilogo dei file creati, istruzioni minime per avvio e pubblicazione, eventuali soli passi che richiedono il mio intervento (pubblicazione del foglio, impostazioni GitHub). **Non dichiarare pubblicato o sincronizzato ciò che non è stato fatto.**

**Output richiesto:** un progetto completo e realmente eseguibile, non un prototipo fittizio. La priorità è avere subito un ottimo sito consultabile, con dati corretti e stato delle esperienze onesto; il collegamento Sheets si attiva quando fornirò il suo URL CSV pubblico.
