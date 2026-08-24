/* ============================================================
   MediaFeed — Post detail page logic
   ============================================================ */

(function () {
  const store = MF.store;
  const C = MFComponents;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const post = id ? store.post(id) : null;

  document.getElementById("backBtn").innerHTML = `${MF.icon("arrow-left", 15)} Back`;
  document.getElementById("backBtn").addEventListener("click", () => history.back());

  if (!post) {
    document.getElementById("postWrap").innerHTML = `
      <div class="mf-empty">
        <div class="mf-empty-icon">${MF.icon("search", 26)}</div>
        <h3>Post not found</h3>
        <p>This post may have been removed or the link is wrong.</p>
        <a class="mf-btn mf-btn-primary" href="feed.html">Back to feed</a>
      </div>`;
    document.getElementById("commentsCard").remove();
    document.getElementById("moreFrom").remove();
    return;
  }

  const author = store.user(post.authorId);
  document.title = `MediaFeed — ${post.title || (post.body || "Post").slice(0, 40)}`;

  /* ==========================================================
     Post card + comments
     ========================================================== */
  document.getElementById("postWrap").innerHTML = C.postCard(post);

  function renderComments() {
    const p = store.post(id);
    document.getElementById("commentsTitle").textContent = `Comments · ${p.comments.length}`;
    document.getElementById("commentsList").innerHTML = p.comments.length
      ? p.comments.map((c) => {
          const u = store.user(c.userId);
          return `
            <div class="mf-comment">
              <a href="${MF.profileUrl(u)}">
                <img class="mf-avatar" src="${u.avatar}" width="34" height="34" alt=""/>
              </a>
              <div class="mf-comment-body">
                <div class="mf-comment-head">
                  <a class="mf-comment-name" href="${MF.profileUrl(u)}">${MF.escapeHtml(u.name)}</a>
                  <span class="mf-comment-time">${MF.timeAgo(c.createdAt)}</span>
                </div>
                <div class="mf-comment-text">${C.linkify(MF.escapeHtml(c.body))}</div>
              </div>
            </div>`;
        }).join("")
      : '<p class="mf-hint">No comments yet — start the conversation!</p>';
  }

  document.getElementById("commentsCard").hidden = false;
  document.getElementById("meAvatar").src = store.me().avatar;
  renderComments();

  document.getElementById("commentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const inp = document.getElementById("commentInput");
    if (!inp.value.trim()) return;
    store.addComment(id, inp.value);
    inp.value = "";
    renderComments();
    const cnt = document.querySelector(`[data-post-id="${id}"] .mf-count-comment`);
    if (cnt) cnt.textContent = MF.nfmt(store.post(id).comments.length);
  });

  /* ==========================================================
     More from this creator
     ========================================================== */
  const more = store
    .get()
    .posts.filter((p) => p.authorId === post.authorId && p.id !== id)
    .slice(0, 3);

  const moreSection = document.getElementById("moreFrom");
  if (!more.length) {
    moreSection.remove();
  } else {
    C.renderPosts(document.getElementById("moreList"), more);
  }
})();
