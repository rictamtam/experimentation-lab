# Sito narrativo "Leonardo" — percorso, console e pubblicazione

Titolo provvisorio: **Il Piano e la presenza digitale**. Nome definitivo e indirizzo GitHub: da decidere. Il sito usa solo indirizzi relativi, quindi funziona con qualunque nome di repository.

## Cosa contiene

```
index.html                      Home (la tesi e il percorso)
gruppo-oggi/                    01 Il Gruppo oggi
portafoglio/                    02 Il portafoglio
piano-2030/                     03 Il Piano 2026–2030
persone-e-innovazione/          04 Persone e innovazione
bisogni/                        05 Cosa chiede il Piano (casi A–G)
tesi/                           06 La tesi
ipotesi/                        07 L'ipotesi (aree A–G)
rotta/                          08 La rotta: l'accordo quadro
dieci-minuti/                   Versione breve
fonti/                          Registro delle fonti e stato di lettura
console/                        Console di configurazione (facoltativa, non nel menu)
404.html                        Pagina non trovata
assets/css/site.css             Stile condiviso
assets/js/                      boot, manifest, config, site (menu e navigazione), console
```

Ogni cartella contiene un file `index.html`: l'indirizzo della pagina è il nome della cartella (per esempio `.../tesi/`).

## Come funziona la console

Apri `.../console/`. Spegni capitoli e casi, scegli la pagina di arrivo, copia il link. Chi lo apre vede solo ciò che hai scelto, e un avviso in alto con il link alla versione completa.

- Non modifica i testi e non cambia ciò che vedono gli altri: la scelta vive nel link (`?c=` capitoli, `?s=` casi).
- **Non protegge nulla.** I capitoli spenti restano nel sito pubblico. Non inserire informazioni riservate.
- La console non è nel menu né nella mappa del sito. Chi non ne conosce l'indirizzo non la trova.

## Pubblicare su GitHub Pages dal browser (nessun terminale)

1. Vai su github.com, accedi e scegli **New repository**. Assegna un nome (sarà parte dell'indirizzo) e scegli **Public**. Crea il repository.
2. Estrai lo ZIP sul tuo computer.
3. Nel repository scegli **Add file → Upload files** e trascina il **contenuto** della cartella estratta (le cartelle e i file, non lo ZIP). Conferma con **Commit changes**.
4. Vai su **Settings → Pages**. In "Build and deployment" scegli **Deploy from a branch**, branch **main**, cartella **/ (root)**, poi **Save**.
5. Attendi uno o due minuti. GitHub mostra l'indirizzo, di solito `https://<tuo-utente>.github.io/<nome-repository>/`.
6. Apri l'indirizzo e controlla: home, menu, almeno un capitolo, la console, la pagina Fonti.

Per aggiornare: sostituisci i file nel repository con **Add file → Upload files** e attendi la nuova pubblicazione. Per tornare indietro: apri **Commits**, scegli la versione precedente e ripristinala.

## Prima di condividere

- Il sito è pubblico: chiunque abbia l'indirizzo può leggerlo. Ha `noindex` (i motori di ricerca non dovrebbero indicizzarlo), ma non è una protezione.
- Contiene solo fonti pubbliche e il riferimento al confronto in corso, senza prezzi, volumi, contratti o dati interni. Rileggi i testi marcati **Dal confronto con voi** e **Da validare** prima dell'invio.
- Verifica che i marchi e le denominazioni di terzi siano usati solo come testo.
- Se il repository è sul tuo spazio personale, valuta se vuoi usare un account aziendale.

## Controlli eseguiti e limiti

Eseguiti:
- struttura HTML, identificativi unici, link interni e riferimenti a sezioni, assenza di stili e script in linea (compatibile con la politica di sicurezza dei contenuti inserita nelle pagine), assenza di risorse esterne;
- lettura sicura dei parametri della console, con valori ammessi e nessun inserimento di contenuti non filtrati;
- rendering in anteprima su larghezza da telefono: home, menu aperto, grafici, tabelle, schede dei casi, console;
- comportamento con configurazione personalizzata: capitoli e casi nascosti, menu, precedente/successivo, avviso su capitolo spento, avviso in alto.

Non eseguiti: prove su dispositivi reali e con lettori di schermo; layout da computer (menu a tendina e indice laterale) verificato solo leggendo il codice; navigazione da tastiera verificata solo leggendo il codice. Il tema scuro è previsto ma non verificato visivamente. Se compare qualcosa fuori posto, dimmelo e correggo.

Aprendo `index.html` direttamente dal computer il sito si vede, ma i link alle sottocartelle possono mostrare un elenco di file: la navigazione completa funziona dopo la pubblicazione.

La pagina `404.html` calcola il link "Torna all'inizio" dall'indirizzo aperto: su un sito di progetto GitHub Pages funziona; con un dominio personalizzato punta alla radice.
