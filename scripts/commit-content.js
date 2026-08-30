#!/usr/bin/env node
/* Over validitu content.json, over KÓDOVÉ SLOVO, potom commit+push — BEZ shellu.
 * Použitie:
 *   node scripts/commit-content.js --code "<kodove-slovo>" -m "<popis zmeny>"
 * Spúšťať z koreňa repa firemna-prirucka PO úprave content.json.
 *
 * Bezpečnosť:
 *  - git sa spúšťa cez execFileSync('git', [args]) — žiadny shell, žiadne skladanie
 *    príkazu z reťazca (B1).
 *  - Editácia OBSAHU je povolená LEN ak sedí kódové slovo (I3). Kódové slovo je uložené
 *    v LOKÁLNOM súbore mimo tohto (verejného) repa:
 *      ~/.openclaw/workspace/skills/firemna-prirucka-asistent/.edit-secret
 *    Kódové slovo NIKDY nevpisuj do tohto repa, správ ani logov.
 *  - Pridáva sa len content.json + presne referencované, overené prílohy z assets/ (M1).
 *  - Pred pushom fetch+rebase; pri konflikte sa nič nezverejní (I1). */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const FILE = 'content.json';
const SECRET_FILE = path.join(os.homedir(), '.openclaw', 'workspace', 'skills',
  'firemna-prirucka-asistent', '.edit-secret');

function git(args) {
  return execFileSync('git', args, { stdio: ['ignore', 'pipe', 'pipe'] });
}
function gitTry(args) {
  try { git(args); return { ok: true }; }
  catch (e) { return { ok: false, err: e.stderr ? e.stderr.toString() : e.message }; }
}
function arg(name) {
  let i = process.argv.indexOf('--' + name);
  if (i === -1 && name.length === 1) i = process.argv.indexOf('-' + name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}
function fail(msg, code) { console.error('CHYBA: ' + msg); process.exit(code || 1); }

// Rovnaká validácia cesty ako vo frontende (app.js): len relatívna cesta do assets/.
function safeAssetPath(p) {
  if (typeof p !== 'string' || !p) return null;
  if (p.indexOf(':') !== -1) return null;
  if (p.charAt(0) === '/') return null;
  if (p.indexOf('\\') !== -1) return null;
  if (p.indexOf('..') !== -1) return null;
  if (p.indexOf('assets/') !== 0) return null;
  return p;
}

const msg = arg('m') || arg('message');
if (!msg) fail('chýba popis zmeny (-m "<popis>")', 2);

// 1) Over platnosť content.json. Pri nevalidnom JSON vráť súbor a nič nezverejni.
let data;
try { data = JSON.parse(fs.readFileSync(FILE, 'utf8')); }
catch (e) {
  console.error('content.json nevalidny JSON: ' + e.message + '\nVratam subor (git checkout -- content.json).');
  gitTry(['checkout', '--', FILE]);
  process.exit(1);
}

// 2) Kódové slovo (I3) — editácia obsahu len s platným kódom.
const code = arg('code');
let secret = null;
try { secret = fs.readFileSync(SECRET_FILE, 'utf8').trim(); } catch (_) {}
if (!secret) {
  fail('kódové slovo nie je nastavené (.edit-secret chýba/prázdny) — editácia obsahu zamietnutá. ' +
    'Nastav ho v ' + SECRET_FILE, 2);
}
if (!code || code.trim() !== secret) {
  fail('nesprávne alebo chýbajúce kódové slovo — editácia obsahu zamietnutá. ' +
    '(Zápis návrhov úloh cez add-suggested-task.js kódové slovo nevyžaduje.)', 2);
}

// 3) git add: len content.json + presne referencované, overené a existujúce prílohy (M1).
const toAdd = [FILE];
const items = Array.isArray(data.items) ? data.items : [];
for (const it of items) {
  const atts = it && Array.isArray(it.attachments) ? it.attachments : [];
  for (const att of atts) {
    const sp = safeAssetPath(att && att.path);
    if (sp && fs.existsSync(sp) && toAdd.indexOf(sp) === -1) toAdd.push(sp);
  }
}
const added = gitTry(['add'].concat(toAdd));
if (!added.ok) fail('git add zlyhal: ' + added.err);

// 4) commit (bez shellu; správa ide ako argument, nie do reťazca).
const committed = gitTry(['commit', '-m', msg]);
if (!committed.ok) fail('commit zlyhal (mozno ziadna zmena): ' + committed.err);

// 5) fetch+rebase pred pushom; pri konflikte nič nezverejni (commit zostáva lokálne).
let pushed = true, pushErr = '';
const f1 = gitTry(['fetch', 'origin', 'main']);
if (f1.ok) {
  const reb = gitTry(['rebase', 'origin/main']);
  if (!reb.ok) {
    gitTry(['rebase', '--abort']);
    pushed = false;
    pushErr = 'konflikt so vzdialenymi zmenami — NEzverejnene. Zmena je commitnuta lokalne, ' +
      'treba manualny merge. ' + reb.err;
  }
} else {
  console.error('POZOR: git fetch origin zlyhal (' + f1.err.trim() + ') — skúšam push priamo.');
}

// 6) push (ak rebase neskončil konfliktom).
if (pushed) {
  const p = gitTry(['push', 'origin', 'main']);
  if (!p.ok) { pushed = false; pushErr = p.err; }
}

console.log(JSON.stringify({
  ok: true, pushed, pushError: pushErr || undefined,
  note: pushed
    ? 'online do ~1 min na https://wczvonce.github.io/firemny-manual-povraznik/'
    : 'PUSH ZLYHAL — commitnute lokalne, nahlas Ivanovi'
}, null, 2));
