document.addEventListener("DOMContentLoaded", () => {
  let productsData = [];
  let cart = [];

  async function loadProducts() {
    try {
      const response = await fetch("./data.json");
      productsData = await response.json();
      updateUI();
    } catch (error) {
      console.error("Error loading products:", error);
    }
  }

  function renderProducts() {
    const productList = document.querySelector(".Product-list");
    if (!productList) return;

    productList.innerHTML = productsData
      .map((product, index) => {
        const cartItem = cart.find((item) => item.name === product.name);
        const quantity = cartItem ? cartItem.quantity : 0;
        const isSelected = quantity > 0;

        return `
        <article class="Product-list-card ${isSelected ? "selected" : ""}">
          <picture>
            <source media="(min-width: 64em)" srcset="${product.image.desktop}">
            <source media="(min-width: 48em)" srcset="${product.image.tablet}">
            <img src="${product.image.mobile}" alt="${product.name}" class="image ${isSelected ? "active-border" : ""}">
          </picture>
          
          <div class="button-container">
            ${
              isSelected
                ? `
              <div class="cart-quantity-btn" role="group" aria-label="Adjust quantity for ${product.name}">
                <button type="button" class="btn-decrement" data-index="${index}" aria-label="Decrease quantity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none" viewBox="0 0 10 2"><path fill="#fff" d="M0 .375h10v1.25H0z"/></svg>
                </button>
                <span class="quantity-value">${quantity}</span>
                <button type="button" class="btn-increment" data-index="${index}" aria-label="Increase quantity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="#fff" d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25z"/></svg>
                </button>
              </div>
            `
                : `
              <button type="button" class="cart add-to-cart" data-index="${index}">
                <img src="assets/images/icon-add-to-cart.svg" alt="" class="cart-icon" aria-hidden="true">
                Add to Cart
              </button>
            `
            }
          </div>

          <p class="category">${product.category}</p>
          <h2>${product.name}</h2>
          <p class="price">$${product.price.toFixed(2)}</p>
        </article>
      `;
      })
      .join("");

    attachProductListeners();
  }

  function attachProductListeners() {
    document.querySelectorAll(".add-to-cart").forEach((button) => {
      button.addEventListener("click", (e) => {
        const index = e.currentTarget.dataset.index;
        addToCart(productsData[index]);
      });
    });

    document.querySelectorAll(".btn-increment").forEach((button) => {
      button.addEventListener("click", (e) => {
        const index = e.currentTarget.dataset.index;
        updateQuantity(productsData[index].name, 1);
      });
    });

    document.querySelectorAll(".btn-decrement").forEach((button) => {
      button.addEventListener("click", (e) => {
        const index = e.currentTarget.dataset.index;
        updateQuantity(productsData[index].name, -1);
      });
    });
  }

  function addToCart(product) {
    cart.push({ ...product, quantity: 1 });
    updateUI();
  }

  function updateQuantity(productName, change) {
    const item = cart.find((i) => i.name === productName);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
      cart = cart.filter((i) => i.name !== productName);
    }
    updateUI();
  }

  function removeFromCart(productName) {
    cart = cart.filter((item) => item.name !== productName);
    updateUI();
  }

  function renderCart() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const orderTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (cart.length === 0) {
      sidebar.innerHTML = `
        <h2>Your Cart (0)</h2>
        <img src="assets/images/illustration-empty-cart.svg" alt="" class="empty-cart-img" aria-hidden="true">
        <p class="empty-cart-text">Your added items will appear here</p>
      `;
      return;
    }

    const itemsHTML = cart
      .map(
        (item) => `
      <div class="cart-item">
        <div class="cart-item-details">
          <p class="cart-item-title">${item.name}</p>
          <div class="cart-item-pricing">
            <span class="cart-item-qty">${item.quantity}x</span>
            <span class="cart-item-unit">@ $${item.price.toFixed(2)}</span>
            <span class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        </div>
        <button type="button" class="remove-item-btn" data-name="${item.name}" aria-label="Remove ${item.name} from cart">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="#CAAFA7" d="M8.375 9.375 5 6 1.625 9.375l-.999-.999L3.999 5 .626 1.625l.999-.999L5 3.999 8.375.626l.999.999L5.999 5l3.375 3.376-.999.999z"/></svg>
        </button>
      </div>
    `
      )
      .join("");

    sidebar.innerHTML = `
      <h2>Your Cart (${totalItems})</h2>
      <div class="cart-items-list">${itemsHTML}</div>
      <div class="order-total-container">
        <span>Order Total</span>
        <span class="order-total-price">$${orderTotal.toFixed(2)}</span>
      </div>
      <div class="carbon-neutral-notice">
        <img src="assets/images/icon-carbon-neutral.svg" alt="" aria-hidden="true">
        <p>This is a <b>carbon-neutral</b> delivery</p>
      </div>
      <button type="button" class="confirm-order-btn">Confirm Order</button>
    `;

    document.querySelectorAll(".remove-item-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const name = e.currentTarget.dataset.name;
        removeFromCart(name);
      });
    });

    document.querySelector(".confirm-order-btn")?.addEventListener("click", showConfirmationModal);
  }

  function showConfirmationModal() {
    const orderTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const modalHTML = `
      <div class="modal-overlay" id="modal-overlay" role="dialog" aria-modal="true">
        <div class="modal-content">
          <img src="assets/images/icon-order-confirmed.svg" alt="" class="modal-icon" aria-hidden="true">
          <h2>Order Confirmed</h2>
          <p class="modal-subtitle">We hope you enjoy your food!</p>
          
          <div class="modal-summary-box">
            ${cart
              .map(
                (item) => `
              <div class="modal-item">
                <img src="${item.image.thumbnail}" alt="" class="modal-thumb" aria-hidden="true">
                <div class="modal-item-info">
                  <p class="modal-item-name">${item.name}</p>
                  <p><span class="modal-qty">${item.quantity}x</span> <span class="modal-unit">@ $${item.price.toFixed(2)}</span></p>
                </div>
                <span class="modal-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `
              )
              .join("")}
            <div class="modal-total-row">
              <span>Order Total</span>
              <span class="modal-total-price">$${orderTotal.toFixed(2)}</span>
            </div>
          </div>

          <button type="button" class="reset-order-btn" id="start-new-order">Start New Order</button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    document.body.style.overflow = "hidden";

    document.getElementById("start-new-order").addEventListener("click", () => {
      cart = [];
      document.getElementById("modal-overlay").remove();
      document.body.style.overflow = "auto";
      updateUI();
    });
  }

  function updateUI() {
    renderProducts();
    renderCart();
  }

  loadProducts();
});
