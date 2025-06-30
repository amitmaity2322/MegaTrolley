// ✅ Centralized function to fetch and cache data
function getProductData() {
  const cached = sessionStorage.getItem('cachedProductData');
  if (cached) return Promise.resolve(JSON.parse(cached));

  return fetch('db.json')
    .then(res => res.json())
    .then(data => {
      sessionStorage.setItem('cachedProductData', JSON.stringify(data));
      return data;
    });
}


getProductData().then(data => {
  const products = data.products;
  const featured = data.featured_products;
  const allProducts = [...products, ...featured];

  const productContainer = document.getElementById('product-list');
  const featuredContainer = document.getElementById('featured-list');
  const allProductContainer = document.getElementById('all-product-list');

  window.allAvailableProducts = allProducts; // Globally accessible
  window.filteredProducts = allProducts;

  //const products = [...data.products, ...data.featured_products];
  window.allProducts = products;

  if (productContainer) {
    products.forEach(p => {
      productContainer.insertAdjacentHTML('beforeend', generateProductCard(p));
    });
  }

  if (featuredContainer) {
    featured.forEach(p => {
      featuredContainer.insertAdjacentHTML('beforeend', generateProductCard(p));
    });
  }

  if (allProductContainer) {
    // 🔄 1. Render full list at once
    allProducts.forEach(p => {
      allProductContainer.insertAdjacentHTML('beforeend', generateProductCard(p));
    });

    // ✅ 2. Call filters only once
    initCategoryFilter(allProducts);
    initPriceFilter(allProducts);
    initSizeFilter(allProducts);
  }

  const query = sessionStorage.getItem("searchQuery");

  if (query) {
    const filtered = allProducts.filter(p =>
      p.product_name.toLowerCase().includes(query.toLowerCase())
    );
    window.filteredProducts = filtered;
    renderPaginatedProducts(filtered);
    renderPaginationButtons(filtered.length);
    sessionStorage.removeItem("searchQuery"); // clear it after use
  } else {
    window.filteredProducts = allProducts;
    renderPaginatedProducts(allProducts);
    renderPaginationButtons(allProducts.length);
  }


  attachWishlistListeners(); // This needs to be here for initial page load
  attachCartListeners();
  updateCartCount();
  updateWishlistCount(); // Ensure this is called on initial load
  // ✅ 4. Setup pagination
  renderPaginatedProducts(allProducts);
  renderPaginationButtons(allProducts.length);
});




function generateProductCard(product) {
  const isShopPage = window.location.pathname.includes('shop');
  const columnClass = isShopPage ? 'col-md-4' : 'col-md-3';

  // Ensure product.mrp_price is formatted as a number for display
  const displayPrice = parseFloat(product.mrp_price).toFixed(2);


  // Get current wishlist data from localStorage
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  // Check if this specific product is already in the wishlist
  const isInWishlist = wishlist.some(item => String(item.id) === String(product.id));

  // Determine the correct image source (filled or empty heart)
  //const heartIconSrc = isInWishlist ? 'images/wishlist-filled.svg' : 'images/wishlist.svg';
  // Determine if the 'wishlist-active' class should be applied initially
  const activeClass = isInWishlist ? 'wishlist-active' : ''; // Add the class if in wishlist

  return `<div class="${columnClass} col-6 main-product">
      <div class="product-box position-relative">
        <div class="position-absolute rounded-circle product_wishlist cursor-pointer text-center ${activeClass}" data-id="${product.id}">
          <img alt="wishlist" src="images/wishlist.svg" class="wishlist-icon-img">
        </div>
        <div class="bgcolor-gray pt-3 rounded">
          <img src="${product.image_url}">
          <div class="d-flex button-hover align-items-center ">
            <button class="add-to-cart-btn rounded" data-id="${product.id}"
              data-name="${product.product_name}"
              data-price="${product.mrp_price}"
              data-image="${product.image_url}">Add to Cart</button>
            <button class="view-cart rounded" onclick="goToProductDetails('${product.id}')">
              <img alt="View" src="images/view-icon.svg">
            </button>
          </div>
        </div>
        <div class="font-size12 pt-2">
          <span><img alt="star" src="images/star.svg"></span>
          <span class="color-Blackgray">${product.review}</span>
        </div>
        <h4 class="color-grayBlack font-size16 font-weight400 pt-1">${product.product_name}</h4>
        <div class="d-flex pt-1">
          <p class="font-weight400 font-size16">$${displayPrice}</p>
        </div>
      </div>
    </div>`;
}



// --- Cart Functionality ---
function attachCartListeners() {
  document.querySelectorAll(".add-to-cart-btn").forEach(button => {
    button.addEventListener("click", () => {
      const productId = button.dataset.id;
      const productData = window.allAvailableProducts.find(p => String(p.id) === productId);

      // Define default values if not present in db.json
      // Change these to your preferred universal defaults
      const defaultColor = productData && productData.default_color ? productData.default_color : 'Blue'; // e.g., 'Assorted', 'Standard', 'Black'
      const defaultSize = productData && productData.default_size ? productData.default_size : 'S'; // e.g., 'One Size', 'Standard', 'M'
      const product = {
        id: productId,
        name: button.dataset.name,
        price: parseFloat(button.dataset.price),
        image: button.dataset.image,
        quantity: 1,
        selectedColor: defaultColor, // Assign the hardcoded default color
        selectedSize: defaultSize, // Assign the hardcoded default size
      };
      addToCart(product);
    });
  });
}

function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const index = cart.findIndex(item => item.id === product.id);

  if (index !== -1) {
    cart[index].quantity += product.quantity;
  } else {
    cart.push(product);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCountElem = document.getElementById("cart-count");
  if (cartCountElem) {
    console.log("Cart length:", cart.length); // Add this line
    cartCountElem.textContent = cart.length;
  }
}

// --- Product Details Page Functionality ---
function goToProductDetails(productId) {
  window.location.href = `product.html?id=${productId}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (productId) {
    getProductData().then(data => {
      const allProducts = [...data.products, ...data.featured_products];
      const currentProduct = allProducts.find(p => p.id == productId);

      if (currentProduct) {
        renderProductDetails(currentProduct);
        setupDetailPageCart(currentProduct);
        document.getElementById("product-category").textContent = currentProduct.category || "N/A";
        document.getElementById("product-review").textContent = currentProduct.review || "N/A";

        renderRecommendedProducts(productId, allProducts); // ✅ Show recommended
      } else {
        document.getElementById("product-category").textContent = "Product not found";
      }

      attachCartListeners();
      attachWishlistListeners();
      updateCartCount();
      updateWishlistCount();
    });
  }

  if (document.getElementById("cart-list")) {
    renderCart();
  }

  if (document.getElementById("wishlist-list")) {
    renderWishlist();
  }
});


function renderRecommendedProducts(currentProductId, allProducts) {
  const container = document.getElementById("recommended-products");
  if (!container) return;

  // Filter out current product
  const otherProducts = allProducts.filter(p => String(p.id) !== String(currentProductId));

  // Pick 4 (optionally random)
  const recommended = getRandomProducts(otherProducts, 4);

  recommended.forEach(product => {
    container.insertAdjacentHTML("beforeend", generateProductCard(product));
  });

  attachCartListeners();
  attachWishlistListeners();
}

function getRandomProducts(products, count = 4) {
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}




function renderProductDetails(product) {
  // Set product name
  document.querySelectorAll('.product-name').forEach(el => el.textContent = product.product_name);

  // Set price
  const productPriceElem = document.getElementById("product-price");
  if (productPriceElem) {
    productPriceElem.textContent = `$${parseFloat(product.mrp_price).toFixed(2)}`;
  }

  // Set main product image
  const mainImage = document.querySelector('.product-main-image');
  if (mainImage) {
    mainImage.src = product.image_url;
    mainImage.alt = product.product_name;
  }

  // Render thumbnails
  const thumbnailList = document.querySelector('.thumbnail-list');
  if (thumbnailList && product.imageArray && product.imageArray.length > 0) {
    thumbnailList.innerHTML = ''; // Clear previous if any

    product.imageArray.forEach((imgObj, index) => {
      const li = document.createElement('li');
      if (index === 0) li.classList.add('active'); // First image active

      li.innerHTML = `
        <img src="${imgObj.url}" alt="Thumbnail ${index + 1}"
             class="thumbnail-img" data-full="${imgObj.url}" />
      `;
      thumbnailList.appendChild(li);
    });

    // Add click event to thumbnails
    document.querySelectorAll('.thumbnail-img').forEach(thumbnail => {
      thumbnail.addEventListener('click', (e) => {
        const newSrc = e.target.dataset.full;

        // Update main image
        if (mainImage) {
          mainImage.src = newSrc;
        }

        // Highlight the active thumbnail
        document.querySelectorAll('.thumbnail-list li').forEach(li => li.classList.remove('active'));
        e.target.closest('li').classList.add('active');
      });
    });
  }

  document.querySelectorAll('.product-desc').forEach(el => {
    el.textContent = product.product_desc;
  });
  document.querySelectorAll('.product-desc1').forEach(el => {
    el.textContent = product.product_desc1;
  });
  document.querySelectorAll('.styling-tips').forEach(el => {
    el.textContent = product.styling_tips;
  });

  const featuresContainer = document.querySelector('.product-features');

  if (featuresContainer && Array.isArray(product.key_features)) {
    const ul = document.createElement('ul');
    product.key_features.forEach(feature => {
      const li = document.createElement('li');
      li.textContent = feature;
      ul.appendChild(li);
    });
    featuresContainer.innerHTML = ''; // clear existing content
    featuresContainer.appendChild(ul);
  }

  // Optional: Color and Size if available
  const defaultColorSpan = document.querySelector('.color h2 span');
  if (defaultColorSpan && product.default_color) {
    defaultColorSpan.textContent = product.default_color;
  }

  const defaultSizeSpan = document.querySelector('.size h2 span');
  if (defaultSizeSpan && product.default_size) {
    defaultSizeSpan.textContent = product.default_size;
  }
}


function setupDetailPageCart(product) {
  const qtyInput = document.querySelector('.qty-input');
  const minusBtn = document.querySelector('.qty-btn:first-child');
  const plusBtn = document.querySelector('.qty-btn:last-child');
  const addToCartBtn = document.querySelector('.prodetail-btn');

  // New: Selectors for color and size options
  const colorOptions = document.querySelectorAll('.color ul li');
  const sizeOptions = document.querySelectorAll('.size ul li');
  const selectedColorSpan = document.querySelector('.color h2 span'); // To display selected color
  const selectedSizeSpan = document.querySelector('.size h2 span'); // To display selected size

  // Default selections (from product details if available, otherwise empty)
  let selectedColor = selectedColorSpan ? selectedColorSpan.textContent : '';
  let selectedSize = selectedSizeSpan ? selectedSizeSpan.textContent : '';

  // --- Event Listeners for Color Selection ---
  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Remove 'selected' class from all color options
      colorOptions.forEach(li => li.classList.remove('selected-option'));
      // Add 'selected' class to the clicked option
      option.classList.add('selected-option');
      // Update the displayed color text
      selectedColor = 'No Color Name Provided'; // Default if li is empty
      if (option.dataset.colorName) { // Assuming you add data-color-name attribute
        selectedColor = option.dataset.colorName;
      } else if (option.textContent.trim() !== '') { // Fallback to li content
        selectedColor = option.textContent.trim();
      } else {
        selectedColor = 'Selected'; // Placeholder if no explicit name
      }
      if (selectedColorSpan) {
        selectedColorSpan.textContent = selectedColor;
      }
    });
  });

  // --- Event Listeners for Size Selection ---
  sizeOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Remove 'selected' class from all size options
      sizeOptions.forEach(li => li.classList.remove('selected-option'));
      // Add 'selected' class to the clicked option
      option.classList.add('selected-option');
      // Update the displayed size text
      selectedSize = option.textContent.trim();
      if (selectedSizeSpan) {
        selectedSizeSpan.textContent = selectedSize;
      }
    });
  });

  if (qtyInput && minusBtn && plusBtn && addToCartBtn) {
    plusBtn.addEventListener("click", () => {
      qtyInput.value = parseInt(qtyInput.value) + 1;
    });

    minusBtn.addEventListener("click", () => {
      let current = parseInt(qtyInput.value);
      if (current > 1) qtyInput.value = current - 1;
    });

    addToCartBtn.addEventListener("click", () => {
      const quantity = parseInt(qtyInput.value);
      // Validate if color and size are selected (optional but recommended)
      if (!selectedColor || !selectedSize || selectedColor === '' || selectedSize === '') {
        alert('Please select a color and size.');
        return; // Stop the function if not selected
      }
      const productToAdd = {
        id: String(product.id),
        name: product.product_name,
        price: parseFloat(product.mrp_price),
        image: product.image_url,
        quantity: quantity,
        
        selectedColor: selectedColor,
        selectedSize: selectedSize,
      };
      addToCart(productToAdd);
    });
  }
}

// --- Cart Page Rendering and Events ---
function renderCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart-list");
  const cartHeader = document.querySelector(".cart_detail3");
  const cartTotals = document.querySelector(".cartPrice_box");
  if (!container) return; // Exit if cart-list container is not found

  if (cart.length === 0) {
    container.innerHTML = `<p>Your cart is empty.</p>`;
    if (cartHeader) cartHeader.style.display = "none";
    if (cartTotals) cartTotals.style.display = "none";
    updateCartTotals();
    return;
  }

  container.innerHTML = ""; // Clear before rendering
  if (cartHeader) cartHeader.style.display = "block";
  if (cartTotals) cartTotals.style.display = "block";

  cart.forEach((item, index) => {
    const subtotal = (item.quantity * item.price).toFixed(2);
    const colorDisplay = item.selectedColor ? `Color: ${item.selectedColor}` : '';
    const sizeDisplay = item.selectedSize ? `Size: ${item.selectedSize}` : '';
    container.insertAdjacentHTML("beforeend", `
      <div class="cart_detail font-size14 font-weight500 text-center mt-3" data-id="${item.id}">
        <div class="d-flex align-items-center">
          <div class="cart-img me-3">
            <img src="${item.image}" alt="${item.name}" />
          </div>
          <div>
            <p>${item.name}</p>
            <p class="color-Blackgray font-size12">${colorDisplay}</p>
             <p class="color-Blackgray font-size12">${sizeDisplay}</p>
            <div class="remove text-uppercase font-size12 cursor-pointer" data-id="${item.id}">Remove</div>
          </div>
        </div>
        <div>$${item.price.toFixed(2)}</div>
        <div class="quantity-selector cart-quantity d-flex align-items-center">
          <button class="qty-btn decrement">-</button>
          <input class="qty-input" readonly type="text" value="${item.quantity}">
          <button class="qty-btn increment">+</button>
        </div>
        <div class="item-subtotal">$${subtotal}</div>
      </div>
    `);
  });

  attachCartEvents(); // Attach events after rendering cart items
  updateCartTotals();
}

function attachCartEvents() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  document.querySelectorAll(".remove").forEach(button => {
    button.addEventListener("click", () => {
      const idToRemove = button.dataset.id;
      cart = cart.filter(item => item.id !== idToRemove);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart(); // Re-render cart after removal
      updateCartCount(); // Update the cart count
    });
  });

  document.querySelectorAll(".cart_detail").forEach((itemElem) => {
    const decrementBtn = itemElem.querySelector(".decrement");
    const incrementBtn = itemElem.querySelector(".increment");
    const qtyInput = itemElem.querySelector(".qty-input");
    const subtotalElem = itemElem.querySelector(".item-subtotal");
    const itemId = itemElem.dataset.id; // Get the ID from the data-id attribute on cart_detail

    const itemInCart = cart.find(item => item.id === itemId);

    if (itemInCart) {
      decrementBtn.addEventListener("click", () => {
        if (itemInCart.quantity > 1) {
          itemInCart.quantity--;
          qtyInput.value = itemInCart.quantity;
          subtotalElem.textContent = `$${(itemInCart.quantity * itemInCart.price).toFixed(2)}`;
          localStorage.setItem("cart", JSON.stringify(cart));
          updateCartTotals();
          updateCartCount(); // Update cart count if quantity changes
        }
      });

      incrementBtn.addEventListener("click", () => {
        itemInCart.quantity++;
        qtyInput.value = itemInCart.quantity;
        subtotalElem.textContent = `$${(itemInCart.quantity * itemInCart.price).toFixed(2)}`;
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartTotals();
        updateCartCount(); // Update cart count if quantity changes
      });
    }
  });
}

function updateCartTotals() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const subtotalElem = document.getElementById("cart-subtotal");
  const totalElem = document.getElementById("cart-total");

  if (subtotalElem) subtotalElem.textContent = `$${subtotal.toFixed(2)}`;
  if (totalElem) totalElem.textContent = `$${subtotal.toFixed(2)}`; // For simplicity, total is same as subtotal. Add shipping logic here if needed.
}


function initCategoryFilter(allProducts) {
  const checkboxes = document.querySelectorAll('.filter-checkbox');
  const container = document.getElementById('all-product-list');

  if (!checkboxes.length || !container) return;

  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const selectedCategories = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value.toLowerCase());

      let filteredProducts = allProducts;

      if (selectedCategories.length > 0) {
        filteredProducts = allProducts.filter(product =>
          selectedCategories.includes(product.product_type.toLowerCase())
        );
      }

      container.innerHTML = ''; // Clear previous results
      filteredProducts.forEach(p => {
        container.insertAdjacentHTML('beforeend', generateProductCard(p));
      });

      attachCartListeners(); // Re-attach event listeners to new buttons
      attachWishlistListeners(); // Re-attach for wishlist as well
    });
  });
}


function initPriceFilter(allProducts) {
  const minRange = document.getElementById('min-price');
  const maxRange = document.getElementById('max-price');
  const minValDisplay = document.getElementById('min-price-val');
  const maxValDisplay = document.getElementById('max-price-val');
  const container = document.getElementById('all-product-list');

  if (!minRange || !maxRange || !container) return;

  function filterAndRender() {
    const min = parseFloat(minRange.value);
    const max = parseFloat(maxRange.value);

    minValDisplay.textContent = min;
    maxValDisplay.textContent = max;

    // Optional: combine with selected categories
    const selectedCategories = Array.from(document.querySelectorAll('.filter-checkbox'))
      .filter(cb => cb.checked)
      .map(cb => cb.value.toLowerCase());

    const selectedSizes = Array.from(document.querySelectorAll('.size-filter-checkbox'))
      .filter(cb => cb.checked)
      .map(cb => cb.value.toUpperCase());


    let filtered = allProducts.filter(p => {
      const price = parseFloat(p.mrp_price);
      const inPriceRange = price >= min && price <= max;
      const inCategory = selectedCategories.length === 0 ||
        selectedCategories.includes(p.product_type.toLowerCase());
      const inSize = selectedSizes.length === 0 || selectedSizes.includes(p.default_size?.toUpperCase());

      return inPriceRange && inCategory && inSize;
    });

    container.innerHTML = '';
    filtered.forEach(p => container.insertAdjacentHTML('beforeend', generateProductCard(p)));
    attachCartListeners();
    attachWishlistListeners(); // Re-attach for wishlist as well
  }

  // Update on slider change
  minRange.addEventListener('input', filterAndRender);
  maxRange.addEventListener('input', filterAndRender);
}


function initSizeFilter(allProducts) {
  const checkboxes = document.querySelectorAll('.size-filter-checkbox');
  const container = document.getElementById('all-product-list');

  if (!checkboxes.length || !container) return;

  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', filterProducts);
  });

  function filterProducts() {
    const selectedSizes = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value.toUpperCase());

    // Also combine with other filters like category and price
    const selectedCategories = Array.from(document.querySelectorAll('.filter-checkbox'))
      .filter(cb => cb.checked)
      .map(cb => cb.value.toLowerCase());

    const min = document.getElementById('min-price')?.value || 0;
    const max = document.getElementById('max-price')?.value || 1000;

    const filtered = allProducts.filter(p => {
      const inSize = selectedSizes.length === 0 || selectedSizes.includes(p.default_size?.toUpperCase());
      const inCategory = selectedCategories.length === 0 || selectedCategories.includes(p.product_type?.toLowerCase());
      const price = parseFloat(p.mrp_price);
      const inPrice = price >= parseFloat(min) && price <= parseFloat(max);

      return inSize && inCategory && inPrice;
    });

    container.innerHTML = '';
    filtered.forEach(p => container.insertAdjacentHTML('beforeend', generateProductCard(p)));
    attachCartListeners();
    attachWishlistListeners(); // Re-attach for wishlist as well
  }
}


let currentPage = 1;
const itemsPerPage = 9;

// Render paginated products
function renderPaginatedProducts(products, page = 1) {
  const productContainer = document.getElementById("all-product-list");
  if (!productContainer) return;

  productContainer.innerHTML = ""; // Clear previous

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const currentItems = products.slice(start, end);

  currentItems.forEach(p => {
    productContainer.insertAdjacentHTML("beforeend", generateProductCard(p));
  });

  attachCartListeners();
   // Re-attach for wishlist as well

  updateCartCount();
  attachWishlistListeners(); // ✅ Important after re-rendering
  

}

// Render pagination with left & right arrows
function renderPaginationButtons(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) return;

  paginationContainer.innerHTML = ""; // Clear existing

  // ← Left Arrow (Previous Page)
  if (currentPage > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.className = "pagination-btn mx-1";
    prevBtn.innerHTML = `<img alt="LeftArrow" src="images/right-arrow.svg" style="transform: rotate(180deg);">`;
    prevBtn.addEventListener("click", () => {
      currentPage--;
      renderPaginatedProducts(window.filteredProducts || window.allAvailableProducts, currentPage);
      renderPaginationButtons(window.filteredProducts?.length || window.allAvailableProducts.length);
      document.getElementById("all-product-list").scrollIntoView({
        behavior: "smooth"
      });
    });
    paginationContainer.appendChild(prevBtn);
  }

  // Page Numbers
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = `pagination-btn mx-1 ${i === currentPage ? "pagina-active" : ""}`;
    btn.textContent = i;
    btn.addEventListener("click", () => {
      currentPage = i;
      renderPaginatedProducts(window.filteredProducts || window.allAvailableProducts, currentPage);
      renderPaginationButtons(window.filteredProducts?.length || window.allAvailableProducts.length);
      document.getElementById("all-product-list").scrollIntoView({
        behavior: "smooth"
      });
    });
    paginationContainer.appendChild(btn);
  }

  // → Right Arrow (Next Page)
  if (currentPage < totalPages) {
    const nextBtn = document.createElement("button");
    nextBtn.className = "pagination-btn mx-1";
    nextBtn.innerHTML = `<img alt="RightArrow" src="images/right-arrow.svg">`;
    nextBtn.addEventListener("click", () => {
      currentPage++;
      renderPaginatedProducts(window.filteredProducts || window.allAvailableProducts, currentPage);
      renderPaginationButtons(window.filteredProducts?.length || window.allAvailableProducts.length);
      document.getElementById("all-product-list").scrollIntoView({
        behavior: "smooth"
      });
    });
    paginationContainer.appendChild(nextBtn);
  }
}




document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    updateWishlistCount();
  }, 100); // Wait 100ms after DOM loads to ensure header exists
});

// The renderWishlist function already correctly calls attachRemoveFromWishlist()
function renderWishlist() {
  // ... (existing rendering logic) ...

  attachRemoveFromWishlist(); // ✅ This call is crucial here
  attachCartListeners();

  
  attachWishlistListeners(); // ✅ If your wishlist page items also have heart icons
  
}

// --- Wishlist Functionality ---
function attachWishlistListeners() {
  document.querySelectorAll(".product_wishlist").forEach(button => {
    button.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevents accidental clicks on underlying elements
      const productId = button.dataset.id;
      toggleWishlist(productId, button); // Pass the button (the div.product_wishlist) element
    });
  });
}

// Toggles product in/out of wishlist and updates UI/count and visual state.
function toggleWishlist(productId, buttonElement) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const productIndex = wishlist.findIndex(item => String(item.id) === productId);
  
  // Get the image element inside the clicked button for changing its src
  const iconImg = buttonElement ? buttonElement.querySelector('.wishlist-icon-img') : null;

  if (productIndex !== -1) {
    // Product is in wishlist, remove it
    wishlist.splice(productIndex, 1);
   
    if (buttonElement) {
      buttonElement.classList.remove('wishlist-active');
    }
  } else {
    // Product is not in wishlist, add it
    const productData = window.allAvailableProducts.find(p => String(p.id) === productId);
    if (productData) {
      wishlist.push(productData);
     
      if (buttonElement) {
        buttonElement.classList.add('wishlist-active');
      }
    } else {
      console.warn(`Product with ID ${productId} not found in allAvailableProducts for wishlist.`);
    }
  }

  // Save the updated wishlist back to localStorage
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  // Update the global wishlist count in the navigation bar
  updateWishlistCount();
}

function renderWishlist() {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const container = document.getElementById("wishlist-list");
  if (!container) return;

  container.innerHTML = ""; // Clear previous

  if (wishlist.length === 0) {
    container.innerHTML = `<p>Your wishlist is empty.</p>`;
    return;
  }

  wishlist.forEach(product => {
    const displayPrice = parseFloat(product.mrp_price).toFixed(2);
    const html = `
      <div class="col-md-3 col-6 main-product">
        <div class="product-box position-relative">
          <div class="position-absolute rounded-circle product_wishlist cursor-pointer text-center remove-from-wishlist-x" data-id="${product.id}">
            <i class="fa-solid fa-xmark"></i>
          </div>
          <div class="bgcolor-gray pt-3 rounded">
            <img src="${product.image_url}" />
          </div>
          <div class="font-size12 pt-2">
            <span><img alt="star" src="images/star.svg"></span>
            <span class="color-Blackgray">${product.review}</span>
          </div>
          <h4 class="color-grayBlack font-size16 font-weight400 pt-1">${product.product_name}</h4>
          <div class="d-flex pt-1">
            <p class="font-weight400 font-size16">$${displayPrice}</p>
          </div>
          <div class="my-2">
            <button class="add-to-cart-btn w-100 wishlist-btn font-size14"
              data-id="${product.id}"
              data-name="${product.product_name}"
              data-price="${product.mrp_price}"
              data-image="${product.image_url}"
            >Add to Cart</button>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", html);
  });

  attachRemoveFromWishlist(); // Re-attach remove listeners for newly rendered items
  attachCartListeners(); // reuse your global add-to-cart logic for wishlist items
}

// Attaches event listeners for removing items from the wishlist page.
function attachRemoveFromWishlist() {
  // ✅ Change the selector to directly target the element that has the data-id and is clickable
  document.querySelectorAll(".remove-from-wishlist-x").forEach(button => {
    button.addEventListener("click", () => {
      const idToRemove = button.dataset.id; // Get the ID directly from the clicked button's dataset

      // Get the current wishlist from localStorage
      let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

      // Filter out the item to be removed
      wishlist = wishlist.filter(item => String(item.id) !== idToRemove);

      // Save the updated wishlist back to localStorage
      localStorage.setItem("wishlist", JSON.stringify(wishlist));

      // Re-render the wishlist on the page to reflect the change
      renderWishlist();

      // Update the wishlist count in the navigation bar
      updateWishlistCount();
    });
  });
}


function updateWishlistCount() {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const countElem = document.getElementById("wishlist-count");
  if (countElem) {
    countElem.textContent = wishlist.length;
  }
}



function attachMoveToCart() {
  document.querySelectorAll(".move-to-cart-btn").forEach(button => {
    button.addEventListener("click", () => {
      const productId = button.dataset.id;
      const name = button.dataset.name;
      const price = parseFloat(button.dataset.price);
      const image = button.dataset.image;

      // Get wishlist from localStorage
      let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

      // Get product from wishlist
      const product = wishlist.find(p => String(p.id) === productId);
      if (!product) return;

      // Remove from wishlist
      wishlist = wishlist.filter(p => String(p.id) !== productId);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));

      // Add to cart (check for duplicates inside addToCart)
      const productToAdd = {
        id: productId,
        name,
        price,
        image,
        quantity: 1,
        selectedColor: product.default_color || 'Default',
        selectedSize: product.default_size || 'M'
      };
      addToCart(productToAdd);

      // Re-render updated wishlist
      renderWishlist();
      updateWishlistCount();
    });
  });
}


document.addEventListener("DOMContentLoaded", () => {
  const checkoutBtn = document.querySelector(".cart-btn");

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      // Optional: Check if cart has items
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
      }

      // Redirect to checkout page
      window.location.href = "checkout.html";
    });
  }
});



// document.addEventListener("DOMContentLoaded", () => {
//   const cart = JSON.parse(localStorage.getItem("cart")) || [];

//   if (cart.length === 0) {
//     document.getElementById("checkout-items").innerHTML = "<p>Your cart is empty.</p>";
//     return;
//   }

//   let subtotal = 0;
//   cart.forEach(product => {
//     subtotal += product.price * product.quantity;

//     const itemHtml = `
    

//       <div class="checkout-item">
//       <div class="checkout-grid mt-4">
//                     <div class="d-flex align-items-center">
//                         <div class="check-img me-3">
//                             <img alt="The Kezia Band Ring" src="${product.image}">
//                         </div>
//                             <div><p class="font-weight300 font-size12">${product.name} <span class="font-weight500">(x${product.quantity})</span></p>
//                                 <p class="font-size12 font-weight500 pt-2">$${(product.price * product.quantity).toFixed(2)}</p>
//                             </div>
//                         </div>
//                         <div class="text-end ">$${(product.price * product.quantity).toFixed(2)}</div>
//                     </div>

       
//       </div>
//     `;
//     document.getElementById("checkout-items").insertAdjacentHTML("beforeend", itemHtml);
//   });

//   document.getElementById("checkout-subtotal").textContent = `$${subtotal.toFixed(2)}`;
//   document.getElementById("checkout-total").textContent = `$${subtotal.toFixed(2)}`;
// });


document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("checkout-items");
  const subtotalElem = document.getElementById("checkout-subtotal");
  const totalElem = document.getElementById("checkout-total");

  if (!container || !subtotalElem || !totalElem) {
   // console.warn("⚠️ One or more checkout elements not found in DOM.");
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  let subtotal = 0;

  cart.forEach(product => {
    subtotal += product.price * product.quantity;

    const itemHtml = `
      <div class="checkout-item">
        <div class="checkout-grid mt-4">
          <div class="d-flex align-items-center">
            <div class="check-img me-3">
              <img alt="${product.name}" src="${product.image}">
            </div>
            <div>
              <p class="font-weight300 font-size12">${product.name} <span class="font-weight500">(x${product.quantity})</span></p>
              <p class="font-size12 font-weight500 pt-2">$${(product.price * product.quantity).toFixed(2)}</p>
            </div>
          </div>
          <div class="text-end">$${(product.price * product.quantity).toFixed(2)}</div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML("beforeend", itemHtml);
  });

  subtotalElem.textContent = `$${subtotal.toFixed(2)}`;
  totalElem.textContent = `$${subtotal.toFixed(2)}`;
});


// document.addEventListener("DOMContentLoaded", () => {
//   const query = sessionStorage.getItem("searchQuery");
//   if (query && window.allProducts) {
//     const filtered = allProducts.filter(p =>
//       p.product_name.toLowerCase().includes(query.toLowerCase())
//     );
//     renderPaginatedProducts(filtered); // or your renderProducts()
//     renderPaginationButtons(filtered.length);
//     sessionStorage.removeItem("searchQuery");
//   } else {
//     renderPaginatedProducts(allProducts); // or default render
//     renderPaginationButtons(allProducts.length);
//   }
// });





