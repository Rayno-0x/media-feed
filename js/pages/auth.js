/* ============================================================
   MediaFeed — Auth page logic (sign in / sign up)
   ============================================================ */

(function () {
  const store = MF.store;
  const $ = (s) => document.querySelector(s);

  /* Icons for brand points + interest chips */
  const iconMap = { image: 20, users: 20, link: 20 };
  document.querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = MF.icon(el.dataset.icon, iconMap[el.dataset.icon] || 18);
  });
  $("#closeAuth").innerHTML = MF.icon("close", 18);
  $("#closeAuth").addEventListener("click", () => (window.location.href = "index.html"));

  $("#forgotLink").addEventListener("click", (e) => {
    e.preventDefault();
    MF.ui.toast("Password reset is coming soon — use the demo account for now");
  });

  /* ==========================================================
     Tabs
     ========================================================== */
  document.querySelectorAll(".auth-tabs button").forEach((btn) =>
    btn.addEventListener("click", () => {
      document.querySelectorAll(".auth-tabs button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const signin = btn.dataset.tab === "signin";
      $("#signinForm").hidden = !signin;
      $("#signupForm").hidden = signin;
    })
  );

  /* ==========================================================
     Sign in
     ========================================================== */
  $("#fillDemo").addEventListener("click", () => {
    $("#loginEmail").value = "rae@mediafeed.app";
    $("#loginPassword").value = "mediafeed";
    $("#loginError").classList.remove("show");
  });

  $("#signinForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const errEl = $("#loginError");
    errEl.classList.remove("show");

    const res = store.signIn($("#loginEmail").value.trim(), $("#loginPassword").value);
    if (!res.ok) {
      errEl.textContent = res.error;
      errEl.classList.add("show");
      return;
    }
    MF.ui.toast("Welcome back!");
    window.location.href = "feed.html";
  });

  /* ==========================================================
     Sign up
     ========================================================== */
  const CHIPS = [
    { v: "Photography", i: "image" },
    { v: "Music", i: "music" },
    { v: "Writing", i: "blog" },
    { v: "Design", i: "camera" },
    { v: "Code", i: "code" },
    { v: "Video", i: "video" },
  ];

  const chipWrap = $("#interestChips");
  chipWrap.innerHTML = CHIPS.map(
    (c) => `<button type="button" class="chip" data-v="${c.v}">${MF.icon(c.i, 15)} ${c.v}</button>`
  ).join("");

  chipWrap.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip) chip.classList.toggle("selected");
  });

  $("#signupForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const errEl = $("#signupError");
    errEl.classList.remove("show");

    const name = $("#regName").value.trim();
    const username = $("#regUsername").value.trim();
    const email = $("#regEmail").value.trim();
    const password = $("#regPassword").value;
    const confirm = $("#regConfirm").value;

    if (!/^[a-zA-Z0-9._]{3,20}$/.test(username)) {
      errEl.textContent = "Username must be 3–20 characters: letters, numbers, . or _";
      errEl.classList.add("show");
      return;
    }
    if (password.length < 8) {
      errEl.textContent = "Password must be at least 8 characters.";
      errEl.classList.add("show");
      return;
    }
    if (password !== confirm) {
      errEl.textContent = "Passwords do not match.";
      errEl.classList.add("show");
      return;
    }

    const interests = [...chipWrap.querySelectorAll(".chip.selected")].map((c) => c.dataset.v);
    const res = store.signUp({ name, username, email, password, interests });

    if (!res.ok) {
      errEl.textContent = res.error;
      errEl.classList.add("show");
      return;
    }
    MF.ui.toast(`Welcome to MediaFeed, @${username}!`);
    window.location.href = "feed.html";
  });
})();
