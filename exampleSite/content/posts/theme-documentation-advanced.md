---
weight: 15
title: "Theme Documentation - Advanced"
date: 2020-05-06T21:29:01+08:00
description: "Discover how to maximise Gokarna's potential"
tags: ["installation", "configuration", "markdown"]
type: post
showTableOfContents: true
---

Gokarna is an opinionated theme with a focus on minimalism and simplicity.

## Content types

Gokarna supports two [content types](https://gohugo.io/content-management/types/): `post` and `page` - they are specified in [front matter](https://gohugo.io/content-management/front-matter/).

### Post

A blog post - listed in the `/posts/` section, with indexed [`/tags/`](https://gohugo.io/content-management/taxonomies/#assign-terms-to-content).

```md
---
title: "Hello, world!"
date: 2021-01-01
description: "A blog post"
image: "/path/to/image.png"
type: "post"
tags: ["blog"]
---

## Hello World!

This is my blog.
```

### Page

A typical Markdown page - perfect for detailing your portfolio, projects, or anything else you can imagine.

```md
---
title: "Hello, world!"
image: "/path/to/image.png"
type: "page"
---

## Projects

Keep an eye on this space for my upcoming projects!
```

### Table of Contents

To enable an optional [Table of Contents](https://gohugo.io/configuration/markup/#table-of-contents) for posts and pages, add the following to `config.toml`:

```toml
[markup]
  [markup.tableOfContents]
    startLevel = 2
    endLevel = 4
    ordered = false
```

Note that `.Title` is also used as `<h1>`. You should ['avoid using multiple `<h1>` elements on one page'](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements#avoid_using_multiple_h1_elements_on_one_page), therefore a `startLevel` of `2` is recommended.

Set `showTableOfContents` to `true` in front matter where you want the Table of Contents to appear:

```yaml
---
title: "Hello, world!"
image: "/path/to/image.png"
type: "page"
showTableOfContents: true
---
```

## Copyright notice

Define the [copyright notice for your site](https://gohugo.io/methods/site/copyright/). The notice will only be displayed on [page Kinds](#content-types).

For example, the following configuration in `config.toml` and front matter...

```toml
copyright = "Verbatim copying and distribution of this entire article are
permitted worldwide, without royalty, in any medium, provided this notice is
preserved."

[params]
  footer = "The Marauders"
```

```yaml
date: 2020-06-17
lastmod: 2024-02-05
```

Will produce this footer:

> © 2020-2024 The Marauders Verbatim copying and distribution of this entire article are permitted worldwide, without royalty, in any medium, provided this notice is preserved.

Note that the years of `.Date` and `.Lastmod` are used to create a date range for your copyrighted material.

`copyright` can include [Markdown syntax](https://www.markdownguide.org/tools/hugo/). This is best used for including hyperlinks, emoji, or text formatting.

## Custom HTML

Inject arbitrary HTML into `<head>` and `<footer>`, using `customHeadHTML` and `customFooterHTML` respectively.

### Analytics

Add your preferred analytics tool (such as [Umami](https://umami.is/), or [Fathom Analytics](https://usefathom.com/)) via `config.toml`.

```toml
[params]
  customHeadHTML = '''
    <script async defer data-website-id="website-id"
        src="https://analytics.example.com/script.js">
    </script>
  '''
```

### Bring your own scripts

Add your own JavaScript or CSS by putting them in the `static/` folder and importing them into your HTML.

```toml
[params]
  customHeadHTML = '''
    <script>console.log("Custom script or import");</script>
    <script src="/js/custom.js"></script>
  '''
  customFooterHTML = '''
    <div>Comment SDK Integration</div>
    <script>console.log("Custom script or import");</script>
    <script src="/js/custom.js"></script>
  '''
```

### Comments section

Add a comments section to the end of posts by providing a `customCommentHTML` script from your platform of choice.

For example:

<!-- toml syntax highlighting gives forward slashes an ugly red foreground and
    black background -->

```
customCommentHTML = """
    <script src="https://utteranc.es/client.js"
        repo="526avijitgupta/gokarna"
        issue-term="title"
        theme="github-dark"
        crossorigin="anonymous"
        async>
    </script>
    """
```

You can style the resulting `<div id="comments">` with CSS.

### KaTeX

KaTeX is a math typesetting library that lets you write beautiful equations. To use it, add the JavaScript mentioned in [their documentation](https://katex.org/docs/browser.html) to `customHeadHTML`.

```toml
[params]
  customHeadHTML = '''
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css" integrity="sha384-Xi8rHCmBmhbuyyhbI88391ZKP2dmfnOl4rT9ZfRI7mLTdk1wblIUnrIq35nqwEvC" crossorigin="anonymous">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.js" integrity="sha384-X/XCfMm41VSsqRNQgDerQczD69XqmjOOOwYQvr/uuC+j4OPoNhVgjdGFwhvN02Ja" crossorigin="anonymous"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/contrib/auto-render.min.js" integrity="sha384-+XBljXPPiv+OzfbB3cVmLHf4hdUFHlWNZN5spNQ7rmHTXpd7WvJum6fIACpNNfIR" crossorigin="anonymous"></script>
    <script>
      document.addEventListener("DOMContentLoaded", function() {
        renderMathInElement(document.body, {
          // customised options
          // • auto-render specific keys, e.g.:
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false},
          ],
          // • rendering keys, e.g.:
          throwOnError : false
        });
      });
    </script>
  '''
```

Ensure that the latest version of KaTeX is used, per [the documentation](https://katex.org/docs/browser.html).

For example, the equation `$$y_t = \beta_0 + \beta_1 x_t + \epsilon_t$$` (wrapped by double `$$`) is displayed as:

   $$y_t = \beta_0 + \beta_1 x_t + \epsilon_t$$

Moreover, the equation `$y_t = \beta_0 + \beta_1 x_t + \epsilon_t$` (wrapped by single `$`) is displayed in-line as $y_t = \beta_0 + \beta_1 x_t + \epsilon_t$

## Icons

Gokarna bundles popular social media icons (e.g. GitHub, LinkedIn, X, StackOverflow, and Dribbble) out of the box.

The full list is available on [on GitHub](https://github.com/gokarna-theme/gokarna-hugo/tree/main/static/svg/icons).

### Header

[Feather Icons](https://feathericons.com) boast a comprehensive array of general use icons. Unlike [the home page](#home-page), you do not need to download additional Feather Icons.

To use Feather Icons in your [navigation bar menu](https://gohugo.io/configuration/menus/), you must provide:

- An `identifier` or `name`

    Display text to the right of the icon by using `name`. Otherwise, use `identifier`.

    Note that an `identifier` must be unique.

- The target `url`
- The item's `weight`

    Lower weights are listed first, appearing leftmost.

- A `pre` string, containing the relevant icon

```toml
  [[menu.main]]
    identifier = "github"
    url = "https://github.com"
    weight = 3
    # Using feather-icons
    pre = "<span data-feather='github'></span>"
```

The `data-feather='github'` element must match the icon's name seen on [Feather Icons'](https://feathericons.com) website - examples include `data-feather='file'`, and `data-feather='list'`.

You can additionally specify that a link should be opened in a new tab:

```toml
[[menu.main]]
  identifier = "github"
  url = "https://github.com"
  weight = 3
  pre = "<span data-feather='github'></span>"
  [menu.main.params]
    newPage = true
```

To inject a non-Feather icon, use the `svg-inject` class, and provide a local SVG:

```toml
  [[menu.main]]
    identifier = "github"
    url = "https://github.com"
    weight = 3
    # Without using feather-icons
    pre = "<img class='svg-inject' src='/svg/icons/github.svg' />"
```

### Home page

To display icons on the home page, update the `socialIcons` param with the `name` of the icon, and a `url` to your profile on that platform.

To use icons that Gokarna doesn't bundle: download the SVG from [Simple Icons](https://simpleicons.org/), and move it to `static/svg/icons/`.

```toml
  [params]
    socialIcons = [
      {name = "twitter", url = "https://example.com"},
      {name = "linkedin", url = "https://example.com"},
      {name = "stackoverflow", url = "https://example.com"},
    ]
```

## Syntax Highlighting

Hugo lets you choose the color scheme for the codeblocks. You can choose from the options here: https://xyproto.github.io/splash/docs/all.html

After choosing your theme, just update the `pygmentsStyle`  attribute in config.toml.

```toml
pygmentsStyle = "monokai"
```

You can read more about syntax highlighting on the [official hugo docs](https://gohugo.io/content-management/syntax-highlighting/).

## Site Metadata

Gokarna enables you to improve the SEO performance of your website with minimal effort.

### Image preview

We make sure your pages are social media ready.

![Social Media Preview](/images/theme-documentation-advanced/preview.png "Social Media Preview")

```md
---
title: "Hello, world!"
image: "/path/to/image.png"
---
```

> Note: If no image is specified in the markdown metadata, the site avatar is automatically used instead.

### SEO keywords

The keywords relevant for SEO are composed of the page `tags` as defined below:

```md
---
title: "Hello, world!"
tags: ["hello", "world"]
---
```

and the `metaKeywords` specified in the config.toml:

```md
[params]
  metaKeywords = ["blog", "gokarna", "hugo"]
```

## Hide tags, date or description of posts

Tags can be used to categorize posts (e.g.: Project or Blog), and be hidden on
the posts. Use the `params.hiddenTags` field in `hugo.toml`.  
A post's date and description can be hidden if it has at least one tag listed in
`params.tagsHidePostDate` or `params.tagsHidePostDescription`, respectively.


```toml
[params]
  [params.hidden]
  tags = ["project", "blog"]
  tagsPostDate = ["project"]
  tagsPostDescription = ["project"]
  [menu]
    [[menu.main]]
      identifier = "projects"
      url = "/tags/project/"
      name = "My Projects"
      weight = 1
    [[menu.main]]
      identifier = "blog"
      url = "/tags/blog/"
      name = "Blog"
      weight = 2
```

## Install as a Hugo module

1. Install `go` and `hugo`

    Package managers such as [Homebrew](https://brew.sh/) (Mac, Linux) and [WinGet](https://learn.microsoft.com/en-us/windows/package-manager/winget/#use-winget) (Windows) can be used.

2. Initialise your website as a module - [using your Git repository as its name](https://www.nickgracilla.com/posts/master-hugo-modules-managing-themes-as-modules/#initialize-your-hugo-project)

    ```sh
    hugo mod init github.com/<your_user>/<your_project>
    ```

3. Add Gokarna to `config.toml`

    ```toml
    [module]
      [[module.imports]]
        path = "github.com/gokarna-theme/gokarna-hugo"
    ```

    [The `theme` key can now be removed](https://www.nickgracilla.com/posts/master-hugo-modules-managing-themes-as-modules/#get-the-projects-module-dependencies) from `config.toml`.

4. Download Gokarna

    ```sh
    hugo mod get -u github.com/gokarna-theme/gokarna-hugo
    ```

5. (Optional) Add `go.mod` and `go.sum` to your repository

    ```sh
    git add go.mod go.sum
    git commit -m 'chore(modules): add gokarna'
    ```

    Useful for building your site with a CI/CD pipeline, such as [GitHub Actions](https://docs.github.com/en/actions/about-github-actions/understanding-github-actions) - the [actions-hugo](https://github.com/peaceiris/actions-hugo) workflow is a good starting point.

See the documentation provided by [Hugo](https://gohugo.io/hugo-modules/use-modules/) and [Nick Gracilla](https://www.nickgracilla.com/posts/master-hugo-modules-managing-themes-as-modules/#how-to-use-hugo-themes-as-modules) for more information.

## Google Lighthouse

### Minify HTML

`hugo`'s HTML output can be [minified](https://gohugo.io/configuration/minify/), resulting in smaller files. This makes your site more performant (especially when paired with compression), and may confer a better [Google Lighthouse](https://pagespeed.web.dev/) score.

```toml
[minify]
    minifyOutput = true
```

You can also specify the `hugo` option `--minify` at runtime.
