/**
 * Khaleej Jeddah — static SEO / integrity checks.   Usage: npm run test:seo
 * Errors → exit code 1. Warnings are informational.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ORIGIN = 'https://khaleejjeddah.com';
const SKIP = new Set(['node_modules', '.git', 'assets', 'dist', 'src', 'favicon', 'scripts']);
const errors = [];
const warns = [];
const err = (p, m) => errors.push(`${p}: ${m}`);
const warn = (p, m) => warns.push(`${p}: ${m}`);

function listPages(dir, out = []) {
    for (const f of fs.readdirSync(dir)) {
        if (SKIP.has(f)) continue;
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) listPages(p, out);
        else if (f.endsWith('.html') && f !== 'footer.html') out.push(p);
    }
    return out;
}
const urlOf = f => {
    const r = path.relative(ROOT, f).replace(/\\/g, '/');
    return r === 'index.html' ? '/' : '/' + r.replace(/index\.html$/, '');
};
const strip = s => s.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const get = (h, re) => { const m = h.match(re); return m ? m[1].trim() : null; };
const localPath = u => path.join(ROOT, decodeURIComponent(u.split('#')[0].split('?')[0]));

function resolveInternal(u) {
    let p = u.split('#')[0].split('?')[0];
    if (!p) return true;
    const fp = localPath(p);
    if (p.endsWith('/')) return fs.existsSync(path.join(fp, 'index.html'));
    return fs.existsSync(fp) || fs.existsSync(path.join(fp, 'index.html'));
}

const files = listPages(ROOT);
const pages = {};
const titles = {}, descs = {};

for (const file of files) {
    const h = fs.readFileSync(file, 'utf8');
    const url = urlOf(file);
    const is404 = url === '/404.html';
    const rel = path.relative(ROOT, file);
    const body = (h.match(/<body[\s\S]*<\/body>/i) || [''])[0];
    pages[url] = { h, body };

    // --- head meta
    const title = get(h, /<title>([\s\S]*?)<\/title>/i);
    const desc = get(h, /<meta\s+name="description"[^>]*content="([^"]*)"/i);
    if (!title) err(rel, 'missing <title>');
    else {
        if (title.length > 70) warn(rel, `title ${title.length} chars`);
        (titles[title] = titles[title] || []).push(rel);
    }
    if (!is404) {
        if (!desc) err(rel, 'missing meta description');
        else {
            if (desc.length > 170 || desc.length < 70) warn(rel, `description ${desc.length} chars`);
            (descs[desc] = descs[desc] || []).push(rel);
        }
        const canon = get(h, /<link\s+rel="canonical"[^>]*href="([^"]+)"/i);
        if (canon !== ORIGIN + url) err(rel, `canonical "${canon}" != ${ORIGIN + url}`);
        const ogurl = get(h, /property="og:url"\s+content="([^"]+)"/i);
        if (ogurl && ogurl !== canon) err(rel, `og:url "${ogurl}" != canonical`);
        const robots = get(h, /<meta\s+name="robots"[^>]*content="([^"]+)"/i) || '';
        if (/noindex/.test(robots)) warn(rel, 'noindex');
    }
    if (!/<html[^>]*lang="ar"[^>]*dir="rtl"/.test(h)) err(rel, 'html lang/dir missing');
    if (!/name="viewport"/.test(h)) err(rel, 'missing viewport');

    // --- headings
    const h1 = (body.match(/<h1\b/gi) || []).length;
    if (h1 !== 1) err(rel, `${h1} <h1> tags`);

    // --- structural balance (cheap broken-HTML detector)
    for (const tag of ['div', 'section', 'main', 'article', 'ul', 'ol', 'nav', 'footer', 'details', 'table', 'a', 'p']) {
        const o = (body.match(new RegExp(`<${tag}\\b`, 'gi')) || []).length;
        const c = (body.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
        if (o !== c) err(rel, `unbalanced <${tag}>: ${o} open / ${c} close`);
    }

    // --- links
    for (const m of body.matchAll(/<a\b[^>]*href="([^"]+)"/gi)) {
        let u = m[1];
        if (/^(tel:|mailto:|#|javascript:)/i.test(u)) continue;
        if (/^https?:\/\/(www\.)?khaleejjeddah\.com/i.test(u)) { warn(rel, `absolute internal link ${u}`); u = u.replace(/^https?:\/\/(www\.)?khaleejjeddah\.com/i, ''); }
        if (/^https?:/i.test(u)) continue;
        if (!u.startsWith('/')) { err(rel, `relative link ${u}`); continue; }
        if (!resolveInternal(u)) err(rel, `broken link ${u}`);
    }
    // --- assets
    for (const m of h.matchAll(/<(?:img|script|link)\b[^>]*(?:src|href)="(\/[^"]+)"/gi)) {
        if (/^\/\//.test(m[1])) continue;
        if (!resolveInternal(m[1])) err(rel, `missing asset ${m[1]}`);
    }
    for (const m of body.matchAll(/<img\b[^>]*>/gi)) {
        const t = m[0];
        if (!/\balt="[^"]+"/.test(t)) err(rel, `img without alt: ${t.slice(0, 80)}`);
        if (!/\bwidth="\d+"/.test(t) || !/\bheight="\d+"/.test(t)) warn(rel, `img without width/height: ${t.slice(0, 80)}`);
    }
    for (const m of h.matchAll(/(?:og:image|twitter:image)"\s+content="([^"]+)"/gi)) {
        if (m[1].startsWith(ORIGIN) && !resolveInternal(m[1].slice(ORIGIN.length))) err(rel, `missing social image ${m[1]}`);
    }

    // --- inline JavaScript must parse
    for (const m of h.matchAll(/<script(?![^>]*(?:src=|application\/ld\+json))[^>]*>([\s\S]*?)<\/script>/gi)) {
        try { new Function(m[1]); } catch (e) { err(rel, 'inline <script> syntax error: ' + e.message); }
    }

    // --- JSON-LD
    const text = strip(body);
    for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
        let o;
        try { o = JSON.parse(m[1]); } catch (e) { err(rel, 'JSON-LD parse error: ' + e.message); continue; }
        const nodes = [];
        (function walk(n) { if (Array.isArray(n)) return n.forEach(walk); if (n && typeof n === 'object') { nodes.push(n); Object.values(n).forEach(walk); } })(o);
        for (const n of nodes) {
            const t = [].concat(n['@type'] || []);
            if (t.includes('Question')) {
                if (!/[؟?]$/.test((n.name || '').trim())) err(rel, `FAQ question not phrased as a question: "${n.name}"`);
                const probe = (n.name || '').replace(/[؟?]/g, '').trim().slice(0, 25);
                if (probe && !text.includes(probe)) warn(rel, `FAQ question not visible on page: "${n.name}"`);
            }
            if (t.some(x => /MovingCompany|LocalBusiness/.test(x)) && n.name && n.name !== 'خليج جدة لنقل العفش') err(rel, `org name variant "${n.name}"`);
            if (n.postalCode || n.geo) warn(rel, 'unverified postalCode/geo present');
            for (const k of ['url', 'item']) {
                const v = n[k];
                if (typeof v === 'string' && v.startsWith(ORIGIN) && !/\.(webp|jpe?g|png)$/.test(v) && !resolveInternal(v.slice(ORIGIN.length))) err(rel, `schema ${k} points to missing page ${v}`);
            }
            if (typeof n['@id'] === 'string' && n['@id'].startsWith(ORIGIN)) {
                const base = n['@id'].slice(ORIGIN.length).split('#')[0];
                if (base && !resolveInternal(base)) err(rel, `schema @id points to missing page ${n['@id']}`);
            }
        }
    }
}

// --- duplicates
for (const [t, ps] of Object.entries(titles)) if (ps.length > 1) err(ps.join(', '), `duplicate title "${t}"`);
for (const [d, ps] of Object.entries(descs)) if (ps.length > 1) err(ps.join(', '), `duplicate description`);

// --- sitemap
const sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
for (const l of locs) if (!resolveInternal(l.slice(ORIGIN.length))) err('sitemap.xml', `missing page ${l}`);
for (const u of Object.keys(pages)) if (u !== '/404.html' && !locs.includes(ORIGIN + u)) err('sitemap.xml', `page not listed ${u}`);
const smi = fs.readFileSync(path.join(ROOT, 'sitemap-images.xml'), 'utf8');
for (const m of smi.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)) if (!resolveInternal(m[1].slice(ORIGIN.length))) err('sitemap-images.xml', `missing image ${m[1]}`);
for (const m of smi.matchAll(/<loc>([^<]+)<\/loc>/g)) if (!resolveInternal(m[1].slice(ORIGIN.length))) err('sitemap-images.xml', `missing page ${m[1]}`);

// --- manifest
const mf = JSON.parse(fs.readFileSync(path.join(ROOT, 'favicon/site.webmanifest'), 'utf8'));
for (const i of mf.icons) if (!resolveInternal(i.src)) err('site.webmanifest', `missing icon ${i.src}`);

// --- near-duplicate content between area pages
const shingles = u => {
    const w = strip(pages[u].body.replace(/<footer[\s\S]*?<\/footer>/gi, '').replace(/<nav[\s\S]*?<\/nav>/gi, '')).replace(/[^؀-ۿ0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
    const s = new Set(); for (let i = 0; i + 5 <= w.length; i++) s.add(w.slice(i, i + 5).join(' ')); return s;
};
// neighbourhood pages + intercity route pages must not be near-duplicates of each other
const areaUrls = Object.keys(pages).filter(u => /^\/(areas|cities)\/.+/.test(u));
const sh = Object.fromEntries(areaUrls.map(u => [u, shingles(u)]));
let maxSim = 0;
for (let i = 0; i < areaUrls.length; i++) for (let j = i + 1; j < areaUrls.length; j++) {
    const a = sh[areaUrls[i]], b = sh[areaUrls[j]]; let n = 0; for (const x of a) if (b.has(x)) n++;
    const c = n / Math.min(a.size, b.size) * 100; maxSim = Math.max(maxSim, c);
    if (c > 30) err(`${areaUrls[i]} ~ ${areaUrls[j]}`, `area pages ${c.toFixed(1)}% similar (limit 30%)`);
}

console.log(`pages checked: ${files.length}`);
console.log(`max area-page similarity: ${maxSim.toFixed(1)}%`);
console.log(`\nWARNINGS (${warns.length})`); warns.forEach(w => console.log('  - ' + w));
console.log(`\nERRORS (${errors.length})`); errors.forEach(e => console.log('  ✗ ' + e));
process.exit(errors.length ? 1 : 0);
