/* ============================================================
   MediaFeed — Articles & Blogs page logic (reader list)
   ============================================================ */

(function () {
  const C = MFComponents;
  const store = MF.store;
  const list = document.getElementById("readerList");
  let filter = ["article", "blog"].includes(
    new URLSearchParams(window.location.search).get("tab")
  )
    ? new URLSearchParams(window.location.search).get("tab")
    : "all";

  /* Sync tab buttons with deep-linked state */
  document.querySelectorAll("#readerTabs .mf-tab").forEach((t) =>
    t.classList.toggle("active", t.dataset.filter === filter)
  );

  function render() {
    let posts = store
      .get()
      .posts.filter((p) => p.type === "article" || p.type === "blog");

    if (filter !== "all") posts = posts.filter((p) => p.type === filter);
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (!posts.length) {
      list.innerHTML = `
        <div class="mf-empty">
          <div class="mf-empty-icon">${MF.icon("blog", 26)}</div>
          <h3>Nothing here yet</h3>
          <p>No ${filter === "all" ? "posts" : filter + "s"} in this section.</p>
        </div>`;
      return;
    }

    list.innerHTML = posts
      .map((p) => {
        const a = store.user(p.authorId);
        return `
        <a class="mf-card reader-card" href="${MF.postUrl(p)}">
          ${p.cover ? `<img class="reader-cover" src="${p.cover}" alt="" loading="lazy"/>` : ""}
          <div class="reader-body">
            ${C.typeBadge(p.type)}
            <h3 class="reader-title">${MF.escapeHtml(p.title)}</h3>
            <p class="reader-excerpt">${
              MF.escapeHtml(p.excerpt || C.stripHtml(p.body).slice(0, 140))
            }…</p>
            <div class="reader-meta">
              <img class="mf-avatar" src="${a.avatar}" alt=""/>
              <strong>${MF.escapeHtml(a.name)}</strong>
              <span class="reader-dot">·</span>
              <span>${MF.timeAgo(p.createdAt)}</span>
              <span class="reader-dot">·</span>
              <span>${MF.icon("clock", 12)} ${p.readMins || 4} min</span>
              <span class="reader-dot">·</span>
              <span>${MF.icon("heart", 12)} ${MF.nfmt(p.likes.length)}</span>
            </div>
          </div>
        </a>`;
      })
      .join("");
  }

  document.getElementById("readerTabs").addEventListener("click", (e) => {
    const tab = e.target.closest(".mf-tab");
    if (!tab) return;
    document
      .querySelectorAll("#readerTabs .mf-tab")
      .forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    filter = tab.dataset.filter;
    render();
  });

  render();
})();
