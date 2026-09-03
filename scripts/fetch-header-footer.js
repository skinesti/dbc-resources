#!/usr/bin/env node
/**
 * fetch-header-footer.js
 *
 * Syncs the site header, footer, and nav script from dbc-site-live into this
 * project's base layout at build time — the same idea as `fetch-style` for
 * style.css, but this needs real HTML surgery (marker extraction + link
 * rewriting), not a raw file copy.
 *
 * What it does:
 *   1. Fetches dbc-site-live's index.html from GitHub (raw, main branch).
 *   2. Pulls the markup between <!-- HEADER-START/END -->,
 *      <!-- FOOTER-START/END -->, and <!-- SCRIPT-START/END -->.
 *   3. Rewrites the header + footer markup (NOT the script) so it works from
 *      this standalone site, which is proxied under designbycristina.com/resources/:
 *        - root-relative links ("/", "/#x", "/pricing.html") -> absolute on
 *          https://designbycristina.com, EXCEPT "/resources/" which is left as-is
 *          (it correctly points at this site's own index either way)
 *        - header logo images/dbc-logo.png -> /images/dbc-logo-teal.png
 *          (this repo ships the teal variant, not dbc-logo.png)
 *        - any other relative images/... -> /images/... (how Eleventy passthrough
 *          actually serves this repo's images)
 *   4. Splices the three pieces into _includes/base.njk between the matching
 *      marker pairs, leaving everything else in that file untouched.
 *
 * Fails loudly (exit 1, clear message) if the fetch fails or any marker pair is
 * missing from the fetched HTML or from base.njk — it never silently leaves the
 * old header/footer/script in place.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const SOURCE_URL =
  'https://raw.githubusercontent.com/skinesti/dbc-site-live/main/index.html';
const MAIN_DOMAIN = 'https://designbycristina.com';
const BASE_NJK = path.join(__dirname, '..', '_includes', 'base.njk');
const BASE_NJK_REL = path.relative(process.cwd(), BASE_NJK);

const TAG = '[fetch-header-footer]';

function fail(message) {
  throw new Error(message);
}

/** Return the markup between <!-- NAME-START --> and <!-- NAME-END -->. */
function extractRegion(html, name) {
  const startTag = `<!-- ${name}-START -->`;
  const endTag = `<!-- ${name}-END -->`;
  const start = html.indexOf(startTag);
  const end = html.indexOf(endTag);

  if (start === -1) fail(`${startTag} not found in fetched index.html`);
  if (end === -1) fail(`${endTag} not found in fetched index.html`);
  if (end < start) fail(`${endTag} appears before ${startTag} in fetched index.html`);

  return html.slice(start + startTag.length, end).trim();
}

/** Rewrite header/footer markup for this standalone, proxied site. */
function rewriteMarkup(markup) {
  let out = markup;

  // Header logo: this repo has dbc-logo-teal.png, not dbc-logo.png. Intentional
  // swap that survives the otherwise-verbatim sync. Do this before the generic
  // images/ rewrite below.
  out = out.replace(/\bsrc="images\/dbc-logo\.png"/g, 'src="/images/dbc-logo-teal.png"');

  // Any other relative images/... reference -> absolute-path form.
  out = out.replace(/(\bsrc=")images\//g, '$1/images/');

  // Root-relative links -> absolute on the main domain, except anything under
  // /resources/ (this site's own pages — correct relative either way).
  out = out.replace(/href="(\/[^"]*)"/g, (match, href) => {
    if (href === '/resources' || href.startsWith('/resources/')) return match;
    return `href="${MAIN_DOMAIN}${href}"`;
  });

  return out;
}

/** Replace the content between <!-- NAME-START --> and <!-- NAME-END --> in base.njk. */
function spliceRegion(base, name, replacement) {
  const startTag = `<!-- ${name}-START -->`;
  const endTag = `<!-- ${name}-END -->`;
  const region = new RegExp(
    `${startTag}[\\s\\S]*?${endTag}`
  );

  if (!region.test(base)) {
    fail(`${startTag} ... ${endTag} marker pair not found in ${BASE_NJK_REL}`);
  }

  return base.replace(region, `${startTag}\n${replacement}\n${endTag}`);
}

async function main() {
  if (typeof fetch !== 'function') {
    fail('global fetch is unavailable — this script requires Node 18+');
  }

  let response;
  try {
    response = await fetch(SOURCE_URL);
  } catch (err) {
    fail(`could not fetch ${SOURCE_URL} — ${err.message}`);
  }
  if (!response.ok) {
    fail(`could not fetch ${SOURCE_URL} — HTTP ${response.status} ${response.statusText}`);
  }

  const sourceHtml = await response.text();

  const header = rewriteMarkup(extractRegion(sourceHtml, 'HEADER'));
  const footer = rewriteMarkup(extractRegion(sourceHtml, 'FOOTER'));
  const script = extractRegion(sourceHtml, 'SCRIPT'); // scroll + hamburger JS, verbatim

  let base;
  try {
    base = fs.readFileSync(BASE_NJK, 'utf8');
  } catch (err) {
    fail(`could not read ${BASE_NJK_REL} — ${err.message}`);
  }

  base = spliceRegion(base, 'HEADER', header);
  base = spliceRegion(base, 'FOOTER', footer);
  base = spliceRegion(base, 'SCRIPT', script);

  fs.writeFileSync(BASE_NJK, base);
  console.log(`${TAG} synced header, footer, and script from dbc-site-live into ${BASE_NJK_REL}`);
}

main().catch((err) => {
  console.error(`\n${TAG} ERROR: ${err.message}\n`);
  process.exit(1);
});
