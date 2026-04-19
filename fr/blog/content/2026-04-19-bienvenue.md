---
layout: post
title: Bienvenue sur le blog
date: 2026-04-19
lang: fr
alt_url: /blog/content/2026-04-19-welcome/
tags:
  - setup
  - github-pages
excerpt: Un article exemple qui montre comment les fichiers Markdown deviennent automatiquement des publications visibles sur le blog.
---

Voici un article d'exemple pour la version francaise du site.

Lorsque vous voulez publier un nouvel article, il suffit de creer un autre fichier Markdown dans `fr/blog/content` avec un front matter en haut du fichier. GitHub Pages transformera ce fichier en page et l'index du blog l'affichera automatiquement.

## Champs recommandes

- `layout: post`
- `title: ...`
- `date: YYYY-MM-DD`
- `lang: fr`
- `alt_url: ...` pour relier la version anglaise
- `tags:` en option
- `excerpt:` pour la carte du blog

Le reste du fichier peut etre ecrit en Markdown normal.
