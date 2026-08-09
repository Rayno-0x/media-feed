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
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;

  // Check if passwords match before proceeding
  if (password !== confirmPassword) {
    alert("Passwords do not match! Please try again.");
    return;
  }

  // Save them to localStorage (simulating a database)
  const userData = { name: name, email: email, password: password };
  localStorage.setItem("mediaFeedUser", JSON.stringify(userData));

  alert("Sign up successful! You can now log in.");

  signUpForm.reset();

  signUpModal.classList.remove("show");
  signInModal.classList.add("show");
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
