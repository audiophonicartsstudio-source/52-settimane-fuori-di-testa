# Pubblicare su GitHub Pages
1. Creare su GitHub un repository **separato** chiamato `52-settimane-fuori-di-testa`, senza README automatico. Non usare repository PersonalOS/MIA. Per la via più semplice con GitHub Free usare un repository pubblico.
2. Aprire un terminale nella cartella di questo progetto. Se non esiste un repository Git dedicato:
   ```sh
   git init -b main
   git add .
   git commit -m "Realizza 52 settimane fuori di testa"
   git remote add origin https://github.com/TUO-UTENTE/52-settimane-fuori-di-testa.git
   git push -u origin main
   ```
   Sostituire TUO-UTENTE. Verificare che `git rev-parse --show-toplevel` punti a questo progetto, non alla cartella contenente altri progetti. Non caricare node_modules, cache, credenziali o materiale non pertinente.
3. In **Settings → Pages → Build and deployment**, scegliere **GitHub Actions**.
4. In **Actions → Verifica e pubblica il calendario → Run workflow**, eseguire su main. Dopo il push il workflow può essere già in corso.
5. Attendere entrambi i job verdi. Il link viene mostrato nell'environment github-pages e in Settings → Pages, normalmente `https://TUO-UTENTE.github.io/52-settimane-fuori-di-testa/`.
6. Aprire il link da telefono e desktop. Verificare titolo, 52 esperienze, ricerca, scheda W52, vista calendario, foto se aggiunte e data di aggiornamento nel footer.

Non serve configurare Google Sheets. Le modifiche al CSV locale entrano nel sito con un nuovo commit/push. Il workflow compila con il base_path restituito da GitHub Pages, quindi gestisce sottocartelle e dominio personalizzato. Non servono routing server-side né redirect 404.

## Verifiche prima del push
```sh
npm ci
npm run check
npm test
BASE_PATH=/52-settimane-fuori-di-testa/ npm run build
BASE_PATH=/52-settimane-fuori-di-testa/ npm run preview
```
Il workflow usa Node 22; sono consigliati Node 22 o 24 LTS anche in locale.

## Errori
- Pages non configurato: scegliere GitHub Actions nelle impostazioni e rieseguire.
- Push rifiutato: autenticarsi con GitHub nel proprio client; non inserire token nei file del progetto.
- Build fallita sui dati: leggere il warning/errore del passo “Genera sito e sincronizza dati”; riparare il CSV secondo MODELLO_DATI.md.
- Sincronizzazione Sheets fallita: il sito usa il precedente snapshot valido con avviso; riparare la fonte e rieseguire.
- Workflow schedulato inattivo: GitHub può ritardare i job o disabilitare le schedule in repository pubblici senza attività. Usare Run workflow e riabilitare Actions se richiesto.

Il sito Pages è pubblico: avere un link non equivale a un controllo di accesso. Non inserire contatti personali, foto private o note riservate.

Riferimenti verificati: [Vite, deploy statico](https://vite.dev/guide/static-deploy.html), [GitHub, sorgente di pubblicazione](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
