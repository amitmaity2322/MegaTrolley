fetch('/navbar.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('navbar-placeholder').innerHTML = html;

    // Setup after navbar loads
    setupSearchPopup();      // ✅ important fix!
    setupNavbarToggle();
    updateCartCount();
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
    });
    closeMenu.addEventListener("click", () => {
      openMenu.classList.remove('open');
    });
  }
}

// Update cart count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const countSpan = document.getElementById("cart-count");
  if (countSpan) countSpan.textContent = total;
}

// ✅ Setup search popup events AFTER navbar is loaded
function setupSearchPopup() {
  const searchPopup = document.getElementById("search-popup");
  const searchInput = document.getElementById("search-input");
  const searchClose = document.getElementById("search-close");
  const searchSubmit = document.getElementById("search-submit");
  const searchIcon = document.querySelector(".search-icon");

  if (searchIcon) {
    searchIcon.addEventListener("click", () => {
      if (searchPopup) searchPopup.style.display = "flex";
      if (searchInput) searchInput.focus();
    });
  }

  if (searchClose) {
    searchClose.addEventListener("click", () => {
      if (searchPopup) searchPopup.style.display = "none";
    });
  }

  if (searchSubmit) {
    searchSubmit.addEventListener("click", () => {
      handleSearch(searchInput);
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleSearch(searchInput);
      }
    });
  }

  function handleSearch() {
    const query = searchInput?.value.trim();
    if (query) {
      sessionStorage.setItem("searchQuery", query); // Save the query temporarily
      window.location.href = "shop.html";
    }
  }
}
