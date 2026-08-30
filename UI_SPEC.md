# UI Specification — Firemná príručka

Schválený koncept: **A — „Čistá karta"**, re-skinnutý do vizuálu majiteľovho webu **apartman7.github.io**
(vzdušný, jednoduchý layout, veľké dotykové ciele; teplá značková paleta + serif nadpisy).
Zamrznuté (v2): 2026-08-30; sha256 v confirmed_handoff.json
Ivanov výber: Telegram 1050774149, 2026-08-30 — „vybral dizajn A ('Čistá karta') … zafixuj dizajn A".
Ivanova revízia (v2): Telegram 1050774149, 2026-08-30 — „vizuál nech vychádza z apartman7.github.io … inšpiruj sa
  layoutom, farbami, typografiou, feelom, v medziach smeru A". → aplikované ako v2.
Referenčný mockup A: `.solution-factory/design/A.html` + `screenshots/A.png`
Referencia značky (apartman7): `.solution-factory/design/ref-apartman7/` (desktop.png, mobile.png, style.json — extrahované tokeny)
Overené screenshoty v2: `.solution-factory/design/slice2-shots/` (01–08, mobil 390×844 + desktop)

## Cieľové zariadenie / viewport (default: Android telefón, 390×844)
- Primárne mobil, portrait, ~390×844 CSS px. Mobile-first; desktop je progresívne rozšírenie (viac bieleho priestoru, obsah v centrovanom stĺpci max ~560 px, nie roztiahnutý na celú šírku).
- Bez horizontálneho scrollu na 320–430 px šírke.

## Inventár obrazoviek a navigácia
1. **Zoznam kategórií (domov)** — titul „Firemná príručka" + podtitul, vyhľadávacie pole, vertikálny zoznam kategórií (karty).
2. **Detail postupu** — breadcrumb (kategória › detail) späť, nadpis postupu, pill s kategóriou, kroky (číslované) alebo voľný text, prílohy.
3. **Vyhľadávanie** — aktívne pole s dopytom + výsledky; prázdny stav („Nič sa nenašlo pre …") + návrhy kategórií.
4. **Navrhované úlohy** — zoznam kariet úloh, každá so značkou „navrhnuté" a zdrojovou otázkou.
- Navigácia: plochá, kategória → detail → späť cez breadcrumb. Vyhľadávanie prístupné z domova. „Navrhované úlohy" je samostatná sekcia/obrazovka.

## Informačná hierarchia
- Domov: názov aplikácie je najsilnejší prvok, hneď pod ním vyhľadávanie (primárny akčný vstup), potom kategórie.
- Detail: nadpis postupu dominuje; kategória ako sekundárny pill; kroky ako rovnocenné bloky; prílohy na konci.
- Jedna hlavná akcia na obrazovku, žiadne skryté menu.

## Komponenty a opakované vzory
- **Karta kategórie**: ikona (44×44, mäkké pozadie `--accent-soft`) + názov (bold) + krátky popis + chevron „›". Celá karta klikateľná, min výška 64 px.
- **Vyhľadávacie pole**: biele, zaoblené 16 px, lupa vľavo, placeholder „Hľadať postup…". Aktívny stav má 2px accent border a „✕" na vyčistenie.
- **Krok**: číslovaný kruh (30 px, accent, biely text) + text kroku v bielej karte 18 px radius.
- **Príloha**: inline chip s typovým odznakom (PDF červený, IMG/VIDEO/AUDIO podľa typu) + názov, klikateľný.
- **Karta úlohy**: text úlohy (bold) + zelený chip „navrhnuté" vpravo hore + zdrojová otázka oddelená prerušovanou čiarou.
- **Pill kategórie**, **breadcrumb**, **empty state blok** (emoji + nadpis + veta + návrhové odkazy).

## Typografia a spacing (zámer) — v2 (apartman7)
- **Nadpisy (serif): Fraunces** (opsz, 600/700) — app titul, nadpis detailu, sekčné nadpisy, empty-state titul.
  Fallback: `Georgia, "Times New Roman", serif`.
- **Telo/UI (sans): Manrope** (400/600/700/800). Fallback: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- Fonty sa načítajú z Google Fonts (rovnaký link ako apartman7). **Deviácia od pôvodného „bez web-fontov":** vedomá,
  na Ivanovu žiadosť o vizuálnu zhodu; plné fallbacky → stránka je čitateľná aj bez CDN (graceful degradation).
- Škála: app titul ~30px, nadpis detailu ~26px, karty názvy 16–17px, telo 15–16px, muted 12–13px. Negatívny letter-spacing na veľkých serifoch.
- Spacing: karty gap 12px, padding kariet 14–18px, sekčné medzery 22–40px. **Zaoblenie 18px** (--radius), pill 999px.
- Teplé jemné tiene (`0 6px 20px rgba(30,58,52,.06)`); hero má výraznejší tieň.

## Vizuálny tón / farby — v2 (značka apartman7)
- Teplý, pokojný, „boutique". **Pozadie paper `#faf7f1`**, karty biele `#fff`, text ink `#22302c`, muted `#6b7a74`, hranice/line `#e7e0d3`.
- **Primárna = pine `#1e3a34`** (hero pozadie, číslované kroky, primárne akcenty), hover pine-2 `#2b4f47`.
- **Akcent = brass `#b98a3c`**, jemný brass-soft `#f3e8d3` (ikonové dlaždice, pill, chevrony). Pozn.: text na brass-soft používa tmavšiu brass `#6f5010` kvôli kontrastu AA (nie surová brass).
- Úspech/„navrhnuté" `#386b56` na `#e6f0ea`. Danger/PDF `#a53d35` na `#fff0ed`.
- **Hero hlavička:** pínová (pine→#16302a gradient) kapela, biely Fraunces titul, brass-soft podtitul, zaoblený spodok. Bez fotky (nemáme relevantný asset).

## Loading / empty / error / disabled stavy
- **Loading**: jednoduchý text/skeleton pri načítaní `content.json`; nesmie blikať prázdnou stránkou.
- **Empty (vyhľadávanie)**: emoji 🔍 + „Nič sa nenašlo pre „<dopyt>"" + veta „Skús iné slovo alebo prehľadaj kategórie nižšie." + chip-odkazy na kategórie.
- **Empty (kategória bez položiek)**: pokojná hláška, žiadny prázdny biely priestor bez vysvetlenia.
- **Error (fetch zlyhal)**: zrozumiteľná SK hláška, nie technický stack; ponuka „Skúsiť znova".
- **Chýbajúca príloha / neznámy media typ**: fallback chip, appka nesmie spadnúť.

## Klávesnica a dotykové ciele
- Dotykové ciele min ~44×44 px (karty kategórií 64 px výška, kroky, prílohy, chip-odkazy dostatočne veľké).
- Vyhľadávacie pole spúšťa systémovú klávesnicu; „✕" na vyčistenie dosiahnuteľný palcom.
- Dostatočné medzery medzi klikateľnými prvkami (žiadne omylom trafené susedné ciele).

## Prístupnosť
- Sémantické HTML (nadpisy h1/h2, zoznamy, `<a>`/`<button>` pre akcie), lang="sk".
- Kontrast textu voči pozadiu ≥ WCAG AA (tmavý text na svetlom, muted len pre sekundárne info).
- `alt` pri obrázkových prílohách/ikonách významových; dekoratívne ikony skryté pre čítačku.
- Viditeľný fokus, logické poradie fokusu, funkčné aj bez myši.

## Referencie na schválené mockupy (cesty k screenshotom)
- `.solution-factory/design/A.html` (zdroj)
- `.solution-factory/design/screenshots/A.png` (4 obrazovky: kategórie, detail, vyhľadávanie-empty, navrhované úlohy)

## Explicitne zamietnuté smery (aby sa k nim vývoj nevracal)
- **B „Kompaktný zoznam"** (hustý referenčný zoznam) — zamietnuté: príliš hutné pre nečastého používateľa v teréne.
- **C „Farebné dlaždice"** (hravá mriežka) — zamietnuté: príliš hravé/pestré na prevádzkovú príručku.
- **D „Tmavý prevádzkový"** (dark ops) — zamietnuté: Ivan chce svetlý, vzdušný vzhľad s veľkými cieľmi.
- Žiadne spodné tab-bary ani skryté hamburger menu — navigácia ostáva plochá a explicitná.
- Žiadne custom web fonty ani build krok — statické súbory, rýchle a offline-friendly.
