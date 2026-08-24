/* ============================================================
   MediaFeed — Profile page logic
   ============================================================ */

(function () {
  const store = MF.store;
  const C = MFComponents;
  const params = new URLSearchParams(window.location.search);

  const usernameParam = params.get("u");
  const user = (usernameParam && store.user(usernameParam)) || store.me();

  /* Unknown username → graceful empty state */
  if (!user) {
    document.getElementById("profileCard").innerHTML = `
      <div class="mf-empty">
        <div class="mf-empty-icon">${MF.icon("user", 26)}</div>
        <h3>Profile not found</h3>
        <p>The account you're looking for doesn't exist.</p>
        <a class="mf-btn mf-btn-primary" href="feed.html">Back to home</a>
      </div>`;
    document.getElementById("profileTabs").remove();
    return;
  }

  const isMe = user.id === store.me().id;
  document.title = `MediaFeed — ${user.name} (@${user.username})`;

  /* ==========================================================
     Header card
     ========================================================== */
  function renderHeader() {
    const socials = Object.entries(user.socials || {}).filter(
      ([, url]) => url && url.trim()
    );
    const postsCount = store
      .get()
      .posts.filter((p) => p.authorId === user.id).length;

    const SOCIAL_ICONS = {
      instagram: "instagram",
      x: "x",
      tiktok: "tiktok",
      youtube: "youtube",
      twitch: "twitch",
      website: "globe",
    };

    document.getElementById("profileCard").innerHTML = `
      <div class="mf-profile-cover">
        <img src="${user.cover}" alt=""/>
      </div>
      <div class="mf-profile-head">
        <div class="mf-profile-toprow">
          <span class="mf-profile-avatar-wrap">
            <img class="mf-avatar" src="${user.avatar}" width="96" height="96" alt="${MF.escapeHtml(user.name)}"/>
          </span>
          <span class="mf-profile-actions">
            ${
              isMe
                ? `<a class="mf-btn mf-btn-ghost" href="settings.html#profile">${MF.icon("blog", 15)} Edit profile</a>
                   <a class="mf-btn mf-btn-primary" href="create.html">${MF.icon("plus", 15)} Create</a>`
                : `${C.followBtn(user)}
                   <button class="mf-btn mf-btn-ghost" id="msgBtn">${MF.icon("comment", 15)} Message</button>`
            }
          </span>
        </div>

        <h1 class="mf-profile-name">${MF.escapeHtml(user.name)}
          ${user.verified ? `<span class="mf-verified">${MF.icon("verified", 19)}</span>` : ""}
        </h1>
        <div class="mf-profile-handle">@${MF.escapeHtml(user.username)}</div>

        ${user.bio ? `<p class="mf-profile-bio">${C.linkify(MF.escapeHtml(user.bio))}</p>` : ""}

        ${
          (user.interests || []).length
            ? `<div class="mf-profile-interests">
                ${user.interests.map((i) => `<span class="mf-interest-pill">${MF.escapeHtml(i)}</span>`).join("")}
               </div>`
            : ""
        }

        <div class="mf-profile-stats">
          <span class="mf-stat-item"><strong>${postsCount}</strong><span>posts</span></span>
          <a class="mf-stat-item" href="#" id="followersLink"><strong>${MF.nfmt(user.followers.length)}</strong><span>followers</span></a>
          <a class="mf-stat-item" href="#" id="followingLink"><strong>${MF.nfmt(user.following.length)}</strong><span>following</span></a>
        </div>

        ${
          socials.length
            ? `<div class="mf-social-row">
                ${socials
                  .map(
                    ([k, url]) =>
                      `<a class="mf-social-link" href="${MF.escapeHtml(url)}" target="_blank"
                         rel="noopener noreferrer" title="${k}" aria-label="${k}">${MF.icon(SOCIAL_ICONS[k] || "link", 18)}</a>`
                  )
                  .join("")}
               </div>`
            : isMe
            ? `<div class="mf-social-row">
                 <a class="mf-social-link" href="settings.html#links" title="Link your accounts" style="border-style:dashed">${MF.icon("plus", 18)}</a>
               </div>`
            : ""
        }
      </div>`;

    const msgBtn = document.getElementById("msgBtn");
    if (msgBtn) msgBtn.addEventListener("click", () => MF.ui.toast("Direct messages coming soon"));

    const fl = document.getElementById("followersLink");
    if (fl) fl.addEventListener("click", (e) => { e.preventDefault(); showPeople(user.followers, "Followers"); });
    const fg = document.getElementById("followingLink");
    if (fg) fg.addEventListener("click", (e) => { e.preventDefault(); showPeople(user.following, "Following"); });
  }

  /* Live follower stat when follow buttons are toggled anywhere */
  document.addEventListener("mf:followchange", (e) => {
    if (e.detail.username !== user.username) return;
    const fresh = store.user(user.username);
    if (!fresh) return;
    const el = document.querySelector("#followersLink strong");
    if (el) el.textContent = MF.nfmt(fresh.followers.length);
  });

  /* Simple people list modal */
  function showPeople(ids, title) {
    C.closeModal();
    const users = ids.map((id) => store.user(id)).filter(Boolean);
    const modal = document.createElement("div");
    modal.className = "mf-modal show";
    modal.id = "mfActiveModal";
    modal.innerHTML = `
      <div class="mf-modal-panel" style="max-width:440px">
        <div class="mf-modal-head">
          <h3>${title} · ${users.length}</h3>
          <button class="mf-icon-btn mf-modal-close" aria-label="Close">${MF.icon("close", 20)}</button>
        </div>
        <div class="mf-modal-body" style="max-height:60vh;overflow-y:auto">
          ${users.length ? users.map(C.userRow).join("") : '<p class="mf-hint" style="text-align:center">Nobody here yet.</p>'}
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.closest(".mf-modal-close")) modal.remove();
    });
  }

  /* ==========================================================
     Content tabs
     ========================================================== */
  const TABS = [
    { key: "posts", label: "Posts" },
    { key: "gallery", label: "Galleries" },
    { key: "article", label: "Articles" },
    { key: "blog", label: "Blogs" },
    { key: "music", label: "Music" },
    { key: "liked", label: "Liked" },
  ];

  let activeTab = params.get("tab") || "posts";

  function renderTabs() {
    document.getElementById("profileTabs").innerHTML =
      TABS.map(
        (t) =>
          `<button class="mf-tab ${activeTab === t.key ? "active" : ""}" data-tab="${t.key}">${t.label}</button>`
      ).join("");
  }

  function userPosts() {
    return store.get().posts.filter((p) => p.authorId === user.id);
  }

  function renderContent() {
    const box = document.getElementById("profileContent");

    if (activeTab === "gallery") {
      /* Visual mosaic of every image in the user's gallery-type posts */
      const tiles = [];
      userPosts()
        .filter((p) => p.type === "gallery")
        .forEach((p) => (p.media || []).forEach((m) => tiles.push({ img: m, post: p })));

      if (!tiles.length) {
        box.innerHTML = emptyBlock("image", "No galleries yet",
          isMe ? "Share your visual work with a gallery post." : `${user.name} hasn't posted galleries yet.`);
        return;
      }
      box.innerHTML = `<div class="mf-mosaic">${tiles
        .map((t) => `<a href="${MF.postUrl(t.post)}"><img src="${t.img}" alt="" loading="lazy"/></a>`)
        .join("")}</div>`;
      return;
    }

    let posts;
    if (activeTab === "liked") {
      posts = store.get().posts.filter((p) => p.likes.includes(user.id));
    } else if (activeTab === "posts") {
      posts = userPosts();
    } else {
      posts = userPosts().filter((p) => p.type === activeTab);
    }

    C.renderPosts(box, posts,
      activeTab === "liked"
        ? "Posts you like will show up here."
        : `No ${activeTab} content yet.`);
  }

  function emptyBlock(iconName, title, msg) {
    return `
      <div class="mf-empty">
        <div class="mf-empty-icon">${MF.icon(iconName, 26)}</div>
        <h3>${MF.escapeHtml(title)}</h3>
        <p>${MF.escapeHtml(msg)}</p>
      </div>`;
  }

  document.getElementById("profileTabs").addEventListener("click", (e) => {
    const tab = e.target.closest(".mf-tab");
    if (!tab) return;
    activeTab = tab.dataset.tab;
    renderTabs();
    renderContent();
  });

  /* ==========================================================
     Boot
     ========================================================== */
  renderHeader();
  renderTabs();
  renderContent();
})();
