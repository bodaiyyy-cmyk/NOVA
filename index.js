// ===== MOBILE MENU =====
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.querySelector(".nav-links");
if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("show");
    const icon = menuBtn.querySelector("i");
    icon.classList.toggle("fa-bars");
    icon.classList.toggle("fa-xmark");
  });
}
// ===== NAVBAR SCROLL STATE =====
const mainNav = document.querySelector(".navbar");
if (mainNav) {
  const onScroll = () => mainNav.classList.toggle("scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll);
}

// ===== CART DATA =====
function loadList(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (err) {
    return [];
  }
}
let cart = isLoggedIn() ? loadList("novaCart") : [];
function saveCart() {
  localStorage.setItem("novaCart", JSON.stringify(cart));
}
function updateCartCount() {
  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = cart.reduce((t, p) => t + p.quantity, 0);
  });
}

// ===== WISHLIST DATA =====
let wishlist = isLoggedIn() ? loadList("novaWishlist") : [];
function saveWishlist() {
  localStorage.setItem("novaWishlist", JSON.stringify(wishlist));
}
function updateWishlistCount() {
  document.querySelectorAll(".wishlist-count").forEach((el) => {
    el.textContent = wishlist.length;
  });
}
function isInWishlist(id) {
  return wishlist.some((p) => p.id === id);
}

updateCartCount();
updateWishlistCount();

// ===== AUTH STATE (login / profile / logout) =====
function isLoggedIn() {
  return localStorage.getItem("novaLoggedIn") === "true";
}
function getUserPhone() {
  return localStorage.getItem("novaPhone") || "";
}
function renderAuthState() {
  const loggedIn = isLoggedIn();

  document.querySelectorAll(".login-btn").forEach((btn) => {
    if (loggedIn) {
      btn.classList.add("logged-in");
      btn.setAttribute("href", "#");
      btn.innerHTML = `<i class="fa-solid fa-arrow-right-from-bracket"></i>Logout`;
    } else {
      btn.classList.remove("logged-in");
      btn.setAttribute("href", "index2.html");
      btn.innerHTML = `<i class="fa-regular fa-user"></i>${btn.classList.contains("mobile-login") ? " " : ""}Login`;
    }
  });
}
renderAuthState();

function logout() {
  localStorage.removeItem("novaLoggedIn");
  localStorage.removeItem("novaPhone");
  localStorage.removeItem("novaCart");      // السلة تتفضي
  localStorage.removeItem("novaWishlist");  // المفضلة تتفضي
  showToast("تم تسجيل الخروج بنجاح", "circle-check");
  setTimeout(() => location.reload(), 700);
}

document.addEventListener("click", (e) => {
  if (e.target.closest(".login-btn.logged-in")) {
    e.preventDefault();
    logout();
  }
});

// ===== TOAST =====
function showToast(message, icon = "circle-check") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i class="fa-solid fa-${icon}"></i><span>${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ===== PRODUCT IMAGE HELPER =====
// Looks for images/<id>.jpeg, then images/<id>.jpg ; falls back to the icon
function imgFallback(img, icon, cls) {
  if (!img.dataset.triedJpg) {
    img.dataset.triedJpg = "1";
    img.src = img.src.replace(/\.jpeg$/i, ".jpg");
    return;
  }
  const i = document.createElement("i");
  i.className = `fa-solid ${icon} ${cls}`.trim();
  img.replaceWith(i);
}
function productImg(item, imgClass = "", iconClass = "") {
  const icon = item.icon || "fa-box";
  return `<img src="images/${item.id}.jpeg" alt="${item.name}" class="${imgClass}" loading="lazy" onerror="imgFallback(this,'${icon}','${iconClass}')">`;
}

// ===== PRODUCT CARD BUILDER =====
function productCardHTML(product) {
  const inWish = isInWishlist(product.id);
  return `
        <article class="product-card">
            <div class="product-image">
                ${product.tag ? `<span class="product-tag ${product.tag === "SALE" ? "sale" : ""}">${product.tag}</span>` : ""}
                <button class="wishlist-btn" data-id="${product.id}">
                    <i class="fa-${inWish ? "solid" : "regular"} fa-heart"></i>
                </button>
                <a href="product.html?id=${product.id}" class="product-link-image">
                    ${productImg(product, "product-img", "product-placeholder")}
                </a>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3>${product.name}</h3>
                <div class="rating">
                    <i class="fa-solid fa-star"></i>
                    <span>${product.rating}</span>
                    <small>(${product.reviews})</small>
                </div>
                <div class="product-bottom">
                    <strong>$${product.price.toFixed(2)}</strong>
                    <button class="add-cart" data-id="${product.id}">
                        <i class="fa-solid fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        </article>
    `;
}

function renderGrid(containerId, list, emptyMsg = "No products found") {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!list.length) {
    el.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:80px 20px;color:#9ca3af;">
                <i class="fa-solid fa-box-open" style="font-size:50px;margin-bottom:20px;"></i>
                <h2>${emptyMsg}</h2>
            </div>`;
    return;
  }
  el.innerHTML = list.map(productCardHTML).join("");
}

// ===== REQUIRE LOGIN =====
function requireLogin() {
  if (isLoggedIn()) return true;
  sessionStorage.setItem("novaReturn", location.href);
  showToast("سجّل الدخول الأول عشان تكمل", "lock");
  setTimeout(() => (window.location.href = "index2.html"), 900);
  return false;
}

// ===== EVENT DELEGATION (add to cart / wishlist / cart page controls) =====
document.addEventListener("click", (e) => {
  // ---- add to cart ----
  const addBtn = e.target.closest(".add-cart");
  if (addBtn) {
    if (!requireLogin()) return;
    const id = Number(addBtn.dataset.id);
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const existing = cart.find((p) => p.id === id);
    if (existing) existing.quantity++;
    else
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        icon: product.icon,
        quantity: 1,
      });
    saveCart();
    updateCartCount();
    showToast("تمت الإضافة إلى السلة", "cart-shopping");

    if (!addBtn.dataset.originalHtml) {
      addBtn.dataset.originalHtml = addBtn.innerHTML;
    }
    addBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
    setTimeout(() => (addBtn.innerHTML = addBtn.dataset.originalHtml), 1000);

    if (document.getElementById("cartPageItems")) renderCartPage();
    return;
  }

  // ---- wishlist ----
  const wishBtn = e.target.closest(".wishlist-btn");
  if (wishBtn) {
    if (!requireLogin()) return;
    const id = Number(wishBtn.dataset.id);
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const idx = wishlist.findIndex((p) => p.id === id);
    if (idx > -1) {
      wishlist.splice(idx, 1);
      showToast("تم الحذف من المفضلة", "heart-crack");
    } else {
      wishlist.push({
        id: product.id,
        name: product.name,
        price: product.price,
        icon: product.icon,
        category: product.category,
        rating: product.rating,
        reviews: product.reviews,
        tag: product.tag,
      });
      showToast("تمت الإضافة إلى المفضلة", "heart");
    }
    saveWishlist();
    updateWishlistCount();
    const nowInWish = isInWishlist(id);
    const icon = wishBtn.querySelector("i");
    icon.classList.toggle("fa-regular", !nowInWish);
    icon.classList.toggle("fa-solid", nowInWish);
    if (wishBtn.classList.contains("wishlist-detail-btn")) {
      wishBtn.lastChild.textContent = nowInWish
        ? " In Wishlist"
        : " Add to Wishlist";
    }
    if (document.getElementById("wishlistContainer")) renderWishlistPage();
    return;
  }

  // ---- quantity +/- ----
  const qtyBtn = e.target.closest(".qty-btn");
  if (qtyBtn) {
    const id = Number(qtyBtn.dataset.id);
    const item = cart.find((p) => p.id === id);
    if (!item) return;
    if (qtyBtn.dataset.action === "inc") item.quantity++;
    else item.quantity--;
    if (item.quantity <= 0) cart = cart.filter((p) => p.id !== id);
    saveCart();
    updateCartCount();
    renderCartPage();
    return;
  }

  // ---- remove from cart ----
  const removeBtn = e.target.closest(".cart-remove-btn");
  if (removeBtn) {
    const id = Number(removeBtn.dataset.id);
    cart = cart.filter((p) => p.id !== id);
    saveCart();
    updateCartCount();
    showToast("تم حذف المنتج من السلة", "trash");
    renderCartPage();
    return;
  }
});

// ===== FEATURED PRODUCTS (home) =====
if (document.getElementById("featuredProducts")) {
  renderGrid("featuredProducts", products.slice(0, 4));
}

// ===== SHOP PAGE =====
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");
const resultCount = document.getElementById("resultCount");

function filterProducts() {
  let list = [...products];
  const search = (searchInput?.value || "").toLowerCase().trim();
  const category = categoryFilter?.value || "all";
  const sort = sortFilter?.value || "default";

  if (search) list = list.filter((p) => p.name.toLowerCase().includes(search));
  if (category !== "all") list = list.filter((p) => p.category === category);
  if (sort === "low") list.sort((a, b) => a.price - b.price);
  if (sort === "high") list.sort((a, b) => b.price - a.price);
  if (sort === "rating") list.sort((a, b) => b.rating - a.rating);

  if (resultCount) resultCount.textContent = list.length;
  renderGrid("productsContainer", list, "Try another search or category.");
}

if (document.getElementById("productsContainer")) {
  filterProducts();
  searchInput?.addEventListener("input", filterProducts);
  categoryFilter?.addEventListener("change", filterProducts);
  sortFilter?.addEventListener("change", filterProducts);
}

// ===== CATEGORY PAGE =====
if (document.getElementById("categoryProducts")) {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const categoryTitle = document.getElementById("categoryTitle");
  const categoryDescription = document.getElementById("categoryDescription");
  if (category) {
    categoryTitle.textContent = category;
    categoryDescription.textContent = `Discover the latest ${category.toLowerCase()} products at NOVA STORE.`;
    const filtered = products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase(),
    );
    renderGrid(
      "categoryProducts",
      filtered,
      "There are no products in this category yet.",
    );
  }
}

// ===== WISHLIST PAGE =====
function renderWishlistPage() {
  renderGrid(
    "wishlistContainer",
    wishlist,
    "Your wishlist is empty. Go add some products you love!",
  );

  const totalEl = document.getElementById("wishlistPageTotal");
  const orderBtn = document.getElementById("wishlistOrderNowBtn");
  if (!totalEl || !orderBtn) return;

  if (!wishlist.length) {
    totalEl.textContent = "$0.00";
    orderBtn.classList.add("disabled");
    return;
  }

  orderBtn.classList.remove("disabled");
  const total = wishlist.reduce((t, p) => t + p.price, 0);
  totalEl.textContent = `$${total.toFixed(2)}`;
}
if (document.getElementById("wishlistContainer")) renderWishlistPage();

// ===== CART PAGE =====
function renderCartPage() {
  const el = document.getElementById("cartPageItems");
  if (!el) return;
  const totalEl = document.getElementById("cartPageTotal");
  const orderBtn = document.getElementById("orderNowBtn");

  if (!cart.length) {
    el.innerHTML = `
            <div class="cart-empty">
                <i class="fa-solid fa-cart-shopping"></i>
                <h3>Your cart is empty</h3>
                <p>Add some products to see them here.</p>
            </div>`;
    if (totalEl) totalEl.textContent = "$0.00";
    orderBtn?.classList.add("disabled");
    return;
  }

  orderBtn?.classList.remove("disabled");
  let total = 0;
  el.innerHTML = cart
    .map((item) => {
      const lineTotal = item.price * item.quantity;
      total += lineTotal;
      return `
            <div class="cart-page-item">
                <div class="cart-page-item-icon">${productImg(item)}</div>
                <div class="cart-page-item-info">
                    <strong>${item.name}</strong>
                    <span>$${item.price.toFixed(2)} each</span>
                </div>
                <div class="qty-stepper">
                    <button class="qty-btn" data-id="${item.id}" data-action="dec">−</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" data-id="${item.id}" data-action="inc">+</button>
                </div>
                <button class="cart-remove-btn" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
            </div>`;
    })
    .join("");

  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}
if (document.getElementById("cartPageItems")) renderCartPage();

// ===== NEWSLETTER =====
const newsletterForm = document.getElementById("newsletterForm");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Thanks for subscribing!", "envelope-circle-check");
    newsletterForm.reset();
  });
}
// ===== SCROLL TO TOP BUTTON (auto-injected on every page) =====
(function () {
  const btn = document.createElement("button");
  btn.className = "scroll-top-btn";
  btn.setAttribute("aria-label", "Scroll to top");
  btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
  document.body.appendChild(btn);

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      btn.classList.add("show");
    } else {
      btn.classList.remove("show");
    }
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

// ===== PRODUCT DETAILS PAGE =====
if (document.getElementById("productDetails")) {
  const params = new URLSearchParams(window.location.search);
  const productId = Number(params.get("id"));
  const product = products.find((p) => p.id === productId);
  const container = document.getElementById("productDetails");

  if (!product) {
    container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;width:100%;padding:100px 20px;">
                <i class="fa-solid fa-box-open" style="font-size:60px;color:var(--primary);"></i>
                <h1 style="margin-top:20px;">Product Not Found</h1>
                <p style="color:var(--text-secondary);margin-top:10px;">This product doesn't exist or was removed.</p>
                <a href="shop.html" class="primary-btn" style="display:inline-flex;margin-top:25px;">
                    Back to Shop <i class="fa-solid fa-arrow-right"></i>
                </a>
            </div>`;
  } else {
    const inWish = isInWishlist(product.id);

    container.innerHTML = `
            <div class="product-detail-image">
                ${product.tag ? `<span class="product-tag ${product.tag === "SALE" ? "sale" : ""}">${product.tag}</span>` : ""}
                ${productImg(product, "product-detail-img", "")}
            </div>

            <div class="product-details-info">
                <a href="shop.html" class="back-home product-back-link">
                    <i class="fa-solid fa-arrow-left"></i> Back to Shop
                </a>

                <span class="product-category">${product.category}</span>
                <h1>${product.name}</h1>

                <div class="rating">
                    <i class="fa-solid fa-star"></i>
                    <span>${product.rating}</span>
                    <small>(${product.reviews} reviews)</small>
                </div>

                <div class="product-price">$${product.price.toFixed(2)}</div>

                <p class="product-description">${product.description || ""}</p>
                ${product.details ? `<p class="product-description"><strong>Details:</strong> ${product.details}</p>` : ""}

                <div class="product-actions">
                    <button class="primary-btn add-cart" data-id="${product.id}">
                        <i class="fa-solid fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="wishlist-detail-btn wishlist-btn" data-id="${product.id}">
                        <i class="fa-${inWish ? "solid" : "regular"} fa-heart"></i> ${inWish ? "In Wishlist" : "Add to Wishlist"}
                    </button>
                </div>
            </div>
        `;
  }
}

// ===== AUTO-INJECT CART & WISHLIST DRAWERS (works on every page) =====
(function () {
  const drawersHTML = `
        <div class="cart-drawer-overlay" id="cartDrawerOverlay">
            <aside class="cart-drawer" id="cartDrawer">
                <div class="cart-drawer-header">
                    <div><span>YOUR CART</span><h2>Shopping Cart</h2></div>
                    <button class="cart-drawer-close" id="cartDrawerClose" type="button"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="cart-drawer-items" id="cartDrawerItems"></div>
                <div class="cart-drawer-footer">
                    <div class="cart-drawer-total"><span>Total</span><strong id="cartDrawerTotal">$0.00</strong></div>
                    <a href="checkout.html?from=cart" class="primary-btn cart-drawer-checkout" id="drawerOrderNowBtn">Order Now <i class="fa-solid fa-arrow-right"></i></a>
                    <a href="cart.html" class="secondary-btn cart-drawer-view">View Full Cart</a>
                </div>
            </aside>
        </div>

        <div class="cart-drawer-overlay" id="wishlistDrawerOverlay">
            <aside class="cart-drawer" id="wishlistDrawer">
                <div class="cart-drawer-header">
                    <div><span>SAVED ITEMS</span><h2>Your Wishlist</h2></div>
                    <button class="cart-drawer-close" id="wishlistDrawerClose" type="button"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="cart-drawer-items" id="wishlistDrawerItems"></div>
                <div class="cart-drawer-footer">
                    <div class="cart-drawer-total"><span>Total</span><strong id="wishlistDrawerTotal">$0.00</strong></div>
                    <a href="checkout.html?from=wishlist" class="primary-btn cart-drawer-checkout" id="wishlistDrawerOrderNowBtn">Order Now <i class="fa-solid fa-arrow-right"></i></a>
                    <a href="wishlist.html" class="secondary-btn cart-drawer-view">View Wishlist</a>
                </div>
            </aside>
        </div>
    `;
  document.body.insertAdjacentHTML("beforeend", drawersHTML);

  const cartOverlay = document.getElementById("cartDrawerOverlay");
  const wishOverlay = document.getElementById("wishlistDrawerOverlay");

  function openDrawer(overlay) {
    overlay.classList.add("show");
  }
  function closeDrawer(overlay) {
    overlay.classList.remove("show");
  }

  function renderCartDrawer() {
    const itemsEl = document.getElementById("cartDrawerItems");
    const totalEl = document.getElementById("cartDrawerTotal");
    document
      .getElementById("drawerOrderNowBtn")
      .classList.toggle("disabled", !cart.length);
    if (!cart.length) {
      itemsEl.innerHTML = `<div class="cart-empty"><i class="fa-solid fa-cart-shopping"></i><h3>Cart is empty</h3></div>`;
      totalEl.textContent = "$0.00";
      return;
    }
    let total = 0;
    itemsEl.innerHTML = cart
      .map((item) => {
        const lineTotal = item.price * item.quantity;
        total += lineTotal;
        return `
                <div class="cart-drawer-item">
                    <div class="cart-drawer-item-icon">${productImg(item)}</div>
                    <div class="cart-drawer-item-info">
                        <strong>${item.name}</strong>
                        <span>${item.quantity} × $${item.price.toFixed(2)}</span>
                    </div>
                    <strong>$${lineTotal.toFixed(2)}</strong>
                </div>`;
      })
      .join("");
    totalEl.textContent = `$${total.toFixed(2)}`;
  }

  function renderWishlistDrawer() {
    const itemsEl = document.getElementById("wishlistDrawerItems");
    const totalEl = document.getElementById("wishlistDrawerTotal");
    document
      .getElementById("wishlistDrawerOrderNowBtn")
      .classList.toggle("disabled", !wishlist.length);
    if (!wishlist.length) {
      itemsEl.innerHTML = `<div class="cart-empty"><i class="fa-solid fa-heart"></i><h3>Wishlist is empty</h3></div>`;
      if (totalEl) totalEl.textContent = "$0.00";
      return;
    }
    let total = 0;
    itemsEl.innerHTML = wishlist
      .map((item) => {
        total += item.price;
        return `
            <div class="cart-drawer-item">
                <div class="cart-drawer-item-icon">${productImg(item)}</div>
                <div class="cart-drawer-item-info">
                    <strong>${item.name}</strong>
                    <span>$${item.price.toFixed(2)}</span>
                </div>
                <button class="add-cart" data-id="${item.id}" style="width:36px;height:36px;">
                    <i class="fa-solid fa-cart-plus"></i>
                </button>
            </div>`;
      })
      .join("");
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
  }

  // Open drawers from header icons
  document.addEventListener("click", (e) => {
    const cartIcon = e.target.closest('a[href="cart.html"].icon-btn');
    if (cartIcon && !location.pathname.endsWith("cart.html")) {
      e.preventDefault();
      renderCartDrawer();
      openDrawer(cartOverlay);
    }

    const wishIcon = e.target.closest('a[href="wishlist.html"].icon-btn');
    if (wishIcon && !location.pathname.endsWith("wishlist.html")) {
      e.preventDefault();
      renderWishlistDrawer();
      openDrawer(wishOverlay);
    }
  });

  document
    .getElementById("cartDrawerClose")
    .addEventListener("click", () => closeDrawer(cartOverlay));
  document
    .getElementById("wishlistDrawerClose")
    .addEventListener("click", () => closeDrawer(wishOverlay));

  [cartOverlay, wishOverlay].forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeDrawer(overlay);
    });
  });

  // Keep drawer content in sync whenever cart/wishlist changes
  document.addEventListener("click", (e) => {
    if (
      e.target.closest(".add-cart") ||
      e.target.closest(".wishlist-btn") ||
      e.target.closest(".cart-remove-btn") ||
      e.target.closest(".qty-btn")
    ) {
      setTimeout(() => {
        renderCartDrawer();
        renderWishlistDrawer();
      }, 0);
    }
  });
})();