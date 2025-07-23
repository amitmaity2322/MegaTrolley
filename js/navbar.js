fetch('/navbar.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('navbar-placeholder').innerHTML = html;

    // Setup after navbar loads
    setupSearchPopup();      // ✅ important fix!
    setupNavbarToggle();
    updateCartCount();
    NavbarActive();
    
    
  })
  .then(() =>{
    setupAuthModal();
  updateUserUI();
  setupCheckoutProtection();
  setupUserDropdown()
  })
  .catch(err => console.error("Navbar load failed:", err));

// Toggle menu

function setupNavbarToggle() {
  const toggleMenu = document.querySelector('.navbar-toggler');
  const openMenu = document.querySelector('.side-nav');
  const closeMenu = document.querySelector('.close-btn');

  if (toggleMenu && openMenu && closeMenu) {
    toggleMenu.addEventListener("click", () => {
      openMenu.classList.toggle("open");
      toggleMenu.classList.toggle("active");
    });
    closeMenu.addEventListener("click", () => {
      openMenu.classList.remove('open');
      toggleMenu.classList.remove("active");
    });
  }
}

function NavbarActive() {
const currentPage = window.location.pathname.split("/").pop(); // e.g. "about.html"
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

    navLinks.forEach(link => {
      const linkPage = link.getAttribute("href");
      if (linkPage === currentPage || (linkPage === "index.html" && currentPage === "")) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
}





// Update cart count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const countSpan = document.getElementById("cart-count");
  if (countSpan) countSpan.textContent = total;
}

// ✅ Setup search popup events AFTER navbar is loaded



// function setupAuthModal() {
//   const authModal = document.getElementById("auth-modal");
//   const userBtn = document.getElementById("user-btn");
//   const loginBtn = document.getElementById("login-btn");
//   const logoutBtn = document.getElementById("logout-btn");

//   userBtn?.addEventListener("click", () => {
//     const user = sessionStorage.getItem("user");
//     const justLoggedOut = sessionStorage.getItem("justLoggedOut");

//     if (!user && !justLoggedOut) {
//       authModal.classList.remove("hidden");
//     }

//     sessionStorage.removeItem("justLoggedOut"); // allow modal next time
//   });

//   loginBtn?.addEventListener("click", function () {
//     const username = document.getElementById('login-username').value.trim(); // treat as email
//     const password = document.getElementById('login-password').value.trim();
//     const errorEl = document.getElementById('login-error');
//     errorEl.textContent = "";
  
//     fetch('https://api.escuelajs.co/api/v1/auth/login', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email: username, password })  // ✅ fixed this
//     })
//       .then(async res => {
//         const data = await res.json();
  
//         if (!res.ok) {
//           errorEl.textContent = data.message || "Invalid login credentials";
//           return;
//         }
  
//         sessionStorage.setItem("user", username); // ✅ save user email
//         sessionStorage.setItem("token", data.access_token); // ✅ EscuelaJS returns `access_token`
//         authModal.classList.add("hidden");
//         updateUserUI();
  
//         const redirect = sessionStorage.getItem("redirectAfterLogin");
//         if (redirect) {
//           sessionStorage.removeItem("redirectAfterLogin");
//           window.location.href = redirect;
//         }
//       })
//       .catch(error => {
//         errorEl.textContent = "Something went wrong.";
//         console.error("Login failed:", error);
//       });
//   });
  
//   logoutBtn?.addEventListener("click", () => {
//     sessionStorage.removeItem("user");
//     sessionStorage.removeItem("token");
//     updateUserUI();
//     sessionStorage.setItem("justLoggedOut", "true");

//     const authModal = document.getElementById("auth-modal");
//     authModal?.classList.add("hidden");
//   });
// }

// function updateUserUI() {
//   const user = sessionStorage.getItem("user");
//   const userGreeting = document.getElementById("user-greeting");
//   const logoutBtn = document.getElementById("logout-btn");

//   if (user) {
//     userGreeting.textContent = `Welcome, ${user}`;
//     logoutBtn.classList.remove("hidden");
//   } else {
//     userGreeting.textContent = "";
//     logoutBtn.classList.add("hidden");
//   }
// }

// function setupCheckoutProtection() {
//   const checkoutBtn = document.getElementById("checkout-btn");

//   if (checkoutBtn) {
//     checkoutBtn.addEventListener("click", (e) => {
//       const token = sessionStorage.getItem("token");

//       if (!token) {
//         e.preventDefault();
//         sessionStorage.setItem("redirectAfterLogin", "checkout.html");

//         const authModal = document.getElementById("auth-modal");
//         authModal?.classList.remove("hidden");
//       } else {
//         window.location.href = "checkout.html";
//       }
//     });
//   }
// }


function setupAuthModal() {
  const authModal = document.getElementById("auth-modal");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const userBtn = document.getElementById("user-btn");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const showSignup = document.getElementById("show-signup");
  const showLogin = document.getElementById("show-login");
  const signupBtn = document.getElementById("signup-btn");

  // 🧠 Toggle form
  showSignup?.addEventListener("click", () => {
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
  });

  showLogin?.addEventListener("click", () => {
    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
  });

  // 👤 Open Modal
  userBtn?.addEventListener("click", () => {
    const user = sessionStorage.getItem("user");
    const justLoggedOut = sessionStorage.getItem("justLoggedOut");

    if (!user && !justLoggedOut) {
      authModal.classList.remove("hidden");
      loginForm.classList.remove("hidden");
      signupForm.classList.add("hidden");
    }

    sessionStorage.removeItem("justLoggedOut");
  });

  // 🔐 LOGIN
  loginBtn?.addEventListener("click", () => {
    const email = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const errorEl = document.getElementById("login-error");
    errorEl.textContent = "";

    fetch("https://api.escuelajs.co/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.access_token) {
        sessionStorage.setItem("token", data.access_token);
        return fetch("https://api.escuelajs.co/api/v1/auth/profile", {
          headers: { Authorization: `Bearer ${data.access_token}` }
        });
      } else {
        errorEl.textContent = "Login failed. Check credentials.";
        throw new Error("Invalid login");
      }
    })
    .then(res => res.json())
    .then(profile => {
      sessionStorage.setItem("user", profile.name || profile.email);
      updateUserUI();
      authModal.classList.add("hidden");

      const redirect = sessionStorage.getItem("redirectAfterLogin");
      if (redirect) {
        sessionStorage.removeItem("redirectAfterLogin");
        window.location.href = redirect;
      }
    })
    .catch(err => {
      console.error(err);
      errorEl.textContent = "Please sign up";
    });
  });

  // 🧾 SIGNUP
  // signupBtn?.addEventListener("click", () => {
  //   const name = document.getElementById("signup-name").value.trim();
  //   const email = document.getElementById("signup-email").value.trim();
  //   const password = document.getElementById("signup-password").value.trim();
  //   const errorEl = document.getElementById("signup-error");
  //    const successEl = document.getElementById("signup-success");
  //   errorEl.textContent = "";
  //   successEl.textContent = "";

  //   fetch("https://api.escuelajs.co/api/v1/users", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       name,
  //       email,
  //       password,
  //       avatar: "https://api.lorem.space/image/face?w=640&h=480"
  //     })
  //   })
  //   .then(res => res.json())
  //   .then(data => {
  //     //alert("Signup successful! Please login.");
  //     successEl.textContent = "Signup successful! Please login.";
  //     signupForm.classList.add("hidden");
  //     loginForm.classList.remove("hidden");
  //   })
  //   .catch(err => {
  //     errorEl.textContent = "Signup failed. Try again.";
  //     console.error(err);
  //   });
  // });

  signupBtn?.addEventListener("click", () => {
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const errorEl = document.getElementById("signup-error");
  const successEl = document.getElementById("signup-success");
  errorEl.textContent = "";
  successEl.textContent = "";

  fetch("https://api.escuelajs.co/api/v1/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      password,
      avatar: "https://api.lorem.space/image/face?w=640&h=480"
    })
  })
    .then(res => res.json())
    .then(data => {
      successEl.textContent = "Signup successful! Redirecting to login...";
      setTimeout(() => {
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
        successEl.textContent = "";
      }, 3000);
    })
    .catch(err => {
      errorEl.textContent = "Signup failed. Try again.";
      console.error(err);
    });
});


  // Logout
  logoutBtn?.addEventListener("click", () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    updateUserUI();
    sessionStorage.setItem("justLoggedOut", "true");
    authModal.classList.add("hidden");
  });
}

function updateUserUI() {
  const user = sessionStorage.getItem("user");
  const userGreeting = document.getElementById("user-greeting");
  const logoutBtn = document.getElementById("logout-btn");
  const userIconImg = document.getElementById("user-icon-img");
  const userDropdown = document.querySelector(".user-dropdown");

  if (user) {
    const firstTwo = user.substring(0, 2).toUpperCase();
    userGreeting.textContent = `${firstTwo}`;
    logoutBtn.classList.remove("hidden");
    if (userIconImg) userIconImg.style.display = "none";
    userDropdown?.classList.remove("hidden");
  } else {
    userGreeting.textContent = "";
    logoutBtn.classList.add("hidden");
    if (userIconImg) userIconImg.style.display = "inline";
    userDropdown?.classList.add("hidden");
  }
}

function setupCheckoutProtection() {
  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", (e) => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        e.preventDefault();
        sessionStorage.setItem("redirectAfterLogin", "checkout.html");
        const authModal = document.getElementById("auth-modal");
        authModal?.classList.remove("hidden");
      } else {
        window.location.href = "checkout.html";
      }
    });
  }
}

function setupUserDropdown() {
  const userGreeting = document.getElementById("user-greeting");
  const dropdownMenu = document.getElementById("dropdown-menu");

  userGreeting?.addEventListener("click", () => {
    dropdownMenu.classList.toggle("hidden");
  });

  // Optional: Hide menu if clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".user-dropdown")) {
      dropdownMenu.classList.add("hidden");
    }
  });
}











