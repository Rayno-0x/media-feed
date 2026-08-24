// Landing page interactions.
// All auth flows now live in auth.html (backed by the MF.store session).

// 1. All auth entry points route to the auth page
const goAuth = () => (window.location.href = "auth.html");

document.getElementById("getStartedBtn")?.addEventListener("click", goAuth);

document.querySelectorAll(".cta-open-signup").forEach((btn) => {
  btn.addEventListener("click", goAuth);
});

// 2. FAQ Accordion (one open at a time)
document.querySelectorAll(".faq-item").forEach((item) => {
  item.querySelector(".faq-question").addEventListener("click", () => {
    const wasOpen = item.classList.contains("open");

    document
      .querySelectorAll(".faq-item.open")
      .forEach((other) => other.classList.remove("open"));

    if (!wasOpen) item.classList.add("open");

    document.querySelectorAll(".faq-question").forEach((q) => {
      q.setAttribute(
        "aria-expanded",
        String(q.closest(".faq-item").classList.contains("open"))
      );
    });
  });
});
