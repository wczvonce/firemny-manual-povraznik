# Nezávislý review — Fable 5 (2026-08-30, doplnený po audite)

Recenzent: claude-fable-5 cez acpx, čerstvá session, read-only (--approve-reads
--non-interactive-permissions deny). Rubrika: ivan-app-builder review-rubric.
Dôvod: pôvodná stavba Phase 7 (nezávislý review) NEPREBEHLA — parent kontroloval vlastnú prácu.

## BLOCKER

- **B1 — shell injection v `scripts/commit-content.js:18`**
  `execSync('git commit -m ' + JSON.stringify(msg))` — JSON-escaping nie je shell-escaping;
  cmd.exe na Windows spustí ľubovoľný príkaz cez `x" & calc & "`. Vstup je z Telegramu
  (zdieľaný účet = čiastočne nedôveryhodný). Aj bežná SK správa s `"`/`&`/`%` commit rozbije.
  OPRAVA: `execFileSync('git', ['commit','-m', msg])` bez shellu (rovnako add/push).

## IMPORTANT

- **I1 — chýba pull/rebase pred pushom** (`add-suggested-task.js`, `commit-content.js`):
  ID sa počíta z lokálneho content.json → po zlyhanom/cudzom pushi vznikne duplicitné
  `st-000N` a strata cudzieho záznamu pri merge. OPRAVA: fetch+rebase (al. čítať
  origin/main pred výpočtom ID).
- **I2 — `href`/`src` z content.json bez validácie schémy** (`app.js:428,442,492,513`):
  `path:"javascript:..."` na PDF chipe = stored XSS; externý `img.src` prezradí IP
  návštevníčky. OPRAVA: povoliť len relatívne cesty do `assets/` (odmietnuť `:`, vedúce `/` `//`).
- **I3 — pravidlo „edituje len Ivan" je nevynútiteľné** (`SKILL.md:38-41`): zamestnankyňa má
  ten istý účet, takže vie tiež editovať. Spec/AC tvrdí opak. ROZHODNUTIE IVANA: buď priznať
  „ktokoľvek s prístupom k účtu edituje", alebo pridať kódové slovo pre edit.
- **I4 — verejný repo podkopáva „ochranu neuhádnuteľnou URL"**: repo je public → názov (a
  teda Pages URL) je zistiteľný z profilu. ROZHODNUTIE IVANA: privátny repo, alebo brať obsah
  ako plne verejný. (Bola to vedomá voľba A — threat-model info, nie chyba kódu.)

## MINOR
- M1 `git add assets` (celý priečinok) zverejní aj omylom odložené súbory → pridávať konkrétne.
- M2 `add-suggested-task.js` pri zlyhanom commite nevráti zapísaný súbor (nekonzistentné s druhým skriptom).
- M3 formát dátumu `Z` vs `+02:00` (kozmetika, bez dopadu).

## Verdikt recenzenta
Frontend render bezpečný a solídny; pred reálnym nasadením opraviť B1 + I1, poctivo priznať
I3 a I4. Appka je živá a funkčná, tieto nálezy sa týkajú edge-case bezpečnosti a integrity.
