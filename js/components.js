/* ============================================================
   MediaFeed — Shared UI Components
   ------------------------------------------------------------
   Post cards (all content types), user rows, follow buttons,
   comment threads, lightbox. Everything is event-delegated so
   dynamically rendered content stays fully interactive.
   ============================================================ */

window.MF = window.MF || {};
window.MFComponents = {};

(function () {
  const store = MF.store;
  const esc = MF.escapeHtml;
  const icon = MF.icon;

  /* ==========================================================
     USER ROW (rail suggestions, explore lists)
     ========================================================== */
  function userRow(u, opts = {}) {
    const following = store.isFollowing(u.id);
    return `
      <div class="mf-userrow" data-user-row="${esc(u.username)}">
        <a href="${MF.profileUrl(u)}">
          <img class="mf-avatar" src="${u.avatar}" width="40" height="40" alt="${esc(u.name)}" />
        </a>
        <div class="mf-userrow-info">
          <div class="mf-userrow-name">${esc(u.name)} ${
            u.verified ? `<span class="mf-verified">${icon("verified", 14)}</span>` : ""
          }</div>
          <div class="mf-userrow-handle">@${esc(u.username)}</div>
          ${opts.reason ? `<div class="mf-userrow-reason">${esc(opts.reason)}</div>` : ""}
        </div>
        ${followBtn(u)}
      </div>`;
  }

  function followBtn(u) {
    if (!store.me() || u.id === store.me().id) return "";
    const following = store.isFollowing(u.id);
    return `
      <button class="mf-btn mf-btn-primary mf-btn-sm mf-follow-btn"
              data-user="${esc(u.username)}"
              data-following="${following}">
        ${following ? "Following" : "Follow"}
      </button>`;
  }

  /* ==========================================================
     TYPE BADGE
     ========================================================== */
  const TYPE_META = {
    gallery: { label: "Gallery", icon: "image" },
    article: { label: "Article", icon: "article" },
    blog: { label: "Blog", icon: "blog" },
    music: { label: "Music", icon: "music" },
    video: { label: "Video", icon: "video" },
    update: { label: "Update", icon: "update" },
  };

  function typeBadge(type) {
    const known = Object.prototype.hasOwnProperty.call(TYPE_META, type);
    const key = known ? type : "update";
    const m = TYPE_META[key];
    return `<span class="mf-badge-${key}">${icon(m.icon, 12)} ${m.label}</span>`;
  }

  function stripHtml(html) {
    if (typeof document === "undefined") return String(html || "");
    const div = document.createElement("div");
    div.innerHTML = html || "";
    return (div.textContent || "").replace(/\s+/g, " ").trim();
  }

  /* ==========================================================
     POST BODY PER CONTENT TYPE
     ========================================================== */
  function bodyHtml(p) {
    let html = p.body ? `<p>${linkify(esc(p.body))}</p>` : "";

    /* Tags */
    if ((p.tags || []).length) {
      html += `<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px">
        ${p.tags
          .map(
            (t) =>
              `<a class="mf-post-tag" href="explore.html?tag=${encodeURIComponent(t)}">#${esc(t)}</a>`
          )
          .join("")}
      </div>`;
    }

    switch (p.type) {
      case "gallery":
      case "blog":
      case "update":
        if (p.media && p.media.length === 1) {
          html += `<div class="mf-post-media"><img src="${p.media[0]}" alt="" loading="lazy" /></div>`;
        } else if (p.media && p.media.length > 1) {
          html += `<div class="mf-post-media mf-post-grid2">
            ${p.media.slice(0, 4).map((m) => `<img src="${m}" alt="" loading="lazy" />`).join("")}
          </div>`;
        }
        break;

      case "article":
        html += `
          <a class="mf-article-snippet" href="${MF.postUrl(p)}">
            ${p.cover ? `<img src="${p.cover}" alt="" style="width:100%;max-height:300px;object-fit:cover;border-radius:var(--radius-sm);margin-bottom:12px" loading="lazy"/>` : ""}
            <h4>${esc(p.title || "Untitled article")}</h4>
            <p>${esc(p.excerpt || "")}</p>
            <span class="mf-readmore">Read article · ${p.readMins || 4} min ${icon("arrow-left", 13)}</span>
          </a>`;
        break;

      case "music":
        if (p.audio) {
          html += `
            <div class="mf-track-row">
              <img class="mf-track-cover" src="${p.audio.cover}" alt="" loading="lazy"/>
              <button class="mf-track-play"
                      data-src="${p.audio.src}"
                      data-title="${esc(p.title || "Untitled")}"
                      data-artist="${esc(p.audio.artist || "")}"
                      data-cover="${p.audio.cover}"
                      data-playing="false"
                      aria-label="Play ${esc(p.title || "track")}">${icon("play", 16)}</button>
              <div class="mf-track-info">
                <div class="mf-track-title">${esc(p.title || "Untitled track")}</div>
                <div class="mf-track-artist">${esc(p.audio.artist || "")}</div>
              </div>
              <span class="mf-eq" hidden><span></span><span></span><span></span></span>
            </div>`;
        }
        break;

      case "video":
        if (p.videoUrl) {
          html += `<div class="mf-video-frame"><iframe src="${esc(p.videoUrl)}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowfullscreen loading="lazy"></iframe></div>`;
        } else if (p.videoFile) {
          html += `<div class="mf-video-frame"><video src="${esc(p.videoFile)}" controls preload="metadata"></video></div>`;
        } else if (p.thumb) {
          html += `<div class="mf-post-media"><img src="${p.thumb}" alt="" loading="lazy"/></div>`;
        }
        break;
    }
    return html;
  }

  /* Turn #tags into links */
  function linkify(html) {
    return html.replace(/#([\w-]+)/g, (_m, tag) => {
      const t = tag.toLowerCase();
      return `<a class="mf-post-tag" href="explore.html?tag=${encodeURIComponent(t)}">#${t}</a>`;
    });
  }

  /* ==========================================================
     FULL POST CARD
     ========================================================== */
  function postCard(p, opts = {}) {
    const author = store.user(p.authorId);
    if (!author) return "";
    const meUser = store.me();
    const liked = p.likes.includes(meUser.id);
    const saved = p.savedBy.includes(meUser.id);

    return `
      <article class="mf-card mf-post" data-post-id="${p.id}" data-type="${p.type}">
        <header class="mf-post-header">
          <a class="mf-post-author" href="${MF.profileUrl(author)}">
            <img class="mf-avatar" src="${author.avatar}" width="44" height="44" alt="${esc(author.name)}"/>
            <span class="mf-post-meta">
              <span class="mf-post-name">${esc(author.name)}
                ${author.verified ? `<span class="mf-verified">${icon("verified", 15)}</span>` : ""}
                ${typeBadge(p.type)}
              </span>
              <span class="mf-post-sub">@${esc(author.username)} · ${MF.timeAgo(p.createdAt)}</span>
            </span>
          </a>
          <button class="mf-more-btn" aria-label="More options">${icon("more", 20)}</button>
        </header>

        <div class="mf-post-body">${bodyHtml(p)}</div>

        <footer class="mf-post-actions">
          <button class="mf-action mf-action-like" data-on="${liked}" aria-label="Like">
            ${icon("heart")}<span class="mf-count-like">${MF.nfmt(p.likes.length)}</span>
          </button>
          <button class="mf-action mf-action-comment" aria-label="Comments">
            ${icon("comment")}<span class="mf-count-comment">${MF.nfmt(p.comments.length)}</span>
          </button>
          <button class="mf-action mf-action-share" aria-label="Share">
            ${icon("share")}<span class="mf-count-share">${MF.nfmt(p.shares)}</span>
          </button>
          <span style="flex:1"></span>
          <button class="mf-action mf-action-save" data-on="${saved}" aria-label="Save bookmark">
            ${icon("bookmark")}
          </button>
        </footer>
      </article>`;
  }

  /* Render a list into a container with empty state */
  function renderPosts(containerEl, posts, emptyMsg) {
    if (!posts.length) {
      containerEl.innerHTML = `
        <div class="mf-empty">
          <div class="mf-empty-icon">${icon("image", 26)}</div>
          <h3>Nothing here yet</h3>
          <p>${esc(emptyMsg || "When there are posts, you'll see them here.")}</p>
        </div>`;
      return;
    }
    containerEl.innerHTML = posts.map((p) => postCard(p)).join("");
  }

  MFComponents.userRow = userRow;
  MFComponents.followBtn = followBtn;
  MFComponents.typeBadge = typeBadge;
  MFComponents.stripHtml = stripHtml;
  MFComponents.postCard = postCard;
  MFComponents.renderPosts = renderPosts;
  MFComponents.TYPE_META = TYPE_META;
  MFComponents.linkify = linkify;

  /* ==========================================================
     COMMENTS MODAL
     ========================================================== */
  function openComments(postId) {
    const p = store.post(postId);
    if (!p) return;
    closeModal();
    const meU = store.me();

    const modal = document.createElement("div");
    modal.className = "mf-modal show";
    modal.id = "mfActiveModal";
    modal.innerHTML = `
      <div class="mf-modal-panel">
        <div class="mf-modal-head">
          <h3>Comments · ${MF.nfmt(p.comments.length)}</h3>
          <button class="mf-icon-btn mf-modal-close" aria-label="Close">${icon("close", 20)}</button>
        </div>
        <div class="mf-modal-body">
          <div class="mf-comments-list">
            ${
              p.comments.length
                ? p.comments.map(commentHtml).join("")
                : '<p class="mf-hint" style="text-align:center;padding:16px 0">No comments yet. Start the conversation!</p>'
            }
          </div>
          <form class="mf-comment-form">
            <img class="mf-avatar" src="${meU.avatar}" width="36" height="36" alt=""/>
            <input class="mf-input" placeholder="Add a comment…" autocomplete="off" required />
            <button class="mf-btn mf-btn-primary" type="submit">Post</button>
          </form>
        </div>
      </div>`;
    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.closest(".mf-modal-close")) modal.remove();
    });

    modal.querySelector(".mf-comment-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = e.target.querySelector("input");
      if (!input.value.trim()) return;
      store.addComment(postId, input.value);
      input.value = "";
      refreshCommentList(modal, postId);
      document
        .querySelectorAll(`[data-post-id="${postId}"] .mf-count-comment`)
        .forEach((el) => (el.textContent = MF.nfmt(store.post(postId).comments.length)));
    });
  }

  function commentHtml(c) {
    const u = store.user(c.userId);
    if (!u) return "";
    return `
      <div class="mf-comment">
        <a href="${MF.profileUrl(u)}">
          <img class="mf-avatar" src="${u.avatar}" width="34" height="34" alt=""/>
        </a>
        <div class="mf-comment-body">
          <div class="mf-comment-head">
            <a class="mf-comment-name" href="${MF.profileUrl(u)}">${esc(u.name)}</a>
            <span class="mf-comment-time">${MF.timeAgo(c.createdAt)}</span>
          </div>
          <div class="mf-comment-text">${MFComponents.linkify(esc(c.body))}</div>
        </div>
      </div>`;
  }

  function refreshCommentList(modal, postId) {
    const p = store.post(postId);
    modal.querySelector("h3").textContent = `Comments · ${MF.nfmt(p.comments.length)}`;
    modal.querySelector(".mf-comments-list").innerHTML = p.comments.length
      ? p.comments.map(commentHtml).join("")
      : '<p class="mf-hint" style="text-align:center;padding:16px 0">No comments yet.</p>';
    const list = modal.querySelector(".mf-comments-list");
    list.scrollTop = list.scrollHeight;
  }

  function closeModal() {
    document.getElementById("mfActiveModal")?.remove();
  }

  MFComponents.openComments = openComments;
  MFComponents.closeModal = closeModal;

  /* ==========================================================
     LIGHTBOX
     ========================================================== */
  function lightbox(src) {
    let lb = document.querySelector(".mf-lightbox");
    if (!lb) {
      lb = document.createElement("div");
      lb.className = "mf-lightbox";
      lb.innerHTML = "<img alt='' />";
      document.body.appendChild(lb);
      lb.addEventListener("click", () => lb.classList.remove("show"));
    }
    lb.querySelector("img").src = src;
    lb.classList.add("show");
  }

  /* ==========================================================
     IMAGE COMPRESSION (uploads → small dataURLs for storage)
     ========================================================== */
  window.MF.util = window.MF.util || {};
  MF.util.compressImage = function (file, maxDim = 1100, quality = 0.78, cb) {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        cb(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  MFComponents.lightbox = lightbox;

  /* ==========================================================
     GLOBAL EVENT DELEGATION
     ========================================================== */
  document.addEventListener("click", (e) => {
    /* LIKE */
    const likeBtn = e.target.closest(".mf-action-like");
    if (likeBtn) {
      const card = likeBtn.closest("[data-post-id]");
      const likedNow = store.toggleLike(card.dataset.postId);
      likeBtn.dataset.on = likedNow;
      const cnt = likeBtn.querySelector(".mf-count-like");
      const p = store.post(card.dataset.postId);
      cnt.textContent = MF.nfmt(p.likes.length);
      likeBtn.classList.remove("animate");
      void likeBtn.offsetWidth;
      likeBtn.classList.add("animate");
      return;
    }

    /* SAVE */
    const saveBtn = e.target.closest(".mf-action-save");
    if (saveBtn) {
      const card = saveBtn.closest("[data-post-id]");
      const savedNow = store.toggleSave(card.dataset.postId);
      saveBtn.dataset.on = savedNow;
      MF.ui.toast(savedNow ? "Saved to your bookmarks" : "Removed from bookmarks");
      return;
    }

    /* COMMENT */
    const cmtBtn = e.target.closest(".mf-action-comment");
    if (cmtBtn) {
      openComments(cmtBtn.closest("[data-post-id]").dataset.postId);
      return;
    }

    /* SHARE */
    const shareBtn = e.target.closest(".mf-action-share");
    if (shareBtn) {
      const id = shareBtn.closest("[data-post-id]").dataset.postId;
      const url = new URL(MF.postUrl({ id }), window.location.href).href;
      const p = store.post(id);
      p.shares += 1;
      store.save();
      const sc = shareBtn.querySelector(".mf-count-share");
      if (sc) sc.textContent = MF.nfmt(p.shares);
      if (navigator.share) {
        navigator.share({ title: "MediaFeed post", url }).catch(() => {});
      } else {
        navigator.clipboard.writeText(url).then(
          () => MF.ui.toast("Link copied to clipboard"),
          () => MF.ui.toast(url)
        );
      }
      return;
    }

    /* FOLLOW BUTTONS */
    const fBtn = e.target.closest(".mf-follow-btn");
    if (fBtn && !fBtn.disabled) {
      const username = fBtn.dataset.user;
      const target = store.user(username);
      const nowFollowing = store.toggleFollow(target.id);
      document.querySelectorAll(`.mf-follow-btn[data-user="${username}"]`).forEach((b) => {
        b.dataset.following = nowFollowing;
        b.textContent = nowFollowing ? "Following" : "Follow";
      });
      /* pages can react (e.g. live-update follower stats) */
      document.dispatchEvent(
        new CustomEvent("mf:followchange", { detail: { username, nowFollowing } })
      );
      MF.ui.toast(nowFollowing ? `You followed @${username}` : `Unfollowed @${username}`);
      return;
    }

    /* TRACK PLAY BUTTONS */
    const playBtn = e.target.closest(".mf-track-play");
    if (playBtn) {
      const wasThisPlaying =
        playBtn.dataset.playing === "true" &&
        !MF.player.audio.paused &&
        MF.player.audio.src.endsWith(playBtn.dataset.src.split("/").pop());
      if (wasThisPlaying) {
        MF.player.toggle();
        return;
      }
      document.querySelectorAll(".mf-track-play").forEach((b) => {
        b.dataset.playing = "false";
        b.innerHTML = icon("play", 16);
      });
      playBtn.dataset.playing = "true";
      playBtn.innerHTML = icon("pause", 16);
      const queue = [...document.querySelectorAll(".mf-track-play")].map((b) => ({
        src: b.dataset.src,
        title: b.dataset.title,
        artist: b.dataset.artist,
        cover: b.dataset.cover,
      }));
      MF.player.play(
        { src: playBtn.dataset.src, title: playBtn.dataset.title, artist: playBtn.dataset.artist, cover: playBtn.dataset.cover },
        queue
      );
      return;
    }

    /* IMAGE LIGHTBOX */
    const mediaImg = e.target.closest(".mf-post-media img");
    if (mediaImg) {
      lightbox(mediaImg.src);
      return;
    }

    /* MORE MENU (placeholder toast until Phase 2 report feature) */
    const moreBtn = e.target.closest(".mf-more-btn");
    if (moreBtn) {
      MF.ui.toast("Post options coming soon");
      return;
    }
  });

  /* ESC closes modals / lightbox */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeModal();
    document.querySelector(".mf-lightbox.show")?.classList.remove("show");
    document.getElementById("composeModal")?.classList.remove("show");
  });
})();
