#!/usr/bin/env node
/* Bezpečne pridá návrh úlohy do content.json a commitne+pushne.
 * Použitie: node scripts/add-suggested-task.js --text "..." --question "..."
 * Spúšťať z koreňa repa firemna-prirucka. */
'use strict';
const fs = require('fs');
const { execSync } = require('child_process');

function arg(name) {
  const i = process.argv.indexOf('--' + name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}
const text = arg('text');
const question = arg('question') || '';
if (!text) { console.error('CHYBA: --text je povinný'); process.exit(1); }

const FILE = 'content.json';
let data;
try { data = JSON.parse(fs.readFileSync(FILE, 'utf8')); }
catch (e) { console.error('CHYBA: content.json sa neda sparsovat: ' + e.message); process.exit(1); }

if (!Array.isArray(data.suggested_tasks)) data.suggested_tasks = [];

// dalsie id v tvare st-000N
let max = 0;
for (const t of data.suggested_tasks) {
  const m = /^st-(\d+)$/.exec(t && t.id || '');
  if (m) max = Math.max(max, parseInt(m[1], 10));
}
const id = 'st-' + String(max + 1).padStart(4, '0');
const entry = { id, text, source_question: question, date: new Date().toISOString(), status: 'navrhnuté' };
data.suggested_tasks.push(entry);

const out = JSON.stringify(data, null, 2) + '\n';
// over, ze vysledok je validny JSON
try { JSON.parse(out); } catch (e) { console.error('CHYBA: vysledny JSON nevalidny, rusim'); process.exit(1); }
fs.writeFileSync(FILE, out);

try {
  execSync('git add ' + FILE, { stdio: 'pipe' });
  execSync('git commit -m "content: navrh ulohy ' + id + '"', { stdio: 'pipe' });
} catch (e) {
  console.error('CHYBA pri commite: ' + (e.stderr ? e.stderr.toString() : e.message));
  process.exit(1);
}
let pushed = true, pushErr = '';
try { execSync('git push origin main', { stdio: 'pipe' }); }
catch (e) { pushed = false; pushErr = (e.stderr ? e.stderr.toString() : e.message); }

console.log(JSON.stringify({ ok: true, id, pushed, pushError: pushErr || undefined,
  note: pushed ? 'online do ~1 min' : 'PUSH ZLYHAL — zmena commitnuta lokalne, nahlas Ivanovi' }, null, 2));
