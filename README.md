# adeleine1217.github.io

Static personal site for GitHub Pages with:

- `/portfolio/` for selected work
- `/cv/` for experience and background
- `/blog/` for posts generated from Markdown files in `blog/content`

## How the blog works

Add a new Markdown file under `blog/content` with Jekyll front matter:

```md
---
layout: post
title: Your Post Title
date: 2026-04-19
tags:
  - notes
excerpt: A short summary for the blog index.
---

Write your post here.
```

When GitHub Pages builds the site, that file will:

1. become its own post page
2. appear automatically in `/blog/`

## Publish on GitHub Pages

1. Push this repository to GitHub.
2. In the repository settings, open `Pages`.
3. Set the source to `Deploy from a branch`.
4. Choose your default branch and the `/(root)` folder.

Because this repo is Jekyll-compatible, GitHub Pages can build it directly without an extra frontend toolchain.
