# Acceptance Criteria — Firemná príručka

Stabilné ID; každé kritické kritérium musí mať aspoň jeden vykonaný test alebo overený
prechod. NOT RUN sa nikdy nemení na PASS.

| ID | Požiadavka | Ako sa overí | Kritické? | Stav |
|---|---|---|---|---|
| AC-001 | HTML príručka dostupná cez verejnú GitHub Pages URL, responzívna na mobile | Otvorenie URL v mobilnej šírke, screenshot | Áno | NOT RUN |
| AC-002 | Kategórie (Prerábka&zariaďovanie, Správa&booking, Stávkovanie, Skilly, Iné) sa zobrazia a dajú otvoriť | Navigácia klikom cez všetky kategórie | Áno | NOT RUN |
| AC-003 | Položka podporuje očíslované kroky AJ voľný text, s prílohami PDF a foto (zobrazenie/otvorenie) | Ukážková položka každého typu + otvorenie PDF a foto | Áno | NOT RUN |
| AC-004 | Dátový model prílohy má typ pripravený na video+audio; položka s type=video/audio nespadne (placeholder) | Kontrola schémy + test položky type=video | Nie | NOT RUN |
| AC-005 | Sekcia „Navrhované úlohy" viditeľná v HTML a zobrazuje zapísané návrhy | Pridať návrh → objaví sa v sekcii | Áno | NOT RUN |
| AC-006 | Agent odpovie z príručky na otázku pokrytú obsahom | Testovacia otázka pokrytá obsahom | Áno | NOT RUN |
| AC-007 | Na otázku mimo príručky agent označí „(mimo príručky)", zapíše návrh úlohy a upozorní Ivana | Testovacia otázka mimo obsahu → kontrola odpovede + zápisu + notifikácie | Áno | NOT RUN |
| AC-008 | Editácia obsahu cez Telegram (len Ivan) → commit+push → zmena viditeľná online po builde | Pridať položku cez TG → po deploy viditeľná na URL | Áno | NOT RUN |
| AC-009 | Zlyhaný push sa nahlási Ivanovi a obsah ostáva konzistentný | Simulovať zlyhanie push | Nie | NOT RUN |
| AC-010 | Celé UI aj obsah v SK | Vizuálna kontrola stránky | Nie | NOT RUN |
| AC-011 | GitHub token / secrets nie sú commitnuté v repo | Scan repa (git grep / secret scan) | Áno | NOT RUN |
