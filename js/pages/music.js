/* ============================================================
   MediaFeed — Music page logic ("Artist Home")
   Your studio stats · featured artist spotlight · trending queue
   ============================================================ */

(function () {
  const C = MFComponents;
  const store = MF.store;
  const me = store.me();
  const state = store.get();

  const allMusic = state.posts.filter((p) => p.type === "music" && p.audio);

  /* ==========================================================
     1. My studio stats
     ========================================================== */
  const myTracks = state.posts.filter((p) => p.authorId === me.id && p.type === "music");
  const myPlays = myTracks.reduce((s, p) => s + (p.plays || 0), 0);
  const myLikes = myTracks.reduce((s, p) => s + p.likes.length, 0);

  document.getElementById("myStats").innerHTML = `
    <div class="mf-card stat-card">
      <span class="num">${myTracks.length}</span>
      <span class="lbl">${MF.icon("music", 15)} your tracks</span>
    </div>
    <div class="mf-card stat-card">
      <span class="num">${MF.nfmt(myPlays)}</span>
      <span class="lbl">${MF.icon("play", 14)} total plays</span>
    </div>
    <div class="mf-card stat-card">
      <span class="num">${MF.nfmt(myLikes)}</span>
      <span class="lbl">${MF.icon("heart", 14)} likes received</span>
    </div>`;

  /* ==========================================================
     2. Featured artist spotlight
     ========================================================== */
  const byArtist = {};
  allMusic.forEach((p) => {
    (byArtist[p.authorId] = byArtist[p.authorId] || []).push(p);
  });

  const ranked = Object.entries(byArtist)
    .filter(([id]) => id !== me.id)
    .map(([id, tracks]) => ({
      artist: store.user(id),
      tracks,
      score: tracks.reduce((s, p) => s + p.likes.length, 0),
    }))
    .sort((a, b) => b.score - a.score);

  const spot = document.getElementById("spotlight");

  if (!ranked.length) {
    spot.innerHTML = "";
  } else {
    const top = ranked[0];
    const best = [...top.tracks].sort((a, b) => b.likes.length - a.likes.length)[0];

    spot.innerHTML = `
      <div class="sp-card">
        <div class="sp-bg"><img src="${best.audio.cover}" alt=""/></div>
        <div class="sp-body">
          <div>
            <p class="sp-kicker">Featured artist</p>
            <div class="sp-id">
              <img class="sp-avatar" src="${top.artist.avatar}" alt=""/>
              <div>
                <h2 class="sp-name">${MF.escapeHtml(top.artist.name)}
                  ${top.artist.verified ? `<span class="mf-verified">${MF.icon("verified", 16)}</span>` : ""}
                </h2>
                <p class="sp-sub">@${MF.escapeHtml(top.artist.username)}
                  · ${MF.nfmt(top.artist.followers.length)} followers
                  · ${top.tracks.length} track${top.tracks.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
            ${top.artist.bio ? `<p class="sp-bio">${C.linkify(MF.escapeHtml(top.artist.bio))}</p>` : ""}
          </div>
          <div class="sp-actions">
            <button class="play-btn-lg" data-play-post="${best.id}"
                    aria-label="Play ${MF.escapeHtml(best.title)}">${MF.icon("play", 22)}</button>
            ${C.followBtn(top.artist)}
            <a class="mf-btn mf-btn-ghost mf-btn-sm" href="${MF.profileUrl(top.artist)}">View profile</a>
          </div>
        </div>
      </div>`;
  }

  /* ==========================================================
     3. Trending tracks (global player queue)
     ========================================================== */
  const trending = [...allMusic].sort(
    (a, b) => b.likes.length - a.likes.length || new Date(b.createdAt) - new Date(a.createdAt)
  );

  const queue = trending.map((p) => ({
    src: p.audio.src,
    title: p.title,
    artist: p.audio.artist || store.user(p.authorId).name,
    cover: p.audio.cover,
    postId: p.id,
  }));

  const rowsEl = document.getElementById("trackRows");

  if (!queue.length) {
    rowsEl.innerHTML = `
      <div class="mf-empty">
        <div class="mf-empty-icon">${MF.icon("music", 26)}</div>
        <h3>No tracks yet</h3>
        <p>Upload the first song to get things playing.</p>
        <a class="mf-btn mf-btn-primary" href="create.html?type=music">Upload a track</a>
      </div>`;
  } else {
    rowsEl.innerHTML = queue
      .map(
        (t) => `
        <div class="mf-track-row" data-play-post="${t.postId}" role="button" tabindex="0"
             aria-label="Play ${MF.escapeHtml(t.title)}">
          <img class="mf-track-cover" src="${t.cover}" alt="" loading="lazy"/>
          <div class="mf-track-info">
            <div class="mf-track-title">${MF.escapeHtml(t.title)}</div>
            <div class="mf-track-artist">${MF.escapeHtml(t.artist)}</div>
          </div>
          <span class="mf-track-eq" aria-hidden="true">${MF.icon("play", 14)}</span>
        </div>`
      )
      .join("");
  }

  function playFrom(postId) {
    const idx = queue.findIndex((t) => t.postId === postId);
    if (idx > -1) MF.player.play(queue[idx], queue);
  }

  document.querySelector(".mf-main").addEventListener("click", (e) => {
    const el = e.target.closest("[data-play-post]");
    if (el) playFrom(el.dataset.playPost);
  });

  /* ==========================================================
     4. Artist tools
     ========================================================== */
  document.getElementById("artistTools").innerHTML = `
    <div class="tools-band">
      <div class="tools-head">
        <h2>Everything an artist needs</h2>
        <a class="mf-btn mf-btn-ghost mf-btn-sm" href="create.html?type=music">
          ${MF.icon("upload", 14)} New release
        </a>
      </div>
      <div class="tools-grid">
        <div class="tool-item">
          <span class="ico">${MF.icon("upload", 18)}</span>
          <strong>Release your sound</strong>
          <p>Cover art, artist name and tags — live on the feed in seconds.</p>
          <a href="create.html?type=music">Start a release</a>
        </div>
        <div class="tool-item">
          <span class="ico">${MF.icon("users", 18)}</span>
          <strong>Grow your audience</strong>
          <p>Trending walls put your tracks in front of new listeners daily.</p>
          <a href="explore.html?type=music">Open Explore</a>
        </div>
        <div class="tool-item">
          <span class="ico">${MF.icon("link", 18)}</span>
          <strong>Own your links</strong>
          <p>Point fans to your Instagram, YouTube, Twitch and more from one bio.</p>
          <a href="settings.html">Connect socials</a>
        </div>
      </div>
    </div>`;
})();
