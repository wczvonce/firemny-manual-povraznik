# TASKS — firemná príručka

## Slice 1 — Scaffold + render z content.json  [IN PROGRESS]
- [ ] index.html shell (SK, viewport, sémantika)
- [ ] styles.css mobil-first responzívne
- [ ] app.js: fetch content.json → render kategórie → položky → detail (steps|text) + prílohy
- [ ] sekcia „Navrhované úlohy" render z suggested_tasks
- [ ] content.json vzorové dáta (5 kategórií, steps+text, PDF+foto, video/audio ukážka, návrhy)
- [ ] README.md: lokálne spustenie + smoke
- [ ] bezpečný render (žiadny innerHTML so surovými dátami)
- Akceptácia: AC-001..AC-005, AC-010 (lokálne, browser smoke)

## Slice 2 — Responzívny polish + prílohy + media placeholdery  [PENDING]
- [ ] PDF otvorenie/embed, foto náhľad/zväčšenie
- [ ] video/audio placeholder (nesmie spadnúť)
- [ ] desktop + mobil šírka overené screenshotom
- [ ] a11y (alt, fokus, kontrast)
- Akceptácia: AC-003, AC-004

## Agent časť (HYBRID, po overení appky)  [PENDING]
- [ ] manual-assistant skill: odpoveď z content.json
- [ ] „(mimo príručky)" označenie + odpoveď z vlastných znalostí
- [ ] zápis návrhu úlohy do content.json.suggested_tasks + notifikácia Ivana
- [ ] editácia obsahu cez Telegram (commit+push abstrakcia)
- Akceptácia: AC-006, AC-007, AC-008, AC-009

## GATED — publikácia  [PENDING — čaká Ivanov súhlas]
- [ ] vytvoriť GitHub repo, nastaviť Pages, push
- [ ] overiť verejnú URL na mobile (AC-001 naostro)
- [ ] secret scan repa (AC-011)
