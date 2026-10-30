# 52 settimane fuori di testa
SPA statica completa per il 2027 di Ale, Paco, Francesca e Clelia. Timeline di 52 esperienze, calendario mensile navigabile, dashboard, filtri combinabili, dettagli, diario e voti. Consultabile senza account e senza backend.

Sito GitHub Pages: [52 settimane fuori di testa](https://audiophonicartsstudio-source.github.io/52-settimane-fuori-di-testa/). Repository pubblico: [codice e aggiornamenti](https://github.com/audiophonicartsstudio-source/52-settimane-fuori-di-testa).

## Avvio
Richiede Node.js 22 o 24 LTS e npm.
```sh
npm ci
npm run dev
```
Aprire l'indirizzo stampato da Vite. Per la versione compilata:
```sh
npm run check
npm test
npm run build
npm run preview
```
I font e le icone sono distribuiti nel sito: non dipendono da CDN.

## Aggiornare dal pannello riservato
Aprire **Gestione** nel footer, oppure [il pannello](https://audiophonicartsstudio-source.github.io/52-settimane-fuori-di-testa/gestione.html). Si accede con un token GitHub fine-grained limitato al solo repository, con Contents: Read and write. Il pannello consente di aggiornare tutte le 52 esperienze, prenotazioni, date, esiti, diario e voti. I salvataggi sono condivisi e tracciati; la pubblicazione segue automaticamente. Non è un archivio locale del browser e non richiede nuovi servizi.
Istruzioni del primo accesso e recupero: [docs/GESTIONE_ESPERIENZE.md](docs/GESTIONE_ESPERIENZE.md).

## Aggiornamento tecnico alternativo senza Google Sheets
La **sola fonte modificabile iniziale** è `data/esperienze_2027.csv`. Conservare intestazioni e ID W01–W52. Aggiornare prenotazione, data confermata, esito, diario o voti; eseguire `npm run build` e pubblicare il nuovo commit. Il JSON normalizzato viene generato dal CSV: non modificarlo manualmente. Sul server di sviluppo, dopo una modifica ai dati eseguire `npm run sync` e ricaricare.

La consultazione pubblica non richiede registrazione. Le modifiche dal pannello richiedono un token autorizzato da GitHub; nessun localStorage come archivio o deposito di credenziali. Il sito è pubblico una volta pubblicato su Pages. Le note e i link immessi nei dati diventano pubblici.

## Regole e decisioni
- `esito=Fatto` è l'unico criterio di completamento. Una settimana trascorsa non viene mai completata o saltata automaticamente.
- Prenotate: stati Prenotata o Confermata. Da verificare: attività Da fare senza questi stati (anche le prove P richiedono verifica per il 2027). Future: Da fare con data confermata o inizio settimana >= oggi a Roma. La prossima esperienza include anche una settimana in corso.
- I codici P/S/V/A/I descrivono la formula documentata, non la disponibilità.
- Prezzo vuoto = sconosciuto; zero = gratuità riportata nella fonte, da riconfermare. Totale x4 soltanto se noto.
- Le finestre originali sono immutabili nel contratto. Per appuntamenti spostati usare `data_ora_confermata`, anche in un altro mese/anno.
- Timeline e filtro mese seguono l'inizio della finestra prevista. Il calendario mostra la data confermata quando presente, altrimenti il lunedì indicativo; mostra anche i giorni contigui di altri mesi. La ricerca e gli altri filtri restano applicati.
- Le date confermate sono orari civili Europe/Rome, senza suffisso Z e senza conversione UTC implicita.
- Nessun contenuto dimostrativo è presentato come una vera avventura. Le foto sono URL esterni opzionali HTTP(S), caricate senza referrer e nascoste se non raggiungibili. Usare solo URL pubblici di immagini con consenso dei partecipanti.
- Ultimo aggiornamento = ultima importazione riuscita dei dati (non verifica delle scuole). Le build locali immutate conservano la data precedente.

## Input e mancanze effettive
Originali forniti e letti integralmente (con copia immutabile CSV in `input/esperienze_2027.originale.csv`): `input/CODEX_PROMPT.md` e `data/esperienze_2027.csv` (copia byte per byte dei file in Downloads).
Non forniti: workbook XLSX originale, registro `scuole_fonti_2026.csv`, JSON di input, `SCHEMA_DATI.md` e `GUIDA_PUBBLICAZIONE.md` citati nel prompt. Non sono stati ricreati come se fossero originali. Il JSON è stato generato dal CSV; il contratto operativo è documentato in `docs/MODELLO_DATI.md`. Tutti i link e tutte le note del CSV sono preservati; non è stata verificata online la disponibilità delle 52 scuole per il 2027.

## Pubblicazione
Seguire [docs/DEPLOY_GITHUB_PAGES.md](docs/DEPLOY_GITHUB_PAGES.md). Nessun servizio Google è necessario. Il workflow installa, verifica, testa, sincronizza, compila e distribuisce. La configurazione base segue il path Pages, con default relativo per altri hosting statici.

## Predisposizione Google Sheets (non in uso)
Non attivare Sheets mentre si usa il pannello: la fonte canonica è il CSV gestito dal pannello. La precedente predisposizione è documentata in [docs/SETUP_GOOGLE_SHEETS.md](docs/SETUP_GOOGLE_SHEETS.md). Quando `SHEETS_CSV_URL` è impostata, il foglio diventa la fonte canonica: smettere di modificare il CSV locale. Nessuna chiave API, nessun fetch Sheets dal browser. Il workflow scarica il CSV lato server tre volte al giorno, su push e manualmente.

Gli snapshot validi, anche del CSV locale gestito dal pannello, sono conservati dalla cache Actions separatamente per URL. Un errore conserva le attività dell'ultimo snapshot e il timestamp riuscito, pubblicando metadata `stale=true` e un avviso visibile. Se è la prima sync o la cache è stata rimossa da GitHub, il fallback è il dataset locale incluso, dichiarato come tale. Il timestamp non viene aggiornato come se la sync fosse riuscita. Il fallimento non blocca la pubblicazione del fallback; un warning compare nei log. La cache GitHub può essere espulsa: esportare periodicamente i propri dati dal foglio se serve una copia durevole.

## Struttura
- `src/admin/`: pannello, login, editor e client GitHub con controllo conflitti.
- `gestione.html`, `src/admin-main.tsx`: ingresso statico del pannello, separato dal sito pubblico.
- `src/components/`: Dashboard, Filters, Timeline, Calendar, ActivityCard, ActivityDetail, Adventures, Footer.
- `src/model.ts`, `src/types.ts`: contratto TypeScript e logica testabile.
- `scripts/data.mjs`: parser CSV, normalizzatore e validatore condivisi tra build e caricamento.
- `scripts/sync.mjs`: importazione atomica, metadata, preservazione snapshot.
- `data/`: CSV canonico iniziale e fallback JSON generato.
- `public/data/esperienze.json`: asset distribuito generato dalla sync.
- `tests/`: unit test e test browser.
- `.github/workflows/deploy.yml`: pubblicazione Pages.

## Test browser
```sh
npx playwright install chromium
BASE_PATH=/52-settimane-fuori-di-testa/ npm run build
npm run test:e2e
```
La suite serve la build reale nella sottocartella Pages, in viewport desktop e Pixel 7. Controlla ricerca, filtri, prezzi, modal/Esc/focus, calendario 2028, recupero dopo errore e overflow orizzontale.

Esiti e limiti della verifica: [docs/VERIFICA.md](docs/VERIFICA.md).
