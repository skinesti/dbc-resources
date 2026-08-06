# dbc-resources — Project Notes

## Before Starting Work
This repo has two independent paths that both commit to origin/main:
Decap CMS (commits directly from the browser admin panel) and Claude
Code (commits locally, then pushes on confirmation). Because of this,
always run `git pull` at the start of a new session, before making any
changes, to bring in anything committed through the CMS since the last
Claude Code session. Skipping this risks working from a stale local
copy or hitting an avoidable merge conflict later.

## Confirmation Rules
Show a diff and wait for explicit confirmation before saving any change
to content (articles, roadmap, backlog files) or any structural change
(templates, new files, config). For small, single-property style/CSS
tweaks (e.g. a font-size or color value), save directly without waiting
for diff confirmation, just report what was changed after the fact.
Pushing to origin/main always requires explicit confirmation regardless
of change size.

## What this is

An Eleventy (11ty) static site generator project — **not** a plain
HTML/CSS/JS site. Pages are built from markdown files in
`content/resources/`, each of which becomes an individual article page.

## Authoring content

Articles are authored two ways:

1. Through the Decap CMS admin panel at `/admin`, which commits directly
   to GitHub.
2. By editing markdown files in `content/resources/` directly in this
   folder.

## Deployment

- This repo is connected to GitHub (`skinesti/dbc-resources`) and deploys
  automatically via Netlify whenever a change is pushed to `main`.
- There is **no** zip/drag-and-drop deploy step here. That pattern belongs
  to a different project, `dbc-site-live`, and does not apply to this one.
- After any file changes made directly in this folder (i.e. not through
  the CMS, which commits on its own), the correct deploy steps are:

  ```bash
  git add .
  git commit -m "..."
  git push
  ```

- Do not create zip files in this project.

## Brand styling

Brand colors and fonts are pulled from the main Design by Cristina site
and defined in `style.css` as CSS variables: `--teal`, `--clay`, `--ink`,
etc., along with `--serif` (Playfair Display) and `--sans` (Jost).

## How this site goes live

This project's own Netlify URL (`dbc-resources.netlify.app`) is the actual
source. It's proxied to live at `designbycristina.com/resources/` via a
`_redirects` rule on the main site, which is a separate project.

## Relationship to dbc-site-live

This project and `dbc-site-live` are related (same brand, cross-linked
via the `_redirects` proxy) but deploy in completely different ways — this
one is git-push-to-Netlify, the other is zip/drag-and-drop. Always flag
any inconsistency noticed between this project's setup and
`dbc-site-live`'s conventions, since it's easy to conflate the two.
