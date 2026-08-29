# Functional Specification — Firemná príručka

Status: DRAFT (v1, 2026-08-30) — čaká na SCHVAĽUJEM; záznam schválenia pôjde do approvals.jsonl

## Cieľ (1 veta)
Firemná príručka pre zamestnankyňu ako HTML stránka hostovaná na GitHube (dostupná z mobilu
odkiaľkoľvek), ktorá drží firemné postupy a know-how, doplnená o agenta v Telegrame, ktorý
z príručky odpovedá a chýbajúce veci zapisuje ako návrhy úloh.

## Rozhodnutie
BUILD — typ: **HYBRID**.
- **APP časť:** statická HTML príručka na GitHub Pages; jediný zdroj pravdy = git repo s dátami.
- **Agent časť:** existujúci Ivanov OpenClaw agent získa schopnosť (skill/inštrukcie)
  odpovedať z obsahu príručky, jasne označiť odpoveď „mimo príručky" a zapisovať návrhy úloh.

Prečo najmenšie udržateľné riešenie: statický web + git = žiadny server, žiadna DB, git
história slúži ako audit aj záloha; agentská časť len rozširuje existujúceho agenta (Ivan
zvolil zdieľanie toho istého agenta, nie nový) — žiadny nový hosting ani druhý bot.

## Používatelia a role
- **Ivan (majiteľ):** plný prístup; JEDINÝ kto edituje obsah príručky (cez Telegram → agent
  commit + push). Spravuje sekciu „Navrhované úlohy".
- **Zamestnankyňa:** číta HTML príručku na mobile; kladie otázky agentovi cez **zdieľaný ten
  istý Telegram účet/agent** (rozhodnutie A). Bez samostatného prihlásenia.
  ⚠️ Dôsledok akceptovaný Ivanom: technicky je nerozlíšiteľná od Ivana a vidí celú jeho
  agentskú konverzáciu.

## Hlavné workflow
1. **Čítanie príručky:** otvorí verejnú URL na mobile → vyberie kategóriu → položku. Položka
   je buď očíslované kroky, alebo voľný text; oboje môže mať prílohy (PDF, foto).
2. **Otázka agentovi:** napíše do Telegramu → agent nájde v príručke a odpovie. Ak to
   v príručke NIE je → povie „toto v príručke nie je", odpovie z vlastných znalostí s jasným
   označením „(odpoveď mimo príručky)" a zapíše návrh úlohy do sekcie „Navrhované úlohy"
   + upozorní Ivana.
3. **Editácia obsahu (len Ivan):** cez Telegram povie čo pridať/upraviť → agent zapíše do dát
   repa, commit + push → GitHub Pages sa prebuduje → nová verzia online.
4. **Správa návrhov úloh:** agent pridáva návrhy do oddelenej sekcie; Ivan ich presunie medzi
   oficiálny obsah alebo zmaže.
Chybové cesty: zlyhaný push → agent to nahlási Ivanovi, obsah sa nezmení. Stránka je statická
(bez servera), takže výpadok behu je minimálne riziko.

## Dáta a stav
- **Zdroj pravdy:** git repo. Obsah ako štruktúrované dáta (markdown/JSON) + priečinok príloh.
- **Kategórie (rozšíriteľné):** Prerábka & zariaďovanie, Správa & booking, Stávkovanie,
  Skilly, Iné.
- **Položka:** `id, kategória, názov, telo (steps[] ALEBO richtext), prílohy[], updated_at`.
- **Príloha:** `{ type: pdf | image | video | audio, path/url, popis }` — typy video/audio sú
  v schéme od začiatku (architektúra pripravená), render v MVP len pdf/image.
- **Sekcia „Navrhované úlohy":** `{ text, dátum, zdroj_otázky, stav: navrhnuté }`.
- **Perzistencia/záloha/audit:** všetko v git repo (história = audit + záloha).

## Integrácie a nástroje
- Existujúce: OpenClaw agent (Telegram), git.
- Nové: GitHub repo + GitHub Pages (Actions build+deploy pri push); statický build príručky
  (dáta → HTML); manual-assistant skill v agentovi.

## Interakcia
- **Telegram (text):** otázky zamestnankyne + editácia obsahu Ivanom.
- **HTML príručka:** responzívna, mobil-first, čítanie. Jazyk SK.

## MVP teraz / Neskôr / Mimo rozsah
**Teraz:**
- Responzívna HTML príručka na GitHub Pages (kategórie, položky = kroky alebo voľný text,
  prílohy PDF + foto).
- Viditeľná sekcia „Navrhované úlohy" v HTML.
- Agent: odpovedá z príručky; označuje „mimo príručky"; zapisuje návrhy úloh + notifikuje
  Ivana; edituje obsah cez Telegram (commit+push).
- Dátový model rovno pripravený na video + audio prílohy.

**Neskôr:** render/prehrávanie video + audio; vyhľadávanie v príručke; prípadné heslo alebo
súkromný hosting; PWA/offline.

**Mimo rozsahu:** samostatný agent/účet pre zamestnankyňu (Ivan zvolil zdieľaný);
viacužívateľské role/prihlásenie.

## Bezpečnosť, súkromie, prístupy
- HTML **verejné** na GitHub Pages, chránené len neuhádnuteľnou URL (rozhodnutie A) — obsah je
  technicky verejný. Default = public repo + Pages (aj git zdroj je verejne prehliadateľný).
- Agent **zdieľaný** cez rovnaký Telegram účet na 2 mobiloch → zamestnankyňa vidí celú
  Ivanovu agentskú konverzáciu a môže konať ako Ivan. **Vedome akceptované Ivanom** (batch 3
  = A), zaznamenané v DISCOVERY_NOTES.
- GitHub token na push uložený na Ivanovej bráne, NIKDY v repo.

## Predpoklady (reverzibilné defaulty)
- Nový public GitHub repo `firemna-prirucka` + GitHub Pages, `*.github.io` URL (bez custom
  domény pre MVP).
- Build+deploy cez GitHub Actions pri každom push.
- Voľba statického generátora / build detailov = na implementátorovi (netýka sa Ivanovho
  rozhodnutia).

## Riziková trieda a verifikačný režim
**Medium → STANDARD.** (Verejná expozícia + push credential, no auth ani osobne citlivé dáta
nad rámec firemného obsahu; expozíciu Ivan akceptoval.)

## Otvorené otázky vyžadujúce Ivanovo rozhodnutie
Žiadne blokujúce. Predpoklady vyššie sú reverzibilné a potvrdia sa cez SCHVAĽUJEM.
