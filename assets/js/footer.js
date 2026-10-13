/**
 * Khaleej Jeddah - Dynamic Unified Footer Loader
 * Loads /footer.html into #site-footer automatically with path-depth awareness.
 */
(function () {
    function getRelativeRoot() {
        var pathname = window.location.pathname || '';
        // Remove trailing slash and split
        var segments = pathname.replace(/^\/+/, '').split('/').filter(Boolean);
        // If current file has an extension like .html, last segment is the filename, not a dir
        if (segments.length > 0 && segments[segments.length - 1].indexOf('.') !== -1) {
            segments.pop();
        }
        var depth = segments.length;
        if (depth === 0) return './';
        var rel = '';
        for (var i = 0; i < depth; i++) {
            rel += '../';
        }
        return rel;
    }

    function initFooter() {
        var container = document.getElementById('site-footer');
        if (!container) return;

        var relativePath = getRelativeRoot() + 'footer.html';
        var candidates = ['/footer.html', relativePath, 'footer.html'];

        function tryFetch(index) {
            if (index >= candidates.length) {
                console.warn('Could not load footer component.');
                return;
            }
            var url = candidates[index];
            fetch(url)
                .then(function (res) {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return res.text();
                })
                .then(function (html) {
                    container.innerHTML = html;
                })
                .catch(function () {
                    tryFetch(index + 1);
                });
        }

        tryFetch(0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFooter);
    } else {
        initFooter();
    }
})();
