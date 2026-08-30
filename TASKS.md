# TASKS — firemná príručka

## Slice 1 — Scaffold + render z content.json  [DONE — verified 2026-08-30, commit a5d8a34]
- [x] index.html shell (SK, viewport, sémantika)
- [x] styles.css mobil-first responzívne
- [x] app.js: fetch content.json → render kategórie → položky → detail (steps|text) + prílohy
- [x] sekcia „Navrhované úlohy" render z suggested_tasks
- [x] content.json vzorové dáta (5 kategórií, steps+text, PDF+foto, video/audio ukážka, návrhy)
- [x] README.md: lokálne spustenie + smoke
- [x] bezpečný render (žiadny innerHTML so surovými dátami — potvrdené grep)
- Akceptácia: AC-002/AC-005/AC-010 overené (JSON, render paths, bezpečnosť); AC-001/AC-003/AC-004 vizuálne → Slice 2

## Slice 2 — Responzívny polish + prílohy + media placeholdery  [DONE — verified 2026-08-30, dizajn A]
- [x] Dizajn A „Čistá karta" aplikovaný (karty s ikonami, search bar, číslované kroky, pill, task chip)
- [x] PDF otvorenie (chip target=_blank), foto náhľad → prístupný lightbox (Esc/backdrop/close, focus restore)
- [x] video/audio placeholder (path ignorovaný — nespadne); unknown-type fallback
- [x] Vyhľadávanie (diakritika-necitlivé) + prázdny stav s návrhmi kategórií
- [x] desktop + mobil šírka overené screenshotom (390×844 + 1200px, 8 shots)
- [x] a11y (alt, fokus, kontrast, dotykové ciele, sémantika); 0 console errors
- Akceptácia: AC-003, AC-004 PASS (+ AC-002/AC-005/AC-010 re-overené vizuálne)

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
