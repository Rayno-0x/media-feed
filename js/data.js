/* ============================================================
   MediaFeed — Mock Database & Persistence Layer
   ------------------------------------------------------------
   Seeds a full social graph into localStorage on first run.
   Shaped exactly like future API responses, so when the real
   backend arrives we swap this file's internals only.

   Public API:
     MF.store.get()            → live state object
     MF.store.save()           → persist state
     MF.store.reset()          → wipe & reseed (dev tool)
     MF.store.me()             → current user object
     MF.store.user(idOrName)   → lookup by id or username
     MF.store.post(id)
     MF.store.toggleLike(postId)
     MF.store.toggleSave(postId)
     MF.store.toggleFollow(userId)
     MF.store.isFollowing(userId)
     MF.store.addComment(postId, text)
     MF.store.addPost(fields)
     MF.store.unreadCount()
     MF.store.markNotificationsRead()
   ============================================================ */

window.MF = window.MF || {};

(function () {
  const KEY = "mf_state_v1";
  const now = Date.now();
  const min = 60 * 1000;
  const hr = 60 * min;
  const day = 24 * hr;

  /* ---------- Seed data ---------- */
  const SEED = {
    sessionUserId: "u_ada",

    users: [
      {
        id: "u_ada",
        name: "Rae Cole",
        username: "rae_creates",
        email: "rae@mediafeed.app",
        password: "mediafeed",
        avatar: "./assets/images/icons/avatar_icon.png",
        cover: "./assets/images/pexel/pexels-art-2178545_1920.jpg",
        bio: "Frontend dev & weekend photographer. Building in public, one pixel at a time.",
        interests: ["Code", "Design", "Photography"],
        socials: { instagram: "", x: "", tiktok: "", youtube: "" },
        followers: ["u_glory", "u_miracle", "u_bless"],
        following: ["u_glory", "u_bless", "u_dailyhustle"],
        verified: false,
      },
      {
        id: "u_glory",
        name: "Glory Obinwokoye",
        username: "glory_o",
        avatar: "./assets/images/lady1.jpg",
        cover: "./assets/images/pexel/pexels-bowed-instrument-1853324_1920.jpg",
        bio: "Music producer & lo-fi enthusiast. Making beats for deep focus sessions.",
        interests: ["Music"],
        socials: { instagram: "https://instagram.com/glory_o", x: "https://x.com/glory_o" },
        followers: ["u_ada", "u_miracle", "u_chichi", "u_ife", "u_charles"],
        following: ["u_ada", "u_dailyhustle"],
        verified: true,
      },
      {
        id: "u_bless",
        name: "Bless Designs",
        username: "bless.designsncodes",
        avatar: "./assets/images/icons/avatar1.png",
        cover: "./assets/images/geometric.jpg",
        bio: "Where code meets art. UI systems, brand identities & geometric everything.",
        interests: ["Design", "Code"],
        socials: { instagram: "https://instagram.com/bless.designs", tiktok: "https://tiktok.com/@blessdesigns" },
        followers: ["u_ada", "u_ife", "u_chichi"],
        following: ["u_glory"],
        verified: false,
      },
      {
        id: "u_techspire",
        name: "Techspire Team",
        username: "techspire_hq",
        avatar: "./assets/images/techspire.jpg",
        cover: "./assets/images/coding.jpg",
        bio: "Building SmartAR Tailor. WEMA Hackathon 6.0 finalists. AR × fashion × AI.",
        interests: ["Code", "Video"],
        socials: { x: "https://x.com/techspire_hq", youtube: "https://youtube.com/@techspire" },
        followers: ["u_chichi", "u_charles"],
        following: [],
        verified: true,
      },
      {
        id: "u_charles",
        name: "Mr. Charles",
        username: "charles_tutors",
        avatar: "./assets/images/man1.jpg",
        cover: "./assets/images/mrcharles.jpg",
        bio: "Python & ML tutor. 12 years teaching. Logic over syntax, always.",
        interests: ["Writing", "Code"],
        socials: { youtube: "https://youtube.com/@charlestutors" },
        followers: ["u_miracle", "u_dunamis"],
        following: ["u_glory"],
        verified: false,
      },
      {
        id: "u_chichi",
        name: "Chike C. Nsofor",
        username: "chichi_codes",
        avatar: "./assets/images/lady2.jpg",
        cover: "./assets/images/article.jpg",
        bio: "Software engineer @ Africa Agility mentor. Writing about thriving in tech.",
        interests: ["Writing", "Code"],
        socials: { instagram: "https://instagram.com/chichi_codes", x: "https://x.com/chichi_codes" },
        followers: ["u_ada", "u_bless"],
        following: ["u_glory", "u_techspire", "u_bless"],
        verified: true,
      },
      {
        id: "u_ife",
        name: "Ife Abimbola-Olulesi",
        username: "ife_designs",
        avatar: "./assets/images/man2.jpg",
        cover: "./assets/images/dataclean.jpg",
        bio: "Product designer. Wireframes today, prototypes tomorrow, ships Friday.",
        interests: ["Design"],
        socials: { instagram: "https://instagram.com/ife.designs", tiktok: "https://tiktok.com/@ife_designs" },
        followers: ["u_bless"],
        following: ["u_glory", "u_bless"],
        verified: false,
      },
      {
        id: "u_miracle",
        name: "Miracle Enenche",
        username: "miracle_e",
        avatar: "./assets/images/lady3.jpg",
        cover: "./assets/images/pexel/pexels-sunflower-2179011_1920.jpg",
        bio: "Blogger & ML student. Day 50 of posting daily until I land my first role.",
        interests: ["Writing", "Code"],
        socials: { x: "https://x.com/miracle_e" },
        followers: ["u_ada", "u_charles"],
        following: ["u_glory", "u_charles"],
        verified: false,
      },
      {
        id: "u_dunamis",
        name: "Dunamis",
        username: "dunamis_trades",
        avatar: "./assets/images/lady4.jpg",
        cover: "./assets/images/crypto.jpg",
        bio: "Crypto & forex educator. Charts, patience, and morning classes.",
        interests: ["Video"],
        socials: { youtube: "https://youtube.com/@dunamistrades", tiktok: "https://tiktok.com/@dunamistrades" },
        followers: ["u_charles"],
        following: [],
        verified: false,
      },
      {
        id: "u_futa",
        name: "FUTA Engineering",
        username: "futa_eng",
        avatar: "./assets/images/pexel/pexels-mikhail-nilov-7988082.jpg",
        cover: "./assets/images/pexel/pexels-cascade-1853341_1920.jpg",
        bio: "Official page of the Student Engineering Society. Projects, papers, people.",
        interests: ["Code"],
        socials: { x: "https://x.com/futa_eng" },
        followers: [],
        following: [],
        verified: true,
      },
      {
        id: "u_dailyhustle",
        name: "The Daily Hustle",
        username: "daily_hustle",
        avatar: "./assets/images/dailyhustle.png",
        cover: "./assets/images/dailyhus2.jpg",
        bio: "Daily 5-minute mindset resets for builders, makers and grinders.",
        interests: ["Music", "Video"],
        socials: { instagram: "https://instagram.com/dailyhustle", youtube: "https://youtube.com/@dailyhustle" },
        followers: ["u_ada", "u_glory"],
        following: [],
        verified: true,
      },
    ],

    posts: [
      {
        id: "p1",
        authorId: "u_bless",
        type: "gallery",
        title: "",
        body: "Just finalized the geometric profile elements linking code and art. Combining frontend logic with visual branding is the best feeling.",
        media: ["./assets/images/geometric.jpg", "./assets/images/dataclean.jpg"],
        tags: ["design", "generative-art"],
        createdAt: now - 1 * hr,
        likes: ["u_glory", "u_ada", "u_chichi", "u_ife", "u_miracle", "u_charles"],
        comments: [
          { id: "c1", userId: "u_ife", body: "The second frame is stunning. What grid are you using?", createdAt: now - 40 * min },
          { id: "c2", userId: "u_glory", body: "This goes hard 🔥", createdAt: now - 22 * min },
        ],
        shares: 14,
        savedBy: ["u_ada"],
      },
      {
        id: "p2",
        authorId: "u_glory",
        type: "music",
        title: "Deep Focus Lo-Fi Beats",
        body: "Prepping for the next DevFest Akure and needed some deep focus. Highly recommend this mix for anyone pushing through a solo coding session today. 🎧",
        audio: {
          src: "./assets/audio/3.mp3",
          cover: "./assets/music_images/Easy on me - Adele.jpg",
          artist: "Glory O.",
        },
        tags: ["lofi", "focus", "indie-music"],
        createdAt: now - 3 * hr,
        likes: ["u_ada", "u_charles", "u_miracle"],
        comments: [{ id: "c3", userId: "u_charles", body: "Perfect background for grading. Saved.", createdAt: now - 2 * hr }],
        shares: 7,
        savedBy: [],
      },
      {
        id: "p3",
        authorId: "u_techspire",
        type: "article",
        title: "The Future of SmartAR Tailor",
        body: "We are incredibly proud to announce our second-place finish at the WEMA Hackathon 6.0! Building SmartAR Tailor has been a journey of late nights, wild prototypes and one very patient mentor.",
        excerpt: "Scaling our augmented reality fashion solution after WEMA 6.0 — what worked, what broke, and what's next.",
        cover: "./assets/images/coding.jpg",
        readMins: 6,
        tags: ["ar", "startup", "hackathon"],
        createdAt: now - 5 * hr,
        likes: ["u_chichi", "u_charles", "u_ada", "u_miracle"],
        comments: [],
        shares: 23,
        savedBy: [],
      },
      {
        id: "p4",
        authorId: "u_charles",
        type: "blog",
        title: "",
        body: "A quick reminder for all my Python and Machine Learning students: understanding the foundational logic of your code is infinitely more important than rote memorization. Syntax changes, logic remains.",
        media: ["./assets/images/mrcharles.jpg"],
        tags: ["python", "learning"],
        createdAt: now - 8 * hr,
        likes: ["u_miracle", "u_ada", "u_dunamis"],
        comments: [{ id: "c4", userId: "u_miracle", body: "Needed this today. Thank you sir!", createdAt: now - 7 * hr }],
        shares: 4,
        savedBy: [],
      },
      {
        id: "p5",
        authorId: "u_chichi",
        type: "article",
        title: "Thriving in Cohort 9",
        body: "Huge congratulations to everyone accepted into Cohort 9 of the Africa Agility Girls in Tech program! I wrote a short guide on maximizing your four weeks of technical training.",
        excerpt: "Tips for mastering Python, ML and community networking during an intense bootcamp month.",
        cover: "./assets/images/article.jpg",
        readMins: 4,
        tags: ["career", "womenintech"],
        createdAt: now - 12 * hr,
        likes: ["u_miracle", "u_ada", "u_bless", "u_glory"],
        comments: [],
        shares: 11,
        savedBy: [],
      },
      {
        id: "p6",
        authorId: "u_ife",
        type: "gallery",
        title: "",
        body: "Working on the data aggregation flow for the Emergency Contact Directory app. Early UI sketches of how the responsive grid behaves on mobile.",
        media: ["./assets/images/dataclean.jpg", "./assets/images/geometric.jpg", "./assets/images/article.jpg", "./assets/images/crypto.jpg"],
        tags: ["ux", "wireframes"],
        createdAt: now - 15 * hr,
        likes: ["u_bless", "u_ada"],
        comments: [],
        shares: 3,
        savedBy: [],
      },
      {
        id: "p7",
        authorId: "u_dailyhustle",
        type: "music",
        title: "Navigating Milestones",
        body: "Whenever you hit a difficult milestone, remember the affirmations that got you started. A quick 5-minute audio reset for your week.",
        audio: {
          src: "./assets/audio/6.mp3",
          cover: "./assets/images/dailyhus2.jpg",
          artist: "The Daily Hustle",
        },
        tags: ["mindset", "podcast"],
        createdAt: now - 20 * hr,
        likes: ["u_ada", "u_glory", "u_charles", "u_miracle", "u_dunamis"],
        comments: [],
        shares: 31,
        savedBy: ["u_glory"],
      },
      {
        id: "p8",
        authorId: "u_miracle",
        type: "blog",
        title: "",
        body: "Day 25 of the 50-day posting challenge. Consistency is definitely the hardest part of building career visibility, but seeing small wins in HTML, CSS and JS debugging makes it worth it.",
        media: ["./assets/images/article.jpg"],
        tags: ["100daysofcode", "consistency"],
        createdAt: now - 1 * day,
        likes: ["u_charles", "u_ada", "u_chichi"],
        comments: [{ id: "c5", userId: "u_ada", body: "Halfway there! Rooting for you 🙌", createdAt: now - 22 * hr }],
        shares: 6,
        savedBy: [],
      },
      {
        id: "p9",
        authorId: "u_dunamis",
        type: "video",
        title: "Morning Market Analysis — Crypto & Forex",
        body: "Finished the morning class. The charts are looking interesting today. Always keep learning outside your main field!",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumb: "./assets/images/crypto.jpg",
        tags: ["trading", "crypto"],
        createdAt: now - 1 * day - 4 * hr,
        likes: ["u_charles"],
        comments: [],
        shares: 9,
        savedBy: [],
      },
      {
        id: "p10",
        authorId: "u_futa",
        type: "article",
        title: "RF Reading Protocols",
        body: "Our 400-level teams just completed their Electromagnetic Wave Signal Analysis field exercise. Great job to all technical leads for tracking down those RF interference sources.",
        excerpt: "Identifying signal interference in urban campus environments with low-cost SDR hardware.",
        cover: "./assets/images/pexel/pexels-cascade-1853341_1920.jpg",
        readMins: 8,
        tags: ["engineering", "research"],
        createdAt: now - 2 * day,
        likes: ["u_charles", "u_chichi"],
        comments: [],
        shares: 12,
        savedBy: [],
      },
      {
        id: "p11",
        authorId: "u_glory",
        type: "update",
        title: "",
        body: "Studio v2 is officially done. New interface, new monitors, same obsession with warm low-end. Sessions open next week — who's first? 🎚️",
        media: ["./assets/images/pexel/pexels-bowed-instrument-1853324_1920.jpg"],
        tags: ["studio", "musiclife"],
        createdAt: now - 2 * day - 6 * hr,
        likes: ["u_ada", "u_bless", "u_ife", "u_miracle", "u_chichi", "u_charles", "u_dailyhustle"],
        comments: [
          { id: "c6", userId: "u_bless", body: "That acoustic treatment though 👀", createdAt: now - 2 * day },
        ],
        shares: 18,
        savedBy: [],
      },
      {
        id: "p12",
        authorId: "u_bless",
        type: "video",
        title: "Designing a logo in 60 seconds",
        body: "From blank canvas to final mark — my compressed process for the MediaFeed community rebrand concept.",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumb: "./assets/images/geometric.jpg",
        tags: ["design", "branding"],
        createdAt: now - 3 * day,
        likes: ["u_ada", "u_ife", "u_glory"],
        comments: [],
        shares: 21,
        savedBy: [],
      },
      {
        id: "p13",
        authorId: "u_chichi",
        type: "update",
        title: "",
        body: "Reminder: your first tech role doesn't define your career. Neither does your second. Play long-term games with long-term people.",
        media: [],
        tags: ["career", "advice"],
        createdAt: now - 3 * day - 8 * hr,
        likes: ["u_ada", "u_miracle", "u_charles", "u_glory", "u_dunamis"],
        comments: [],
        shares: 44,
        savedBy: ["u_miracle"],
      },
      {
        id: "p14",
        authorId: "u_ada",
        type: "gallery",
        title: "",
        body: "Golden hour experiments from last weekend. Shot on a borrowed lens — now I definitely need to buy one.",
        media: ["./assets/images/pexel/pexels-woman-2179062_1920.jpg", "./assets/images/pexel/blackwoman.jpg"],
        tags: ["photography", "goldenhour"],
        createdAt: now - 4 * day,
        likes: ["u_glory", "u_miracle", "u_bless"],
        comments: [],
        shares: 2,
        savedBy: [],
      },
      {
        id: "p15",
        authorId: "u_miracle",
        type: "article",
        title: "What 25 Days of Posting Taught Me About Consistency",
        body: "Halfway through my 50-day challenge and the lessons are louder than the doubts. Here's my honest breakdown of what consistency actually looks like behind the scenes.",
        excerpt: "Systems beat motivation. A content calendar beats vibes. And small wins compound faster than you think.",
        cover: "./assets/images/pexel/pexels-sunflower-2179011_1920.jpg",
        readMins: 5,
        tags: ["writing", "growth"],
        createdAt: now - 5 * day,
        likes: ["u_chichi", "u_charles"],
        comments: [],
        shares: 16,
        savedBy: [],
      },
    ],

    notifications: [
      { id: "n1", type: "like", actorIds: ["u_glory", "u_miracle"], postId: "p14", read: false, createdAt: now - 30 * min },
      { id: "n2", type: "follow", actorIds: ["u_miracle"], postId: null, read: false, createdAt: now - 2 * hr },
      { id: "n3", type: "comment", actorIds: ["u_bless"], postId: "p14", read: false, createdAt: now - 5 * hr, commentText: "That lighting in shot two! 😍" },
      { id: "n4", type: "like", actorIds: ["u_bless", "u_ife"], postId: "p14", read: true, createdAt: now - 1 * day },
      { id: "n5", type: "mention", actorIds: ["u_chichi"], postId: null, read: true, createdAt: now - 2 * day, commentText: "@rae_creates you'd love this thread on design systems." },
      { id: "n6", type: "follow", actorIds: ["u_glory"], postId: null, read: true, createdAt: now - 3 * day },
    ],
  };

  /* ---------- Store core ---------- */
  let state = null;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        state = JSON.parse(raw);
        migrate();
        return;
      }
    } catch (e) {
      /* corrupted store → reseed */
    }
    state = JSON.parse(JSON.stringify(SEED));
    save();
  }

  /* Patch older saved stores with fields added in later versions */
  function migrate() {
    let dirty = false;
    const demo = user("u_ada");
    if (demo && !demo.email) {
      demo.email = "rae@mediafeed.app";
      demo.password = "mediafeed";
      dirty = true;
    }
    /* rename legacy default demo identity, but never stomp user edits */
    if (demo && demo.name === "Ada Obi") {
      demo.name = "Rae Cole";
      demo.username = "rae_creates";
      if (demo.email === "ada@mediafeed.app") demo.email = "rae@mediafeed.app";
      dirty = true;
    }
    if (dirty) save();
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("MediaFeed: storage full — changes not persisted.", e);
    }
  }

  /* ---------- Lookups ---------- */
  function me() {
    return user(state.sessionUserId);
  }

  function user(idOrUsername) {
    return state.users.find(
      (u) => u.id === idOrUsername || u.username === idOrUsername
    );
  }

  function post(id) {
    return state.posts.find((p) => p.id === id);
  }

  /* ---------- Social mutations ---------- */
  function toggleLike(postId) {
    const p = post(postId);
    if (!p) return false;
    const uid = state.sessionUserId;
    const i = p.likes.indexOf(uid);
    if (i === -1) p.likes.push(uid);
    else p.likes.splice(i, 1);
    save();
    return i === -1;
  }

  function toggleSave(postId) {
    const p = post(postId);
    if (!p) return false;
    const uid = state.sessionUserId;
    const i = p.savedBy.indexOf(uid);
    if (i === -1) p.savedBy.push(uid);
    else p.savedBy.splice(i, 1);
    save();
    return i === -1;
  }

  function isFollowing(userId) {
    return me().following.includes(userId);
  }

  function toggleFollow(userId) {
    const target = user(userId);
    if (!target || target.id === state.sessionUserId) return false;
    const mine = me();
    if (isFollowing(userId)) {
      mine.following = mine.following.filter((id) => id !== userId);
      target.followers = target.followers.filter((id) => id !== mine.id);
    } else {
      mine.following.push(userId);
      target.followers.push(mine.id);
    }
    save();
    return isFollowing(userId);
  }

  function addComment(postId, text) {
    const p = post(postId);
    if (!p || !text.trim()) return null;
    const c = {
      id: "c" + Date.now(),
      userId: state.sessionUserId,
      body: text.trim(),
      createdAt: Date.now(),
    };
    p.comments.push(c);
    save();
    return c;
  }

  function addPost(fields) {
    const p = Object.assign(
      {
        id: "p" + Date.now(),
        authorId: state.sessionUserId,
        createdAt: Date.now(),
        likes: [],
        comments: [],
        shares: 0,
        savedBy: [],
        tags: [],
        media: [],
      },
      fields
    );
    state.posts.unshift(p);
    save();
    return p;
  }

  /* ---------- Notifications ---------- */
  function unreadCount() {
    return state.notifications.filter((n) => !n.read).length;
  }

  function markNotificationsRead() {
    state.notifications.forEach((n) => (n.read = true));
    save();
  }

  function pushNotification(n) {
    state.notifications.unshift(
      Object.assign({ id: "n" + Date.now(), read: false, createdAt: Date.now() }, n)
    );
    save();
  }

  /* ---------- Auth ---------- */
  function signIn(email, password) {
    const u = state.users.find(
      (x) => (x.email || "").toLowerCase() === email.toLowerCase()
    );
    if (!u) return { ok: false, error: "No account found with that email." };
    if (u.password !== password) return { ok: false, error: "Incorrect password." };
    state.sessionUserId = u.id;
    save();
    return { ok: true };
  }

  function signUp(fields) {
    const uname = (fields.username || "").toLowerCase();
    if (state.users.some((u) => u.username.toLowerCase() === uname)) {
      return { ok: false, error: "That username is already taken." };
    }
    if (state.users.some((u) => (u.email || "").toLowerCase() === (fields.email || "").toLowerCase())) {
      return { ok: false, error: "An account with that email already exists." };
    }
    const u = Object.assign(
      {
        id: "u_" + Date.now(),
        avatar: "./assets/images/icons/default_avatar.svg",
        cover: "./assets/images/pexel/pexels-art-2178545_1920.jpg",
        bio: "",
        interests: [],
        socials: {},
        followers: [],
        following: [],
        verified: false,
      },
      fields
    );
    state.users.push(u);
    state.sessionUserId = u.id;
    save();
    return { ok: true, user: u };
  }

  function signOut() {
    state.sessionUserId = null;
    save();
  }

  function deleteAccount() {
    const uid = state.sessionUserId;
    if (!uid) return;
    state.users = state.users.filter((u) => u.id !== uid);
    state.users.forEach((u) => {
      u.followers = (u.followers || []).filter((id) => id !== uid);
      u.following = (u.following || []).filter((id) => id !== uid);
    });
    state.posts = (state.posts || []).filter((p) => p.userId !== uid);
    state.posts.forEach((p) => {
      p.likes = (p.likes || []).filter((id) => id !== uid);
      p.saves = (p.saves || []).filter((id) => id !== uid);
      (p.comments || []).forEach((c) => {
        if (c.userId === uid) c.userId = null;
      });
    });
    state.notifications = (state.notifications || []).filter((n) => n.userId !== uid);
    state.sessionUserId = null;
    save();
  }

  /* ---------- Export ---------- */
  MF.store = {
    get: () => state,
    save,
    reset() {
      localStorage.removeItem(KEY);
      load();
    },
    me,
    user,
    post,
    toggleLike,
    toggleSave,
    toggleFollow,
    isFollowing,
    addComment,
    addPost,
    unreadCount,
    markNotificationsRead,
    pushNotification,
    signIn,
    signUp,
    signOut,
    deleteAccount,
  };

  load();

  /* First-run convenience: keep the demo session active so every
     screen is browsable instantly. Log out via Settings → Account. */
})();
