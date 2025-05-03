---
weight: 10
title: "Theme Documentation - Basics"
date: 2020-03-06T21:29:01+08:00
description: "A guide to getting started with Gokarna"
tags: ["installation", "configuration", "markdown"]
type: post
showTableOfContents: true
---

Gokarna is an opinionated theme with a focus on minimalism and simplicity.

## Installation

Follow these steps to initialize your new website.

If you are new to [Hugo](https://gohugo.io/), we suggest following this [great documentation for beginners](https://gohugo.io/getting-started/quick-start/).

### a. Create Your Project {#create-your-project}

Hugo provides a `new` subcommand to create a new website:

```bash
hugo new site my-website
cd my-website
```

### b. Install the Theme {#install-the-theme}

The theme's repository is: [https://github.com/gokarna-theme/gokarna-hugo](https://github.com/gokarna-theme/gokarna-hugo).

Make this repository a submodule of your Git project:

```bash
git init
git submodule add https://github.com/gokarna-theme/gokarna-hugo.git themes/gokarna
```

### c. Basic Configuration {#basic-configuration}

A simple Hugo [configuration file](https://gohugo.io/getting-started/configuration/#configuration-file) with [menu items](https://gohugo.io/content-management/menus/#properties-front-matter).

Gokarna supports [adding Feather icons to the header](/posts/theme-documentation-advanced/#icons-in-header).

```toml
baseURL = "https://example.org/"
defaultContentLanguage = "en"
# Automatically generate robots.txt
enableRobotsTXT = true
languageCode = "en"
theme = "gokarna"
title = "My New Hugo Site"

[menu]
  [[menu.main]]
    # Display name
    name = "Posts"

    # Relative URL slug (appended to baseURL)
    url = "/posts/"

    # Lower weights are listed first in the menu (leftmost); higher weights are
    # listed last in the menu (rightmost)
    weight = 1

  [[menu.main]]
    name = "Tags"
    url = "/tags/"
    weight = 2
    
  [[menu.main]]
    # Unique identifiers are required for menu entries without a name property,
    # or for menu entries which re-use a name
    identifier = "github"

    # Absolute URL to external resource
    url = "https://github.com"
    weight = 3
    
    # Surround the menu entry (or name) with HTML content, such as Feather
    # icons: https://feathericons.com
    pre = "<span data-feather='github'></span>"
    post = ""
```


### d. Create Your First Post {#create-your-first-post}

Use the [`new` subcommand](https://gohugo.io/commands/hugo_new/#hugo-new) to create a post (in [the `content/` directory](https://gohugo.io/content-management/organization/#organization-of-content-source)):

```bash
hugo new posts/'My First Post'.md
```

Two [content types](https://gohugo.io/content-management/types/) are supported in Gokarna:

1. `type: "post"`

    A blog post consisting of a [page title](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title#page_titles_and_seo), [meta description](https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/The_head_metadata_in_HTML#adding_an_author_and_description), creation/last modified dates, [SEO keywords (tags)](/posts/theme-documentation-advanced/#seo-keywords), and Markdown content.

    Read more about Posts in the [advanced documentation](/posts/theme-documentation-advanced/#post).

2. `type: "page"`

    A standalone page which only renders Markdown. Best used for custom pages (e.g. your [portfolio](/projects/)) which should not feature in your [Posts](/posts/) timeline.
    
    Read more about Pages in the [advanced documentation](/posts/theme-documentation-advanced/#page).

#### Using archetypes

`hugo new` will automatically use an appropriate [archetype](https://gohugo.io/content-management/archetypes/#lookup-order) (see [`archetypes/`](https://github.com/gokarna-theme/gokarna-hugo/tree/main/archetypes)) and insert [front matter](https://gohugo.io/content-management/front-matter/) depending on the location of your content:

- `hugo new posts/$post-name.md` automatically sets `type: "post"`
- `hugo new $page-name.md` automatically sets `type: "page"`

Gokarna employs [custom front matter](/posts/theme-documentation-advanced/#content-types), which is included in the archetypes:

- The creation date of the file is automatically set (e.g. `date: 2023-12-25`)
- The file name is used as the default title (e.g. `title: "My First Post"`)

### e. Launching the Website Locally {#launching-the-website-locally}

Use the [`server` subcommand](https://gohugo.io/commands/hugo_server/#synopsis) to view your site.

```bash
hugo server
```

Go to [`http://localhost:1313`](http://localhost:1313/) (if no other Hugo servers are running; Hugo will use an [ephemeral port](https://en.wikipedia.org/wiki/Ephemeral_port) if one or more servers are running concurrently on the host).

### f. Build the Website {#build-the-website}

Use the `hugo` command to build your site.

```bash
hugo
```

A `public` folder will be generated, containing all static content and assets for your website. It can be hosted on any web server.

The website can be automatically published and hosted with [Netlify](https://www.netlify.com/), [AWS Amplify](https://gohugo.io/hosting-and-deployment/hosting-on-aws-amplify/), [GitHub Pages](https://gohugo.io/hosting-and-deployment/hosting-on-github/), [Render](https://gohugo.io/hosting-and-deployment/hosting-on-render/), and more...

## Configuration

In addition to [Hugo global configuration](https://gohugo.io/overview/configuration/) and [menu configuration](#basic-configuration), Gokarna lets you define the following [parameters](https://gohugo.io/methods/site/params/) in your site configuration.

See this sample `hugo.toml`, which uses Gokarna's default values, and [exampleSite's `hugo.toml`](https://github.com/gokarna-theme/gokarna-hugo/blob/main/exampleSite/hugo.toml):

```toml
[params]
  # Choose the color shown when hyperlinks are hovered over
  accentColor = "#FF4D4D"

  # Resource URL for the site avatar (home page and header)
  avatarURL = "/images/avatar.webp"

  # Describe the avatar for screen readers
  avatarAltText = "avatar"

  # Set the avatar's size: size-xs, size-s, size-m, size-l & size-xl
  avatarSize = "size-m"

  # Inject arbitrary HTML via the <head> tag
  # Best used for importing custom JavaScript, CSS, or analytics
  customHeadHTML = ""

  # Configure how post dates are displayed
  dateFormat = "January 2, 2006"
  
  # Home page meta description
  description = "Sky above, sand below & peace within"

  # Footer text (i.e. author/project name)
  footer = "The Marauders"

  # Define SEO keywords
  metaKeywords = ["blog", "gokarna", "hugo"]

  # Define how many posts are displayed on the home page
  # showPostsOnHomePage must be "popular" or "recent"
  numberPostsOnHomePage = 4

  # Display a "back to top" button on posts and pages: true, false
  # May not render on smaller screen sizes
  showBackToTopButton = true

  # Display posts on the home page:
  # "popular" (order posts by weight)
  # "recent" (order posts by date)
  # "", unset (do not display)
  showPostsOnHomePage = ""

  # Show the previous and next post in your timeline: "true", "false"
  # Incompatible with Weight
  togglePreviousAndNextButtons = false
```

### Accent color

The color displayed when a user hovers over hyperlinks (`<a>` tags), expressed as a [hexadecimal](https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color).

```toml
[params]
  accentColor = "#FF4D4D"
```

### Avatar URL

The avatar's resource URL, displayed on the [home page](/) and header (top-left).

Images are typically placed into the [`assets/`](https://gohugo.io/getting-started/directory-structure/#assets) or [`static/`](https://gohugo.io/getting-started/directory-structure/#static) directories (which are copied to the top-level directory [at build time](#build-the-website)).

```toml
[params]
  avatarURL = "/images/avatar.webp"
```

### Avatar size

Set the avatar's size as: `size-xs`, `size-s`, `size-m`, `size-l`, or `size-xl`.

```toml
[params]
  avatarSize = "size-m"
```

### Custom Head HTML

Add arbitrary HTML code to the [`<head>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head).

```toml
[params]
  customHeadHTML = "<script>console.log('Any HTML')</script>"
```

Examples are available in the [advanced documentation](/posts/theme-documentation-advanced/#bring-your-own-scripts).

### Date format 

[Configure how posts date are displayed](https://gohugo.io/functions/time/format/), using [date strings](https://pkg.go.dev/time#pkg-constants).

```toml 
[params]
  dateFormat = "2 January, 2006"
```

### Description

[Meta description](https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/The_head_metadata_in_HTML#adding_an_author_and_description) to display on the home page, below the title and avatar.

```toml
[params]
  description = "Sky above, sand below & peace within"
```

### Display content on the home page

Markdown content in `content/_index.md` will be rendered on the home page, below the social icons.

### Display posts on the home page

Recent and popular posts can be shown on the home page:

- `popular`: Sort posts in ascending order of their [Weight](https://gohugo.io/methods/page/weight/)

  **If any post on your site defines `weight`, you cannot enable [Previous and Next buttons](#previous-and-next-buttons).**

- `recent`: Sort posts in ascending order of [Date](https://gohugo.io/methods/page/date/)

- Do not show anything if the variable is:
    - unset
    - an empty string (`""`)

The number of posts displayed on the home page can be changed by setting `numberPostsOnHomePage`. If `numberPostsOnHomePage` is equal to `""` or `0`, the default value (`4`) is used.

```toml
[params]
  showPostsOnHomePage = ""
  numberPostsOnHomePage = 4
```

### Favicons

Place favicons into the `static/` directory. The following files are supported:

- `apple-touch-icon.png` (180x180)
- `favicon-32x32.png` (32x32)
- `favicon-16x16.png` (16x16)
- `mstile-150x150.png` (150x150)
- `android-chrome-192x192.png` (192x192)
- `android-chrome-512x512.png` (512x512)

Favicons can be generated using services such as [favicon.io](https://favicon.io), or [realfavicongenerator.net](https://realfavicongenerator.net/).

### Font size

Set the content [`font-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size).

```toml
[params]
  fontSize = "17.5px"
```

### Footer

Text to display in the footer section, typically the name of the author or project.

```toml
[params]
  footer = "The Marauders"
```

`footer` can include [Markdown syntax](https://www.markdownguide.org/tools/hugo/) - best used for including hyperlinks, emoji, or text formatting.

### Previous and Next buttons

At the bottom of a post, show the previous and next post chronologically.

**Warning**: Not compatible with the `.Weight` parameter.

If any post front matter contains `weight`, the posts will not appear by Date. See [Hugo's default sort](https://gohugo.io/templates/lists#default-weight--date--linktitle--filepath).

```toml
[params]
  togglePreviousAndNextButtons = false
```

### Reading time

Display a post's [estimated reading time](https://gohugo.io/methods/page/readingtime/) in minutes.

```toml
[params]
  displayReadingTime = false
```

### robots.txt

[Automatically generate](https://gohugo.io/templates/robots/) a `robots.txt` file, used to ['manage crawler traffic to your site'](https://developers.google.com/search/docs/crawling-indexing/robots/intro).

```toml
enableRobotsTXT = true
```
