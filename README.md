# Norair Harutyunyan — Game Art Portfolio

A static, self-hosted portfolio for Norair Harutyunyan: Game Art Team Lead, Art
Production Lead and Senior 2D Artist, Yerevan.

No framework, no build step, no runtime dependencies. Open `index.html` and it
works. GitHub Pages serves the repository root as-is.

**Live:** https://edgarhovsepyan.github.io/Norair_Harutyunyan_Portfolio/

This is the working copy. The destination is
https://norohtn.github.io/Norair_Harutyunyan_Portfolio/ ; when it lands there,
switch the five absolute URLs in the `<head>` of `index.html`, plus `robots.txt`
and `sitemap.xml`, back to that host.

---

## Why this rewrite exists

The previous version of this repository pulled every image from
`norair-game-art.cocoa-ball-5078.chatgpt.site`, a generated preview host that
nobody here controls. The portfolio had no assets of its own: if that host went
away, the page went blank. Two thumbnails were already returning 404 because of
filename typos, and the four motion clips referenced by the old `motion.js`
(`0830.mp4`, `0830(1..3).mp4`) were never committed, so the motion section
rendered four empty boxes reading "Video file pending upload".

Everything is now local. The site has no third-party origin at all: no CDN, no
font service, no analytics, no external image host.

---

## Layout

```
index.html                     the whole page, one file
assets/css/site.css            hand-authored, mobile-first
assets/js/site.js              progressive enhancement only
assets/fonts/*.woff2           Syne (display) + Manrope (body), self-hosted
games/*.png + *.webp           22 game thumbnails, WebP with PNG fallback
media/*.mp4 + *-poster.webp    4 clips, two rungs each, plus poster frames
og-cover.png                   1200x630 share card
Norair_Harutyunyan_Resume.pdf  linked from the hero and the profile band
favicon.svg / favicon.ico / apple-touch-icon.png
robots.txt / sitemap.xml / .nojekyll
```

## Media pipeline

Source clips were 4K, 85 MB for four files. They ship as two H.264 rungs each
plus a WebP poster, 22.6 MB in total:

| Clip | Desktop | Mobile | Duration |
|---|---|---|---|
| `atlantis-cinematic` | 1620x1080 | 1080x720 | 14.4s |
| `fortune-don-tiger-cinematic` | 1920x1080 | 1280x720 | 12.1s |
| `pascal-sbc-recognition` | 900x1600 | 608x1080 | 18.6s |
| `character-motion-reel` | 900x1600 | 608x1080 | 28.0s |

Encoded with `libx264`, `-movflags +faststart`, closed GOP every 60 frames so the
loop restarts without a stall. The three silent clips carry no audio track at
all. Regenerate with `D:/_norair_src/encode.sh` if the sources change.

Thumbnails are converted to WebP (3.79 MB of PNG becomes 0.43 MB) and served
through `<picture>`, with the PNG kept as the fallback source.

## How the page behaves

- **Boot screen.** Held until the fonts resolve, the document loads, and the
  first poster frame decodes; capped at 1.5s so a slow asset can never trap a
  visitor. It only exists when JavaScript runs.
- **Video.** Sources attach one viewport ahead of the clip, so playback starts
  full rather than buffering on screen. Each clip arrives blurred and pulls into
  focus as it enters view, which also covers the hand-off from poster frame to
  first video frame. Clips pause off screen and on a hidden tab.
- **Motion switch.** The header control stops every clip, the hero canvas and all
  reveals at once, and remembers the choice. It defaults to the operating
  system's reduced-motion setting, and follows changes to it until someone
  chooses explicitly. This is the pause mechanism required by WCAG 2.2.2, so the
  per-clip buttons stay out of sight until hover or keyboard focus.
- **Hero canvas.** A slow ruby haze in WebGL, purely atmospheric. If the context
  is refused, or frames start costing more than 34ms, it steps aside and the CSS
  glow underneath carries the hero. It never renders under reduced motion.
- **Gallery.** Every thumbnail's square is reserved in CSS, so lazy loading
  cannot shift the layout. A shimmer holds the slot until the image has decoded.

Without JavaScript the page is complete: all sections visible, all poster frames
shown, no overlay, every link live.

## Local preview

Any static server works. This repository is registered in `.claude/launch.json`:

```bash
node D:/_norair_src/serve.mjs 8231
```

## Deployment

`.github/workflows/pages.yml` publishes the repository root to GitHub Pages on
every push to `main`. There is no build step to go wrong.

## Editing

- **Game list:** the `.tile` blocks in `index.html`, numbered 01 to 22.
- **Copy:** all of it lives in `index.html`; there is no CMS and no data file.
- **Colour and type:** the custom properties at the top of `assets/css/site.css`.
- **Résumé:** replace `Norair_Harutyunyan_Resume.pdf`, keeping the filename.

## Known items for the owner

- Nineteen of the 22 game links are Pascal Gaming launcher URLs carrying a
  `launchToken`, a `partnerKey` and `mode=real`. They are inherited from the
  reference build. They are session-shaped and may expire; a public
  `pascalgaming.com/games/...` page is the durable alternative where one exists.
- The reference build pointed "Book of the Sun" at `pg-stage.rpd.cloud`, a
  staging host. That card now points at the public game page instead.
- Award entries in the recognition section are Pascal Gaming studio awards, and
  the section says so. They are not presented as individual awards.

## Reviewing the hero effect

The WebGL haze is skipped on software renderers (SwiftShader, llvmpipe) and on
machines reporting two cores or fewer, because there it costs main-thread time
that first paint needs. Append `?gl=force` to the URL to render it anyway, which
is also how it is checked in a headless browser.
