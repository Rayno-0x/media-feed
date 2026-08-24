/* ============================================================
   MediaFeed — Home Feed page logic
   ============================================================ */

(function () {
  const store = MF.store;
  const C = MFComponents;
  const $ = (sel) => document.querySelector(sel);

  /* ==========================================================
     0. Populate composer type chips with icons + labels
     ========================================================== */
  const CHIP_DEFS = {
    gallery: { label: "Gallery", icon: "image" },
    update: { label: "Update", icon: "update" },
    blog: { label: "Blog", icon: "blog" },
    "create.html?type=article": { label: "Write article", icon: "article" },
    "create.html?type=music": { label: "Upload music", icon: "music" },
    "create.html?type=video": { label: "Post video", icon: "video" },
  };

  document.querySelectorAll(".mf-type-chip").forEach((chip) => {
    const key = chip.dataset.composeType || chip.dataset.goto;
    const def = CHIP_DEFS[key];
    if (def) chip.innerHTML = `${MF.icon(def.icon, 16)} ${def.label}`;
  });

  $("#composerAvatar").src = store.me().avatar;

  /* ==========================================================
     1. Stories row
     ========================================================== */
  function renderStories() {
    const me = store.me();
    const followed = me.following.map((id) => store.user(id)).filter(Boolean);
    const extras = store
      .get()
      .users.filter((u) => u.id !== me.id && !me.following.includes(u.id))
      .slice(0, 6);

    const people = [me, ...followed, ...extras].slice(0, 12);
    $("#storiesRow").innerHTML = people
      .map(
        (u) => `
        <a class="mf-story" href="${MF.profileUrl(u)}">
          <span class="mf-avatar-ring">
            <img class="mf-avatar" src="${u.avatar}" alt="${MF.escapeHtml(u.name)}" width="58" height="58"/>
          </span>
          <span>${u.id === me.id ? "Your story" : MF.escapeHtml(u.name.split(" ")[0])}</span>
        </a>`
      )
      .join("");
  }

  /* ==========================================================
     2. Feed rendering + filters
     ========================================================== */
  let currentFilter = "all";

  function renderFeed() {
    let posts = [...store.get().posts];
    if (currentFilter !== "all") {
      posts = posts.filter((p) => p.type === currentFilter);
    }
    C.renderPosts(
      $("#feedList"),
      posts,
      currentFilter === "all"
        ? "Your feed is quiet. Follow creators from Explore to fill it up."
        : `No ${currentFilter} posts yet — be the first to create one!`
    );
  }

  $("#feedTabs").addEventListener("click", (e) => {
    const tab = e.target.closest(".mf-tab");
    if (!tab) return;
    document
      .querySelectorAll("#feedTabs .mf-tab")
      .forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentFilter = tab.dataset.filter;
    renderFeed();
  });

  /* ==========================================================
     3. Quick compose modal
     ========================================================== */
  const modal = $("#composeModal");
  let composeType = "update";
  let composeImageURL = null;

  function openCompose(presetType) {
    modal.classList.add("show");
    setType(presetType || "update");
    setTimeout(() => $("#composeText").focus(), 60);
  }

  function closeCompose() {
    modal.classList.remove("show");
    resetCompose();
  }

  function setType(type) {
    composeType = type;
    document.querySelectorAll("#composeTypes .mf-tab").forEach((b) => {
      b.classList.toggle("active", b.dataset.type === type);
    });
  }

  function resetCompose() {
    $("#composeText").value = "";
    $("#composeTags").value = "";
    $("#composeError").classList.remove("show");
    composeImageURL = null;
    const prev = $("#composePreview");
    prev.hidden = true;
    prev.querySelector("img").src = "";
    $("#composeImage").value = "";
    setType("update");
  }

  $("#composerOpenBtn").addEventListener("click", () => openCompose());
  document
    .querySelectorAll('.mf-type-chip[data-compose-type]')
    .forEach((chip) =>
      chip.addEventListener("click", () => openCompose(chip.dataset.composeType))
    );

  modal.querySelector(".mf-modal-close").innerHTML = MF.icon("close", 20);
  modal.querySelector(".mf-modal-close").addEventListener("click", closeCompose);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeCompose();
  });

  $("#composeTypes").addEventListener("click", (e) => {
    const b = e.target.closest("[data-type]");
    if (b) setType(b.dataset.type);
  });

  /* "Full creator" chips navigate */
  document.querySelectorAll(".mf-type-chip[data-goto]").forEach((chip) =>
    chip.addEventListener("click", () => MF.go(chip.dataset.goto))
  );

  /* --- Image upload with compression (shared helper in components.js) --- */
  const dropzone = $("#composeDrop");
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleImage(f);
  });
  $("#composeImage").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (f) handleImage(f);
  });

  function handleImage(file) {
    MF.util.compressImage(file, 1100, 0.78, (dataUrl) => {
      composeImageURL = dataUrl;
      const prev = $("#composePreview");
      prev.hidden = false;
      prev.querySelector("img").src = dataUrl;
    });
  }

  /* --- Publish --- */
  $("#publishBtn").addEventListener("click", () => {
    const text = $("#composeText").value.trim();
    const err = $("#composeError");

    if (!text && !composeImageURL) {
      err.textContent = "Add some text or an image first.";
      err.classList.add("show");
      return;
    }
    if (text.length > 2000) {
      err.textContent = "Post is too long (max 2000 characters).";
      err.classList.add("show");
      return;
    }

    const tags = $("#composeTags").value
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/^#/, ""))
      .filter(Boolean)
      .slice(0, 6);

    const post = store.addPost({
      type: composeType,
      body: text,
      media: composeImageURL ? [composeImageURL] : [],
      tags,
    });

    closeCompose();
    renderFeed();
    window.scrollTo({ top: 0, behavior: "smooth" });
    MF.ui.toast("Post published 🎉");
    void post;
  });

  /* ==========================================================
     4. Boot page
     ========================================================== */
  renderStories();
  renderFeed();
})();
