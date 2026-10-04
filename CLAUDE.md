# dbc-resources — Project Notes

## Before Starting Work
This repo has two independent paths that both commit to origin/main:
Decap CMS (commits directly from the browser admin panel) and Claude
Code (commits locally, then Cristina pushes from a plain terminal). Because of this,
always run `git pull` at the start of a new session, before making any
changes, to bring in anything committed through the CMS since the last
Claude Code session. Skipping this risks working from a stale local
copy or hitting an avoidable merge conflict later.

## Confirmation Rules
Show a diff and wait for explicit confirmation before saving any change
to content (articles, roadmap, content-backlog folder) or any structural change
(templates, new files, config). For a single style property change where
I name the exact property and value in my request (for example, "make the
eyebrow 1.1rem"), save it directly in this repo's template <style> blocks
and report what changed afterward. Never edit style.css here, because the
build overwrites it from dbc-site-live. If a style.css change is needed,
tell me it belongs in dbc-site-live instead.
Claude Code never runs `git push`, regardless of change size. Cristina
runs `git push` herself from a plain terminal.

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
- There is **no** zip/drag-and-drop deploy step here. `dbc-site-live` no
  longer uses one either: pushing its `main` branch triggers its Netlify build.
- After any file changes made directly in this folder (i.e. not through
  the CMS, which commits on its own), Claude Code commits locally:

  ```bash
  git add .
  git commit -m "..."
  ```

  Claude Code never runs `git push`. Cristina runs it herself from a
  plain terminal:

  ```bash
  git push
  ```

- Do not create zip files in this project.

## Brand styling

`style.css` is not maintained in this repo. The `fetch-style` step
downloads it from `dbc-site-live` on every build and overwrites the local
copy, and it is listed in `.gitignore`. It defines the brand colors and
fonts as CSS variables: `--teal`, `--clay`, `--ink`, etc., along with
`--serif` (Playfair Display) and `--sans` (Jost).

This repo's own CSS lives in the `<style>` blocks in `resources-index.njk`,
`_includes/article.njk`, and `_includes/resources-sidebar.njk`.

## How this site goes live

This project's own Netlify URL (`dbc-resources.netlify.app`) is the actual
source. It's proxied to live at `designbycristina.com/resources/` via a
`_redirects` rule on the main site, which is a separate project.

## Relationship to dbc-site-live

This project and `dbc-site-live` are related (same brand, cross-linked
via the `_redirects` proxy). Both are Eleventy sites where pushing to
`main` triggers the Netlify build, but they are separate repos with
separate builds and settings. Always flag
any inconsistency noticed between this project's setup and
`dbc-site-live`'s conventions, since it's easy to conflate the two.

- **Header/footer/nav-script sync source:** `scripts/fetch-header-footer.js`
  fetches `https://designbycristina.com/partials/site-chrome.html` (a
  marker-delimited export from `dbc-site-live`'s Eleventy build) at build
  time and splices it into `_includes/base.njk`. It previously fetched that
  repo's static `index.html` from GitHub raw; changed 2026-09-06 when
  `dbc-site-live` migrated to Eleventy. A build here now depends on
  `dbc-site-live` having deployed at least once.
