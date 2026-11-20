// Client side of the build-time search index (see layouts/index.searchindex.json).
// Bundled only when the site enables the SearchIndex output (see partials/head.html).
document.addEventListener('DOMContentLoaded', function () {
  const overlay = document.getElementById('search-overlay');
  if (!overlay) return;

  const input = document.getElementById('search-input');
  const countEl = document.getElementById('search-count');
  const resultsEl = document.getElementById('search-results');
  const closeBtn = overlay.querySelector('.search-close');
  const toggles = document.querySelectorAll('.search-toggle button');

  const PREFIX_MATCH_WEIGHT = 0.7; // exact word matches rank above prefix matches
  const DEBOUNCE_MS = 100;
  const MAX_RESULTS = 15;
  // The overlay's own id, so the fragment can't collide with a heading anchor such as #search.
  const HASH = '#search-overlay';

  // Translated strings from partials/search-overlay.html; {count} and {shown} are placeholders.
  function text(name, values) {
    return Object.entries(values || {}).reduce(
      (s, [key, value]) => s.replace('{' + key + '}', value),
      overlay.dataset['text' + name]
    );
  }

  let index = null;
  let loading = null;
  let lastToggle = null;
  let debounceTimer = null;
  let pushedHistory = false;
  let inertElements = [];
  let loadFailed = false;

  function loadIndex() {
    if (!loading) {
      loading = fetch(overlay.dataset.indexUrl)
        .then((res) => {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then((data) => {
          index = {
            posts: data.posts,
            words: data.words,
            postings: data.postIndexAndScore,
            minPrefixLen: data.config.minPrefixLen,
            minWordLen: data.config.minWordLen,
            tokenPattern: new RegExp(data.config.tokenPattern, 'gu'),
            stopWords: new Set(data.config.stopWords),
          };
          return index;
        })
        .catch((err) => {
          loadFailed = true; // keep the rejection until the next open, rather than refetch per keystroke
          throw err;
        });
    }
    return loading;
  }

  // Must match the normalization in layouts/index.searchindex.json. Go lowercases with simple case
  // mappings, JS with full ones; these replacements cover the two places where they differ.
  function normalize(s) {
    return s.toLowerCase().replace(/ς/g, 'σ').replace(/i\u0307/g, 'i');
  }

  // Length in code points, like Hugo's strings.RuneCount.
  function codePointLength(s) {
    let n = 0;
    for (const _ of s) n++;
    return n;
  }

  // Must match the tokenizer in layouts/index.searchindex.json; its rules come from the index config.
  function tokenize(query) {
    const tokens = normalize(query).match(index.tokenPattern) || [];
    const kept = tokens.filter((t) => codePointLength(t) >= index.minWordLen && !index.stopWords.has(t));
    return [...new Set(kept)];
  }

  // Compares by code point, the order Hugo sorts the word list in. Plain `<` compares UTF-16 code
  // units, which disagrees for characters outside the Basic Multilingual Plane.
  function compareCodePoints(a, b) {
    let i = 0;
    while (i < a.length && i < b.length && a.charCodeAt(i) === b.charCodeAt(i)) i++;
    if (i === a.length || i === b.length) return a.length - b.length;
    return a.codePointAt(i) - b.codePointAt(i);
  }

  // Position of the first word >= target in the sorted word list.
  function lowerBound(target) {
    let lo = 0;
    let hi = index.words.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (compareCodePoints(index.words[mid], target) < 0) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  function matchingWordPositions(token) {
    const words = index.words;
    let i = lowerBound(token);
    if (codePointLength(token) < index.minPrefixLen) {
      return words[i] === token ? [i] : [];
    }
    const positions = [];
    while (i < words.length && words[i].startsWith(token)) positions.push(i++);
    return positions;
  }

  // Ranked OR: every post matching any query word is a result. Posts matching more of the query
  // words rank first; ties are broken by score, the sum over query words of the post's best match
  // for that word, weighted by how rare the word is.
  function search(query) {
    const totals = new Map(); // post -> { matched, score }
    const postCount = index.posts.length;

    for (const token of tokenize(query)) {
      const best = new Map();
      for (const pos of matchingWordPositions(token)) {
        const postings = index.postings[pos];
        const idf = Math.log(1 + postCount / postings.length);
        const weight = index.words[pos] === token ? 1 : PREFIX_MATCH_WEIGHT;
        for (const [post, score] of postings) {
          const value = score * idf * weight;
          if (value > (best.get(post) || 0)) best.set(post, value);
        }
      }
      for (const [post, value] of best) {
        const total = totals.get(post) || { matched: 0, score: 0 };
        total.matched += 1;
        total.score += value;
        totals.set(post, total);
      }
    }

    return [...totals]
      .sort(
        ([postA, a], [postB, b]) =>
          b.matched - a.matched ||
          b.score - a.score ||
          index.posts[postB].date.localeCompare(index.posts[postA].date)
      )
      .map(([post]) => index.posts[post]);
  }

  function render(query) {
    resultsEl.replaceChildren();
    if (!query.trim()) {
      countEl.textContent = '';
      return;
    }
    const results = search(query);
    const shown = results.slice(0, MAX_RESULTS);
    if (results.length === 0) countEl.textContent = text('NoResults');
    else if (results.length > shown.length) countEl.textContent = text('TopResults', { shown: shown.length, count: results.length });
    else if (results.length === 1) countEl.textContent = text('OneResult');
    else countEl.textContent = text('Results', { count: results.length });
    for (const post of shown) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = post.url;
      a.textContent = post.title;
      li.appendChild(a);
      resultsEl.appendChild(li);
    }
  }

  function update() {
    const query = input.value;
    if (index) {
      render(query);
      return;
    }
    loadIndex()
      .then(() => render(input.value))
      .catch(() => {
        countEl.textContent = text('Unavailable');
      });
  }

  // Makes everything outside the overlay inert, so focus and screen readers stay in the dialog.
  function setBackgroundInert(inert) {
    if (!inert) {
      inertElements.forEach((el) => (el.inert = false));
      inertElements = [];
      return;
    }
    for (let node = overlay; node.parentElement && node !== document.body; node = node.parentElement) {
      for (const sibling of node.parentElement.children) {
        if (sibling !== node && !sibling.inert && sibling.tagName !== 'SCRIPT') {
          sibling.inert = true;
          inertElements.push(sibling);
        }
      }
    }
  }

  function isVisible(el) {
    return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  }

  // source: 'click'; 'popstate' when back/forward reached a HASH entry of this page; 'load' when
  // the page was loaded with HASH, e.g. a link to /#search-overlay or going back from a result.
  function open(trigger, source) {
    if (!overlay.hidden) return;
    lastToggle = trigger || null;
    if (loadFailed) {
      loading = null; // retry a failed index load once per open
      loadFailed = false;
    }

    // Hiding the page scrollbar would shift the layout sideways; keep its space if it had one.
    const root = document.documentElement;
    root.classList.toggle('search-open-gutter', window.innerWidth > root.clientWidth);
    root.classList.add('search-open');
    overlay.hidden = false;
    setBackgroundInert(true);

    // An entry for HASH lets the browser's back button close the overlay; closing then steps back
    // over it. The state marks entries added here, so forward navigation onto one can do the same.
    // After a page load the previous entry belongs to another document, so closing only drops HASH.
    if (source === 'click' && location.hash !== HASH) {
      history.pushState({ search: true }, '', HASH);
      pushedHistory = true;
    } else {
      pushedHistory = source === 'popstate' && Boolean(history.state && history.state.search);
    }

    input.focus();
    input.select();
    update();
  }

  // fromHistory: the URL has already left HASH (back/forward), so don't touch history.
  function close(fromHistory) {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.documentElement.classList.remove('search-open', 'search-open-gutter');
    setBackgroundInert(false);

    if (!fromHistory) {
      if (pushedHistory) history.back();
      else if (location.hash === HASH) history.replaceState(null, '', location.pathname + location.search);
    }
    pushedHistory = false;

    if (lastToggle && isVisible(lastToggle)) lastToggle.focus();
  }

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => open(toggle, 'click'));
  });

  closeBtn.addEventListener('click', () => close(false));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) close(false);
  });

  window.addEventListener('popstate', () => {
    if (location.hash === HASH) open(null, 'popstate');
    else close(true);
  });

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(update, DEBOUNCE_MS);
  });

  if (location.hash === HASH) open(null, 'load');
});
