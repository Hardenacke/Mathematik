# Dreistufige Navigation

Startseite: `index.html`

Fachseite: `fach.html?fach=mathematik`

Klassen-/Kursseite: `klasse.html?fach=mathematik&klasse=klasse-5`

Materialien werden über die `data.json` verlinkt und in einem neuen Tab geöffnet:

```json
{
  "typ": "Lernpfad",
  "titel": "Volumen entdecken",
  "url": "material/mathematik/klasse-5/volumen/lernpfad-volumen.html"
}
```

Die Datei muss genau unter diesem Pfad im Repository liegen.
