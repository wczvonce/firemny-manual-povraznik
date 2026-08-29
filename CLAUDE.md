# CLAUDE.md — implementačné pravidlá (firemná príručka)

## Čo staviaš
Statická firemná príručka renderovaná z `content.json` na strane klienta. Žiadny build krok,
žiadny server, žiadny framework, žiadne npm závislosti pre runtime. Čistý HTML + vanilla JS + CSS.

## Architektúra (dodrž, nemeň bez súhlasu)
- `index.html` — shell stránky (SK, `<html lang="sk">`, viewport meta pre mobil).
- `styles.css` — mobil-first responzívne, funkčné aj na desktope. Čitateľné, jednoduché, bez
  externých CDN/fontov (offline-friendly).
- `app.js` — načíta `content.json` (fetch), vyrenderuje: zoznam kategórií → položky → detail
  (steps alebo text + prílohy), a sekciu „Navrhované úlohy". Vanilla JS, žiadne knižnice.
- `content.json` — JEDINÝ zdroj obsahu (schéma v APP_SPEC.md). Editovateľný ručne/agentom.
- `assets/` — PDF a foto (a neskôr video/audio).

## Dátový model
Presne podľa `APP_SPEC.md` → sekcia content.json. Attachment má vždy `type` ∈
{pdf,image,video,audio}. Render teraz: pdf (odkaz/embed) + image (náhľad). video/audio:
NErenderuj prehrávač, zobraz placeholder „(video/zvuk — čoskoro)", ale nesmie spadnúť.

## Pravidlá
- SK všade (UI texty aj vzorový obsah).
- Žiadne tajomstvá (tokeny, heslá) v kóde ani v content.json.
- Bezpečný render: obsah z content.json vkladaj cez textContent / bezpečné DOM API, nie
  cez innerHTML so surovými dátami (vyhni sa XSS aj keď obsah je „náš").
- Prístupnosť: sémantické HTML, alt texty pri obrázkoch, klávesnicová navigácia.
- Vzorové dáta: naplň content.json ukážkami vo VŠETKÝCH 5 kategóriách; aspoň jedna položka
  typu `steps` a jedna typu `text`; aspoň jedna s PDF a jedna s foto prílohou; aspoň jedna
  ukážka s type=video alebo audio (na overenie placeholdera); aspoň 1–2 návrhy úloh.

## Zakázané
- Merge, push, deploy, GitHub operácie, zmena secrets, mazanie dát, inštalácia globálnych vecí.
- Pridávať runtime npm závislosti alebo build nástroje bez súhlasu.
- Skenovať mimo tohto worktree.

## Ako spustiť lokálne (pre smoke test)
Statické súbory; kvôli `fetch('content.json')` treba jednoduchý server:
`node --run serve` ak pridáš skript, alebo `npx --yes serve .` / `python -m http.server`.
Zdokumentuj presný príkaz v README.md.
