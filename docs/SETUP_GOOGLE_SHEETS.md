# Google Sheets (facoltativo, rimandabile)
Il progetto funziona già con i dati locali. Non occorre completare questi passaggi per pubblicare.

1. Creare un nuovo foglio Google Sheets e importare `data/esperienze_2027.csv` in un tab chiamato **ESPERIENZE**. Impostare formato testo semplice per ID e colonne ISO di data, evitando conversioni automatiche locali. Conservare le intestazioni esatte.
2. Controllare tutte le 52 righe, W01…W52. Le righe possono essere riordinate; gli ID non vanno rinominati, duplicati o eliminati. Voti vuoti e prezzi vuoti devono restare vuoti, non zero.
3. In **File → Condividi → Pubblica sul web**, scegliere **solo ESPERIENZE**, formato **Valori separati da virgola (.csv)**, e attivare la ripubblicazione automatica quando disponibile. Copiare l'URL pubblico HTTPS. Il registro Google Drive originale può rimanere modificabile solo dai gestori: la pubblicazione CSV è un accesso pubblico separato.
4. Aprire quel link in una finestra anonima. Deve mostrare/scaricare CSV senza login, con intestazioni e 52 righe, non una pagina HTML di accesso. Non utilizzare il link normale “Modifica foglio”.
5. Nel repository GitHub: **Settings → Secrets and variables → Actions → Variables → New repository variable**. Nome `SHEETS_CSV_URL`, valore URL pubblico. È una variabile, non una chiave segreta.
6. In Actions eseguire **Verifica e pubblica il calendario → Run workflow**. Il passo di sync deve dichiarare `google-sheets` e 52 ID. Aprire il sito e verificare nel footer fonte e ultimo aggiornamento.
7. Da questo momento aggiornare **solo il foglio**. Non modificare CSV/JSON locale per mantenere un secondo archivio concorrente. Gli aggiornamenti ordinari arrivano con il successivo workflow: tre esecuzioni giornaliere (05:17, 13:17, 21:17 UTC), su push o manuali. Google e GitHub possono ritardare cache/schedule; nessuna promessa di aggiornamento istantaneo.

## Compilare i dati
- Per spostare un appuntamento: `data_ora_confermata=2027-05-12T20:30`, mantenendo finestra e ID. Ora locale di Roma.
- Per confermare una prenotazione: stato Prenotata o Confermata; inserire la data reale quando concordata.
- Dopo l'esperienza: esito Fatto, eventuali note diario, voti individuali 1–10 e URL pubblico di una foto.
- Per rinuncia: esito Saltato, mai ricavato automaticamente dalla data.
- Nuove disponibilità e prezzi devono provenire da conferme reali; non eliminare i promemoria ancora pertinenti.

## Recuperare errori
La sync verifica colonne, ID, 52 attività, date, stati, prezzi, URL e voti. In caso di download/CSV invalido pubblica l'ultimo snapshot valido senza sovrascriverlo, aggiunge un warning nei log e un avviso nel sito. La data dell'ultimo successo resta invariata.
La cache Actions è separata per URL del foglio e può essere espulsa da GitHub; se assente, la copia locale iniziale è il fallback dichiarato. Non contiene aggiornamenti Sheets mai scaricati. Correggere la fonte e rilanciare il workflow. Non impostare un URL finto per fare una prova sul sito pubblico.

Per disattivare Sheets, esportare prima il foglio aggiornato e sostituire il CSV locale; solo dopo rimuovere la variabile e ricompilare. Altrimenti si torna consapevolmente al calendario locale iniziale.

## Privacy
Il CSV pubblicato e il sito sono pubblici anche se il documento modificabile è ristretto. Pubblicare solo il tab previsto e solo dati da rendere pubblici. Nessun token, password, email privata o indirizzo personale nei dati. Foto soltanto con consenso e URL pubblici validi. Nessun Apps Script per editing anonimo, nessuna credenziale richiesta dal sito.
