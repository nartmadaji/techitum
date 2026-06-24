# Homepage Baseline Audit

Audit date: 2026-06-18  
Homepage: `/index.html`  
Scope: Current homepage only, before further optimization.

## Before-State Summary

The homepage is a Hebrew RTL static page with a blocking shared shell stylesheet, a large inline homepage stylesheet, and two inline JavaScript blocks. Its menus and responsive layout are generally well guarded with ARIA state and `inert`. Browser checks found no page-level horizontal overflow at 360, 390, 430, 768, or desktop widths.

The current working-tree baseline already includes two extracted WebP category images. No homepage code was changed during this audit.

## Measured Baseline

| Item | Current value |
|---|---:|
| HTML size | 90,991 bytes (88.9 KiB) |
| Inline CSS | 35,703 bytes in 1 `<style>` block |
| Inline JavaScript | 19,832 bytes in 2 blocks |
| Menu/header JS | 14,049 bytes |
| Brand carousel JS | 5,783 bytes |
| Project CSS files linked | 1: `assets/css/site-shell.css` (28,034 bytes) |
| Total stylesheet requests | 2: site shell + Google Fonts stylesheet |
| External script files | 0 |
| `<img>` elements | 34 |
| Inline/base64 images | 0 |
| SVG image references | 25 references, 16 unique paths |
| Inline SVG elements | 14 |
| SVG files under `assets/` | 25 |
| Map iframes | 1 |
| Total links | 58 |

## Loading Strategy

- Font: Google Fonts `Heebo`, loaded through a blocking stylesheet with preconnects to Google Fonts and Google static assets.
- Requested font weights: 400, 500, 600, 700, 800, 900.
- Critical CSS: all homepage section/layout CSS is inline, so hero and page layout styling is immediately available.
- Header/footer/menu CSS: `assets/css/site-shell.css` is a normal blocking stylesheet.
- Deferred CSS: none.
- JavaScript: both menu and carousel scripts are inline near the end of `<body>`. No external JS requests are made.
- Category images use WebP files, fixed dimensions, `loading="lazy"`, and `decoding="async"`.
- Brand logos and the map iframe are lazy loaded where applicable.

## Structure And SEO

- Document language/direction: `lang="he"` and `dir="rtl"`.
- One H1: “אספקה טכנית, חומרי איטום וכלי עבודה — במקום אחד”.
- Headings: 1 H1, 10 H2 elements, and 9 category-card H3 elements.
- Meta description exists.
- Open Graph: locale, type, site name, title, and description exist.
- Twitter: card, title, and description exist.
- Missing: canonical URL, OG image/URL, Twitter image, and LocalBusiness JSON-LD.
- No accidental `noindex` was found.
- Main target exists as `#main-content`.
- No skip link exists.

## Links And Placeholders

- WhatsApp: 7 links, consistently using `https://wa.me/972502126707`.
- Phone: 3 links, consistently using `tel:046023752`.
- Email: 2 links, consistently using `mailto:itum.hatsafon@gmail.com`.
- Categories: 36 references covering all 9 category URLs in cards, menus, and footer.
- Social links: Facebook, Instagram, and TikTok are placeholder `href="#"` links.
- Location quick action and footer location link are placeholders.
- `/about/` is linked from navigation but no local `/about/index.html` currently exists.
- The footer also contains `#about`; this target is not present on the homepage.

## Interaction Wiring

- Desktop product dropdown: present and opens correctly. `aria-expanded`, `aria-hidden`, and `inert` update together.
- Mobile hamburger: present and opens correctly with focus/state management.
- Mobile product submenu: present and opens correctly with matching ARIA and `inert` updates.
- Brand strip: arrows, keyboard-focusable track, cloned loop cards, smooth scrolling, pointer drag, touch pan, resize reset, and reduced-motion handling are implemented.
- Carousel automated check: cloned cards and handlers were present, but arrow clicks did not produce a measurable `scrollLeft` change in the audit browser. Manual verification is required.
- WhatsApp, telephone, map iframe, and all 9 category cards are present.
- No console errors were observed during browser checks.

ARIA baseline:

- `aria-expanded`: 3 uses.
- `aria-hidden`: 33 uses.
- `inert`: 3 initial uses.
- `aria-controls`: 5 uses; every referenced target ID exists.

## Responsive Baseline

Checked at 360, 390, 430, 768, and 1280 CSS-pixel viewport requests.

- No document-level horizontal overflow was found.
- Hero title remained inside its container.
- Header, buttons, category grid, footer, and map remained inside the viewport.
- Mobile category grid becomes a compact single-column layout.
- Footer stacks without measured overflow.
- Map measured approximately 317×280 at 360 and 1120×630 at desktop.
- The brand strip intentionally contains offscreen loop clones, but its shell clips them and does not widen the document.
- No button overflow was detected.

## Lighthouse

Lighthouse was not run. It is not installed locally, and running it would require downloading a package or adding tooling. This pass therefore used browser interaction checks and a static performance audit only.

## Risks Found

### Critical Before Production

- Replace placeholder social and location links.
- Resolve the broken `/about/` link and missing `#about` target.
- Confirm the final public URL, then add canonical metadata.
- Add verified LocalBusiness schema only after address, hours, URL, logo, and map details are final.

### Important

- Manually verify carousel arrow movement and drag behavior in Chrome, Safari, and mobile browsers.
- Measure actual font usage before reducing the six requested Heebo weights.
- Run mobile Lighthouse/WebPageTest against the deployed HTTPS URL.
- Review the very large SVG logo/brand assets, especially `Izek-Ilen.svg`, without changing their appearance.
- Replace temporary category imagery with final optimized photographs.

### Nice To Have

- Add a visible-on-focus skip link to `#main-content`.
- Add complete social preview metadata after the production URL and preview image exist.
- Remove stale TODO comments after each production item is resolved.

## CSS Extraction Warning

Do not broadly extract or split the 35.7 KB inline stylesheet without measurement. The inline CSS currently protects the hero, above-the-fold layout, responsive base state, and initial rendering. Moving it all into additional files can add blocking requests, cause header/menu flashes, or delay first paint. Any future extraction should use one cacheable file at most, retain truly critical header/hero/mobile-menu base CSS immediately, and be tested on cold and repeat visits.

## Retest Checklist

- [ ] Cold-load header, logo, hero, and CTA paint without flashing or layout shift.
- [ ] Desktop product dropdown opens, closes, and supports keyboard navigation.
- [ ] Mobile hamburger opens/closes, locks scrolling, and restores focus.
- [ ] Mobile product submenu updates ARIA and `inert`.
- [ ] Brand arrows, mouse drag, touch swipe, looping, and reduced motion work.
- [ ] No overflow at 360, 390, 430, 768, and desktop widths.
- [ ] Hero title, buttons, category cards, footer, and map remain contained.
- [ ] WhatsApp, phone, email, category, about, location, and social links work.
- [ ] Lazy images and map load when scrolled into view.
- [ ] One H1 remains; title, description, canonical, OG, Twitter, and schema are valid.
- [ ] Skip-link and keyboard focus order are checked.
- [ ] Console remains free of errors.
- [ ] Mobile Lighthouse is run on the deployed production URL.
- [ ] When Google Search Console AI-search reporting is accessible, monitor only visible AI impressions by page, country, device, date range, and pages appearing in AI search surfaces.
