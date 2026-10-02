# Performance

How MediBridge keeps pages fast and the API light, why each technique was
picked over its alternatives, and how to check it is still working. Measured
on 2 October 2026 against the production build and a local copy of the API.

## Results

| What | Before | After |
| ---- | ------ | ----- |
| Built client (`apps/Client/dist`) | 35 MB | 2 MB |
| JavaScript on the first page | 1 file, 981 KB (288 KB gzipped) | `index` 180 KB (56 KB gz) + `framework` 344 KB (110 KB gz) |
| JavaScript for the patient or doctor portal | in the first file | ~45 KB (12 KB gz) each, loaded on sign-in |
| Home page picture | 11.2 MB SVG | 56 KB WebP |
| Sign-in page background | 3.6 MB JPEG | 34 KB WebP |
| Other page images (about, departments, support, activate) | 2.9–7.2 MB each | 13–68 KB each |
| Doctor dashboard response (local, no proxy) | 4,440 bytes | 958 bytes (Brotli) |
| Common database queries | several full collection scans | all use an index |

The images were the biggest problem by far: one visit to the About page
downloaded more than 11 MB of photos.

## Client

### 1. Image optimisation

**What.** The photos were exported from the design at 4096–6144 px wide and
up to 11 MB each, and the home picture was a Figma SVG with a JPEG embedded
inside it. Each one was converted once to WebP, sized for how big it is shown:
1920 px wide for full-width backgrounds, 1200 px for the About story photo,
and twice the display size for the Figma SVGs, which were rendered in Chrome
so their blur effects survive. The originals were removed from `src/assets`;
git history still has them.

| File now | Replaces |
| -------- | -------- |
| `home-hero.webp` | `Frame 2085662224.svg` |
| `auth-background.webp` | `463a3ecad….jpg` |
| `departments-hero.webp` | `432ff249….jpg` |
| `support-hero.webp` | `10acabe97….jpg` |
| `about-hero.webp` | `about-hero-image.jpg` |
| `about-story.webp` | `about-story.jpg` |
| `identity-form.webp` | `identityForm.svg` |

**Rule for new images.** Export at no more than twice the size the image is
shown, as WebP (quality ~75). A Figma frame that contains a photo should be
exported as WebP or PNG, not SVG.

**Alternatives.**

| Option | Why not (for now) |
| ------ | ----------------- |
| Build-time plugin (`vite-plugin-image-optimizer`, `vite-imagetools`) | Handles new images automatically, but adds a native dependency (`sharp`) to every build and CI run. With seven images, converting once was simpler. Worth adding if the image count grows. |
| AVIF instead of WebP | 20–30% smaller again, but much slower to encode and still slightly less supported. WebP already took the images from megabytes to kilobytes. |
| Several sizes per image (`srcset`) | Phones would get even smaller files. Worth it if image weight becomes an issue again; today the largest image is 68 KB. |
| Image CDN (Cloudinary, imgix) | Resizes on demand. We already use Cloudinary for profile photos, but static design images don't need a paid service. |

### 2. Route-based code splitting

**What.** [`App.tsx`](../../apps/Client/src/App.tsx) loads every page except
Home and Login with `React.lazy`, so each page is its own JavaScript file,
downloaded the first time it is opened. `<Suspense>` shows a small spinner
([`PageLoader`](../../apps/Client/src/Components/PageLoader.tsx)) meanwhile.
Home and Login stay in the main file because nearly every visit starts on one
of them.

**After a deploy.** Each build renames the page files and Render removes the
old ones, so someone with the app already open would get a failed import.
[`lazyPage`](../../apps/Client/src/utils/lazyPage.ts) catches that and
reloads the page once to pick up the new build (at most once a minute, so a
real outage still shows an error instead of reloading forever).

**Alternatives.**

| Option | Trade-off |
| ------ | --------- |
| One bundle (what we had) | No loading pauses between pages, but everyone downloads the doctor portal, the booking flow and the forms just to see the sign-in page. |
| Split by component instead of by route | Finer control, but more `Suspense` boundaries and loading states to manage. We split one component only: the booking modal on the home page (see below). |
| React Router's `lazy` route option / framework mode | Equivalent for our purposes; `React.lazy` needs no change to how routes are declared. |
| Prefetch page files on hover or idle | Would hide the short loading spinner. Worth adding later, for example prefetching the portal after a successful sign-in. |

### 3. Lazy loading inside pages

- **The booking modal on the home page.** Only signed-in visitors who press
  *Book Appointment* need the five-step booking flow, so its code downloads on
  that click ([`HomePage.tsx`](../../apps/Client/src/Pages/HomePage.tsx)).
- **Images below the fold** (the About story photo, testimonial avatars, the
  footer logo, avatars and doctor photos in lists, the sign-up illustration)
  use `loading="lazy"` and `decoding="async"`. The browser fetches them only
  when they are about to scroll into view, and never fetches lazy images that
  are hidden, such as the sign-up illustration on phones.
- **The home picture** is the largest thing on screen on desktop, so it gets
  the opposite treatment: `fetchpriority="high"` and a fixed width and height,
  so it starts downloading early and the layout doesn't jump when it arrives.

**Don't** lazy-load an image that is visible when the page first opens: it
delays it.

### 4. Smaller dependencies in the first download

Measured with `source-map-explorer` on the main bundle:

| Library | Size | Change |
| ------- | ---- | ------ |
| `framer-motion` (+ `motion-dom`) | ~120 KB | **Removed.** It animated two things: testimonial cards and the user-menu dropdown. Two CSS keyframe animations in `App.css` (`animate-fade-up`, `animate-drop-in`) do the same, and they switch off for people who ask their device to reduce motion (`motion-safe:`). |
| `libphonenumber-js` | ~119 KB | **Moved out of the first download.** The login schema lived in the same file as the phone-number checks, so Login pulled in the phone library. `loginSchema` now has its own file ([`LoginSchema.ts`](../../apps/Client/src/Validation/LoginSchema.ts)); the library loads only with the activation pages. |
| `zod` | ~76 KB | Kept: Login validates with it. `zod/mini` is much smaller but has a different API across all our schemas; revisit if the first download needs to shrink further. |
| `axios` | ~49 KB | Kept: its interceptors handle sign-out on 401 and the auth header. A small `fetch` wrapper could replace it later. |

### 5. A separate, long-cached framework file

[`vite.config.ts`](../../apps/Client/vite.config.ts) puts React, React DOM,
the router, axios and react-toastify in `framework-[hash].js`. Our own code
changes with nearly every deploy; these libraries rarely do. Because the files
are cached for a year (see 7), returning visitors only download the small app
file after a deploy.

Only libraries the first page needs anyway belong in this group. A catch-all
`/node_modules/` group would pull lazily loaded libraries (such as the phone
validator) back into the first download.

**Alternative:** no manual grouping (Vite's default). Simpler, but React then
ships inside the app file and is downloaded again after every deploy.

### 6. Fonts

The Google Fonts were loaded with `@import` inside the CSS, so the browser
only discovered them after downloading and reading the stylesheet. They now
load from [`index.html`](../../apps/Client/index.html) with `preconnect`, as
one request for both families, with `display=swap` so text shows immediately
in a fallback font.

**Alternative:** self-host the fonts (e.g. `@fontsource/outfit`). That avoids
the extra connection to Google and is better for privacy, at the cost of
managing the font files ourselves. A reasonable next step.

### 7. Caching and compression of static files (Render)

Already in place before this work, and verified on the live site:

- Files in `/assets/` have content hashes in their names, so `render.yaml`
  serves them with `Cache-Control: public, max-age=31536000, immutable`.
- Pages (`index.html`) are served with `max-age=0`, so browsers check for a
  new deploy on every visit.
- Render's edge compresses everything with Brotli (`Content-Encoding: br`).

No pre-compression step (`vite-plugin-compression`) is needed while the edge
does this.

## Server

### 8. Response compression

**What.** [`middlewares/Performance.ts`](../../apps/Server/src/middlewares/Performance.ts)
adds the Express team's `compression` middleware: Brotli or gzip, whichever
the client prefers, at Brotli level 4 (fast; the default level 11 is meant for
files compressed once at build time), skipping responses under 1 KB and
formats that are already compressed (PDFs, images). Measured locally, the
doctor dashboard went from 4,440 to 958 bytes.

**Off on Render.** Render's edge already compresses every API response with
Brotli, so `render.yaml` sets `ENABLE_COMPRESSION=false`. Compressing twice
would only spend the small instance's CPU, and the edge may pass our gzip
through instead of its own better Brotli. The middleware is on by default
everywhere else (local runs, or a host without a compressing proxy).

| Option | Trade-off |
| ------ | --------- |
| Compress in a reverse proxy or CDN (what Render does) | Best: no work for the Node process. Use it whenever it's available. |
| `compression` in Express (chosen as the fallback) | Works anywhere; costs CPU per response. |
| `shrink-ray-current` or other Brotli-specific middleware | Adds caching of compressed output, but is less maintained than `compression`, which now supports Brotli itself. |

### 9. Database indexes

Every query the server runs was listed, and the frequent ones were given an
index. MongoDB's query planner (`explain()`) now picks an index scan for all
of them instead of reading the whole collection.

| Collection | Index | Serves |
| ---------- | ----- | ------ |
| appointments | `{ userId, status, date }` | a patient's appointments; marking past visits completed |
| appointments | `{ doctor, status, date }` | a doctor's schedule and dashboard counts; free-slot lookups when booking |
| appointments | `{ doctor, userId }` | "has this patient booked with this doctor?" (messages, patient profile) |
| messages | `{ doctor, createdAt: -1 }` | the doctor's side of the inbox |
| flaggedmessages | `{ userId, flaggedAt: -1 }`, `{ appointmentId }` (sparse) | a doctor's safety alerts |
| chatsessions | `{ userId, role, updatedAt: -1 }` | AI chat history |
| users | `{ UserId }` with a case-insensitive collation | sign-in ignores the case of the User ID; a query with a collation can only use an index with the same collation |

Already present: unique `UserId`, `Email` and `RegisteredNumber`; one
confirmed booking per doctor slot; records, messages, activity and visit notes
by owner and date.

**Field order** follows MongoDB's equality → sort → range guideline: the
person first, then the status, then the date range.

**How they are created.** Mongoose builds missing indexes when the server
connects (`autoIndex`). With today's data that is instant. Once collections
are large, build new indexes ahead of a deploy (Atlas UI, or
`Model.syncIndexes()` from a script) and turn `autoIndex` off in production,
because building an index on a big collection takes time and resources.

**Trade-off.** Each index makes writes slightly slower and uses storage. These
collections are read far more than written, and each index matches a query
that runs on every page load.

**Alternatives:** Atlas Performance Advisor (suggests indexes from real
traffic; worth checking once there is real usage), or caching query results
(see 11).

### 10. Lean reads and smaller responses

The public doctor directory and department lists now use `.lean()` (plain
objects instead of full Mongoose documents, which is faster and uses less
memory) and leave out internal fields. The doctor directory no longer sends
each doctor's login account ID, which was also a small information leak. Most
of the newer services already used `.lean()` and projections.

### 11. HTTP caching of public lists

`GET /api/departments` (5 minutes) and `GET /api/doctors` (1 minute) send
`Cache-Control: public, max-age=…, stale-while-revalidate=…`, so browsers
reuse them between pages. After that, Express's ETag gives a cheap
`304 Not Modified` when nothing changed. Booking slots are never cached, and
booking still checks the doctor's live availability.

**Never** add `publicCache` to anything behind `authMiddleware` or containing
personal data: a shared cache could hand one person's data to another.

| Option | Trade-off |
| ------ | --------- |
| Browser caching with `Cache-Control` (chosen) | Free and simple; data can be up to a minute (doctors) or five minutes (departments) old. |
| Server-side cache (in-memory or Redis) | Saves database reads for everyone, but needs invalidation when an admin edits data, and Redis is another service to run. Not needed at current traffic. |
| Client-side cache library (TanStack Query) | Dedupes requests and keeps data between pages. A bigger refactor of the data hooks; worth considering when the admin portal is built. |

## Checking it still works

```powershell
# Client: sizes of the JS and CSS files (look at index-*.js and framework-*.js)
npm run build -w @medibridge/client

# What is inside the main bundle
npx vite build --sourcemap   # in apps/Client
npx source-map-explorer dist/assets/index-*.js

# Live caching and compression headers
curl -I -H "Accept-Encoding: br" https://medibridge-client-v2.onrender.com/login
```

In the browser: DevTools → Network, tick *Disable cache* and load a page; the
sign-in page should download well under 1 MB in total. In DevTools →
Lighthouse, check *Largest Contentful Paint* on the home page.

For a query: `Model.find(…).explain()` and look for `IXSCAN` (index) rather
than `COLLSCAN` (whole collection) in the winning plan.

## Not done yet (ideas, roughly in order of value)

1. Prefetch the portal's code right after a successful sign-in.
2. Self-host the fonts.
3. Responsive image sizes (`srcset`) for the full-width backgrounds.
4. TanStack Query for client-side data caching and request deduplication.
5. Replace `axios` with a small `fetch` wrapper; consider `zod/mini`.
6. Turn off Mongoose `autoIndex` in production once collections grow.
7. Render's free API sleeps when idle, and the first request can take about
   a minute. A paid instance (or a scheduled ping) removes that cold start;
   it is the biggest delay real users will notice, more than any of the above.
