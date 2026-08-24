/* ============================================================
   MediaFeed — Notifications page logic
   ============================================================ */

(function () {
  const store = MF.store;
  const params = new URLSearchParams(window.location.search);
  let activeTab = params.get("tab") || "all";

  /* Opening the page marks everything as read */
  store.markNotificationsRead();
  document
    .querySelectorAll(".mf-nav-badge, .mf-dot-badge")
    .forEach((el) => el.remove());

  /* ==========================================================
     Rendering
     ========================================================== */
  const ICONS = { like: "heart", follow: "user", comment: "comment", mention: "update" };
  const BUBBLES = { like: "ni-like", follow: "ni-follow", comment: "ni-comment", mention: "ni-mention" };

  function actorNames(ids) {
    const names = ids.map((id) => store.user(id)).filter(Boolean);
    if (!names.length) return "Someone";
    if (names.length === 1) return `<a href="${MF.profileUrl(names[0])}">${MF.escapeHtml(names[0].name)}</a>`;
    if (names.length === 2) {
      return `<a href="${MF.profileUrl(names[0])}">${MF.escapeHtml(names[0].name)}</a> and <a href="${MF.profileUrl(names[1])}">${MF.escapeHtml(names[1].name)}</a>`;
    }
    return `<a href="${MF.profileUrl(names[0])}">${MF.escapeHtml(names[0].name)}</a> and ${names.length - 1} others`;
  }

  function notifHtml(n) {
    const post = n.postId ? store.post(n.postId) : null;
    const thumb = post
      ? post.cover || (post.media && post.media[0]) || (post.audio && post.audio.cover)
      : null;

    let text = "";
    switch (n.type) {
      case "like":
        text = `${actorNames(n.actorIds)} liked your ${post ? "post" : "content"}`;
        break;
      case "follow":
        text = `${actorNames(n.actorIds)} started following you`;
        break;
      case "comment":
        text = `${actorNames(n.actorIds)} commented on your post${n.commentText ? `: <span class="hl">“${MF.escapeHtml(n.commentText)}”</span>` : ""}`;
        break;
      case "mention":
        text = `${actorNames(n.actorIds)} mentioned you${n.commentText ? `: <span class="hl">“${MF.escapeHtml(n.commentText)}”</span>` : ""}`;
        break;
      default:
        text = "Something happened";
    }

    const target = post ? MF.postUrl(post) : n.actorIds?.[0] ? MF.profileUrl(store.user(n.actorIds[0]) || {}) : "#";

    return `
      <a class="mf-notif ${n.read ? "" : "unread"}" href="${target}">
        <span class="mf-notif-icon ${BUBBLES[n.type] || "ni-like"}">${MF.icon(ICONS[n.type] || "bell", 18)}</span>
        <span class="mf-notif-body">
          <span class="mf-notif-text">${text}</span>
          <span class="mf-notif-time">${MF.timeAgo(n.createdAt)}</span>
        </span>
        ${thumb ? `<img class="mf-notif-thumb" src="${thumb}" alt=""/>` : ""}
        ${n.read ? "" : '<span class="mf-notif-dot" aria-label="Unread"></span>'}
      </a>`;
  }

  function groupLabel(ts) {
    const d = Date.now() - ts;
    if (d < 24 * 3600 * 1000) return "Today";
    if (d < 7 * 24 * 3600 * 1000) return "This week";
    return "Earlier";
  }

  function render() {
    const all = [...store.get().notifications].sort((a, b) => b.createdAt - a.createdAt);
    const list = activeTab === "all" ? all : all.filter((n) => n.type === activeTab);
    const box = document.getElementById("notifList");

    document.getElementById("notifSub").textContent =
      all.filter((n) => !n.read).length + " unread";

    if (!list.length) {
      box.innerHTML = `
        <div class="mf-empty">
          <div class="mf-empty-icon">${MF.icon("bell", 26)}</div>
          <h3>All caught up!</h3>
          <p>New likes, comments, follows and mentions will appear here.</p>
        </div>`;
      return;
    }

    /* Group by day buckets */
    let html = "";
    let lastGroup = null;
    list.forEach((n) => {
      const g = groupLabel(n.createdAt);
      if (g !== lastGroup) {
        html += `<h2 class="mf-notif-group">${g}</h2>`;
        lastGroup = g;
      }
      html += notifHtml(n);
    });
    box.innerHTML = html;
  }

  /* ==========================================================
     Tabs & actions
     ========================================================== */
  document.getElementById("notifTabs").addEventListener("click", (e) => {
    const tab = e.target.closest(".mf-tab");
    if (!tab) return;
    document.querySelectorAll("#notifTabs .mf-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    activeTab = tab.dataset.tab;
    render();
  });

  document.getElementById("markAllBtn").addEventListener("click", () => {
    store.markNotificationsRead();
    render();
    MF.ui.toast("All notifications marked as read");
  });

  render();
})();
