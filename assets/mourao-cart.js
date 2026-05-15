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
      name: 'Calendula Lip Balm',
      category: 'MOURÃO lips',
      image: 'assets/mourao-product-lipbalm-card.jpg',
      url: 'lipbalm.html',
      formulas: ['Calendula', 'Protect', 'Nourish'],
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
      if (CheckoutPage.isActive()) {
        CheckoutPage.renderSummary();
      }
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
          '<div class="mourao-cart-drawer__actions">' +
            '<a href="checkout.html" class="mourao-button mourao-button--full mourao-cart-checkout-btn">Veilig afrekenen</a>' +
            '<button type="button" class="mourao-cart-continue-btn">Verder winkelen</button>' +
          '</div>' +
          '<p class="mourao-cart-trust-note">30 dagen rustig proberen · Gratis verzending vanaf €30</p>' +
        '</div>';
      drawer.querySelector('.mourao-cart-drawer__close').addEventListener('click', CartUI.close);
      drawer.querySelector('.mourao-cart-continue-btn').addEventListener('click', CartUI.close);

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
            '<p>Je winkelwagen is nog leeg.</p>' +
            '<p>Kies eerst een product dat past bij je routine.</p>' +
            '<a href="index.html#producten" class="mourao-inline-link">Bekijk collectie</a>' +
          '</div>';
      } else {
        body.innerHTML = items.map(function (item) {
          return (
            '<div class="mourao-cart-item" data-key="' + esc(item.key) + '">' +
              '<div class="mourao-cart-item__img" style="--cart-img:url(\'' + esc(assetUrl(item.image)) + '\')"></div>' +
              '<div class="mourao-cart-item__info">' +
                '<p class="mourao-cart-item__name">' + esc(item.name) + '</p>' +
                '<p class="mourao-cart-item__meta">' + esc(item.formula) + ' · ' + esc(item.size) + '</p>' +
                '<div class="mourao-cart-item__row">' +
                  '<div class="mourao-cart-qty">' +
                    '<button class="mourao-cart-qty__btn" data-action="dec" data-key="' + esc(item.key) + '" aria-label="Minder">−</button>' +
                    '<span class="mourao-cart-qty__val">' + item.qty + '</span>' +
                    '<button class="mourao-cart-qty__btn" data-action="inc" data-key="' + esc(item.key) + '" aria-label="Meer">+</button>' +
                  '</div>' +
                  '<span class="mourao-cart-item__price">' + formatMoney(item.price * item.qty) + '</span>' +
                '</div>' +
              '</div>' +
              '<button class="mourao-cart-item__remove" data-key="' + esc(item.key) + '" aria-label="Verwijderen">&#x2715;</button>' +
            '</div>'
          );
        }).join('');
      }

      // Update total
      var totalEl = CartUI._drawer.querySelector('.mourao-cart-total');
      if (totalEl) totalEl.textContent = formatMoney(total);

      // Shipping note
      var note = CartUI._drawer.querySelector('.mourao-cart-shipping-note');
      if (note) {
        if (total === 0) {
          note.textContent = '';
        } else if (total < 30) {
          note.textContent = formatMoney(30 - total) + ' meer voor gratis verzending.';
        } else {
          note.textContent = '✓ Gratis verzending van toepassing.';
        }
      }

      // Checkout btn
      var checkoutBtn = CartUI._drawer.querySelector('.mourao-cart-checkout-btn');
      if (checkoutBtn) {
        checkoutBtn.style.display = items.length === 0 ? 'none' : '';
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
            ProductPage._updateStickySummary();
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
            ProductPage._updateStickySummary();
          });
          opt.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opt.click(); }
          });
        });
      }

      ProductPage._updateStickySummary();

      // Wire up "Voeg toe" button
      var addBtn = document.querySelector('.mourao-button--full:not(.mourao-button--sticky):not(.mourao-direct-checkout)');
      if (addBtn) {
        addBtn = ProductPage._upgradeToButton(addBtn);
        addBtn.addEventListener('click', function (e) {
          e.preventDefault();
          ProductPage._addCurrentSelection();
          ProductPage._pulseButton(addBtn);
          CartUI.open();
        });
      }

      var directBtn = document.querySelector('.mourao-direct-checkout');
      if (directBtn) {
        directBtn.addEventListener('click', function (e) {
          e.preventDefault();
          ProductPage._addCurrentSelection();
          window.location.href = 'checkout.html';
        });
      }

      // Wire up sticky bar button
      var stickyBtn = document.querySelector('.mourao-button--sticky');
      if (stickyBtn) {
        stickyBtn.removeAttribute('href');
        stickyBtn.addEventListener('click', function (e) {
          e.preventDefault();
          ProductPage._addCurrentSelection();
          ProductPage._pulseButton(stickyBtn, 'Toegevoegd');
          CartUI.open();
        });
      }
    },

    _addCurrentSelection: function () {
      Cart.add(
        ProductPage.productId,
        ProductPage.selectedFormula,
        ProductPage.selectedSize,
        ProductPage.selectedPrice
      );
    },

    _upgradeToButton: function (el) {
      if (!el || el.tagName !== 'A') return el;
      var button = document.createElement('button');
      button.type = 'button';
      button.id = el.id;
      button.className = el.className;
      button.innerHTML = el.innerHTML;
      if (el.getAttribute('style')) {
        button.setAttribute('style', el.getAttribute('style'));
      }
      el.replaceWith(button);
      return button;
    },

    _updateStickySummary: function () {
      var product = CATALOG[ProductPage.productId];
      if (!product) return;
      var nameEl = document.querySelector('.mourao-sticky-bar__name');
      var priceEl = document.querySelector('.mourao-sticky-bar__price');
      if (nameEl) {
        nameEl.textContent = product.name + ' ' + ProductPage.selectedFormula;
      }
      if (priceEl) {
        priceEl.textContent = formatMoney(ProductPage.selectedPrice) + ' · ' + ProductPage.selectedSize;
      }
    },

    _pulseButton: function (btn, label) {
      var original = btn.getAttribute('data-default-label') || btn.textContent;
      if (!btn.getAttribute('data-default-label')) {
        btn.setAttribute('data-default-label', original);
      }
      btn.textContent = '✓ ' + (label || 'Toegevoegd');
      btn.classList.add('mourao-btn--added');
      setTimeout(function () {
        btn.textContent = btn.getAttribute('data-default-label') || original;
        btn.classList.remove('mourao-btn--added');
      }, 1800);
    }
  };

  /* ── Checkout page ────────────────────────────────────────────── */
  var CheckoutPage = {
    _discountPercent: 0,
    _discountApplied: false,

    isActive: function () {
      return !!document.querySelector('.checkout-body');
    },

    init: function () {
      CheckoutPage._bindEvents();
      CheckoutPage._syncFieldState();
      CheckoutPage._updatePaymentState();
      CheckoutPage.renderSummary();
      CheckoutPage._bindForm();
    },

    _bindEvents: function () {
      var itemsWrap = document.getElementById('co-items');
      if (itemsWrap) {
        itemsWrap.addEventListener('click', function (event) {
          var actionBtn = event.target.closest('[data-checkout-action]');
          if (!actionBtn) return;
          var key = actionBtn.getAttribute('data-key');
          var action = actionBtn.getAttribute('data-checkout-action');
          if (action === 'remove') {
            Cart.remove(key);
            return;
          }
          Cart.updateQty(key, action === 'inc' ? 1 : -1);
        });
      }

      var summaryToggle = document.getElementById('summary-toggle');
      var summaryBody = document.getElementById('summary-body');
      if (summaryToggle && summaryBody) {
        summaryToggle.addEventListener('click', function () {
          var open = summaryBody.classList.toggle('is-open');
          summaryToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      }

      document.querySelectorAll('input[name="shipping"]').forEach(function (input) {
        input.addEventListener('change', function () {
          CheckoutPage.renderSummary();
        });
      });

      document.querySelectorAll('input[name="payment"]').forEach(function (input) {
        input.addEventListener('change', function () {
          CheckoutPage._updatePaymentState();
        });
      });

      document.querySelectorAll('[data-express-method]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          CheckoutPage._handleExpressCheckout(btn.getAttribute('data-express-method'));
        });
      });

      var discountBtn = document.getElementById('discount-apply');
      if (discountBtn) {
        discountBtn.addEventListener('click', CheckoutPage._applyDiscount);
      }
      var discountInput = document.getElementById('discount-input');
      if (discountInput) {
        discountInput.addEventListener('keydown', function (event) {
          if (event.key === 'Enter') {
            event.preventDefault();
            CheckoutPage._applyDiscount();
          }
        });
      }

      document.querySelectorAll('.co-field input, .co-field select').forEach(function (field) {
        var handler = function () {
          var wrapper = field.closest('.co-field');
          if (!wrapper) return;
          var hasValue = field.tagName === 'SELECT' ? !!field.value : !!field.value.trim();
          wrapper.classList.toggle('has-value', hasValue);
        };
        field.addEventListener('input', handler);
        field.addEventListener('change', handler);
      });
    },

    renderSummary: function () {
      var items = Cart.get();
      var container = document.getElementById('co-items') || document.getElementById('checkout-items');
      var subtotalEl = document.getElementById('co-subtotal') || document.getElementById('checkout-total');
      var shippingEl = document.getElementById('co-shipping-cost') || document.getElementById('checkout-shipping');
      var orderTotalEl = document.getElementById('co-total') || document.getElementById('checkout-order-total');
      var togglePriceEl = document.getElementById('summary-toggle-price');
      var summaryNoteEl = document.getElementById('co-summary-note');
      var discountRow = document.getElementById('co-discount-row');
      var discountAmountEl = document.getElementById('co-discount-amount');
      if (!container) return;

      if (items.length === 0) {
        container.innerHTML =
          '<div class="co-empty-state">' +
            '<p>Je winkelwagen is leeg.</p>' +
            '<a href="index.html#producten" class="mourao-inline-link">Bekijk producten</a>' +
          '</div>';
      } else {
        container.innerHTML = items.map(function (item) {
          return (
            '<div class="co-item" data-key="' + esc(item.key) + '">' +
              '<div class="co-item__img-wrap">' +
                '<div class="co-item__img" style="--img:url(\'' + esc(assetUrl(item.image)) + '\')"></div>' +
                '<span class="co-item__qty-badge">' + item.qty + '</span>' +
              '</div>' +
              '<div class="co-item__info">' +
                '<div class="co-item__name">' + esc(item.name) + '</div>' +
                '<div class="co-item__variant">' + esc(item.formula) + ' · ' + esc(item.size) + '</div>' +
                '<div class="co-item__bottom">' +
                  '<div class="co-item-qty">' +
                    '<button class="co-item-qty__btn" type="button" data-checkout-action="dec" data-key="' + esc(item.key) + '" aria-label="Minder">−</button>' +
                    '<span class="co-item-qty__val">' + item.qty + '</span>' +
                    '<button class="co-item-qty__btn" type="button" data-checkout-action="inc" data-key="' + esc(item.key) + '" aria-label="Meer">+</button>' +
                  '</div>' +
                  '<span class="co-item__price">' + formatMoney(item.price * item.qty) + '</span>' +
                  '<button class="co-item__remove" type="button" data-checkout-action="remove" data-key="' + esc(item.key) + '">Verwijderen</button>' +
                '</div>' +
              '</div>' +
            '</div>'
          );
        }).join('');
      }

      var subtotal = Cart.total();
      var discountAmount = CheckoutPage._discountApplied ? subtotal * CheckoutPage._discountPercent : 0;
      var discountedSubtotal = Math.max(0, subtotal - discountAmount);
      var shipping = CheckoutPage._shippingCost(subtotal);
      var orderTotal = discountedSubtotal + shipping;

      if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal);
      if (shippingEl) {
        shippingEl.textContent = shipping === 0 ? (subtotal === 0 ? '—' : 'Gratis') : formatMoney(shipping);
        shippingEl.className = shipping === 0 && subtotal > 0 ? 'co-totals__free' : '';
      }
      if (orderTotalEl) orderTotalEl.textContent = formatMoney(orderTotal);
      if (togglePriceEl) togglePriceEl.textContent = items.length ? formatMoney(orderTotal) : '—';
      if (discountRow && discountAmountEl) {
        discountRow.style.display = discountAmount > 0 ? 'flex' : 'none';
        discountAmountEl.textContent = discountAmount > 0 ? '−' + formatMoney(discountAmount).slice(1) : '';
      }
      if (summaryNoteEl) {
        if (subtotal === 0) {
          summaryNoteEl.textContent = 'Kleine batches, snel en rustig geleverd vanuit Nederland.';
        } else if (shipping === 0 && CheckoutPage._selectedShipping() === 'standard') {
          summaryNoteEl.textContent = 'Gratis standaardverzending is actief op deze bestelling.';
        } else if (subtotal < 30) {
          summaryNoteEl.textContent = formatMoney(30 - subtotal) + ' meer voor gratis standaardverzending.';
        } else {
          summaryNoteEl.textContent = 'Kies de verzendmethode die het best past bij je routine.';
        }
      }

      var standardPrice = document.getElementById('standard-price');
      if (standardPrice) {
        standardPrice.textContent = subtotal >= 30 && subtotal > 0 ? 'Gratis' : '€4,95';
        standardPrice.classList.toggle('is-free', subtotal >= 30 && subtotal > 0);
      }

      var pickupPrice = document.getElementById('pickup-price');
      if (pickupPrice) {
        pickupPrice.textContent = '€3,95';
      }

      CheckoutPage._setCheckoutEnabled(items.length > 0);
    },

    _bindForm: function () {
      var form = document.getElementById('checkout-form');
      if (!form) return;
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (Cart.count() === 0) return;
        CheckoutPage._showSuccess();
      });
    },

    _showSuccess: function () {
      var page = document.getElementById('co-main') || document.querySelector('.checkout-page');
      if (!page) return;
      var name = document.getElementById('co-firstname') || document.getElementById('checkout-firstname');
      var email = document.getElementById('co-email');
      var first = name && name.value ? name.value.split(' ')[0] : '';
      var shippingMethod = CheckoutPage._selectedShippingLabel();
      var total = Cart.total() - (CheckoutPage._discountApplied ? Cart.total() * CheckoutPage._discountPercent : 0) + CheckoutPage._shippingCost(Cart.total());
      var orderNr = 'MR-' + Math.floor(10000 + Math.random() * 90000);
      Cart.clear();
      page.innerHTML =
        '<div class="co-success">' +
          '<div class="co-success__check">' +
            '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
          '</div>' +
          '<span class="co-success__order">Bestelnummer ' + orderNr + '</span>' +
          '<h1>Bedankt' + (first ? ', ' + esc(first) + '!' : '!') + '</h1>' +
          '<p>Je bestelling is ontvangen en wordt zorgvuldig ingepakt.' + (email && email.value ? ' Een bevestiging is verstuurd naar <strong>' + esc(email.value) + '</strong>.' : '') + '</p>' +
          '<div class="co-success__meta">' +
            '<div class="co-success__meta-row"><span>Verwachte levering</span><strong>2–4 werkdagen</strong></div>' +
            '<div class="co-success__meta-row"><span>Ordertotaal</span><strong>' + formatMoney(total) + '</strong></div>' +
            '<div class="co-success__meta-row"><span>Verzending via</span><strong>' + esc(shippingMethod) + '</strong></div>' +
          '</div>' +
          '<a href="index.html" class="co-submit-btn" style="text-decoration:none;max-width:18rem;">Verder winkelen</a>' +
        '</div>';

      document.querySelectorAll('.co-step').forEach(function (step) {
        step.classList.remove('is-active');
        step.classList.add('is-done');
        var num = step.querySelector('.co-step__num');
        if (num) num.textContent = '✓';
      });
    },

    _applyDiscount: function () {
      var input = document.getElementById('discount-input');
      var feedback = document.getElementById('discount-feedback');
      if (!input) return;
      var code = input.value.trim().toUpperCase();
      CheckoutPage._discountApplied = false;
      CheckoutPage._discountPercent = 0;

      if (code === 'MOURAO10') {
        CheckoutPage._discountApplied = true;
        CheckoutPage._discountPercent = 0.10;
        if (feedback) {
          feedback.textContent = 'Kortingscode toegepast: 10% op het subtotaal.';
          feedback.className = 'co-discount__feedback is-success';
        }
      } else if (code) {
        if (feedback) {
          feedback.textContent = 'Deze kortingscode is niet geldig.';
          feedback.className = 'co-discount__feedback is-error';
        }
      } else if (feedback) {
        feedback.textContent = '';
        feedback.className = 'co-discount__feedback';
      }

      CheckoutPage.renderSummary();
    },

    _handleExpressCheckout: function (method) {
      if (Cart.count() === 0) return;
      var payment = method === 'PayPal' ? 'paypal' : method === 'Apple Pay' ? 'card' : 'ideal';
      var radio = document.querySelector('input[name="payment"][value="' + payment + '"]');
      if (radio) {
        radio.checked = true;
      }
      CheckoutPage._updatePaymentState();
      CheckoutPage._showSuccess();
    },

    _selectedShipping: function () {
      var selected = document.querySelector('input[name="shipping"]:checked');
      return selected ? selected.value : 'standard';
    },

    _selectedShippingLabel: function () {
      var selected = document.querySelector('input[name="shipping"]:checked');
      if (!selected) return 'PostNL';
      var label = selected.closest('.co-shipping-opt');
      var name = label && label.querySelector('.co-shipping-opt__name');
      return name ? name.textContent : 'PostNL';
    },

    _shippingCost: function (subtotal) {
      var method = CheckoutPage._selectedShipping();
      if (subtotal === 0) return 0;
      if (method === 'express') return 7.95;
      if (method === 'pickup') return 3.95;
      return subtotal >= 30 ? 0 : 4.95;
    },

    _setCheckoutEnabled: function (enabled) {
      document.querySelectorAll('[data-express-method]').forEach(function (btn) {
        btn.disabled = !enabled;
      });
      var submitBtn = document.querySelector('.co-submit-btn[type="submit"], button.co-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = !enabled;
      }
    },

    _syncFieldState: function () {
      document.querySelectorAll('.co-field').forEach(function (field) {
        var input = field.querySelector('input, select');
        if (!input) return;
        var hasValue = input.tagName === 'SELECT' ? !!input.value : !!input.value.trim();
        field.classList.toggle('has-value', hasValue);
      });
    },

    _updatePaymentState: function () {
      var wrap = document.getElementById('ideal-bank-wrap');
      var ideal = document.querySelector('input[name="payment"][value="ideal"]');
      if (wrap) {
        wrap.classList.toggle('is-visible', !!(ideal && ideal.checked));
      }
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

  function formatMoney(amount) {
    var formatted = Number(amount || 0).toFixed(2).replace('.', ',');
    if (formatted.slice(-3) === ',00') {
      formatted = formatted.slice(0, -3);
    }
    return '€' + formatted;
  }

  function assetUrl(path) {
    try {
      return new URL(String(path || ''), window.location.href).href;
    } catch (error) {
      return String(path || '');
    }
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
