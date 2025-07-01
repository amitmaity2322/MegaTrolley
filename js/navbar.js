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




