#!/usr/bin/env node
/* Over validitu content.json, potom commit+push.
 * Použitie: node scripts/commit-content.js "commit message"
 * Spúšťať z koreňa repa firemna-prirucka po úprave content.json. */
'use strict';
const fs = require('fs');
const { execSync } = require('child_process');

const msg = process.argv[2] || 'content: uprava prirucky';
try { JSON.parse(fs.readFileSync('content.json', 'utf8')); }
catch (e) {
  console.error('CHYBA: content.json nevalidny JSON: ' + e.message + '\nVratam subor (git checkout -- content.json).');
  try { execSync('git checkout -- content.json', { stdio: 'pipe' }); } catch (_) {}
  process.exit(1);
}
try {
  execSync('git add content.json assets', { stdio: 'pipe' });
  execSync('git commit -m ' + JSON.stringify(msg), { stdio: 'pipe' });
} catch (e) {
  console.error('CHYBA pri commite (mozno ziadna zmena): ' + (e.stderr ? e.stderr.toString() : e.message));
  process.exit(1);
}
let pushed = true, pushErr = '';
try { execSync('git push origin main', { stdio: 'pipe' }); }
catch (e) { pushed = false; pushErr = (e.stderr ? e.stderr.toString() : e.message); }
console.log(JSON.stringify({ ok: true, pushed, pushError: pushErr || undefined,
  note: pushed ? 'online do ~1 min na https://wczvonce.github.io/firemny-manual-povraznik/' : 'PUSH ZLYHAL — commitnute lokalne, nahlas Ivanovi' }, null, 2));
