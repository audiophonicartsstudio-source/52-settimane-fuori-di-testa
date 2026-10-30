# Pubblicare su GitHub Pages
Il repository pubblico è già creato e collegato: [audiophonicartsstudio-source/52-settimane-fuori-di-testa](https://github.com/audiophonicartsstudio-source/52-settimane-fuori-di-testa).
GitHub Pages è configurato con sorgente **GitHub Actions**. Non occorre ricreare il repository né aggiungere di nuovo origin.

URL del sito: [52 settimane fuori di testa](https://audiophonicartsstudio-source.github.io/52-settimane-fuori-di-testa/).
Stato delle pubblicazioni: [Actions](https://github.com/audiophonicartsstudio-source/52-settimane-fuori-di-testa/actions).

## Pubblicare aggiornamenti
1. Per i dati usare normalmente il pannello **Gestione**: il suo salvataggio crea già il commit e avvia la pubblicazione. I passaggi successivi servono per modifiche tecniche al codice o per aggiornamenti manuali alternativi al CSV; conservare ID e intestazioni.
2. Verificare il progetto con i comandi sotto.
3. Salvare e caricare le modifiche:
   ```sh
   git add .
   git commit -m "Aggiorna il calendario"
   git push origin main
   ```
4. Attendere entrambi i job verdi in Actions. Per una nuova pubblicazione senza modifiche, usare **Verifica e pubblica il calendario → Run workflow** su main.
5. Aprire il sito da telefono e desktop e verificare l'aggiornamento nel footer.

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
