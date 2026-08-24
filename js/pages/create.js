/* ============================================================
   MediaFeed — Create page logic (full multi-type composer)
   ============================================================ */

(function () {
  const store = MF.store;
  const params = new URLSearchParams(window.location.search);
  const esc = MF.escapeHtml;
  const $ = (s) => document.querySelector(s);

  document.getElementById("backBtn").innerHTML = MF.icon("arrow-left", 20);
  document.getElementById("backBtn").addEventListener("click", () => history.back());

  /* ==========================================================
     Type definitions
     ========================================================== */
  const TYPES = {
    update: { label: "Update", icon: "update", cls: "tile-update", desc: "Quick thoughts & status" },
    gallery: { label: "Gallery", icon: "image", cls: "tile-gallery", desc: "Photos & visual art" },
    article: { label: "Article", icon: "article", cls: "tile-article", desc: "Long-form writing" },
    blog: { label: "Blog", icon: "blog", cls: "tile-blog", desc: "Stories & journals" },
    music: { label: "Music", icon: "music", cls: "tile-music", desc: "Tracks & podcasts" },
    video: { label: "Video", icon: "video", cls: "tile-video", desc: "Films & clips" },
  };

  let currentType = params.get("type") || null;

  /* ==========================================================
     Step 1 — picker
     ========================================================== */
  function renderPicker() {
    $("#typeGrid").innerHTML = Object.entries(TYPES)
      .map(
        ([key, t]) => `
        <button class="mf-type-tile" data-type="${key}">
          <span class="mf-type-tile-icon ${t.cls}">${MF.icon(t.icon, 24)}</span>
          <h4>${t.label}</h4>
          <p>${t.desc}</p>
        </button>`
      )
      .join("");
  }

  $("#typeGrid").addEventListener("click", (e) => {
    const tile = e.target.closest(".mf-type-tile");
    if (tile) showForm(tile.dataset.type);
  });

  /* ==========================================================
     Shared field builders
     ========================================================== */
  function field(label, inner, hint = "") {
    return `
      <div class="mf-field">
        <label>${label}</label>
        ${inner}
        ${hint ? `<p class="mf-hint">${hint}</p>` : ""}
      </div>`;
  }

  function textArea(id, ph, minH = 120) {
    return `<textarea id="${id}" class="mf-textarea" style="min-height:${minH}px"
              placeholder="${esc(ph)}"></textarea>`;
  }

  function input(id, ph, value = "") {
    return `<input id="${id}" class="mf-input" placeholder="${esc(ph)}" value="${esc(value)}" autocomplete="off"/>`;
  }

  function tagsField() {
    return field("Tags", input("fTags", "Comma separated, e.g. design, photography"),
      "Tags make your post discoverable in Explore.");
  }

  function dropzoneField(label, accept, id) {
    return `
      <div class="mf-field">
        <label>${label}</label>
        <label class="mf-dropzone" id="${id}Zone">
          <input type="file" id="${id}" accept="${accept}" hidden />
          <span>Click to choose a file, or drag it here</span>
          <span class="mf-dropzone-preview" id="${id}Preview" hidden><img alt="" /></span>
        </label>
      </div>`;
  }

  function readTags() {
    return ($("#fTags").value || "")
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/^#/, ""))
      .filter(Boolean)
      .slice(0, 6);
  }

  function bindDropzone(zoneId, onLoaded) {
    const zone = document.getElementById(zoneId + "Zone");
    const fileInput = document.getElementById(zoneId);
    const preview = document.getElementById(zoneId + "Preview");

    zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("dragover"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("dragover");
      const f = e.dataTransfer.files[0];
      if (f) handle(f);
    });
    fileInput.addEventListener("change", () => {
      const f = fileInput.files[0];
      if (f) handle(f);
    });

    function handle(f) {
      if (f.type.startsWith("image/")) {
        MF.util.compressImage(f, 1100, 0.78, (url) => {
          preview.hidden = false;
          preview.querySelector("img").src = url;
          onLoaded(url);
        });
      } else {
        /* audio/video stay as session-only blob URLs */
        const url = URL.createObjectURL(f);
        preview.hidden = false;
        preview.querySelector("img").src = "";
        preview.querySelector("span")?.remove();
        preview.insertAdjacentHTML(
          "afterbegin",
          `<div style="padding:12px;color:var(--brand-tint);font-weight:600">${esc(f.name)} ✓</div>`
        );
        onLoaded(url);
      }
    }
    return preview;
  }

  function error(msg) {
    const el = ensureErrorEl();
    el.textContent = msg;
    el.classList.add("show");
  }

  function clearError() {
    ensureErrorEl().classList.remove("show");
  }

  function ensureErrorEl() {
    let el = document.getElementById("formError");
    if (!el) {
      el = document.createElement("p");
      el.className = "mf-error";
      el.id = "formError";
      $(".mf-publish-row").before(el);
    }
    return el;
  }

  /* ==========================================================
     Step 2 — per-type forms
     ========================================================== */
  function showForm(type) {
    currentType = type;
    const t = TYPES[type];
    $("#typePicker").hidden = true;
    $("#formCard").hidden = false;
    window.scrollTo({ top: 0 });

    const banner = `
      <div class="mf-form-banner">
        <span class="mf-badge-${type}" >${MF.icon(t.icon, 13)} ${t.label}</span>
        <button class="mf-btn mf-btn-ghost mf-btn-sm" id="changeType">Change type</button>
      </div>`;

    let body = "";

    switch (type) {
      case "update":
        body =
          field("What's happening?", textArea("fBody", "Share an update… use #tags to be discovered")) +
          dropzoneField("Attach an image (optional)", "image/*", "fImg") +
          tagsField();
        break;

      case "gallery":
        body =
          field("Photos (up to 6)", `
            <label class="mf-dropzone" id="fImgsZone">
              <input type="file" id="fImgs" accept="image/*" multiple hidden />
              <span>Add photos one at a time or drag several</span>
            </label>
            <div class="mf-multi-previews" id="galleryPreviews"></div>`) +
          field("Caption", textArea("fBody", "Tell the story behind these shots…", 90)) +
          tagsField();
        break;

      case "article":
        body =
          field("Title", input("fTitle", "A compelling headline…")) +
          field("Cover image", `
            <label class="mf-dropzone" id="fImgZone">
              <input type="file" id="fImg" accept="image/*" hidden />
              <span>Choose a cover image</span>
              <span class="mf-dropzone-preview" id="fImgPreview" hidden><img alt=""/></span>
            </label>`) +
          field("Summary / excerpt", textArea("fExcerpt", "One or two lines shown in feeds…", 70)) +
          field("Full article", textArea("fBody", "Write your article…", 260)) +
          tagsField();
        break;

      case "blog":
        body =
          field("Title (optional)", input("fTitle", "Give it a title…")) +
          field("Cover image (optional)", `
            <label class="mf-dropzone" id="fImgZone">
              <input type="file" id="fImg" accept="image/*" hidden />
              <span>Choose an image</span>
              <span class="mf-dropzone-preview" id="fImgPreview" hidden><img alt=""/></span>
            </label>`) +
          field("Your story", textArea("fBody", "Write your blog post…", 220)) +
          tagsField();
        break;

      case "music":
        body =
          field("Choose a track from the MediaFeed library", `<div class="mf-track-list" id="trackList"></div>`,
            "Uploaded audio files play for this session only — the real upload pipeline arrives with the backend.") +
          field("Track title override (optional)", input("fTitle", "")) +
          field("Artist name override (optional)", input("fArtist", "")) +
          field("Cover art (optional)", `
            <label class="mf-dropzone" id="fImgZone">
              <input type="file" id="fImg" accept="image/*" hidden />
              <span>Choose artwork</span>
              <span class="mf-dropzone-preview" id="fImgPreview" hidden><img alt=""/></span>
            </label>`) +
          field("Caption", textArea("fBody", "What should listeners know?", 90)) +
          tagsField();
        break;

      case "video":
        body =
          field("YouTube link", input("fVideoUrl", "https://youtube.com/watch?v=…"),
            "Paste any YouTube URL — long videos stream free without using storage.") +
          field("Or upload a clip (session-only)", `
            <label class="mf-dropzone" id="fVidZone">
              <input type="file" id="fVid" accept="video/*" hidden />
              <span>MP4/WebM up to ~50MB</span>
            </label>`) +
          field("Title", input("fTitle", "Name your video…")) +
          field("Description", textArea("fBody", "Tell viewers about it…", 90)) +
          tagsField();
        break;
    }

    $("#formArea").innerHTML = `
      ${banner}
      ${body}
      <div class="mf-publish-row">
        <button class="mf-btn mf-btn-primary" id="publishBtn">${MF.icon("check", 17)} Publish</button>
        <button class="mf-btn mf-btn-ghost" id="cancelBtn">Cancel</button>
      </div>`;

    /* wire per-form behaviours */
    $("#changeType").addEventListener("click", backToPicker);
    $("#cancelBtn").addEventListener("click", backToPicker);

    if (type === "update") bindDropzone("fImg", (u) => (state.img1 = u));
    if (type === "blog" || type === "article")
      bindDropzone("fImg", (u) => {
        state.cover = u;
        const pv = document.getElementById("fImgPreview");
        pv.hidden = false;
        pv.querySelector("img").src = u;
      });
    if (type === "music") {
      renderTrackList();
      bindDropzone("fImg", (u) => (state.cover = u));
    }
    if (type === "video") {
      bindDropzone("fVid", (u) => (state.videoFile = u));
      bindImagePreviewForVideo();
    }
    if (type === "gallery") bindMultiImages();

    $("#publishBtn").addEventListener("click", publish);
  }

  function bindImagePreviewForVideo() {
    /* video uses fVid only; nothing extra needed */
  }

  function backToPicker() {
    currentType = null;
    state = {};
    $("#formCard").hidden = true;
    $("#typePicker").hidden = false;
  }

  /* --- gallery multi-image handling --- */
  let galleryImages = [];

  function bindMultiImages() {
    galleryImages = [];
    const inputEl = document.getElementById("fImgs");
    const zone = document.getElementById("fImgsZone");
    const wrap = document.getElementById("galleryPreviews");

    const addFiles = (files) => {
      [...files].slice(0, 6 - galleryImages.length).forEach((f) =>
        MF.util.compressImage(f, 1100, 0.78, (url) => {
          if (galleryImages.length >= 6) return;
          galleryImages.push(url);
          renderThumbs();
        })
      );
    };

    zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("dragover"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
    zone.addEventListener("drop", (e) => { e.preventDefault(); addFiles(e.dataTransfer.files); });
    inputEl.addEventListener("change", () => addFiles(inputEl.files));

    function renderThumbs() {
      wrap.innerHTML = galleryImages
        .map(
          (src, i) => `
          <div class="mf-thumb"><img src="${src}" alt=""/>
            <button data-i="${i}" aria-label="Remove">${MF.icon("close", 13)}</button>
          </div>`
        )
        .join("");
      wrap.querySelectorAll("button").forEach((b) =>
        b.addEventListener("click", () => {
          galleryImages.splice(+b.dataset.i, 1);
          renderThumbs();
        })
      );
    }
  }

  /* --- music track library --- */
  const DEMO_TRACKS = [
    { src: "./assets/audio/3.mp3", title: "Deep Focus Lo-Fi Beats", artist: "Glory O.", cover: "./assets/music_images/Easy on me - Adele.jpg" },
    { src: "./assets/audio/6.mp3", title: "Navigating Milestones", artist: "The Daily Hustle", cover: "./assets/images/dailyhus2.jpg" },
    { src: "./assets/audio/1.mp3", title: "Easy on Me", artist: "Adele", cover: "./assets/music_images/Easy on me - Adele.jpg" },
    { src: "./assets/audio/8.mp3", title: "God Knows", artist: "Calum Scott", cover: "./assets/audio/Calum_Scott - God_Knows.jpg" },
    { src: "./assets/audio/13.mp3", title: "I Want To Be a Billionaire", artist: "Travie McCoy ft. Bruno Mars", cover: "./assets/music_images/Travie McCoy feat. Bruno Mars - I_Want_To_Be_a_Billionaire.jpg" },
    { src: "./assets/audio/4.mp3", title: "It Will Rain", artist: "Bruno Mars", cover: "./assets/music_images/Bruno_Mars_-_Locked_Out_Of_Heaven.jpg" },
    { src: "./assets/audio/2.mp3", title: "Studio Session 02", artist: "MediaFeed Library", cover: "./assets/music_images/Callum.jpg" },
    { src: "./assets/audio/5.mp3", title: "Studio Session 05", artist: "MediaFeed Library", cover: "./assets/music_images/Justin beiber - sorry.jpg" },
    { src: "./assets/audio/7.mp3", title: "Studio Session 07", artist: "MediaFeed Library", cover: "./assets/music_images/Calum_Scott - Rise.jpg" },
    { src: "./assets/audio/9.mp3", title: "Studio Session 09", artist: "MediaFeed Library", cover: "./assets/music_images/Bruno_Mars - Grenade.jpg" },
    { src: "./assets/audio/10.mp3", title: "Studio Session 10", artist: "MediaFeed Library", cover: "./assets/music_images/Justin_Beiber_-_Somebody_To_Love.jpg" },
    { src: "./assets/audio/11.mp3", title: "Studio Session 11", artist: "MediaFeed Library", cover: "./assets/music_images/Calum_Scott - You_Are_The_Reason.jpg" },
    { src: "./assets/audio/12.mp3", title: "Studio Session 12", artist: "MediaFeed Library", cover: "./assets/music_images/Bruno_Mars_cover_by_KIM_WOOJIN_-_Talking_To_The_Moon.jpg" },
  ];

  let selectedTrack = DEMO_TRACKS[0];

  function renderTrackList() {
    const list = document.getElementById("trackList");
    list.innerHTML = DEMO_TRACKS.map(
      (t, i) => `
      <button type="button" class="mf-track-option ${t === selectedTrack ? "selected" : ""}" data-i="${i}">
        <img src="${t.cover}" alt=""/>
        <span>
          <span class="mf-track-option-title">${esc(t.title)}</span><br/>
          <span class="mf-track-option-artist">${esc(t.artist)}</span>
        </span>
      </button>`
    ).join("");
    list.querySelectorAll(".mf-track-option").forEach((b) =>
      b.addEventListener("click", () => {
        selectedTrack = DEMO_TRACKS[+b.dataset.i];
        list.querySelectorAll(".mf-track-option").forEach((x) => x.classList.remove("selected"));
        b.classList.add("selected");
      })
    );
  }

  /* ==========================================================
     Publish per type
     ========================================================== */
  let state = {};

  function publish() {
    clearError();
    const tags = readTags ? readTags() : [];
    let post = null;

    switch (currentType) {
      case "update": {
        const bodyV = $("#fBody").value.trim();
        if (!bodyV && !state.img1) return error("Write something or attach an image.");
        post = store.addPost({ type: "update", body: bodyV, media: state.img1 ? [state.img1] : [], tags });
        break;
      }
      case "gallery": {
        if (!galleryImages.length) return error("Add at least one photo.");
        post = store.addPost({ type: "gallery", body: $("#fBody").value.trim(), media: galleryImages.slice(0, 6), tags });
        break;
      }
      case "article": {
        const title = $("#fTitle").value.trim();
        const bodyV = $("#fBody").value.trim();
        if (!title) return error("Your article needs a title.");
        if (!bodyV) return error("Write the article body first.");
        post = store.addPost({
          type: "article",
          title,
          body: bodyV,
          excerpt: $("#fExcerpt").value.trim() || bodyV.slice(0, 140),
          cover: state.cover || "./assets/images/article.jpg",
          readMins: Math.max(1, Math.round(bodyV.split(/\s+/).length / 200)),
          tags,
        });
        break;
      }
      case "blog": {
        const bodyV = $("#fBody").value.trim();
        if (!bodyV && !state.cover) return error("Write your story or add an image.");
        post = store.addPost({ type: "blog", title: $("#fTitle").value.trim(), body: bodyV, media: state.cover ? [state.cover] : [], tags });
        break;
      }
      case "music": {
        const track = selectedTrack;
        post = store.addPost({
          type: "music",
          title: $("#fTitle").value.trim() || track.title,
          audio: {
            src: track.src,
            cover: state.cover || track.cover,
            artist: $("#fArtist").value.trim() || track.artist,
          },
          body: $("#fBody").value.trim(),
          tags,
        });
        break;
      }
      case "video": {
        const yt = $("#fVideoUrl").value.trim();
        const m = yt.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/);
        if (!m && !state.videoFile) return error("Paste a valid YouTube link or upload a clip.");
        post = store.addPost({
          type: "video",
          title: $("#fTitle").value.trim(),
          body: $("#fBody").value.trim(),
          videoUrl: m ? `https://www.youtube.com/embed/${m[1]}` : undefined,
          videoFile: m ? undefined : state.videoFile,
          thumb: "./assets/images/pexel/pexels-action-2178885_1920.jpg",
          tags,
        });
        break;
      }
    }

    MF.ui.toast("Published!");
    MF.go(MF.postUrl(post));
  }

  /* ==========================================================
     Boot
     ========================================================== */
  renderPicker();
  if (currentType && TYPES[currentType]) showForm(currentType);
})();
