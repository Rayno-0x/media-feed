/* ============================================================
   MediaFeed — Settings page logic
   ============================================================ */

(function () {
  const store = MF.store;
  const me = store.me();
  const $ = (s) => document.querySelector(s);

  /* Populate upload affordance icons */
  document.querySelectorAll(".set-avatar-pick span, .set-cover-pick span").forEach((s) => {
    s.innerHTML = MF.icon("camera", 14);
  });

  /* ==========================================================
     Account & profile
     ========================================================== */
  $("#setName").value = me.name || "";
  $("#setUsername").value = me.username || "";
  $("#setEmail").value = me.email || "";
  $("#setBio").value = me.bio || "";
  $("#avatarPreview").src = me.avatar;
  $("#coverPreview").src = me.cover;

  let newAvatar = null;
  let newCover = null;
  let avatarChanged = false;
  let coverChanged = false;

  $("#avatarFile").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    MF.util.compressImage(f, 300, 0.85, (url) => {
      newAvatar = url;
      avatarChanged = true;
      $("#avatarPreview").src = url;
    });
  });

  $("#coverFile").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    MF.util.compressImage(f, 1400, 0.8, (url) => {
      newCover = url;
      coverChanged = true;
      $("#coverPreview").src = url;
    });
  });

  $("#saveAccount").addEventListener("click", () => {
    const errEl = $("#unameError");
    errEl.classList.remove("show");

    const name = $("#setName").value.trim();
    const username = $("#setUsername").value.trim();
    if (!name) return showErr(errEl, "Name can't be empty.");
    if (!/^[a-zA-Z0-9._]{3,20}$/.test(username))
      return showErr(errEl, "Username must be 3–20 chars: letters, numbers, . or _");
    const clash = store
      .get()
      .users.find((u) => u.id !== me.id && u.username.toLowerCase() === username.toLowerCase());
    if (clash) return showErr(errEl, "That username is taken.");

    me.name = name;
    me.username = username;
    me.email = $("#setEmail").value.trim();
    me.bio = $("#setBio").value.trim();
    if (avatarChanged && newAvatar) me.avatar = newAvatar;
    if (coverChanged && newCover) me.cover = newCover;
    store.save();

    flash("#accountSaved", "Saved!");
    MF.ui.toast("Profile updated");
  });

  function showErr(el, msg) {
    el.textContent = msg;
    el.classList.add("show");
  }

  function flash(sel, msg) {
    const el = $(sel);
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 1800);
  }

  /* ==========================================================
     Social links
     ========================================================== */
  const PLATFORMS = [
    { key: "instagram", label: "Instagram", icon: "instagram", ph: "https://instagram.com/you" },
    { key: "x", label: "X / Twitter", icon: "x", ph: "https://x.com/you" },
    { key: "tiktok", label: "TikTok", icon: "tiktok", ph: "https://tiktok.com/@you" },
    { key: "youtube", label: "YouTube", icon: "youtube", ph: "https://youtube.com/@you" },
    { key: "twitch", label: "Twitch", icon: "twitch", ph: "https://twitch.tv/you" },
    { key: "website", label: "Website", icon: "globe", ph: "https://your-site.com" },
  ];

  const sf = $("#socialFields");
  sf.innerHTML = PLATFORMS.map(
    (p) => `
    <div class="mf-field">
      <label>${MF.icon(p.icon, 17)} ${p.label}</label>
      <input class="mf-input" data-social="${p.key}"
             placeholder="${p.ph}"
             value="${MF.escapeHtml(me.socials?.[p.key] || "")}"/>
    </div>`
  ).join("");

  $("#saveSocials").addEventListener("click", () => {
    me.socials = {};
    sf.querySelectorAll("[data-social]").forEach((inp) => {
      const v = inp.value.trim();
      if (v) me.socials[inp.dataset.social] = v;
    });
    store.save();
    MF.ui.toast("Social links saved");
  });

  /* ==========================================================
     Appearance
     ========================================================== */
  function syncThemeRow() {
    const t = document.documentElement.dataset.theme || "dark";
    document.querySelectorAll(".set-theme-opt").forEach((b) =>
      b.classList.toggle("active", b.dataset.theme === t)
    );
  }

  document.querySelectorAll(".set-theme-opt").forEach((b) =>
    b.addEventListener("click", () => {
      document.documentElement.dataset.theme = b.dataset.theme;
      try {
        localStorage.setItem("mf_theme", b.dataset.theme);
      } catch (e) {}
      /* keep sidebar toggle icons in sync */
      document.querySelectorAll(".mf-theme-toggle").forEach((btn) => {
        btn.innerHTML =
          MF.icon(b.dataset.theme === "light" ? "moon" : "sun") +
          `<span>${b.dataset.theme === "light" ? "Dark mode" : "Light mode"}</span>`;
      });
      syncThemeRow();
    })
  );
  syncThemeRow();

  /* ==========================================================
     Toggle rows builder
     ========================================================== */
  function toggleRow(key, title, desc, list) {
    return `
      <div class="mf-toggle-row">
        <div><strong>${title}</strong><p>${desc}</p></div>
        <span class="mf-switch">
          <input type="checkbox" data-pref="${key}" ${me.prefs?.[key] !== false ? "checked" : ""}/>
          <span class="knob"></span>
        </span>
      </div>`;
  }

  document.getElementById("prefToggles").innerHTML =
    toggleRow("likes", "Likes on your posts", "When someone likes what you made") +
    toggleRow("comments", "Comments & mentions", "Replies and @mentions of you") +
    toggleRow("follows", "New followers", "When someone follows your account");

  document.getElementById("privacyToggles").innerHTML = toggleRow(
    "private",
    "Private account",
    "Only approved followers see your posts"
  );

  ["prefToggles", "privacyToggles"].forEach((id) =>
    document.getElementById(id).addEventListener("change", (e) => {
      const k = e.target.dataset.pref;
      if (!k) return;
      me.prefs = me.prefs || {};
      me.prefs[k] = e.target.checked;
      store.save();
    })
  );

  /* ==========================================================
     Danger zone
     ========================================================== */
  $("#logoutBtn").innerHTML = `${MF.icon("logout", 15)} Log out`;
  $("#logoutBtn").addEventListener("click", () => {
    store.signOut();
    window.location.href = "index.html";
  });

  $("#resetBtn").addEventListener("click", () => {
    if (confirm("Reset all demo data? Your mock posts, likes and follows return to defaults.")) {
      store.reset();
      window.location.reload();
    }
  });

  /* ==========================================================
     Delete account
     ========================================================== */
  $("#deleteAccBtn").addEventListener("click", () => {
    const errEl = $("#deleteAccError");
    errEl.classList.remove("show");

    const pw = $("#deleteAccPw").value;
    if (!pw) {
      errEl.textContent = "Enter your password to confirm.";
      errEl.classList.add("show");
      return;
    }
    if (pw !== me.password) {
      errEl.textContent = "Incorrect password.";
      errEl.classList.add("show");
      return;
    }
    if (!confirm("Are you sure? This will permanently delete your account and all your posts. This cannot be undone.")) return;

    store.deleteAccount();
    MF.ui.toast("Account deleted.");
    window.location.href = "index.html";
  });
})();
