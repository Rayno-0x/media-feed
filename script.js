// 1. Grab all our elements
const signUpBtn = document.getElementById("signUpBtn");
const signInBtn = document.getElementById("signInBtn");
const signUpModal = document.getElementById("signUpModal");
const signInModal = document.getElementById("signInModal");
const closeSignUp = document.getElementById("closeSignUp");
const closeSignIn = document.getElementById("closeSignIn");

const signUpForm = document.getElementById("signUpForm");
const signInForm = document.getElementById("signInForm");

// 2. Functions to Open and Close the Modals
signUpBtn.addEventListener("click", () => signUpModal.classList.add("show"));
signInBtn.addEventListener("click", () => signInModal.classList.add("show"));

closeSignUp.addEventListener("click", () =>
  signUpModal.classList.remove("show"),
);
closeSignIn.addEventListener("click", () =>
  signInModal.classList.remove("show"),
);

// Close modals if the user clicks outside the white box
window.addEventListener("click", (e) => {
  if (e.target === signUpModal) signUpModal.classList.remove("show");
  if (e.target === signInModal) signInModal.classList.remove("show");
});

// 3. Handle the Sign-Up Process
signUpForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // Get the values the user typed in
  const name = document.getElementById("regName").value.trim();
  const username = document.getElementById("regUsername").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;

  // Username: 3-20 chars, letters/numbers/dots/underscores only
  const usernamePattern = /^[a-zA-Z0-9._]{3,20}$/;
  if (!usernamePattern.test(username)) {
    alert(
      "Username must be 3-20 characters and use only letters, numbers, dots or underscores."
    );
    return;
  }

  // Check if passwords match before proceeding
  if (password !== confirmPassword) {
    alert("Passwords do not match! Please try again.");
    return;
  }

  if (password.length < 8) {
    alert("Password must be at least 8 characters long.");
    return;
  }

  // Collect optional creator interests from selected chips
  const interests = [
    ...document.querySelectorAll("#interestChips .chip.selected"),
  ].map((chip) => chip.dataset.value);

  // Save them to localStorage (simulating a database — replaced by the real backend)
  const userData = {
    name,
    username,
    email,
    password,
    interests,
  };
  localStorage.setItem("mediaFeedUser", JSON.stringify(userData));

  alert(`Welcome to MediaFeed, @${username}! You can now log in.`);

  signUpForm.reset();
  document
    .querySelectorAll("#interestChips .chip.selected")
    .forEach((chip) => chip.classList.remove("selected"));

  signUpModal.classList.remove("show");
  signInModal.classList.add("show");
});

// Toggle the optional interest chips (they must not submit the form)
document.getElementById("interestChips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (chip) chip.classList.toggle("selected");
});

// 5. FAQ Accordion (one open at a time)
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

// 6. Secondary sign-up buttons reuse the existing sign-up modal
const signUpModalEl = document.getElementById("signUpModal");
document.querySelectorAll(".cta-open-signup").forEach((btn) => {
  btn.addEventListener("click", () => signUpModalEl.classList.add("show"));
});

// 4. Handle the Sign-In Process
signInForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const enteredEmail = document.getElementById("loginEmail").value;
  const enteredPassword = document.getElementById("loginPassword").value;

  // Retrieve the saved user data from localStorage
  const savedData = localStorage.getItem("mediaFeedUser");

  if (savedData) {
    const parsedData = JSON.parse(savedData);

    // Check if the credentials match
    if (
      enteredEmail === parsedData.email &&
      enteredPassword === parsedData.password
    ) {
      alert(`Welcome back, ${parsedData.name}! You are now logged in.`);
      signInForm.reset();
      signInModal.classList.remove("show");

      // Redirect the user to the Social Wall page
      window.location.href = "feed.html";
    } else {
      alert("Incorrect email or password. Please try again.");
    }
  } else {
    alert("No account found with that email. Please sign up first!");
  }
});
