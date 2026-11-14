/**
 * Reports Tailwind classes used in HTML that are missing from dist/output.css
 * (and not defined in the page's inline <style>).
 * Usage: node scripts/check-css-classes.js file1.html [file2.html ...]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BS = String.fromCharCode(92); // backslash
const css = fs.readFileSync(path.join(ROOT, 'dist/output.css'), 'utf8') +
    fs.readFileSync(path.join(ROOT, 'dist/custom.css'), 'utf8');
const SPECIAL = new Set(':/[].%#(),!&>+~=*\'"@'.split(''));
const esc = c => '.' + [...c].map(ch => (SPECIAL.has(ch) ? BS + ch : ch)).join('');
const IGNORE = /^(fa[srbl]?|fa-.*|fab|fas|far|faq-.*|nav-item|active|no-link-style|content-section|sticky-sidebar|hero-pattern|gradient-bg-custom|btn-.*|float-.*|card-service|trust-badge-card|group|peer)$/;

let missing = 0;
for (const f of process.argv.slice(2)) {
    const h = fs.readFileSync(f, 'utf8');
    const inline = (h.match(/<style[\s\S]*?<\/style>/gi) || []).join('\n');
    const classes = new Set();
    for (const m of h.matchAll(/class="([^"]+)"/g)) m[1].split(/\s+/).filter(Boolean).forEach(c => classes.add(c));
    const miss = [...classes].filter(c => !IGNORE.test(c) && !css.includes(esc(c)) && !inline.includes(esc(c)));
    if (miss.length) {
        missing += miss.length;
        console.log(path.relative(ROOT, f) + ': ' + miss.join(' '));
    }
}
console.log(missing ? `\n${missing} missing class usage(s)` : 'all classes present');
process.exitCode = missing ? 1 : 0;
