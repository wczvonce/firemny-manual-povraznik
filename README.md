# Firemná príručka

Statická firemná príručka. Obsah sa renderuje na strane klienta z jediného súboru
`content.json` — žiadny build krok, žiadny framework, žiadne runtime závislosti.
Čistý HTML + vanilla JS + CSS.

## Štruktúra

- `index.html` — kostra stránky (SK, mobil-first).
- `styles.css` — responzívne štýly (mobil aj desktop), bez externých CDN/fontov.
- `app.js` — načíta `content.json` (`fetch`) a vyrenderuje: kategórie → položky →
  detail (kroky alebo text + prílohy) a sekciu „Navrhované úlohy".
- `content.json` — **jediný zdroj obsahu**. Tu sa upravuje príručka.
- `assets/` — prílohy (PDF, foto; neskôr video/audio).

## Ako spustiť lokálne (smoke test)

Súbory sú statické, ale kvôli `fetch('content.json')` ich treba servovať cez HTTP
(otvorenie `index.html` cez `file://` fetch zablokuje). Spusti jednoduchý server
v tomto priečinku a otvor stránku v prehliadači:

**Python (odporúčané, býva predinštalovaný):**

```bash
python -m http.server 8000
```

**Alebo Node (bez inštalácie balíka natrvalo):**

```bash
npx --yes serve .
```

Potom otvor v prehliadači:

```
http://localhost:8000
```

(pri `npx serve` použi URL, ktorú vypíše, zvyčajne `http://localhost:3000`).

### Čo overiť

1. Zobrazí sa zoznam 5 kategórií.
2. Klik na kategóriu → zoznam položiek; klik na položku → detail.
3. Položka s krokmi ukáže očíslovaný zoznam, položka s textom odseky.
4. Prílohy: PDF sa otvorí odkazom, foto sa zobrazí ako náhľad, video/audio ukáže
   placeholder „(video/zvuk — čoskoro)".
5. Sekcia „Navrhované úlohy" zobrazí návrhy zo `suggested_tasks`.

## Odkazy na konkrétnu časť

Adresa v prehliadači sa mení podľa toho, čo je otvorené, takže odkaz sa dá skopírovať a poslať:

- `…/#postup/<id-položky>` – otvorí priamo daný postup (napr. `#postup/kupa-bytu-spravcovska-spolocnost`)
- `…/#kategoria/<id-kategórie>` – otvorí zoznam postupov v kategórii (napr. `#kategoria/prerabka`)

ID sa overuje voči `content.json`; neznámy alebo neplatný odkaz otvorí úvodnú obrazovku.

## Ako upraviť obsah

Uprav `content.json` podľa schémy v `APP_SPEC.md`:

- **Kategórie** (`categories`): `id` + `name`.
- **Položky** (`items`): `id`, `category` (id kategórie), `title`, `body_type`
  (`"steps"` alebo `"text"`), potom `steps` (pole reťazcov) **alebo** `text`
  (reťazec), voliteľne `attachments`.
- **Prílohy** (`attachments`): `type` ∈ `pdf | image | video | audio`, `path`
  (napr. `assets/subor.pdf`), `label`. Súbor musí reálne existovať v `assets/`.
- **Navrhované úlohy** (`suggested_tasks`): `id`, `text`, `source_question`,
  `date`, `status`.

Po úprave stačí obnoviť stránku v prehliadači (server beží ďalej).

## Bezpečnosť

Obsah z `content.json` sa vkladá cez `textContent` / bezpečné DOM API, nie cez
`innerHTML` — aj „náš" obsah je ošetrený proti XSS. Do `content.json` ani do kódu
nepatria žiadne tajomstvá (tokeny, heslá).
