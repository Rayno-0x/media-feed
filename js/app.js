/* ============================================================
   MediaFeed — App Shell Engine
   ------------------------------------------------------------
   Injected UI: sidebar, mobile top bar, bottom nav, FAB,
   right rail, global music player, toasts, lightbox, search.
   Every app page loads:  js/data.js → js/app.js → js/components.js

   Public API:
     MF.icon(name, size)          → inline SVG string
     MF.ui.toast(msg)
     MF.player.play(track, queue) → global persistent player
     MF.go(url)                   → navigate helper
   ============================================================ */

window.MF = window.MF || {};

(function () {
  const store = MF.store;

  /* ==========================================================
     1. ICON LIBRARY
     ========================================================== */
  const PATHS = {
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    explore: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    settings: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    comment: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
    bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    article: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    blog: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    video: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
    update: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    play: '<polygon points="6 3 20 12 6 21" fill="currentColor" stroke="none"/>',
    pause: '<rect x="5" y="4" width="5" height="16" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="4" width="5" height="16" rx="1" fill="currentColor" stroke="none"/>',
    "skip-back": '<polygon points="19 20 9 12 19 4 19 20" fill="currentColor" stroke="none"/><line x1="5" y1="5" x2="5" y2="19"/>',
    "skip-fwd": '<polygon points="5 4 15 12 5 20 5 4" fill="currentColor" stroke="none"/><line x1="19" y1="5" x2="19" y2="19"/>',
    more: '<circle cx="5" cy="12" r="1.8" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.8" fill="currentColor" stroke="none"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3 1.072-2.143 2.5-3.736 4.5-5 .5 2.5 1.5 3.5 2.5 5a7 7 0 1 1-11 6c0-1.5.5-2.5 1.5-3.5.5 1.5 1 2.5 2.5 3z"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    "arrow-left": '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    verified: '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
    chevron: '<polyline points="6 9 12 15 18 9"/>',
    globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',
    x: '<path d="M4 4l16 16M20 4L4 20"/>',
    youtube: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
    tiktok: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    twitch: '<rect x="2" y="2" width="20" height="20" rx="4.5"/><path d="M7.5 22v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-6.5L7.5 22z"/><line x1="10" y1="8" x2="10" y2="12"/><line x1="15" y1="8" x2="15" y2="12"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  };

  MF.icon = function (name, size = 24) {
    const body = PATHS[name] || PATHS.update;
    return (
      `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" ` +
      `stroke="currentColor" stroke-width="2" stroke-linecap="round" ` +
      `stroke-linejoin="round" aria-hidden="true">${body}</svg>`
    );
  };

  /* ==========================================================
     2. HELPERS
     ========================================================== */
  MF.escapeHtml = function (str) {
    const d = document.createElement("div");
    d.textContent = str == null ? "" : String(str);
    return d.innerHTML;
  };

  MF.timeAgo = function (ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return m + "m ago";
    const h = Math.floor(m / 60);
    if (h < 24) return h + "h ago";
    const d = Math.floor(h / 24);
    if (d < 7) return d + "d ago";
    return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  MF.nfmt = function (n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
  };

  MF.go = (url) => (window.location.href = url);

  MF.profileUrl = (user) => `profile.html?u=${encodeURIComponent(user.username)}`;
  MF.postUrl = (p) => `post.html?id=${encodeURIComponent(p.id)}`;

  /* ==========================================================
     3. TOASTS
     ========================================================== */
  let toastWrap = null;

  MF.ui = MF.ui || {};
  MF.ui.toast = function (msg) {
    if (!toastWrap) {
      toastWrap = document.createElement("div");
      toastWrap.className = "mf-toast-wrap";
      document.body.appendChild(toastWrap);
    }
    const t = document.createElement("div");
    t.className = "mf-toast";
    t.textContent = msg;
    toastWrap.appendChild(t);
    setTimeout(() => t.classList.add("out"), 2200);
    setTimeout(() => t.remove(), 2600);
  };

  /* ==========================================================
     4. THEME
     ========================================================== */
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("mf_theme", theme);
    } catch (e) {}
    document.querySelectorAll(".mf-theme-toggle").forEach((b) => {
      b.innerHTML =
        MF.icon(theme === "light" ? "moon" : "sun") +
        `<span>${theme === "light" ? "Dark mode" : "Light mode"}</span>`;
    });
  }

  function initTheme() {
    let saved = "dark";
    try {
      saved = localStorage.getItem("mf_theme") || "dark";
    } catch (e) {}
    applyTheme(saved);
  }

  /* ==========================================================
     5. GLOBAL MUSIC PLAYER
     ========================================================== */
  const player = {
    el: null,
    audio: new Audio(),
    queue: [],
    index: -1,
    open: false,

    ensureEl() {
      if (this.el) return;
      this.el = document.createElement("div");
      this.el.className = "mf-player";
      this.el.innerHTML = `
        <button class="mf-icon-btn mf-player-close" aria-label="Close player">${MF.icon("close", 16)}</button>
        <div class="mf-player-progress"><div class="mf-player-progress-fill"></div></div>
        <div class="mf-player-row">
          <img class="mf-player-cover" alt="" />
          <div class="mf-player-info">
            <div class="mf-player-title"></div>
            <div class="mf-player-artist"></div>
          </div>
          <span class="mf-player-time">0:00</span>
          <div class="mf-player-controls">
            <button class="mf-pc-prev" aria-label="Previous">${MF.icon("skip-back", 17)}</button>
            <button class="mf-pc-play" aria-label="Play or pause">${MF.icon("play", 17)}</button>
            <button class="mf-pc-next" aria-label="Next">${MF.icon("skip-fwd", 17)}</button>
          </div>
        </div>`;
      document.body.appendChild(this.el);

      this.el.querySelector(".mf-player-close").addEventListener("click", () => this.close());
      this.el.querySelector(".mf-pc-play").addEventListener("click", () => this.toggle());
      this.el.querySelector(".mf-pc-prev").addEventListener("click", () => this.step(-1));
      this.el.querySelector(".mf-pc-next").addEventListener("click", () => this.step(1));

      const bar = this.el.querySelector(".mf-player-progress");
      bar.addEventListener("click", (e) => {
        const r = bar.getBoundingClientRect();
        this.audio.currentTime = ((e.clientX - r.left) / r.width) * (this.audio.duration || 0);
      });

      this.audio.addEventListener("timeupdate", () => {
        const pct = this.audio.duration
          ? (this.audio.currentTime / this.audio.duration) * 100
          : 0;
        this.el.querySelector(".mf-player-progress-fill").style.width = pct + "%";
        this.el.querySelector(".mf-player-time").textContent = this.fmt(this.audio.currentTime);
      });
      this.audio.addEventListener("ended", () => this.step(1));
      this.audio.addEventListener("play", () => this.syncPlayBtn());
      this.audio.addEventListener("pause", () => this.syncPlayBtn());
    },

    fmt(s) {
      if (!isFinite(s)) return "0:00";
      const m = Math.floor(s / 60);
      const ss = Math.floor(s % 60).toString().padStart(2, "0");
      return `${m}:${ss}`;
    },

    syncPlayBtn() {
      const btn = this.el.querySelector(".mf-pc-play");
      btn.innerHTML = MF.icon(this.audio.paused ? "play" : "pause", 17);
      document.body.classList.toggle("mf-player-open", this.open && !this.audio.paused);
      document.querySelectorAll(".mf-track-play[data-playing]").forEach((b) => {
        b.innerHTML = b.dataset.playing === "true" && !this.audio.paused ? MF.icon("pause", 16) : MF.icon("play", 16);
      });
    },

    load(track) {
      this.ensureEl();
      this.audio.src = track.src;
      this.el.querySelector(".mf-player-title").textContent = track.title || "Untitled track";
      this.el.querySelector(".mf-player-artist").textContent = track.artist || "";
      this.el.querySelector(".mf-player-cover").src = track.cover || "./assets/images/music.png";
      try {
        localStorage.setItem("mf_player_last", JSON.stringify(track));
      } catch (e) {}
    },

    play(track, queue) {
      this.load(track);
      if (Array.isArray(queue)) {
        this.queue = queue;
        this.index = queue.findIndex((t) => t.src === track.src);
      }
      this.open = true;
      this.el.classList.add("open");
      this.audio.play().catch(() => {});
    },

    toggle() {
      if (!this.audio.src) return;
      if (this.audio.paused) this.audio.play().catch(() => {});
      else this.audio.pause();
    },

    step(dir) {
      if (!this.queue.length) return;
      this.index = (this.index + dir + this.queue.length) % this.queue.length;
      this.play(this.queue[this.index]);
    },

    close() {
      this.audio.pause();
      this.open = false;
      this.el.classList.remove("open");
      document.body.classList.remove("mf-player-open");
      document.querySelectorAll(".mf-track-play").forEach((b) => (b.innerHTML = MF.icon("play", 16)));
    },
  };

  MF.player = player;

  /* Restore last played track (paused) */
  function restorePlayer() {
    try {
      const raw = localStorage.getItem("mf_player_last");
      if (raw) {
        const t = JSON.parse(raw);
        player.load(t);
        player.syncPlayBtn();
      }
    } catch (e) {}
  }

  /* ==========================================================
     6. SHELL INJECTION
     ========================================================== */
  function buildSidebar(page) {
    const me = store.me();
    const unread = store.unreadCount();
    return `
      <aside class="mf-sidebar">
        <div class="mf-sidebar-inner">
          <a class="mf-logo" href="feed.html">Media<span>Feed</span></a>
          <nav class="mf-nav" aria-label="Primary">
            <a class="mf-navitem ${page === "feed" ? "active" : ""}" href="feed.html">
              ${MF.icon("home")}<span>Home</span>
            </a>
            <a class="mf-navitem ${page === "explore" ? "active" : ""}" href="explore.html">
              ${MF.icon("explore")}<span>Explore</span>
            </a>
            <a class="mf-navitem ${page === "notifications" ? "active" : ""}" href="notifications.html">
              ${MF.icon("bell")}<span>Notifications</span>
              ${unread ? `<span class="mf-nav-badge">${unread > 9 ? "9+" : unread}</span>` : ""}
            </a>
            <a class="mf-navitem ${page === "profile" ? "active" : ""}" href="${MF.profileUrl(me)}">
              ${MF.icon("user")}<span>Profile</span>
            </a>
            <a class="mf-navitem ${page === "settings" ? "active" : ""}" href="settings.html">
              ${MF.icon("settings")}<span>Settings</span>
            </a>
            <div class="mf-nav-sep"><span>Browse</span></div>
            <a class="mf-navitem ${page === "music" ? "active" : ""}" href="music.html">
              ${MF.icon("music")}<span>Music</span>
            </a>
            <a class="mf-navitem ${page === "gallery" ? "active" : ""}" href="gallery.html">
              ${MF.icon("image")}<span>Gallery</span>
            </a>
            <a class="mf-navitem ${page === "blogs" ? "active" : ""}" href="blogs.html">
              ${MF.icon("blog")}<span>Reads</span>
            </a>
            <a class="mf-create-btn" href="create.html">
              ${MF.icon("plus", 20)}<span>Create</span>
            </a>
          </nav>
          <button class="mf-theme-toggle" type="button"></button>
          <a class="mf-userchip" href="${MF.profileUrl(me)}">
            <img class="mf-avatar" src="${me.avatar}" alt="" width="38" height="38" />
            <span class="mf-userchip-info">
              <span class="mf-userchip-name">${MF.escapeHtml(me.name)}</span>
              <span class="mf-userchip-handle">@${MF.escapeHtml(me.username)}</span>
            </span>
          </a>
        </div>
      </aside>`;
  }

  function buildTopbar(page) {
    const me = store.me();
    const quick = [
      { href: "music.html", page: "music", icon: "music", label: "Music" },
      { href: "gallery.html", page: "gallery", icon: "image", label: "Gallery" },
      { href: "blogs.html", page: "blogs", icon: "blog", label: "Reads" },
    ];
    /* pages that live outside the main tabs get a back affordance */
    const isSubPage = ["music", "gallery", "blogs", "settings"].includes(page);
    return `
      <header class="mf-topbar">
        <a class="mf-logo" href="feed.html">Media<span>Feed</span></a>
        <div class="mf-topbar-actions">
          <button class="mf-theme-toggle mf-icon-btn" type="button" aria-label="Toggle theme"></button>
          <a href="${MF.profileUrl(me)}" aria-label="Your profile">
            <img class="mf-avatar" src="${me.avatar}" alt="" width="34" height="34" />
          </a>
        </div>
      </header>
      <nav class="mf-quicklinks" aria-label="Quick links">
        ${
          /* back arrow only on secondary pages */
          isSubPage
            ? `<button class="mf-ql-back" type="button" aria-label="Go back">${MF.icon("arrow-left", 16)}</button>`
            : ""
        }
        ${quick
          .map(
            (q) => `
          <a class="mf-ql-chip ${page === q.page ? "active" : ""}" href="${q.href}">
            ${MF.icon(q.icon, 14)}<span>${q.label}</span>
          </a>`
          )
          .join("")}
      </nav>`;
  }

  function buildBottomNav(page) {
    const me = store.me();
    const unread = store.unreadCount();
    return `
      <nav class="mf-bottomnav" aria-label="Mobile">
        <a href="feed.html" class="${page === "feed" ? "active" : ""}">
          ${MF.icon("home")}<span>Home</span>
        </a>
        <a href="explore.html" class="${page === "explore" ? "active" : ""}">
          ${MF.icon("explore")}<span>Explore</span>
        </a>
        <a href="create.html" class="mf-bn-create" aria-label="Create">
          ${MF.icon("plus")}
        </a>
        <a href="notifications.html" class="${page === "notifications" ? "active" : ""}">
          ${MF.icon("bell")}<span>Alerts</span>
          ${unread ? `<span class="mf-dot-badge">${unread > 9 ? "9+" : unread}</span>` : ""}
        </a>
        <a href="${MF.profileUrl(me)}" class="${page === "profile" ? "active" : ""}">
          ${MF.icon("user")}<span>You</span>
        </a>
      </nav>
      <a class="mf-fab" href="create.html" aria-label="Create a post">${MF.icon("plus", 26)}</a>`;
  }

  /* --- Right rail --- */
  function trendingTags(limit = 6) {
    const counts = {};
    store.get().posts.forEach((p) =>
      (p.tags || []).forEach((t) => (counts[t] = (counts[t] || 0) + 1))
    );
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }

  function suggestions(limit = 3) {
    const me = store.me();
    return store
      .get()
      .users.filter((u) => u.id !== me.id && !me.following.includes(u.id))
      .slice(0, limit);
  }

  function buildRail(page) {
    const tags = trendingTags();
    const sug = suggestions();
    return `
      <aside class="mf-rail">
        <div class="mf-rail-sticky">
          <div class="mf-search" id="railSearch">
            <div class="mf-search-box">
              ${MF.icon("search", 18)}
              <input type="search" placeholder="Search creators, posts, tags…" autocomplete="off" />
            </div>
            <div class="mf-search-results"></div>
          </div>

          <div class="mf-rail-card">
            <h3>${MF.icon("flame", 18)} Trending now</h3>
            ${
              tags.length
                ? tags
                    .map(
                      ([tag, n], i) =>
                        `<a class="mf-trend-item" href="explore.html?tag=${encodeURIComponent(tag)}">
                           <span class="mf-trend-tag">#${MF.escapeHtml(tag)}</span>
                           <span class="mf-trend-count">${n} post${n > 1 ? "s" : ""} · #${i + 1} trending</span>
                         </a>`
                    )
                    .join("")
                : '<p class="mf-hint">No trends yet — start posting!</p>'
            }
          </div>

          ${
            sug.length
              ? `<div class="mf-rail-card">
                   <h3>Who to follow</h3>
                   ${sug.map((u) => window.MFComponents.userRow(u)).join("")}
                   <a class="mf-readmore" href="explore.html">Show more ${MF.icon("arrow-left", 14)}</a>
                 </div>`
              : ""
          }

          <div class="mf-rail-footer">
            <a href="index.html">About</a><a href="#">Terms</a><a href="#">Privacy</a>
            <a href="#">Cookies</a><span>© 2026 MediaFeed</span>
          </div>
        </div>
      </aside>`;
  }

  /* --- Search behaviour --- */
  function initSearch(root) {
    const input = root.querySelector("input");
    const box = root.querySelector(".mf-search-results");
    if (!input || !box) return;

    function run(q) {
      q = q.trim().toLowerCase();
      if (q.length < 1) {
        box.classList.remove("open");
        box.innerHTML = "";
        return;
      }
      const st = store.get();
      const users = st.users
        .filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.username.toLowerCase().includes(q) ||
            (u.interests || []).some((i) => i.toLowerCase().includes(q))
        )
        .slice(0, 4);
      const posts = st.posts
        .filter(
          (p) =>
            (p.title || "").toLowerCase().includes(q) ||
            (p.body || "").toLowerCase().includes(q) ||
            (p.tags || []).some((t) => t.toLowerCase().includes(q))
        )
        .slice(0, 4);

      if (!users.length && !posts.length) {
        box.innerHTML = '<div class="mf-search-empty">No results found.</div>';
      } else {
        box.innerHTML =
          users
            .map(
              (u) => `
              <a class="mf-search-item" href="${MF.profileUrl(u)}">
                <img class="mf-avatar" src="${u.avatar}" width="34" height="34" alt=""/>
                <div><div class="mf-search-item-label">${MF.escapeHtml(u.name)}</div>
                <div class="mf-search-item-sub">@${MF.escapeHtml(u.username)}</div></div>
              </a>`
            )
            .join("") +
          posts
            .map(
              (p) => `
              <a class="mf-search-item" href="${MF.postUrl(p)}">
                <span style="color:var(--brand-tint);flex-shrink:0">${MF.icon(p.type === "gallery" ? "image" : p.type === "music" ? "music" : p.type === "video" ? "video" : p.type === "article" ? "article" : p.type === "blog" ? "blog" : "update", 20)}</span>
                <div><div class="mf-search-item-label">${MF.escapeHtml(p.title || p.body.slice(0, 40))}</div>
                <div class="mf-search-item-sub">by @${MF.escapeHtml(store.user(p.authorId)?.username || "")}</div></div>
              </a>`
            )
            .join("");
      }
      box.classList.add("open");
    }

    input.addEventListener("input", () => run(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        MF.go(`explore.html?q=${encodeURIComponent(input.value.trim())}`);
      }
    });
    document.addEventListener("click", (e) => {
      if (!root.contains(e.target)) box.classList.remove("open");
    });
  }

  /* ==========================================================
     7. BOOT
     ========================================================== */
  function boot() {
    const body = document.body;
    const isPublic = body.classList.contains("mf-public");

    /* Auth guard — app pages require a session */
    if (!isPublic && !store.get().sessionUserId) {
      window.location.href = "auth.html";
      return;
    }

    const page = body.dataset.page || "";

    if (!isPublic) {
      body.insertAdjacentHTML("afterbegin", buildTopbar(page));
      body.insertAdjacentHTML("beforeend", buildBottomNav(page));

      /* Sidebar goes first so flexbox puts it left */
      body.insertAdjacentHTML("afterbegin", buildSidebar(page));

      if (body.dataset.rail === "true") {
        body.insertAdjacentHTML("beforeend", buildRail(page));
      }
    }

    /* Theme must init AFTER shell injection so toggles get their icons */
    initTheme();

    document.querySelectorAll(".mf-theme-toggle").forEach((b) =>
      b.addEventListener("click", () =>
        applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light")
      )
    );

    /* Mobile quick-links back button */
    const qlBack = document.querySelector(".mf-ql-back");
    if (qlBack)
      qlBack.addEventListener("click", () => {
        if (history.length > 1) history.back();
        else window.location.href = "feed.html";
      });

    document.querySelectorAll(".mf-search").forEach(initSearch);
    restorePlayer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
