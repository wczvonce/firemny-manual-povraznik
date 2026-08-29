# APP_SPEC — Firemná príručka

Status: CONFIRMED (via Solution Factory handoff sf-firemna-prirucka-2026-08-30T01:08:05+02:00)
Spec version: 1 | Approval: telegram:1050774149, 2026-08-30T01:08:05, "SCHVAĽUJEM"

Autoritatívny produktový spec je `FUNCTIONAL_SPEC.md` (hash-locknutý). Tento súbor je
implementačný výťah pre workerov + akceptačné kritériá.

## Cieľ
HTML firemná príručka (GitHub Pages, mobil odkiaľkoľvek) + agent v Telegrame, čo z nej
odpovedá a chýbajúce veci zapisuje ako návrhy úloh. Jazyk SK.

## Používatelia
- Ivan: plný prístup, jediný editor obsahu (cez Telegram).
- Zamestnankyňa: číta príručku na mobile, pýta sa agenta cez zdieľaný účet (voľba A).

## Architektúra (rozhodnutá)
- Statická stránka bez build kroku: `index.html` + `app.js` + `styles.css` renderujú z
  `content.json` na strane klienta.
- Jediný zdroj pravdy: `content.json`. Prílohy v `assets/`.
- GitHub Pages servuje root repa. Editácia = zmena `content.json`/`assets` → commit → push → live.
- Bez hesla (voľba A: verejné, len neuhádnuteľná URL).

## Dátový model (content.json)
```
{
  "meta": { "title": "Firemná príručka", "lang": "sk", "updated_at": "<ISO>" },
  "categories": [
    { "id": "prerabka", "name": "Prerábka & zariaďovanie" },
    { "id": "sprava-booking", "name": "Správa & booking" },
    { "id": "stavkovanie", "name": "Stávkovanie" },
    { "id": "skilly", "name": "Skilly" },
    { "id": "ine", "name": "Iné" }
  ],
  "items": [
    {
      "id": "<slug>", "category": "<category id>", "title": "<názov>",
      "body_type": "steps" | "text",
      "steps": ["krok 1", "krok 2"],        // ak body_type=steps
      "text": "voľný text",                  // ak body_type=text
      "attachments": [
        { "type": "pdf|image|video|audio", "path": "assets/<file>", "label": "<popis>" }
      ],
      "updated_at": "<ISO>"
    }
  ],
  "suggested_tasks": [
    { "id": "<uuid>", "text": "<čo treba doplniť>", "source_question": "<otázka>",
      "date": "<ISO>", "status": "navrhnuté" }
  ]
}
```
Render v MVP: pdf + image. video/audio: schéma áno, render placeholder ("čoskoro").

## Obrazovky
- Zoznam kategórií → položky kategórie → detail položky (kroky/text + prílohy).
- Sekcia „Navrhované úlohy" (viditeľná, z `suggested_tasks`).
- Mobil-first responzívne; funguje aj na desktop šírke.

## MVP teraz / Neskôr / Mimo
- Teraz: render kategórií/položiek (steps|text), prílohy PDF+foto, sekcia návrhov úloh, SK.
- Neskôr: prehrávanie video/audio, vyhľadávanie, heslo/súkromný hosting, PWA.
- Mimo: samostatný agent/účet pre zamestnankyňu, role/prihlásenie.

## Akceptačné kritériá
Viď `ACCEPTANCE_CRITERIA.md` (AC-001..AC-011).

## Riziko / verifikácia
Medium (produkt) → build vedený v DEEP (nová aplikácia, verejná expozícia, push credential).
