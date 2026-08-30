# Product

## Register

brand

The design is the product. This is a portfolio: the page has to do the job a
reel does, which is to make a hiring lead want the person before they have
finished reading.

## Users

Art directors, studio leads, producers and recruiters in iGaming and game
studios, most of them opening the link from a message or a LinkedIn profile,
often on a phone, usually giving it under a minute before deciding whether to
keep scrolling. A second, smaller audience is peers and collaborators checking
specific titles.

The job to be done: judge, quickly, whether this person can carry art direction
at studio scale, and then find a way to contact them.

## Product Purpose

Present Norair Harutyunyan's released iGaming work and production leadership as
one page that loads anywhere, needs no login, and survives without any
third-party host. Success is a visitor reaching the contact block with a clear
sense of the range of the work: 22 shipped titles, cinematics, and leadership of
a 30-person art function.

## Brand Personality

Composed, cinematic, exact. The voice states facts and gets out of the way: game
titles, mechanics, dates, counts. Nothing is claimed that a link cannot back up,
and studio awards are labelled as studio awards rather than personal ones. The
emotional target is confidence, not excitement; the art carries the colour, so
the interface stays dark and quiet around it.

Three words: cinematic, exact, unhurried.

## Anti-references

- The generated preview host the earlier version depended on. A portfolio whose
  images live on somebody else's temporary domain is not a portfolio.
- Template artist sites: masonry wall of thumbnails, no hierarchy, no order, no
  statement of what the person actually did.
- iGaming marketing pages: gold gradients, coin explosions, exclamation marks.
  The work already contains that energy; repeating it in the frame is noise.
- Motion for its own sake. Parallax on everything, counters that tick up,
  scroll-jacking.

## Design Principles

1. **The art is the loudest thing on the page.** Every interface surface stays
   near-black and low chroma so the game thumbnails and cinematics are the only
   saturated objects in view.
2. **Show the work, then the claim.** Featured titles and the full 22-game grid
   come before any statement about leadership or awards.
3. **Own every byte.** No external host, no CDN, no font service. If it renders
   today it renders in three years.
4. **Nothing is claimed without a link.** Every title opens the live game. Studio
   awards are attributed to the studio in the same sentence.
5. **Motion is a hand-off, not decoration.** Clips pull into focus to cover the
   poster-to-video swap; the grid fades to cover decode. Motion that covers
   nothing gets cut.

## Accessibility & Inclusion

Target WCAG 2.1 AA.

- `prefers-reduced-motion` is the default state, not an afterthought: it disables
  the hero canvas, the focus-pull blur and all reveals, and it decides the
  initial position of the Motion switch.
- The Motion switch is the pause mechanism for auto-playing clips longer than
  five seconds (WCAG 2.2.2). Per-clip controls remain in the tab order and appear
  on keyboard focus.
- Every interactive target is at least 44px tall. Focus is always visible, never
  removed.
- The page is fully readable and navigable with JavaScript disabled.
- Body text holds 4.5:1 or better against its background in both the dark page
  and the light profile band; the sticky header inverts over that band so its
  own labels never drop below contrast.
