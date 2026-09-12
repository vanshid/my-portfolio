# vanshi dalal — portfolio

Static site, no build step. Core files: `index.html`, `style.css`, `script.js`.
Deploy config included for both platforms: `netlify.toml`, `wrangler.toml`, `_headers` (Cloudflare Pages reads `_headers`; Netlify reads `netlify.toml` — both are already set up with security headers and long-cache on CSS/JS).

## what's in it

One page, full viewport height, no scrolling required.

- **Headline** — cycles through "I build / I ship / I fix / I own things that don't break."
- **The stage** — 14 fragments (real decisions, roles, and skills from her background) scattered across the screen. Drag them, or the cursor pushes them away as it gets close. Click one (without dragging) and its story prints to the console bar at the bottom.
- **Console bar** — a single line at the bottom that shows whichever fragment was last clicked. Defaults to "click a fragment to expand it".
- Keyboard accessible: fragments are focusable and Enter/Space activates the same reveal as a click.
- Respects `prefers-reduced-motion` — fragments render in a static scatter with click-to-reveal still working, no animation loop.

Dark mode follows system preference automatically (`prefers-color-scheme`).

## before you deploy

Swap the email if `vanshid1904@gmail.com` isn't the one she wants public-facing — it appears in two places in `index.html`: the nav link and the `mailto:` href.

## deploy — netlify

**Option A: drag and drop**
Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the whole `vanshi-portfolio` folder in. Done — you get a live URL immediately.

**Option B: CLI**
```bash
npm install -g netlify-cli
cd vanshi-portfolio
netlify deploy --prod
```

**Option C: git**
Push this folder to a GitHub repo, then in Netlify: "Add new site" → "Import an existing project" → pick the repo. Build command: leave blank. Publish directory: `/` (root).

## deploy — cloudflare pages

**Option A: dashboard**
Cloudflare dashboard → Workers & Pages → Create → Pages → "Upload assets" → drag in the folder. No build command needed.

**Option B: CLI**
```bash
npm install -g wrangler
cd vanshi-portfolio
wrangler pages deploy . --project-name=vanshi-dalal
```

**Option C: git**
Connect the GitHub repo in the Pages dashboard. Framework preset: "None". Build command: blank. Build output directory: `/`.

## custom domain

Both Netlify and Cloudflare Pages let you attach a custom domain for free under site settings once it's live — just point the domain's DNS at the one they give you.
