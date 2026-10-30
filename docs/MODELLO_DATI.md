# Modello dati
Il prompt cita uno schema originale `SCHEMA_DATI.md` che non è stato fornito. Questo documento esplicita il contratto applicato al CSV realmente disponibile; qualora venga consegnato lo schema originale, confrontarlo prima di modificarne i valori.

Tutte le 22 intestazioni del CSV originale sono obbligatorie, nello stesso significato. L'ordine delle righe e delle colonne può cambiare. Colonne aggiuntive sono ignorate; colonne duplicate sono rifiutate.

| Campo | Contratto |
| --- | --- |
| id | W01…W52, tutti presenti una volta sola |
| settimana | Intero corrispondente all'ID, 1…52 |
| settimana_inizio / settimana_fine | Date ISO di finestre lun–dom contigue dal 2027-01-04 al 2028-01-02 |
| attivita / categoria / comune / centro / sede | Testi non vuoti preservati; “DA TROVARE” e “Da individuare” restano tali |
| prezzo_persona_eur | Numero >=0; vuoto diventa null; 0 mantiene il significato di gratuità documentata. Decimale punto o virgola (CSV con virgolette) |
| prova_codice | P pubblicata, S stagionale, V da verificare, A accesso singolo, I idea |
| fonte_url / foto_url | Testo vuoto o URL HTTP(S) senza credenziali; per foto usare immagini pubbliche raggiungibili |
| cosa_verificare | Testo, anche vuoto |
| stato_prenotazione | Da contattare, Contattata, In attesa, Prenotata, Confermata, Non disponibile, Annullata |
| data_ora_confermata | Vuoto o YYYY-MM-DDTHH:mm, orario civile Europe/Rome. Non richiede che il giorno rientri nella finestra |
| esito | Da fare, Fatto, Saltato |
| note_diario | Testo libero; nessuna interpretazione HTML |
| voto_ale / voto_paco / voto_francesca / voto_clelia | Numero 1–10 facoltativo, null se vuoto |

L'elenco degli stati oltre a “Da contattare” è una scelta operativa documentata, poiché lo schema originale manca. L'esito e la prenotazione sono indipendenti: una data non rende mai l'esperienza Fatto. Un esito manuale prevale sul calendario per conteggi e avventure.

Il normalizzatore rifiuta importazioni parziali, righe duplicate o malformate, finestre non coerenti, date impossibili, URL di altro protocollo, prezzi negativi e voti fuori scala. Le righe sono ordinate per ID/settimana dopo la validazione. Il parser gestisce UTF-8 BOM, virgole, newline nelle celle e virgolette CSV raddoppiate.

## Snapshot JSON
`{meta, activities}`:
- `source`: local oppure google-sheets, fonte dei dati effettivamente mostrati.
- `last_successful_sync`: istante ISO reale dell'ultima importazione riuscita. Per importazioni locali immutate rimane invariato.
- `last_attempt`: istante dell'ultimo tentativo.
- `stale`: true se l'ultimo tentativo è fallito.
- `sync_error`: messaggio pubblico recuperabile, senza credenziali o risposta del server.

Le scritture avvengono mediante file temporaneo e rename. L'ultimo snapshot valido in cache non è mai sovrascritto da dati non validi; l'asset pubblico può contenere gli stessi dati con metadata di errore aggiornati.
