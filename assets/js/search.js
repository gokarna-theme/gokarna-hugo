// Client side of the build-time search index (see layouts/index.searchindex.json).
// Bundled into every page; does nothing unless the site enables the SearchIndex output.
document.addEventListener('DOMContentLoaded', function () {
  const overlay = document.getElementById('search-overlay');
  if (!overlay) return;

  const input = document.getElementById('search-input');
  const countEl = document.getElementById('search-count');
  const resultsEl = document.getElementById('search-results');
  const closeBtn = overlay.querySelector('.search-close');
  const toggles = document.querySelectorAll('.search-toggle a');

  const PREFIX_MATCH_WEIGHT = 0.7; // exact word matches rank above prefix matches
  const DEBOUNCE_MS = 100;
  const MAX_RESULTS = 15;

  // Translated strings from partials/search.html; {count} and {shown} are placeholders.
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
            tokenPattern: new RegExp(data.config.tokenPattern, 'g'),
            stopWords: new Set(data.config.stopWords),
          };
          return index;
        })
        .catch((err) => {
          loading = null; // allow a retry on the next open
          throw err;
        });
    }
    return loading;
  }

  // Must match the tokenizer in layouts/index.searchindex.json; its rules come from the index config.
  function tokenize(text) {
    const tokens = text.toLowerCase().match(index.tokenPattern) || [];
    const kept = tokens.filter((t) => t.length >= index.minWordLen && !index.stopWords.has(t));
    return [...new Set(kept)];
  }

  // Position of the first word >= target in the sorted word list.
  function lowerBound(target) {
    let lo = 0;
    let hi = index.words.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (index.words[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  function matchingWordPositions(token) {
    const words = index.words;
    let i = lowerBound(token);
    if (token.length < index.minPrefixLen) {
      return words[i] === token ? [i] : [];
    }
    const positions = [];
    while (i < words.length && words[i].startsWith(token)) positions.push(i++);
    return positions;
  }

  // Ranked OR: every post matching any query word is a result; a post's score is the sum over
  // query words of its best match for that word, weighted by how rare the word is.
  function search(query) {
    const totals = new Map();
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
      for (const [post, value] of best) totals.set(post, (totals.get(post) || 0) + value);
    }

    return [...totals]
      .sort((a, b) => b[1] - a[1] || index.posts[b[0]].date.localeCompare(index.posts[a[0]].date))
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

  function setExpanded(expanded) {
    toggles.forEach((t) => t.setAttribute('aria-expanded', String(expanded)));
  }

  function open(trigger) {
    lastToggle = trigger || null;
    overlay.hidden = false;
    document.documentElement.classList.add('search-open');
    setExpanded(true);

    const hamburgerMenu = document.querySelector('.nav-hamburger-list');
    if (hamburgerMenu) hamburgerMenu.classList.add('visibility-hidden');

    input.focus();
    input.select();
    update();
  }

  function close() {
    overlay.hidden = true;
    document.documentElement.classList.remove('search-open');
    setExpanded(false);
    if (lastToggle && lastToggle.offsetParent !== null) lastToggle.focus();
  }

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      open(toggle);
    });
  });

  closeBtn.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) close();
  });

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(update, DEBOUNCE_MS);
  });
});
