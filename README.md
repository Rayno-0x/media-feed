# MediaFeed

One feed for everything you create — music, photos, articles, and blogs in a single social wall.

MediaFeed is a fully interactive **front-end demo** of a multi-format social platform. It is built with plain HTML, CSS, and vanilla JavaScript, no frameworks, no build step, no backend. All data lives in your browser via `localStorage`, so every like, follow, comment, post, and playlist persists between visits.

## Run it

No install required. Either:

- Open `index.html` directly in a browser, or
- Serve the folder (recommended):

```bash
npx serve .
# or
python -m http.server 8080
```

## Demo account

On the [sign-in page](auth.html), press **Fill demo credentials**:

| Email | Password |
| --- | --- |
| `rae@mediafeed.app` | `mediafeed` |

Or create your own account from the sign-up tab — registration is instant and mock.

## What's inside

| Page | Highlights |
| --- | --- |
| **Landing** (`index.html`) | Marketing page with animated device mockup, pricing, FAQ |
| **Home feed** | Unified wall of all post types: text, photo, gallery, video, audio, article link |
| **Explore** | Trending tags, most-liked wall, tiles that deep-link into Music / Gallery / Reads |
| **Create** | Composer for all six post types with image compression, audio track picker, tagging |
| **Post detail** | Full thread view with comments, likes, saves, share |
| **Profile** | Cover/avatar, stats, tabs (Posts / Music / Gallery / Articles), follow system |
| **Notifications** | Like / comment / follow / mention events, unread badges, mark-all-read |
| **Music** | Artist home: stats, featured spotlight, trending queue, persistent mini-player |
| **Gallery** | Masonry grid of visual work with lightbox |
| **Reads** | Article & blog reader cards with tag filtering |
| **Settings** | Account editing, social links, theme picker (dark/light), preferences, danger zone |

## Notable details

- **Persistent global player** — start a track anywhere; the mini-player follows you across pages
- **Responsive shell** — desktop sidebar + right rail, tablet icon rail, mobile top bar / quick links / bottom tab bar
- **Dark & light themes** — token-based design system ("Electric Violet"), switchable in Settings
- **Image compression** — uploads are downscaled client-side before saving to localStorage
- **Reset anytime** — Settings → Danger zone restores the original demo data

## Project structure

```
index.html            landing page
*.html                app pages (feed, explore, profile, ...)
css/
  theme.css           design tokens (colors, spacing, type)
  app.css             shared component library + responsive shell
  <page>.css          per-page styles
js/
  data.js             mock database + localStorage store (MF.store)
  app.js              shell engine: sidebar/topbar/nav/player/toasts
  components.js       shared UI renderers (post cards, comments, ...)
  pages/<page>.js     per-page logic
assets/               seed images, audio, icons
```
