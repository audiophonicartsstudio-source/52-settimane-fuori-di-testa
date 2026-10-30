# Gestire le esperienze dal sito
Il pannello si apre da **Gestione**, in fondo al sito, oppure direttamente da:
[gestione.html](https://audiophonicartsstudio-source.github.io/52-settimane-fuori-di-testa/gestione.html).

Non occorre modificare il CSV, usare Google Sheets o configurare un nuovo servizio. Il pannello modifica la sola fonte condivisa già presente nel repository GitHub. La pubblicazione del sito rimane automatica.

## Primo accesso: crea una chiave limitata al progetto
Questo passaggio si fa su GitHub, con l'account proprietario **audiophonicartsstudio-source**.
1. Apri il collegamento **Crea token su GitHub** presente nel pannello. Nome, proprietario, scadenza di 30 giorni e permesso Contents sono precompilati.
2. In **Repository access**, seleziona **Only select repositories** e scegli soltanto **52-settimane-fuori-di-testa**. Questo è il passaggio che limita il token al progetto.
3. Controlla **Repository permissions → Contents → Read and write**. Metadata in lettura è incluso da GitHub. Non servono permessi di amministrazione, Actions o Workflows.
4. Genera il token e copialo nel campo **Token di accesso GitHub** del pannello. Premi **Accedi**. Non inviarlo in chat, non incollarlo nel diario e non salvarlo nel repository.
5. Se vuoi riutilizzarlo fino alla scadenza, conservalo nel tuo gestore di password. Il sito non lo ricorda: all'uscita o al ricaricamento dovrai reinserirlo.

Il token è una credenziale personale. Per revocarlo o rinnovarlo, usa le impostazioni GitHub **Developer settings → Personal access tokens → Fine-grained tokens**. Se scade durante una modifica, il pannello richiede un nuovo accesso e conserva il modulo non salvato nella pagina aperta. Non ricaricare la pagina prima di aver recuperato le modifiche.

## Uso quotidiano
1. Cerca un'esperienza per nome, ID, scuola o comune, oppure filtra il mese previsto.
2. Seleziona la settimana. Sul telefono usa **Esperienza da modificare**.
3. Aggiorna i campi necessari: esperienza, scuola, sede, prezzo, formula, fonte, promemoria, prenotazione, data reale, esito, diario, link foto e voti individuali.
4. Premi **Salva esperienza**. Il pannello legge l'ultima versione condivisa, valida i dati e crea un commit GitHub identificato con l'ID della settimana.
5. Il messaggio **Salvato** conferma l'archivio, non ancora la distribuzione pubblica. GitHub Actions ricompila il sito; può impiegare alcuni minuti. Il pannello controlla automaticamente, per circa dieci minuti, se l'esperienza pubblica corrisponde al salvataggio; puoi usare anche **Controlla sito** o **Stato pubblicazione**.
6. Premi **Esci** quando hai finito.

ID, numero e finestra prevista restano fissi. Per un appuntamento spostato, usa la data e ora confermata, espressa nell'orario locale di Roma. Prezzo vuoto significa sconosciuto, zero significa gratuità documentata. Voti vuoti restano senza voto. Solo l'esito **Fatto** alimenta le avventure e il conteggio completate.

## Conflitti e recupero
- Se un altro gestore modifica una settimana diversa, il suo aggiornamento viene conservato durante il tuo salvataggio.
- Se cambia la stessa esperienza, il salvataggio si ferma e mostra il confronto. Non sovrascrive automaticamente l'altra versione.
- **Riporta le mie modifiche sulla versione aggiornata** conserva i campi che hai modificato tu e aggiorna gli altri dall'archivio. Controlla il risultato e salva esplicitamente. Nei campi cambiati da entrambi verrà mantenuto il tuo valore solo dopo questa scelta e il successivo Salva.
- Anche un aggiornamento avvenuto tra lettura e scrittura viene fermato dal controllo SHA di GitHub.
- Dopo un errore di rete, il salvataggio potrebbe essere riuscito senza che il browser ricevesse conferma: usa **Ricarica dati** per verificarlo. Ripetere lo stesso salvataggio non crea commit duplicati se i dati sono già presenti.
- Cambiare esperienza, annullare o uscire con modifiche pendenti richiede conferma. Il browser avvisa anche prima di chiudere una pagina con modifiche non salvate.
- La cronologia GitHub contiene ogni salvataggio. Per correggere un errore normale riapri il modulo e salva i valori corretti; per un recupero storico usa la cronologia del file o chiedi assistenza.

## Protezione effettiva e limiti
La pagina e il suo codice sono pubblici, come il resto del sito. L'autorizzazione alla modifica è verificata **da GitHub su ogni richiesta autenticata**, non da una password incorporata nel JavaScript. Senza una credenziale autorizzata non è possibile salvare. Un token valido per la sola lettura può consentire il caricamento del modulo, ma GitHub rifiuta il salvataggio: il pannello mantiene le modifiche e spiega il permesso mancante.
Il pannello non può attestare dal browser l'elenco completo dei repository concessi a un token: il limite al solo progetto va scelto alla creazione. L'applicazione invia richieste esclusivamente al repository fissato nel codice.

La credenziale rimane solo nella memoria della pagina; non viene scritta in localStorage, sessionStorage, cookie, URL, file del progetto, commit o messaggi di errore. Viene trasmessa come Authorization soltanto a https://api.github.com. Le richieste non seguono redirect e non inviano cookie o referrer. Il pannello di produzione applica una Content Security Policy che limita script, font e stile agli asset locali e le connessioni al sito e a GitHub; non usa analytics o script di terzi. In sviluppo Vite la CSP viene rimossa soltanto dalla risposta del server locale, per consentire HMR; la build mantiene la policy completa.

Note, foto e voti salvati sono **pubblici**. L'accesso riservato protegge la modifica, non la lettura. Il pannello non carica file fotografici: accetta un URL pubblico. Le 52 esperienze restano il dataset del progetto; non si aggiungono o eliminano ID da questa versione.

Non attivare contemporaneamente SHEETS_CSV_URL: renderebbe Sheets canonico e annullerebbe lo scopo del pannello. Nell'installazione attuale questa variabile non è configurata.

## Riferimenti
- [Token fine-grained e permessi minimi — GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).
- [API di aggiornamento dei file e controllo SHA — GitHub](https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents).
- [CORS delle API GitHub](https://docs.github.com/en/rest/using-the-rest-api/using-cors-and-jsonp-to-make-cross-origin-requests).
