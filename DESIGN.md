# Design

## Theme

Dark, single theme, locked. One deliberate inversion: the Profile band is the
paper colour, full width, and the sticky header inverts with it. That is the
only theme switch on the page and it is a composition device, not a mode.

## Color

All tokens live at the top of `assets/css/site.css`.

| Token | Value | Role |
|---|---|---|
| `--ink` | `#050507` | page ground |
| `--ink-soft` | `#0b0b0f` | tiles, stage ground, stat panel base |
| `--panel` | `#0c0c10c7` | sticky header, over blur |
| `--paper` | `#f0ede7` | primary text, Profile band ground |
| `--silver` | `#b9bec8` | body copy on dark |
| `--silver-dim` | `#8a8e97` | eyebrows, meta, footer |
| `--ruby` | `#ff355f` | the single accent |
| `--crimson` | `#8d102d` | accent on the light band, hero haze base |
| `--gold` | `#c5a56d` | one role only: the leadership stat label |
| `--line` | `#f0ede726` | hairlines |
| `--line-strong` | `#f0ede74d` | control borders |

One accent, used identically everywhere: ruby marks the current nav item, the
second line of every section title, index numbers, award years, and the primary
button. Gold appears exactly once. Nothing else is saturated except the artwork.

`--silver-dim` was lifted from `#767b84` to `#8a8e97` so meta text clears 4.5:1
on `--ink`.

## Typography

Two families, self-hosted as variable WOFF2, preloaded, `font-display: swap`.

- **Display: Syne** (400 to 800). All headings, index numbers, award titles, the
  monogram. Uppercase only in the hero and the 404.
- **Body: Manrope** (200 to 800). Everything else.

Rules held throughout:

- Display letter-spacing never tighter than `-0.04em`.
- Hero clamps at `8rem`; the contact title at `7rem`.
- Body measure capped at 65ch, narrower where a column is narrow.
- `text-wrap: balance` on headings, `pretty` on prose.
- `font-variant-numeric: tabular-nums` on every number that sits in a column:
  tile indices, featured numbers, award years.
- Uppercase is reserved for labels of four words or fewer.

The second line of a two-line section title is the accent colour and its own
block; in the hero and the contact title the middle word is stroke-only
(`-webkit-text-stroke`), which is the signature of the reference build.

## Layout

- `--content: min(100% - 1.5rem, 92rem)`, widening to `min(100% - 2rem, 92rem)`
  at 900px.
- Mobile-first. Three breakpoints, all `min-width`: **560px** (grid goes to two
  columns), **900px** (desktop header, side-by-side splits, two-column stat),
  **1100px** (three-column grid, three-column capability set).
- Corner radius: one scale. `--radius` (1rem, 1.1rem at desktop) for tiles and
  panels; full pill for every control. Nothing in between.
- Section rhythm via `clamp()` so vertical space compresses on small screens
  rather than stepping at a breakpoint.
- Z-index is a named scale: `--z-sticky: 50`, `--z-progress: 60`, `--z-skip: 100`,
  `--z-boot: 200`. No arbitrary values anywhere.

## Components

- **Header.** Monogram, wordmark, nav, Motion switch, mail link. Burger below
  900px. Inverts to `.is-light` over the Profile band.
- **Featured block.** Index, meta, title, copy, an underlined "Open game" link,
  then a full-bleed stage. Used twice, for the two titles with cinematics.
- **Tile.** Square art over a bar carrying index, title and a pill. Square
  reserved in CSS; a shimmer holds it until the image decodes.
- **Stage.** Poster `<img>` under a `<video>`, a caption chip, and a clip control
  that is hidden until hover or focus.
- **Split.** Text against a portrait stage; the recognition section flips it.
- **Award row.** Year, title, source. Three columns from 560px, stacked below.

## Motion

Custom cubic-beziers only, never the CSS keywords.

| Token | Curve | Used for |
|---|---|---|
| `--ease-out-quart` | `cubic-bezier(.25,1,.5,1)` | default, all state changes |
| `--ease-out-expo` | `cubic-bezier(.16,1,.3,1)` | reveals, focus pull, image scale |

| Duration | Where |
|---|---|
| `--in` 150ms | hover on |
| `--out` 220ms | hover off, all control state |
| `--enter` 260ms | header theme change, skip link |
| 450ms | tile image scale, reveal |
| 850ms | stage focus pull |

Hover is faster on than off so nothing snaps away. Every hover rule sits inside
`@media (hover:hover) and (pointer:fine)` so it cannot fire on a tap. Press
feedback is `scale(.97)` on controls, `scale(.99)` on tiles. Only `transform`,
`opacity` and `filter` are animated; `filter` is dropped once a stage settles so
no blur pass stays alive during scroll.

Reveals are staggered 40ms apart within a row, capped at six steps, and gated
behind `.js` so the page is never blank without scripts. A four second safety
timer reveals everything if the observer never fires.

## Effects

- **Hero canvas.** WebGL, a domain-warped fbm haze in crimson to ruby, anchored
  upper-right where the reference build puts its glow, `mix-blend-mode: screen`
  over the CSS gradient. Grain at 1.8% kills banding. DPR capped at 1.25; the
  effect halves its resolution once frames pass 34ms and removes itself entirely
  if that continues. Absent under reduced motion.
- **Backdrop blur** is only ever on fixed or sticky surfaces: the header, the
  caption chips, the clip controls. Never on scrolling content.

## Deliberate deviations from the reference build

- Hero display size capped at `8rem` rather than `9.5rem`, and letter-spacing
  relaxed from `-0.055em` to `-0.04em`, so glyphs stop touching at large sizes.
- The sticky header inverts over the Profile band. In the reference build it
  stays white-on-paper and its labels are unreadable there.
- "Book of the Sun" points at the public game page; the reference build points it
  at a staging host.
- Em dashes in prose are replaced by commas or periods; award category separators
  become parentheses or a comma. Award names themselves are unchanged.
- Nav carries Motion and Contact in addition to Work, Expertise and Profile.
