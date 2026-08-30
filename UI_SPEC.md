# UI Specification — Firemná príručka

Schválený koncept: **A — „Čistá karta"** (vzdušný, jednoduchý layout, veľké dotykové ciele)
Zamrznuté: 2026-08-30; sha256 v confirmed_handoff.json
Ivanov výber: Telegram 1050774149, 2026-08-30 — „vybral dizajn A ('Čistá karta') … zafixuj dizajn A".
Referenčný mockup: `.solution-factory/design/A.html` + `.solution-factory/design/screenshots/A.png`

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

## Typografia a spacing (zámer)
- Systémový font stack (-apple-system, Segoe UI, Roboto…). Bez custom web fontu (rýchle načítanie, offline-friendly).
- Škála: názov app ~26px/bold, nadpis detailu ~23px, telo 15px, popisy/muted 12–13px.
- Spacing: karty gap 12px, vnútorný padding kariet 16–18px, sekčné medzery 16–24px. Zaoblenia 14–20px (mäkké, priateľské).
- Jemné tiene (`0 2px 8-10px rgba(30,45,70,.04)`) — plochý, čistý dojem, nie „ťažké" karty.

## Vizuálny tón / farby
- Svetlý, vzdušný, pokojný. Pozadie `#f6f8fb`, karty biele, text `#1c2530`, muted `#6b7684`, linky/hranice `#eef1f5`.
- Akcent modrý `#2f7df6`, jemný akcent `#eaf2ff`. Úspech/„navrhnuté" zelený `#2e7d4f` na `#e8f4ec`.
- PDF odznak červenkastý `#e04a3a` na `#ffe9e6`.
- Jeden akcent, žiadne prehnané farby ani gradienty — dôraz na čitateľnosť pre netechnického pracovníka.

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
