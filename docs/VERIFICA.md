# Verifica del 30 ottobre 2026
## Risultati
- Installazione pulita con `npm ci`: riuscita.
- `npm run check`: TypeScript riuscito.
- `npm test`: 25 test passati (23 di modello/validazione e 2 di integrazione della CLI di sincronizzazione).
- `npm run test:e2e`: 6 test passati su Chromium, desktop e viewport Pixel 7.
- Build production con `BASE_PATH=/52-settimane-fuori-di-testa/`: riuscita.
- Test eseguiti sulla build production servita nella sottocartella Pages, non soltanto sul server di sviluppo.
- Screenshot desktop 1440px e mobile 390px, dettaglio e calendario mobile: nessun errore JavaScript e nessun overflow orizzontale osservato.
- Revisione visiva indipendente: richiesta e applicata correzione del contrasto delle date fuori mese; verifica finale documentata nelle schermate.
- Repository Git locale autonomo inizializzato nella cartella del progetto, senza modificare repository degli altri progetti.

## Dati originali
52 ID univoci W01…W52, 17 categorie, 46 URL fonte presenti e preservati. Formule: P=32, S=11, V=2, A=1, I=6. Prezzi noti 28, sconosciuti 24. Tutte le attività iniziali sono Da fare e Da contattare, nessuna data prenotata. Prima finestra 4–10 gennaio 2027; ultima 27 dicembre 2027–2 gennaio 2028.
Il CSV operativo e il prompt copiati sono stati confrontati byte per byte con i file originali in Downloads. Una copia immutata del CSV in input è usata dai test di fedeltà, così gli aggiornamenti reali di esito e prenotazione non fanno fallire i test sul dataset iniziale.

## Casi verificati
Date italiane e giorno corrente di Roma in estate/inverno; date confermate mantenute come orari civili; fine anno 2028; conteggio Fatto esclusivamente manuale; Saltato separato; distinzione zero/null e costo x4; filtri combinati; abbreviazioni dei comuni; ordine CSV indipendente dagli ID; virgolette/BOM/newline; dati mancanti o invalidi; fonte non sicura; voti; URL; media con voti mancanti; errori di rete/contenuto.
Integrazione CLI: dopo errore Sheets, snapshot precedente preservato byte per byte, dati locali intatti, asset pubblico con esito precedente e avviso di ritardo, timestamp riuscito invariato.
Browser: 52 card, ricerca, filtri mese/categoria, reset, dialog, Esc, ripristino focus, gratuità, prezzo ignoto, assenza link scuola se mancante, navigazione calendario e W52 nel gennaio 2028, fallback e riprova.

## Limiti verificabili solo dopo configurazione
Repository creato e caricato su GitHub, poi reso pubblico su autorizzazione esplicita dell’utente. GitHub Pages configurato con build_type=workflow. L’esito corrente della pubblicazione è consultabile in [Actions](https://github.com/audiophonicartsstudio-source/52-settimane-fuori-di-testa/actions); URL configurato: https://audiophonicartsstudio-source.github.io/52-settimane-fuori-di-testa/.
Google Sheets non collegato per scelta dell'utente: testati parser, validazione e fallimenti senza usare un foglio reale. Nessun aggiornamento scolastico o disponibilità 2027 verificato online. I 46 link sono preservati e validati sintatticamente, non certificati come ancora attivi.
Viewport mobile emulato in Chromium, non dispositivo Android fisico. Revisione di accessibilità di base, non audit WCAG completo.
Node 22.23.4 usato per installazione pulita e test browser. Node 26 di sistema ha restituito errori di rete nell'ambiente di esecuzione; le verifiche sono state completate con Node LTS, senza modificare l'installazione di sistema.
