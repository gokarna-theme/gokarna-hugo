# Search

Gokarna includes an optional client-side search. Hugo builds an inverted index of the site's posts as a JSON file; a small script in the browser loads it and ranks posts as the user types. There is no server, no third-party service, and no build step outside `hugo`.

This document describes how it works and why it was built this way. For configuration, see the [Search section of the theme documentation](exampleSite/content/posts/theme-documentation-basics.md#search).

## Files

| File | Role |
|---|---|
| `config.toml` | Defines the `SearchIndex` output format |
| `layouts/index.searchindex.json` | Builds `search-index.json` at build time |
| `layouts/partials/header.html` | Adds the search icon (desktop links and mobile menu) |
| `layouts/partials/search.html` | Markup for the full-page search overlay |
| `assets/js/search.js` | Loads the index, matches and ranks posts, renders results |
| `assets/css/main.css`, `assets/css/dark.css` | Overlay styles (`/* SEARCH */` section) |
| `i18n/en.toml` | Labels (`search*` and `closeSearch` keys) |

## Enabling

A site enables search by adding `SearchIndex` to its home page outputs:

```toml
[outputs]
  home = ["HTML", "RSS", "SearchIndex"]
```

The theme defines the output format, but it cannot enable it: Hugo merges `outputFormats` from a theme's config but ignores the theme's `outputs`. The header checks whether the home page has a `SearchIndex` output and renders the icon and overlay only if it does, so sites that don't opt in are unchanged. `search.js` is part of the theme's script bundle on every page and returns immediately when the overlay is absent.

## How it works

1. **Build time.** `layouts/index.searchindex.json` reads every regular page whose type is in `params.search.types`, splits each field into words, scores each word per post, and writes the index.
2. **First open.** Clicking the search icon opens the overlay and fetches `search-index.json` once. If the fetch fails, a message is shown and the next open retries.
3. **Typing.** After a 100 ms pause, the query is split into words with the same rules as the index, each word is matched against the index, and the top results are listed as linked post titles.

## Index format

```json
{
  "config": { "minPrefixLen": 3, "minWordLen": 2, "tokenPattern": "...", "stopWords": ["a", "..."] },
  "posts": [ { "title": "Unfolding the folds", "url": "/blog/unfolding-folds/", "date": "2019-07-20" } ],
  "words": ["fold", "folds", "haskell", "..."],
  "postIndexAndScore": [ [[0, 13]], [[0, 4]], [[0, 5]] ]
}
```

- **`posts`** holds each post's metadata once. Only what the results need is stored: `title` and `url` for the link, and `date` to break ties.
- **`words`** and **`postIndexAndScore`** are parallel arrays: `postIndexAndScore[i]` lists `[postIndex, score]` pairs for `words[i]`, where `postIndex` is a position in `posts`. Storing post indexes instead of repeating metadata under every word keeps the file small.
- **`words` is sorted**, so the browser can binary-search it for prefixes. A map from word to postings would be simpler to read, but JSON object key order isn't reliable (numeric-looking keys such as `"101"` are reordered), so the sorted array is used instead.
- **`config`** carries the tokenizing rules, so the browser splits queries exactly as the index was built and the rules are defined in one place.

For the 63 posts of [amitashukla.in](https://amitashukla.in) the index has about 4,800 words and is 165 KB, or 43 KB gzipped.

## Building the index

### Which text is indexed

- **Fields:** title, tags, h2 and h3 headings, and body text. Each is scored separately (see below).
- **Code blocks are removed** (`<pre>` elements) before indexing, so keywords like `const` or `return` don't fill the index.
- **HTML is stripped and entities decoded** from the rendered content, so Markdown, shortcodes, and raw HTML are indexed as the reader sees them.
- **Drafts and future-dated posts** are excluded automatically, because the index is built from Hugo's own page list. With `hugo -D`, drafts are indexed too, consistent with the rest of the site.

### Splitting text into words

- **Lowercased**, so matching is case-insensitive.
- **Pattern** `[a-z0-9]+(?:\+\+|#)?`: runs of letters and digits, keeping `c++`, `c#`, and `f#` intact.
- **Stop words** (a built-in English list of 135 words, replaceable with `params.search.stopWords`) are dropped.
- **Words shorter than `minWordLen`** (default 2) are dropped.
- **No stemming.** "fold", "folds", and "folding" are separate words. Prefix matching (below) covers most of the same need without a stemmer's odd merges.

### Scoring a word in a post

```
score(word, post) = Σ over fields  boost[field] × min(count of word in field, tfCap)
```

- **Field boosts** (defaults: title 10, tags 5, headings 3, body 1). A word in a post's title is the strongest signal of what the post is about.
- **`tfCap`** (default 10) limits how many times a word counts per field, so a word repeated 50 times in the body can't outweigh a single title match.

## Matching and ranking a query

1. **Split the query** into words with the index's rules, ignoring duplicates.
2. **Match each query word** against the sorted word list:
   - Words of at least `minPrefixLen` letters (default 3) also match as **prefixes**: `hado` matches `hadoop`. Shorter words match only **exactly**, because two-letter prefixes match too much.
   - A prefix match counts **0.7×** an exact match, so `fold` ranks posts containing "fold" above posts containing only "folds".
   - If several index words match one query word in the same post, only the **best** one counts, so a post can't win by using many forms of a word.
3. **Weight rare words higher.** Each match is multiplied by `log(1 + total posts / posts containing the word)`, so a distinctive word like "hadoop" outweighs a common one like "data".
4. **Ranked OR.** A post matching *any* query word is a result, and its score is the sum over query words. Posts matching more of the words rank higher, but a query never returns nothing just because one word is missing. Strict AND matching was rejected for that reason.
5. **Sort** by score, highest first; ties go to the newer post.
6. **Show the top 15.** Ranked OR can return many loosely related posts, so the count line says "Top 15 of 39 results" when there are more.

## Interface

- **A search icon in the header**, next to the dark-mode toggle, using the same markup and classes so it looks the same. It also appears in the mobile menu, because the theme hides header links on narrow screens.
- **A full-page overlay** rather than a dropdown under the icon. A dropdown is cramped on phones and squeezes long titles.
- **Results are post titles only**, with no dates, tags, or summaries, to keep the list scannable and the index small.
- **Opening and closing:** the icon opens the overlay and focuses the input; the close button or `Esc` closes it and returns focus to the icon. Page scrolling is locked while it's open.
- **Deliberately left out:** a `/` shortcut to open search from anywhere, and arrow-key navigation of results. Tab already moves through the result links, and the extra keyboard handling wasn't worth the code.

## Styling

- Light-mode styles in `main.css` use the theme's light variables; dark-mode overrides in `dark.css` use the dark ones, matching how the rest of the theme handles the dark stylesheet toggle.
- Sizes are relative to the theme's `--font-size` (`em`), the column uses `--container-width`, and the focused input and hovered results use `--accent-color`.
- The overlay sits above the theme's fixed header (`z-index: 10` versus 5).

## Translations

All labels, including the result counts, come from `i18n` keys, with English defaults in the template. Counts use `{count}` and `{shown}` placeholders, which the script fills in. Languages without these keys fall back to English.

## Decisions along the way

- **Built by a Hugo template, not an external script.** The first version used a bash and `jq` script run after `hugo`. It produced the same index, but `hugo server` didn't run it, the deploy needed an extra command, and a theme can't add build steps for its users. Building the index in a template means plain `hugo` and `hugo server` always produce an up-to-date index. The cost is build time: about 0.4 seconds more for 63 posts.
- **Index built at build time, not in the browser.** Building it in the browser from raw post text would need the full text downloaded, which is larger than the index.
- **Postings are assembled as JSON text.** Hugo's `Scratch.Add` can't append nested slices, so the template keeps each `[postIndex, score]` pair as a JSON fragment and joins them when writing the file. The output is ordinary JSON.
- **`math.Min` is avoided** in favor of `cond`, to stay compatible with older Hugo versions.

## Known limitations

- **English-oriented.** The word pattern matches only ASCII letters and digits, so words with accents or in non-Latin scripts are not indexed, and the stop-word list is English. Supporting other languages would need a Unicode-aware pattern and per-language stop words.
- **Numbers are indexed** (for example `101` or `1099702277`). Harmless, but they take some space.
- **Single letters aren't indexed** with the default `minWordLen = 2`, so searching "C" won't find a post about the C language.
- **Short common words match loosely.** A query like `go` matches every post using the word "go", not just posts about the Go language.
- **No phrase search, typo tolerance, or result snippets.** Phrase search would need word positions in the index, which makes it much larger.
