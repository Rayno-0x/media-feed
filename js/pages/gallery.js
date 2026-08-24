/* ============================================================
   MediaFeed — Gallery page logic (masonry of visual work)
   ============================================================ */

(function () {
  const store = MF.store;
  const grid = document.getElementById("galleryGrid");

  const posts = store
    .get()
    .posts.filter((p) => p.type === "gallery")
    .sort((a, b) => b.likes.length - a.likes.length);

  if (!posts.length) {
    grid.innerHTML = `
      <div class="mf-empty">
        <div class="mf-empty-icon">${MF.icon("image", 26)}</div>
        <h3>No galleries yet</h3>
        <p>Be the first to share your visual work.</p>
        <a class="mf-btn mf-btn-primary" href="create.html?type=gallery">Create a gallery</a>
      </div>`;
    return;
  }

  const tiles = [];
  posts.forEach((p) =>
    (p.media || []).forEach((img) =>
      tiles.push({ img, post: p, author: store.user(p.authorId) })
    )
  );

  grid.innerHTML = tiles
    .map(
      (t) => `
      <a class="gal-tile" href="${MF.postUrl(t.post)}">
        <img src="${t.img}" alt="" loading="lazy"/>
        <span class="gal-overlay">
          <strong>${MF.escapeHtml(t.author.name)}
            ${t.author.verified ? `<span class="mf-verified">${MF.icon("verified", 13)}</span>` : ""}
          </strong>
          <small>${MF.icon("heart", 12)} ${MF.nfmt(t.post.likes.length)} · ${MF.timeAgo(t.post.createdAt)}</small>
        </span>
      </a>`
    )
    .join("");
})();
