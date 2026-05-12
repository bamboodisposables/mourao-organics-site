/* ================================================================
   MOURÃO Organics — Cart System
   Handles cart state, drawer UI, and checkout page rendering
   ================================================================ */
(function () {
  'use strict';

  /* ── Product catalog ──────────────────────────────────────────── */
  var CATALOG = {
    'tallowcreme': {
      name: 'Tallowcrème',
      category: 'MOURÃO balm',
      image: 'assets/mourao-product-tallowcreme-card.jpg',
      url: 'product.html',
      formulas: ['Original', 'Calming', 'Sensitive'],
      sizes: [
        { label: '120 ml', desc: 'Meest gekozen', price: 39 },
        { label: '60 ml',  desc: 'Starter size',  price: 29 }
      ]
    },
    'gezichtscreme': {
      name: 'Gezichtscrème',
      category: 'MOURÃO face',
      image: 'assets/mourao-product-gezichtscreme-card.jpg',
      url: 'gezichtscreme.html',
      formulas: ['Daily', 'Rich', 'Sensitive'],
      sizes: [
        { label: '50 ml', desc: 'Dagelijks formaat', price: 24 },
        { label: '30 ml', desc: 'Starter size',      price: 18 }
      ]
    },
    'calming-skin-balm': {
      name: 'Calming Skin Balm',
      category: 'MOURÃO rescue',
      image: 'assets/mourao-product-calming-skin-balm-card.jpg',
      url: 'calming-skin-balm.html',
      formulas: ['Spot Balm', 'Overnight', 'Barrier'],
      sizes: [
        { label: '60 ml', desc: 'Volledige routine', price: 27 },
        { label: '25 ml', desc: 'Gerichte care',     price: 19 }
      ]
    },
    'bodylotion': {
      name: 'Bodylotion',
      category: 'MOURÃO body',
      image: 'assets/mourao-product-bodylotion-card.jpg',
      url: 'bodylotion.html',
      formulas: ['Daily Soft', 'Extra Nourish', 'Unscented'],
      sizes: [
        { label: '250 ml', desc: 'Volledig formaat',  price: 22 },
        { label: '100 ml', desc: 'Reisvriendelijk',   price: 15 }
      ]
    },
    'handcreme': {
      name: 'Handcrème',
      category: 'MOURÃO hands',
      image: 'assets/mourao-product-handcreme-card.jpg',
      url: 'handcreme.html',
      formulas: ['Everyday', 'Rich Rescue', 'On The Go'],
      sizes: [
        { label: '75 ml', desc: 'Volledig formaat', price: 16 },
        { label: '30 ml', desc: 'Tasformaat',       price: 11 }
      ]
    },
    'lipbalm': {
      name: 'Lipbalm',
      category: 'MOURÃO lips',
      image: 'assets/mourao-product-lipbalm-card.jpg',
      url: 'lipbalm.html',
      formulas: ['Bare', 'Soft Shine', 'Night Repair'],
      sizes: [
        { label: '15 ml',   desc: 'Dagelijks formaat', price: 12 },
        { label: 'Mini duo', desc: '2 × 7 ml',         price: 14 }
      ]
    }
  };

  /* ── Cart storage ─────────────────────────────────────────────── */
  var Cart = {
    get: function () {
      try { return JSON.parse(localStorage.getItem('mourao_cart') || '[]'); }
      catch (e) { return []; }
    },
    save: function (items) {
      localStorage.setItem('mourao_cart', JSON.stringify(items));
      Cart._notify();
    },
    add: function (productId, formula, sizeLabel, price) {
      var items = Cart.get();
      var key = productId + '|' + formula + '|' + sizeLabel;
      var existing = null;
      for (var i = 0; i < items.length; i++) {
        if (items[i].key === key) { existing = items[i]; break; }
      }
      if (existing) {
        existing.qty += 1;
      } else {
        var product = CATALOG[productId] || {};
        items.push({
          key: key,
          productId: productId,
          name: product.name || productId,
          formula: formula,
          size: sizeLabel,
          price: price,
          qty: 1,
          image: product.image || '',
          url: product.url || '#'
        });
      }
      Cart.save(items);
    },
    updateQty: function (key, delta) {
      var items = Cart.get();
      for (var i = 0; i < items.length; i++) {
        if (items[i].key === key) {
          items[i].qty = Math.max(0, items[i].qty + delta);
        }
      }
      Cart.save(items.filter(function (x) { return x.qty > 0; }));
    },
    remove: function (key) {
      Cart.save(Cart.get().filter(function (x) { return x.key !== key; }));
    },
    total: function () {
      return Cart.get().reduce(function (s, x) { return s + x.price * x.qty; }, 0);
    },
    count: function () {
      return Cart.get().reduce(function (s, x) { return s + x.qty; }, 0);
    },
    clear: function () { Cart.save([]); },
    _notify: function () {
      CartUI.updateBadge();
      CartUI.renderItems();
    }
  };

  /* ── Cart UI (drawer + badge) ─────────────────────────────────── */
  var CartUI = {
    _drawer: null,
    _overlay: null,
    _badge: null,

    init: function () {
      CartUI._injectDrawer();
      CartUI._injectHeaderBtn();
      CartUI.updateBadge();
    },

    _injectHeaderBtn: function () {
      var meta = document.querySelector('.mourao-header-meta');
      if (!meta) return;
      var btn = document.createElement('button');
      btn.className = 'mourao-cart-btn';
      btn.setAttribute('aria-label', 'Winkelwagen openen');
      btn.innerHTML =
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>' +
        '<span class="mourao-cart-badge" aria-live="polite"></span>';
      btn.addEventListener('click', CartUI.open);
      meta.insertBefore(btn, meta.firstChild);
      CartUI._badge = btn.querySelector('.mourao-cart-badge');
    },

    _injectDrawer: function () {
      var overlay = document.createElement('div');
      overlay.className = 'mourao-cart-overlay';
      overlay.addEventListener('click', CartUI.close);
      document.body.appendChild(overlay);
      CartUI._overlay = overlay;

      var drawer = document.createElement('aside');
      drawer.className = 'mourao-cart-drawer';
      drawer.setAttribute('aria-label', 'Winkelwagen');
      drawer.setAttribute('role', 'dialog');
      drawer.innerHTML =
        '<div class="mourao-cart-drawer__header">' +
          '<h2 class="mourao-cart-drawer__title">Winkelwagen</h2>' +
          '<button class="mourao-cart-drawer__close" aria-label="Sluiten">&#x2715;</button>' +
        '</div>' +
        '<div class="mourao-cart-drawer__body"></div>' +
        '<div class="mourao-cart-drawer__footer">' +
          '<div class="mourao-cart-summary">' +
            '<span>Subtotaal</span>' +
            '<span class="mourao-cart-total"></span>' +
          '</div>' +
          '<p class="mourao-cart-shipping-note"></p>' +
          '<a href="checkout.html" class="mourao-button mourao-button--full mourao-cart-checkout-btn">Naar checkout</a>' +
        '</div>';
      drawer.querySelector('.mourao-cart-drawer__close').addEventListener('click', CartUI.close);

      // Single delegated listener on the body — set up once here, not on every renderItems()
      var body = drawer.querySelector('.mourao-cart-drawer__body');
      body.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-action]');
        if (btn) {
          Cart.updateQty(btn.getAttribute('data-key'), btn.getAttribute('data-action') === 'inc' ? 1 : -1);
          return;
        }
        var rem = e.target.closest('.mourao-cart-item__remove');
        if (rem) Cart.remove(rem.getAttribute('data-key'));
      });

      document.body.appendChild(drawer);
      CartUI._drawer = drawer;
    },

    open: function () {
      CartUI._drawer.classList.add('is-open');
      CartUI._overlay.classList.add('is-open');
      document.body.classList.add('mourao-cart-open');
      CartUI.renderItems();
    },

    close: function () {
      CartUI._drawer.classList.remove('is-open');
      CartUI._overlay.classList.remove('is-open');
      document.body.classList.remove('mourao-cart-open');
    },

    updateBadge: function () {
      if (!CartUI._badge) {
        CartUI._badge = document.querySelector('.mourao-cart-badge');
      }
      var count = Cart.count();
      if (!CartUI._badge) return;
      CartUI._badge.textContent = count > 0 ? count : '';
      CartUI._badge.classList.toggle('is-visible', count > 0);
    },

    renderItems: function () {
      var body = CartUI._drawer && CartUI._drawer.querySelector('.mourao-cart-drawer__body');
      if (!body) return;
      var items = Cart.get();
      var total = Cart.total();

      if (items.length === 0) {
        body.innerHTML =
          '<div class="mourao-cart-empty">' +
            '<p>Je winkelwagen is leeg.</p>' +
            '<a href="index.html#producten" class="mourao-inline-link">Bekijk collectie</a>' +
          '</div>';
      } else {
        body.innerHTML = items.map(function (item) {
          return (
            '<div class="mourao-cart-item" data-key="' + esc(item.key) + '">' +
              '<div class="mourao-cart-item__img" style="--cart-img:url(\'../' + esc(item.image) + '\')"></div>' +
              '<div class="mourao-cart-item__info">' +
                '<p class="mourao-cart-item__name">' + esc(item.name) + '</p>' +
                '<p class="mourao-cart-item__meta">' + esc(item.formula) + ' · ' + esc(item.size) + '</p>' +
                '<div class="mourao-cart-item__row">' +
                  '<div class="mourao-cart-qty">' +
                    '<button class="mourao-cart-qty__btn" data-action="dec" data-key="' + esc(item.key) + '" aria-label="Minder">−</button>' +
                    '<span class="mourao-cart-qty__val">' + item.qty + '</span>' +
                    '<button class="mourao-cart-qty__btn" data-action="inc" data-key="' + esc(item.key) + '" aria-label="Meer">+</button>' +
                  '</div>' +
                  '<span class="mourao-cart-item__price">€' + (item.price * item.qty) + '</span>' +
                '</div>' +
              '</div>' +
              '<button class="mourao-cart-item__remove" data-key="' + esc(item.key) + '" aria-label="Verwijderen">&#x2715;</button>' +
            '</div>'
          );
        }).join('');
      }

      // Update total
      var totalEl = CartUI._drawer.querySelector('.mourao-cart-total');
      if (totalEl) totalEl.textContent = '€' + total;

      // Shipping note
      var note = CartUI._drawer.querySelector('.mourao-cart-shipping-note');
      if (note) {
        if (total === 0) {
          note.textContent = '';
        } else if (total < 30) {
          note.textContent = '€' + (30 - total) + ' meer voor gratis verzending.';
        } else {
          note.textContent = '✓ Gratis verzending van toepassing.';
        }
      }

      // Checkout btn
      var checkoutBtn = CartUI._drawer.querySelector('.mourao-cart-checkout-btn');
      if (checkoutBtn) {
        checkoutBtn.style.display = items.length === 0 ? 'none' : '';
        // Make checkout link relative to current page depth
        var isRoot = window.location.pathname.split('/').filter(Boolean).length <= 1 ||
                     window.location.pathname.endsWith('.html') &&
                     window.location.pathname.split('/').length <= 2;
        checkoutBtn.href = 'checkout.html';
      }

    }
  };

  /* ── Product page: option selection + add-to-cart ─────────────── */
  var ProductPage = {
    productId: null,
    selectedFormula: null,
    selectedSize: null,
    selectedPrice: null,

    init: function (productId) {
      ProductPage.productId = productId;
      var product = CATALOG[productId];
      if (!product) return;

      // Set defaults to first option
      ProductPage.selectedFormula = product.formulas[0];
      ProductPage.selectedSize = product.sizes[0].label;
      ProductPage.selectedPrice = product.sizes[0].price;

      // Make formula options interactive
      var formulaList = document.querySelector('.mourao-option-list:not(.mourao-option-list--sizes)');
      if (formulaList) {
        var formulaOpts = formulaList.querySelectorAll('.mourao-option');
        formulaOpts.forEach(function (opt, i) {
          opt.style.cursor = 'pointer';
          opt.setAttribute('tabindex', '0');
          opt.setAttribute('role', 'radio');
          opt.setAttribute('aria-checked', i === 0 ? 'true' : 'false');
          if (i === 0) opt.classList.add('mourao-option--selected');
          opt.addEventListener('click', function () {
            formulaOpts.forEach(function (o) {
              o.classList.remove('mourao-option--selected');
              o.setAttribute('aria-checked', 'false');
            });
            opt.classList.add('mourao-option--selected');
            opt.setAttribute('aria-checked', 'true');
            ProductPage.selectedFormula = product.formulas[i];
          });
          opt.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opt.click(); }
          });
        });
      }

      // Make size options interactive
      var sizeList = document.querySelector('.mourao-option-list--sizes');
      if (sizeList) {
        var sizeOpts = sizeList.querySelectorAll('.mourao-option');
        sizeOpts.forEach(function (opt, i) {
          opt.style.cursor = 'pointer';
          opt.setAttribute('tabindex', '0');
          opt.setAttribute('role', 'radio');
          opt.setAttribute('aria-checked', i === 0 ? 'true' : 'false');
          if (i === 0) opt.classList.add('mourao-option--selected');
          opt.addEventListener('click', function () {
            sizeOpts.forEach(function (o) {
              o.classList.remove('mourao-option--selected');
              o.setAttribute('aria-checked', 'false');
            });
            opt.classList.add('mourao-option--selected');
            opt.setAttribute('aria-checked', 'true');
            ProductPage.selectedSize = product.sizes[i].label;
            ProductPage.selectedPrice = product.sizes[i].price;
          });
          opt.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opt.click(); }
          });
        });
      }

      // Wire up "Voeg toe" button
      var addBtn = document.querySelector('.mourao-button--full:not(.mourao-button--sticky)');
      if (addBtn) {
        addBtn.removeAttribute('href');
        addBtn.tagName === 'A' && (addBtn.outerHTML = addBtn.outerHTML.replace(/^<a/, '<button').replace(/<\/a>$/, '</button>'));
        // Re-query after possible replacement
        addBtn = document.querySelector('.mourao-button--full:not(.mourao-button--sticky)');
        addBtn.addEventListener('click', function (e) {
          e.preventDefault();
          Cart.add(
            ProductPage.productId,
            ProductPage.selectedFormula,
            ProductPage.selectedSize,
            ProductPage.selectedPrice
          );
          CartUI.open();
          ProductPage._pulseButton(addBtn);
        });
      }

      // Wire up sticky bar button
      var stickyBtn = document.querySelector('.mourao-button--sticky');
      if (stickyBtn) {
        stickyBtn.removeAttribute('href');
        stickyBtn.addEventListener('click', function (e) {
          e.preventDefault();
          Cart.add(
            ProductPage.productId,
            ProductPage.selectedFormula,
            ProductPage.selectedSize,
            ProductPage.selectedPrice
          );
          CartUI.open();
        });
      }
    },

    _pulseButton: function (btn) {
      btn.textContent = '✓ Toegevoegd';
      btn.classList.add('mourao-btn--added');
      setTimeout(function () {
        btn.textContent = 'Voeg toe aan routine';
        btn.classList.remove('mourao-btn--added');
      }, 1800);
    }
  };

  /* ── Checkout page ────────────────────────────────────────────── */
  var CheckoutPage = {
    init: function () {
      CheckoutPage._renderSummary();
      CheckoutPage._bindForm();
    },

    _renderSummary: function () {
      var items = Cart.get();
      var container = document.getElementById('checkout-items');
      var totalEl = document.getElementById('checkout-total');
      var shippingEl = document.getElementById('checkout-shipping');
      var orderTotalEl = document.getElementById('checkout-order-total');
      if (!container) return;

      if (items.length === 0) {
        container.innerHTML = '<p style="color:rgba(61,43,33,.56);font-size:.9rem;">Je winkelwagen is leeg. <a href="index.html#producten" class="mourao-inline-link">Ga terug naar de shop.</a></p>';
      } else {
        container.innerHTML = items.map(function (item) {
          return (
            '<div class="checkout-item">' +
              '<div class="checkout-item__img" style="--cart-img:url(\'' + esc(item.image) + '\')"></div>' +
              '<div class="checkout-item__info">' +
                '<p class="checkout-item__name">' + esc(item.name) + '</p>' +
                '<p class="checkout-item__meta">' + esc(item.formula) + ' · ' + esc(item.size) + '</p>' +
                '<p class="checkout-item__qty">Aantal: ' + item.qty + '</p>' +
              '</div>' +
              '<span class="checkout-item__price">€' + (item.price * item.qty) + '</span>' +
            '</div>'
          );
        }).join('');
      }

      var subtotal = Cart.total();
      var shipping = subtotal >= 30 || subtotal === 0 ? 0 : 4.95;
      var orderTotal = subtotal + shipping;

      if (totalEl) totalEl.textContent = '€' + subtotal.toFixed(2).replace('.', ',');
      if (shippingEl) shippingEl.textContent = shipping === 0 ? (subtotal === 0 ? '—' : 'Gratis') : '€' + shipping.toFixed(2).replace('.', ',');
      if (orderTotalEl) orderTotalEl.textContent = '€' + orderTotal.toFixed(2).replace('.', ',');
    },

    _bindForm: function () {
      var form = document.getElementById('checkout-form');
      if (!form) return;
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        CheckoutPage._showSuccess();
      });
    },

    _showSuccess: function () {
      var page = document.querySelector('.checkout-page');
      if (!page) return;
      var name = document.getElementById('checkout-firstname');
      var first = name ? name.value.split(' ')[0] : '';
      Cart.clear();
      page.innerHTML =
        '<div class="checkout-success">' +
          '<div class="checkout-success__icon">✓</div>' +
          '<h1 class="checkout-success__title">Bedankt' + (first ? ', ' + esc(first) + '!' : '!') + '</h1>' +
          '<p class="checkout-success__text">Je bestelling is ontvangen en wordt zo snel mogelijk verwerkt. Je ontvangt een bevestiging per e-mail.</p>' +
          '<p class="checkout-success__note">Voor 21:00 besteld? Dan verwerken we je bestelling meestal dezelfde dag nog.</p>' +
          '<a href="index.html" class="mourao-button">Terug naar de shop</a>' +
        '</div>';
    }
  };

  /* ── Utilities ────────────────────────────────────────────────── */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ── Bootstrap ────────────────────────────────────────────────── */
  function init() {
    var path = window.location.pathname;
    var isCheckout = path.includes('checkout');

    if (!isCheckout) {
      CartUI.init();
    }

    // Detect product page by data attribute
    var productEl = document.querySelector('[data-product-id]');
    if (productEl) {
      ProductPage.init(productEl.getAttribute('data-product-id'));
    }

    if (isCheckout) {
      CheckoutPage.init();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
