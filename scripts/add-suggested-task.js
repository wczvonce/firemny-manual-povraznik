#!/usr/bin/env node
/* Bezpečne pridá návrh úlohy do content.json a commitne+pushne — BEZ shellu.
 * Použitie: node scripts/add-suggested-task.js --text "..." --question "..."
 * Spúšťať z koreňa repa firemna-prirucka.
 * Poznámka: zápis NÁVRHU úlohy je bezpečná operácia a NEVYŽADUJE kódové slovo
 * (na rozdiel od editácie obsahu cez commit-content.js).
 * Bezpečnosť: git sa spúšťa cez execFileSync('git', [args]) — žiadny shell, žiadne
 * skladanie príkazu z reťazca. ID sa počíta až po fetch+rebase z aktuálneho origin/main,
 * aby nevznikali duplicitné st-000N. */
'use strict';
const fs = require('fs');
const { execFileSync } = require('child_process');

const FILE = 'content.json';

function git(args) {
  return execFileSync('git', args, { stdio: ['ignore', 'pipe', 'pipe'] });
}
function gitTry(args) {
  try { git(args); return { ok: true, out: '' }; }
  catch (e) { return { ok: false, err: e.stderr ? e.stderr.toString() : e.message }; }
}
function arg(name) {
  const i = process.argv.indexOf('--' + name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}
function fail(msg) { console.error('CHYBA: ' + msg); process.exit(1); }

const text = arg('text');
const question = arg('question') || '';
if (!text) fail('--text je povinný');

// 1) Sync s origin/main PRED výpočtom ID (aby ID nebolo duplicitné).
//    Strom je čistý (súbor ešte nezapisujeme), takže rebase je bezpečný.
const fetched = gitTry(['fetch', 'origin', 'main']);
if (fetched.ok) {
  const reb = gitTry(['rebase', 'origin/main']);
  if (!reb.ok) {
    gitTry(['rebase', '--abort']);
    fail('nepodarilo sa zosúladiť s origin/main (non-fast-forward/konflikt). ' +
      'Návrh úlohy NEBOL vytvorený ani zverejnený — vyrieš git stav ručne.\n' + reb.err);
  }
} else {
  console.error('POZOR: git fetch origin zlyhal (' + fetched.err.trim() +
    ') — pokračujem s lokálnym stavom; ID sa počíta lokálne (možné riziko duplicity pri pushi).');
}

// 2) Načítaj AKTUÁLNY content.json a vypočítaj ďalšie ID.
let data;
try { data = JSON.parse(fs.readFileSync(FILE, 'utf8')); }
catch (e) { fail('content.json sa neda sparsovat: ' + e.message); }

if (!Array.isArray(data.suggested_tasks)) data.suggested_tasks = [];

let max = 0;
for (const t of data.suggested_tasks) {
  const m = /^st-(\d+)$/.exec((t && t.id) || '');
  if (m) max = Math.max(max, parseInt(m[1], 10));
}
const id = 'st-' + String(max + 1).padStart(4, '0');
const entry = { id, text, source_question: question, date: new Date().toISOString(), status: 'navrhnuté' };
data.suggested_tasks.push(entry);

const out = JSON.stringify(data, null, 2) + '\n';
try { JSON.parse(out); } catch (e) { fail('vysledny JSON nevalidny, rusim'); }
fs.writeFileSync(FILE, out);

// 3) Commit (bez shellu). Pri zlyhaní vráť súbor, nech nezostane visieť lokálna zmena (M2).
const added = gitTry(['add', FILE]);
if (!added.ok) { gitTry(['checkout', '--', FILE]); fail('git add zlyhal: ' + added.err); }
const committed = gitTry(['commit', '-m', 'content: navrh ulohy ' + id]);
if (!committed.ok) {
  gitTry(['checkout', '--', FILE]);
  fail('commit zlyhal (mozno ziadna zmena): ' + committed.err);
}

// 4) Push. Pri non-fast-forward skús raz rebase+push; pri konflikte skonči jasne,
//    NEzverejnené (commit zostáva lokálne, žiadny duplicitný ID sa nepublikuje).
let pushed = true, pushErr = '';
let p = gitTry(['push', 'origin', 'main']);
if (!p.ok) {
  const f2 = gitTry(['fetch', 'origin', 'main']);
  const reb2 = f2.ok ? gitTry(['rebase', 'origin/main']) : { ok: false, err: f2.err };
  if (reb2.ok) {
    p = gitTry(['push', 'origin', 'main']);
    if (!p.ok) { pushed = false; pushErr = p.err; }
  } else {
    gitTry(['rebase', '--abort']);
    pushed = false;
    pushErr = 'konflikt so vzdialenymi zmenami — NEzverejnene, commit je lokalne. ' + reb2.err;
  }
}

console.log(JSON.stringify({
  ok: true, id, pushed, pushError: pushErr || undefined,
  note: pushed ? 'online do ~1 min' : 'PUSH ZLYHAL — zmena commitnuta lokalne, nahlas Ivanovi'
}, null, 2));
