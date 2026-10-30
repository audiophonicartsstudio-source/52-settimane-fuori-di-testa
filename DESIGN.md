---
name: "52 settimane fuori di testa"
description: "Diario editoriale e calendario operativo per quattro amici adulti."
colors:
  paper: "#faf8f3"
  ink: "#243e37"
  green: "#174e46"
  green-hover: "#103e37"
  orange: "#ac4529"
  muted: "#5d675f"
  line: "#dedfd5"
  surface: "#ffffff"
  sage-panel: "#edf0e5"
  poster: "#dce5bc"
  empty: "#efeee6"
  event: "#e2ead5"
  event-hover: "#d6e3c3"
  chip: "#e9eddf"
  chip-ink: "#3a5234"
  seasonal: "#f9ebd9"
  seasonal-ink: "#825019"
  idea: "#eee8f1"
  idea-ink: "#6b4c76"
  verify: "#f5e6df"
  verify-ink: "#8a422c"
typography:
  display:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "clamp(40px, 5vw, 68px)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    letterSpacing: "-0.025em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "13px"
    fontWeight: 600
rounded:
  chip: "5px"
  event: "6px"
  control: "8px"
  inset: "12px"
  card: "16px"
spacing:
  step-4: "4px"
  step-8: "8px"
  step-12: "12px"
  step-16: "16px"
  step-24: "24px"
  step-32: "32px"
  step-48: "48px"
  step-64: "64px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "13px 20px"
  button-primary-hover:
    backgroundColor: "{colors.green-hover}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "13px 20px"
  search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  chip:
    backgroundColor: "{colors.chip}"
    textColor: "{colors.chip-ink}"
    rounded: "{rounded.chip}"
    padding: "4px 8px"
  activity-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "23px"
  month-selected:
    backgroundColor: "{colors.green}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "11px 15px"
  calendar-event:
    backgroundColor: "{colors.event}"
    textColor: "{colors.green}"
    rounded: "{rounded.event}"
    padding: "9px 6px"
---

# Design System: 52 settimane fuori di testa

## Overview

Diario editoriale e calendario operativo, chiaro, pulito e giocoso per adulti. Petrolio e arancio danno carattere senza sovrastare le informazioni. La composizione usa spazio, numeri di settimana e titoli netti; il poster inclinato, gli asterischi e le iniziali degli amici aggiungono il tono personale.

La consultazione resta centrale: stato reale, finestre indicative e dettagli verificabili devono essere leggibili da telefono e desktop. Questa documentazione descrive il sistema implementato; non aggiunge una nuova identità visiva.

**Key Characteristics:**
- Carta calda, petrolio strutturale e arancio di accento.
- Titoli geometrici e lettura morbida, con font distribuiti localmente.
- Timeline scandita dalle settimane e calendario adattato al telefono.
- Superfici quasi piatte, bordi sottili e interazioni discrete.

## Colors

La palette abbina carta calda, petrolio profondo, arancio terroso e superfici salvia. I valori normativi sono nel frontmatter; le variabili CSS in `src/styles.css` restano la fonte dell’implementazione.

### Primary
- **Petrolio** (`green`): marchio, azioni principali, mese selezionato e testo degli eventi. La variante più scura serve per il passaggio del puntatore.

### Secondary
- **Arancio terroso** (`orange`): parola enfatizzata nel titolo, segni grafici e anello di focus. Non indica da solo una prenotazione o un esito.
- **Salvia** (`sage-panel`, `poster`, `event`): pannello della prossima esperienza, poster e appuntamenti; il cambio tonale separa i contenuti senza ombre.

### Neutral
- **Carta** (`paper`) e **bianco** (`surface`): pagina e card.
- **Inchiostro** (`ink`), **testo secondario** (`muted`) e **linea** (`line`): lettura principale, metadati e separatori. Entrambe le versioni del calendario usano `muted` per i giorni fuori mese.
- **Tela quieta** (`empty`): stati senza risultati o senza avventure vissute.

I piccoli badge mostrano la categoria, ma la loro tinta deriva dal codice di prova: base verde, stagionale ambrato, idea lilla, verifica/accesso singolo pesca. Il testo del codice e la legenda spiegano il significato; il colore non sostituisce queste etichette. Il dialog usa il badge base.

## Typography

**Display Font:** Space Grotesk, sans-serif. **Body Font:** DM Sans, sans-serif. I pesi effettivamente inclusi sono 500/600/700 per Space Grotesk e 400/500/600/700 per DM Sans, importati da Fontsource e serviti con il sito; nessuna chiamata a un servizio font esterno.

Titoli geometrici, compatti e bilanciati; corpo più morbido per dettagli e note. Il frontmatter registra i ruoli desktop. Il titolo principale diventa 54px sotto 1050px, poi `clamp(46px, 9vw, 68px)` sotto 760px. Le sezioni scendono a 28px; i titoli delle card sono 21px su mobile, 19px nella vista compatta. Le note operative mobili principali sono 11–13px dopo gli adattamenti finali. Numeri di settimana, statistiche e date usano cifre tabulari dove previsto.

## Layout

Contenitore centrato largo al massimo 1280px. Margini interni desktop di 48px, ridotti a 30px sotto 1050px e 22px sotto 760px. Il ritmo ricorrente è raccolto nel frontmatter; i componenti hanno anche misure locali estratte dal CSS, senza imporre una scala artificiale a ogni dettaglio.

Il desktop affianca testo e poster nel primo blocco, distribuisce il riepilogo in sei colonne e compone la prossima esperienza in tre colonne. La timeline ha mese laterale, linea verticale sottile e card; la griglia mensile ha sette colonne. Sotto 760px il primo blocco si impila, il riepilogo usa tre colonne, i filtri una griglia a due colonne e il mese precede le card senza linea verticale. I mesi restano scorrevoli orizzontalmente; il selettore di vista conserva il testo della sola vista attiva, con nomi accessibili per ogni pulsante.

Il calendario mobile sostituisce la griglia con blocchi settimanali: sette date allineate sopra eventi a tutta larghezza. Le finestre indicative mostrano l’intervallo della settimana; le date confermate mostrano giorno e ora di Roma. Le settimane vuote hanno un messaggio esplicito. Non è una griglia desktop rimpicciolita.

Le esperienze indicative sono posizionate il lunedì della settimana; una data confermata ne sostituisce la posizione. Le viste condividono ricerca e filtri. Selezionare un mese aggiorna il calendario; navigare tra mesi aggiorna il filtro mese.

## Elevation & Depth

Le superfici ordinarie sono piatte: bordi sottili e fondi tonali creano separazione. Il poster usa una lieve inclinazione statica (2°, 1° su mobile). Solo il dialog è sollevato: ombra `0 20px 70px #182d3633` e sfondo oscurato `#102b24a6`.

Le transizioni di sfondo, colore e bordo durano 0.18s; lo scorrimento della pagina è fluido. `prefers-reduced-motion: reduce` elimina transizioni e animazioni e ripristina lo scorrimento immediato.

## Shapes

Card, calendario e pannelli principali hanno angoli morbidi; i controlli sono più compatti. Il poster conserva angoli quasi squadrati (4px), gli avatar sono circolari e il marchio ha un raggio di 12px. Il dialog mobile adatta il raggio a 14px. Le linee da 1px organizzano sezioni, card e giorni; le forme decorative restano concentrate nel primo blocco.

## Components

### Buttons
Azioni nette e compatte. Primario pieno petrolio con testo bianco, secondario trasparente con bordo salvia. Entrambi hanno altezza minima di 44px; il secondario schiarisce il fondo al passaggio del puntatore. Le azioni testuali delle card mantengono il proprio trattamento leggero. I pulsanti icona del calendario e della chiusura misurano 44px. Focus visibile: contorno arancio da 3px, distanziato di 4px; controlli disabilitati al 45% di opacità.

### Inputs / Fields
Ricerca su bianco con bordo sottile, icona e input trasparente; etichetta disponibile anche ai lettori di schermo. Filtri tramite select native etichettate, con fondi trasparenti. Il reset si disabilita quando nessun filtro è attivo e diventa visivamente un’icona su mobile, mantenendo il nome accessibile.

### Chips
Badge piccoli con angoli da 5px e coppie cromatiche di testo/fondo. Il significato documentale resta esplicito nel codice di prova e nella legenda. Nessuna semantica di prenotazione si deduce dal solo badge.

### Cards / Containers
Card bianche con bordo e numero di settimana laterale. Passando il puntatore cambia il bordo, senza sollevamento. Il titolo apre i dettagli, seguito da sede, stato, prova e costi; il collegamento alla scuola è distinto. La vista compatta riduce informazioni e spaziatura. I ricordi usano immagini reali solo quando disponibili; prima di esperienze completate appare uno stato vuoto.

### Navigation
Marchio e due ancore di sezione nell’intestazione. I mesi sono pulsanti con stato `aria-pressed`; il mese selezionato è pieno petrolio. Le tre viste sono un gruppo di pulsanti con stato premuto. Risultati annunciati con `aria-live="polite"`; aggiornamento e problemi dati usano messaggi di stato. Il salto al calendario diventa visibile al focus.

### Calendar events
Tessere salvia con numero della settimana e indicazione temporale sopra il titolo; sfondo leggermente più intenso al passaggio del puntatore. Su mobile testo e spaziatura aumentano e ogni evento occupa la larghezza del blocco settimanale.

### Detail dialog
Dialog nativo con titolo associato tramite `aria-labelledby`, apertura modale, focus iniziale sul pulsante di chiusura e contenimento del focus del browser. Chiusura con pulsante, Esc o clic sullo sfondo esterno; alla chiusura il focus torna al controllo di partenza e lo scorrimento della pagina viene ripristinato. Barra superiore fissa durante lo scorrimento interno. Larghezza desktop `min(640px, calc(100% - 32px))`, altezza massima 90dvh; su mobile margine totale di 18px e altezza massima 94dvh. Fatti in due colonne, note di verifica evidenziate e nessun dato mancante sostituito da un risultato inventato.

## Do's and Don'ts

### Do:
- Do mantenere separati finestra prevista, prenotazione ed esito anche nella gerarchia visiva.
- Do usare il petrolio per azioni primarie e selezioni, e l’arancio per accenti e focus.
- Do conservare metadati leggibili e nomi accessibili quando le etichette visive diventano icone.
- Do usare il calendario settimanale su mobile e testo secondario per i giorni fuori mese.
- Do mantenere font locali, stati vuoti onesti e ripristino del focus del dialog.

### Don't:
- Don’t presentare una settimana indicativa come una prenotazione confermata.
- Don’t codificare stato o prova esclusivamente con il colore.
- Don’t comprimere la griglia mensile in sette colonne di eventi illeggibili sul telefono.
- Don’t aggiungere ombre alle card ordinarie o animazioni decorative continue.
- Don’t inventare fotografie, voti o ricordi quando i dati non li contengono.
