/* ============================================================
   MediaFeed — Explore page logic
   ============================================================ */

(function () {
  const store = MF.store;
  const C = MFComponents;
  const params = new URLSearchParams(window.location.search);
  const input = document.getElementById("exploreInput");

  /* Icons injected after shell boot */
  document.getElementById("searchIcon").innerHTML = MF.icon("search", 20);
  const clearBtn = document.getElementById("clearFilter");
  clearBtn.innerHTML = MF.icon("close", 16);

  /* ==========================================================
     Category tiles
     ========================================================== */
  const CATS = [
    { type: "all", label: "All", icon: "explore", cls: "tile-update" },
    { type: "gallery", label: "Gallery", icon: "image", cls: "tile-gallery" },
    { type: "article", label: "Articles", icon: "article", cls: "tile-article" },
    { type: "blog", label: "Blogs", icon: "blog", cls: "tile-blog" },
    { type: "music", label: "Music", icon: "music", cls: "tile-music" },
    { type: "video", label: "Videos", icon: "video", cls: "tile-video" },
    { type: "update", label: "Updates", icon: "update", cls: "tile-update" },
  ];

  let activeType = "all";
  let activeTag = params.get("tag") || null;
  let query = (params.get("q") || "").trim();

  /* Dedicated pages take over for types that have their own home */
  const PAGE_FOR = {
    gallery: "gallery.html",
    music: "music.html",
    article: "blogs.html?tab=article",
    blog: "blogs.html?tab=blog",
  };

  function countFor(type) {
    return store.get().posts.filter((p) => p.type === type).length;
  }

  function tileInner(c) {
    return `
      <span class="mf-cat-tile-icon ${c.cls}">${MF.icon(c.icon, 20)}</span>
      <span class="mf-cat-tile-label">${c.label}</span>
      <span class="mf-cat-tile-count">${
        c.type === "all" ? store.get().posts.length : countFor(c.type)
      } posts</span>`;
  }

  function renderTiles() {
    const wrap = document.getElementById("catTiles");
    wrap.innerHTML = CATS.map((c) => {
      const cls = `mf-cat-tile ${activeType === c.type && !activeTag ? "active" : ""}`;
      if (PAGE_FOR[c.type]) {
        return `<a class="${cls}" data-type="${c.type}" href="${PAGE_FOR[c.type]}">${tileInner(c)}</a>`;
      }
      return `<button class="${cls}" data-type="${c.type}">${tileInner(c)}</button>`;
    }).join("");
  }

  document.getElementById("catTiles").addEventListener("click", (e) => {
    const tile = e.target.closest(".mf-cat-tile");
    if (!tile || tile.tagName === "A") return; /* anchors navigate on their own */
    activeType = tile.dataset.type;
    activeTag = null;
    query = "";
    input.value = "";
    syncFilterBar();
    renderTiles();
    renderGrid();
  });

  /* ==========================================================
     Active filter bar
     ========================================================== */
  function syncFilterBar() {
    const bar = document.getElementById("activeFilter");
    const txt = document.getElementById("activeFilterText");
    if (query) {
      txt.textContent = `Search results for “${query}”`;
      bar.hidden = false;
    } else if (activeTag) {
      txt.textContent = `Posts tagged #${activeTag}`;
      bar.hidden = false;
    } else if (activeType !== "all") {
      const c = CATS.find((x) => x.type === activeType);
      txt.textContent = `Browsing ${c.label}`;
      bar.hidden = false;
    } else {
      bar.hidden = true;
    }
  }

  clearBtn.addEventListener("click", () => {
    activeType = "all";
    activeTag = null;
    query = "";
    input.value = "";
    syncFilterBar();
    renderTiles();
    renderGrid();
  });

  /* ==========================================================
     Creators to follow
     ========================================================== */
  function renderCreators() {
    const me = store.me();
    const users = [...store.get().users]
      .filter((u) => u.id !== me.id)
      .sort((a, b) => {
        const fa = me.following.includes(a.id) ? 1 : 0;
        const fb = me.following.includes(b.id) ? 1 : 0;
        if (fa !== fb) return fa - fb; /* not-followed first */
        return b.followers.length - a.followers.length;
      })
      .slice(0, 8);

    document.getElementById("creatorGrid").innerHTML = users
      .map((u) => C.userRow(u, { reason: `${u.followers.length} followers` }))
      .join("");
  }

  /* ==========================================================
     Trending grid
     ========================================================== */
  function currentPosts() {
    let posts = [...store.get().posts];

    if (query) {
      const q = query.toLowerCase();
      posts = posts.filter((p) => {
        const author = store.user(p.authorId);
        return (
          (p.title || "").toLowerCase().includes(q) ||
          (p.body || "").toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.includes(q)) ||
          (author &&
            (author.name.toLowerCase().includes(q) ||
              author.username.toLowerCase().includes(q)))
        );
      });
    } else if (activeTag) {
      posts = posts.filter((p) =>
        (p.tags || []).some((t) => t.toLowerCase() === activeTag.toLowerCase())
      );
    } else if (activeType !== "all") {
      posts = posts.filter((p) => p.type === activeType);
    }

    /* Most-loved first */
    return posts.sort((a, b) => b.likes.length - a.likes.length);
  }

  function renderGrid() {
    const posts = currentPosts();
    C.renderPosts(
      document.getElementById("exploreGrid"),
      posts,
      query
        ? `Nothing matched “${query}”. Try a different search.`
        : activeTag
        ? `No posts tagged #${activeTag} yet.`
        : "Nothing here yet."
    );
    const sub = document.getElementById("trendSub");
    sub.textContent =
      query || activeTag || activeType !== "all"
        ? `${posts.length} result${posts.length === 1 ? "" : "s"}`
        : "The most-loved posts across MediaFeed";
  }

  /* Live search-as-you-type */
  let debounce;
  input.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      query = input.value.trim();
      activeTag = null;
      activeType = "all";
      syncFilterBar();
      renderTiles();
      renderGrid();
    }, 220);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      query = input.value.trim();
      activeTag = null;
      activeType = "all";
      syncFilterBar();
      renderTiles();
      renderGrid();
    }
  });

  /* Prefill from ?q= */
  if (params.get("q")) input.value = params.get("q");
  if (params.get("type") && CATS.some((c) => c.type === params.get("type"))) {
    activeType = params.get("type");
  }
  if (activeTag) input.value = "#" + activeTag;

  renderCreators();
  renderTiles();
  syncFilterBar();
  renderGrid();
})();
