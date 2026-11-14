/**
 * Builds assets/css/fa-subset.css from the local Font Awesome 6.7.2 (assets/css/all.min.css),
 * keeping all base/utility/@font-face rules but only the icon rules actually used
 * in the site's HTML and JS. Re-run after adding new icons:  npm run build:icons
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'assets/css/all.min.css');
const OUT = path.join(ROOT, 'assets/css/fa-subset.css');
const SKIP = new Set(['node_modules', '.git', 'webfonts', 'fonts', 'img', 'scripts']);

function walk(dir, out = []) {
    for (const f of fs.readdirSync(dir)) {
        if (SKIP.has(f)) continue;
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) walk(p, out);
        else if (/\.(html|js)$/.test(f)) out.push(p);
    }
    return out;
}

const used = new Set();
for (const f of walk(ROOT)) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/\bfa-[a-z0-9-]+/g)) used.add(m[0].slice(3));
}

const css = fs.readFileSync(SRC, 'utf8');
const header = (css.match(/^\/\*![\s\S]*?\*\//) || [''])[0];
const body = css.slice(header.length);

// Split top-level rules; at-rules with nested blocks (@keyframes, @media) are kept whole.
const rules = [];
let depth = 0, start = 0;
for (let i = 0; i < body.length; i++) {
    if (body[i] === '{') depth++;
    else if (body[i] === '}') {
        depth--;
        if (depth === 0) { rules.push(body.slice(start, i + 1)); start = i + 1; }
    }
}

const ICON_RULE = /^((?:\.fa-[a-z0-9-]+,?)+)\{--fa:"[^"]*"\}$/;
let kept = 0, dropped = 0;
const out = rules.filter(r => {
    const m = r.match(ICON_RULE);
    if (!m) return true;
    const names = m[1].split(',').filter(Boolean).map(s => s.slice(4));
    const keep = names.some(n => used.has(n));
    keep ? kept++ : dropped++;
    return keep;
});

fs.writeFileSync(OUT, header + '\n' + out.join('') + '\n');
console.log(`icons kept: ${kept}, dropped: ${dropped}`);
console.log(`size: ${css.length} -> ${fs.statSync(OUT).size} bytes`);
