/**
 * Khaleej Jeddah — static partials builder
 *
 * Writes shared HTML into every page so that navigation links and the footer
 * exist in the static HTML (crawlable without JavaScript):
 *   1. Injects footer.html into <div id="site-footer"> between marker comments.
 *   2. Fills #desktop-services-dropdown and #mobile-services-dropdown with the
 *      canonical services list (keeping each page's own link classes).
 *
 * Idempotent: safe to run repeatedly.  Usage:  npm run build:partials
 * After editing footer.html or SERVICES below, re-run this script.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['node_modules', '.git', 'assets', 'dist', 'src', 'favicon', 'scripts']);

// Keep in sync with assets/js/services.js (fallback for pages without static lists)
const SERVICES = [
    { name: 'نقل الأثاث المنزلي بجدة', url: '/furniture-moving-in-jeddah/' },
    { name: 'نقل عفش شقق بجدة', url: '/apartment-furniture-moving-jeddah/' },
    { name: 'نقل عفش فلل بجدة', url: '/villa-furniture-moving-jeddah/' },
    { name: 'تغليف العفش بجدة', url: '/furniture-packing-jeddah/' },
    { name: 'فك وتركيب الأثاث بجدة', url: '/furniture-assembly-jeddah/' },
    { name: 'دينا نقل عفش بجدة', url: '/furniture-moving-truck-in-jeddah/' },
    { name: 'نقل غرف النوم بجدة', url: '/bedroom-moving-jeddah/' },
    { name: 'نقل المطابخ بجدة', url: '/kitchen-moving-jeddah/' },
    { name: 'نقل الأجهزة الكهربائية', url: '/electrical-appliances-moving-jeddah/' },
    { name: 'نقل المكاتب والشركات', url: '/office-and-company-moving-jeddah/' },
    { name: 'تخزين الأثاث بجدة', url: '/furniture-storage-in-jeddah/' },
    { name: 'أسعار نقل العفش بجدة', url: '/furniture-moving-prices-in-jeddah/' },
];

const DEFAULT_CLASS = {
    'desktop-services-dropdown': 'block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-primary transition',
    'mobile-services-dropdown': 'block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-primary transition border-b border-gray-100 last:border-0',
};

const FOOTER_START = '<!-- footer:start — generated from /footer.html by scripts/build-partials.js; edit footer.html then re-run -->';
const FOOTER_END = '<!-- footer:end -->';

function listPages(dir, out = []) {
    for (const f of fs.readdirSync(dir)) {
        if (SKIP.has(f)) continue;
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) listPages(p, out);
        else if (f.endsWith('.html') && f !== 'footer.html') out.push(p);
    }
    return out;
}

function pageUrl(file) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    if (rel === 'index.html') return '/';
    return '/' + rel.replace(/index\.html$/, '');
}

function fillDropdown(html, id, url) {
    const re = new RegExp('(<ul\\b[^>]*\\bid="' + id + '"[^>]*>)([\\s\\S]*?)(</ul>)');
    const m = html.match(re);
    if (!m) return html;
    const inner = m[2];
    const indentMatch = html.slice(0, m.index).match(/\n([ \t]*)[^\n]*$/);
    const indent = (indentMatch ? indentMatch[1] : '') + '    ';

    // Preserve an existing "all services" header item and the page's item styling.
    const items = [...inner.matchAll(/<li\b[^>]*>[\s\S]*?<\/li>/g)].map(x => x[0]);
    let header = '';
    let itemClass = DEFAULT_CLASS[id];
    if (items.length) {
        if (/href="\/services\/"/.test(items[0])) header = items.shift();
        const plain = items.find(li => !/font-bold|bg-blue-50 text-primary/.test(li)) || items[0];
        const cls = plain && plain.match(/<a\b[^>]*class="([^"]*)"/);
        if (cls) itemClass = cls[1];
    }
    const lis = SERVICES.map(s => {
        const current = s.url === url ? ' aria-current="page"' : '';
        return `${indent}<li><a href="${s.url}" class="${itemClass}"${current}>${s.name}</a></li>`;
    });
    if (header) lis.unshift(indent + header.trim());
    const closeIndent = indent.slice(0, -4);
    return html.replace(re, `$1\n${lis.join('\n')}\n${closeIndent}$3`);
}

function injectFooter(html, footer) {
    const block = `${FOOTER_START}\n${footer.trim()}\n${FOOTER_END}`;
    const withMarkers = /<div id="site-footer">[\s\S]*?<!-- footer:end -->\s*<\/div>/;
    if (withMarkers.test(html)) return html.replace(withMarkers, `<div id="site-footer">\n${block}\n</div>`);
    return html.replace(/<div id="site-footer">\s*<\/div>/, `<div id="site-footer">\n${block}\n</div>`);
}

const footer = fs.readFileSync(path.join(ROOT, 'footer.html'), 'utf8');
let changed = 0;
for (const file of listPages(ROOT)) {
    const before = fs.readFileSync(file, 'utf8');
    const url = pageUrl(file);
    let html = injectFooter(before, footer);
    html = fillDropdown(html, 'desktop-services-dropdown', url);
    html = fillDropdown(html, 'mobile-services-dropdown', url);
    if (html !== before) {
        fs.writeFileSync(file, html);
        changed++;
        console.log('updated', path.relative(ROOT, file));
    }
}
console.log(`done: ${changed} file(s) updated`);
