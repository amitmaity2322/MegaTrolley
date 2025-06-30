fetch('/navbar.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('navbar-placeholder').innerHTML = html;
  })
  .then(() => {
    setupNavbarToggle()
    updateCartCount(); // ✅ show cart items on every page
  })
  .catch(err => console.error("Navbar load failed:", err));


  function setupNavbarToggle(){
    const toggleMenu = document.querySelector('.navbar-toggler');
    const openMenu = document.querySelector('.side-nav');
    const closeMEnu = document.querySelector('.close-btn');

    if(toggleMenu && openMenu && closeMEnu){
        toggleMenu.addEventListener("click", ()=>{
            openMenu.classList.toggle("open");
            
        })
        closeMEnu.addEventListener("click", ()=>{
            openMenu.classList.remove('open');
        })
    }
  }

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);

  const countSpan = document.getElementById("cart-count");
  if (countSpan) countSpan.textContent = total;
}


