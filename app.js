import { 
  MENU_ITEMS, 
  CATEGORIES, 
  MEAT_TYPES, 
  SAUCES, 
  SPICES, 
  STANDARD_ADDONS, 
  PREMIUM_ADDONS, 
  EXTRA_MEAT_OPTIONS,
  RESTAURANT_INFO 
} from './menu-data.js';

// Stan aplikacji
let cart = JSON.parse(localStorage.getItem('bulka_spolka_cart') || '[]');
let currentSelectedItem = null;
let currentConfig = {
  sizeId: null,
  meatId: 'kurczak',
  sauces: [],
  spices: [],
  standardAddons: [],
  premiumAddons: [],
  extraMeat: [],
  breadChoice: null,
  notes: ''
};

// Inicjalizacja UI
document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderMenu('polecane');
  updateCartUI();
  setupCartEvents();
  setupModalEvents();
  initMeatTicker();
});

// Pasek informacyjny - Stan mięsa na żywo (%) i czas dostawy
function initMeatTicker() {
  const tickerEl = document.getElementById('meatTickerText');
  if (!tickerEl) return;

  function updateTicker() {
    fetch('/api/meat-inventory')
      .then(r => r.json())
      .then(status => {
        if (!status || !status.meats) return;

        const { chicken, pork, beef } = status.meats;
        const delivery = status.delivery;

        const getMeatBadge = (meat) => {
          const pct = Math.max(0, Math.min(100, Math.round(meat.percentRemaining)));
          let colorClass = 'ticker-status-ok';
          let warningTag = '';

          if (pct <= 20) {
            colorClass = 'ticker-status-low';
            warningTag = '<span class="ticker-badge-alert">🔥 KOŃCÓWKA!</span>';
          } else if (pct <= 45) {
            colorClass = 'ticker-status-mid';
          }

          return `
            <span class="ticker-item">
              <span class="ticker-meat-icon">${meat.icon}</span>
              <strong>${meat.name}:</strong> 
              <span class="ticker-pct ${colorClass}">${pct}%</span>
              <span class="ticker-mini-bar"><span class="ticker-mini-fill ${colorClass}" style="width: ${pct}%"></span></span>
              ${warningTag}
            </span>
          `;
        };

        const deliveryHtml = `
          <span class="ticker-item ticker-delivery-item">
            🛵 <strong>CZAS DOSTAWY:</strong> 
            <span class="ticker-delivery-val">${delivery.estimatedMinutes}</span>
            <span class="ticker-pickup-val">(Odbiór na miejscu: ~${delivery.pickupMinutes})</span>
          </span>
        `;

        const announcementHtml = `
          <span class="ticker-item ticker-announcement">
            📢 <em>"${status.announcement || '100% rzemieślnicze mięso w płatach'}"</em>
          </span>
        `;

        const locationHtml = `
          <span class="ticker-item">
            📍 <strong>Tychy</strong> • Zamówienia online z płatnością AutoPay / BLIK
          </span>
        `;

        // Podwójna treść dla idealnie płynnego przewijania
        const segment = getMeatBadge(chicken) + getMeatBadge(pork) + getMeatBadge(beef) + deliveryHtml + announcementHtml + locationHtml;
        tickerEl.innerHTML = segment + ' &nbsp;&bull;&nbsp; ' + segment;
      })
      .catch(console.error);
  }

  updateTicker();
  // Odświeżanie stanu mięsa co 5 sekund
  setInterval(updateTicker, 5000);
}

function renderCategories() {
  const container = document.getElementById('categoriesScroll');
  if (!container) return;

  container.innerHTML = CATEGORIES.map((cat, idx) => `
    <button class="cat-btn ${idx === 0 ? 'active' : ''}" data-cat="${cat.id}">
      <span>${cat.icon}</span> ${cat.name}
    </button>
  `).join('');

  container.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const catId = btn.getAttribute('data-cat');
      renderMenu(catId);
    });
  });
}

function renderMenu(categoryId) {
  const container = document.getElementById('menuGrid');
  if (!container) return;

  const items = categoryId === 'all' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(it => it.category === categoryId);

  container.innerHTML = items.map(item => {
    // Oblicz cenę wyjściową "od"
    let startingPrice = 0;
    if (item.sizes && item.sizes.length > 0) {
      const firstSize = item.sizes[0];
      if (firstSize.fixedPrice) {
        startingPrice = firstSize.fixedPrice;
      } else if (firstSize.prices) {
        startingPrice = Math.min(...Object.values(firstSize.prices));
      }
    }

    return `
      <div class="item-card" data-id="${item.id}">
        <div class="card-img-wrap">
          <img src="${item.image}" alt="${item.name}" loading="lazy" />
          ${item.badge ? `<span class="badge-flag">${item.badge}</span>` : ''}
        </div>
        <div class="card-body">
          <h3 class="item-name">${item.name}</h3>
          <p class="item-desc">${item.description}</p>
          <div class="card-footer">
            <div class="price-box">
              <span class="from">${item.sizes?.length > 1 ? 'Cena od' : 'Cena'}</span>
              <span class="price">${startingPrice} zł</span>
            </div>
            <button class="btn-select" onclick="window.openItemModal('${item.id}')">
              <span>Wybierz</span>
              <span>➕</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Otwieranie konfiguratora produktu
window.openItemModal = function(itemId) {
  const item = MENU_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  currentSelectedItem = item;
  currentConfig = {
    sizeId: item.sizes ? item.sizes[0].id : null,
    meatId: item.requiresMeat ? 'kurczak' : null,
    sauces: ['czosnkowy'], // domyślny sos
    spices: [],
    standardAddons: [],
    premiumAddons: [],
    extraMeat: [],
    breadChoice: item.requiresBreadChoice ? item.breadChoices[0] : null,
    notes: ''
  };

  const modal = document.getElementById('itemModal');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');

  title.textContent = item.name;

  let html = '';

  // 1. WYBÓR ROZMIARU
  if (item.sizes && item.sizes.length > 1) {
    html += `
      <div class="config-group">
        <label class="config-label">1. Wybierz rozmiar / wariant</label>
        <div class="config-options-grid">
          ${item.sizes.map((sz, i) => `
            <div class="option-pill size-opt ${i === 0 ? 'selected' : ''}" data-size="${sz.id}">
              <div>${sz.name}</div>
              <div class="opt-price">${getSizePriceDisplay(item, sz)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 2. WYBÓR MIĘSA (jeśli wymaga)
  if (item.requiresMeat) {
    html += `
      <div class="config-group">
        <label class="config-label">2. Wybierz rodzaj mięsa (100% kraft w płatach)</label>
        <div class="config-options-grid">
          ${MEAT_TYPES.map((m, i) => `
            <div class="option-pill meat-opt ${i === 0 ? 'selected' : ''}" data-meat="${m.id}">
              <div>${m.icon} ${m.name}</div>
              <div class="opt-price" style="font-size: 0.65rem; color: #a0aec0;">${m.description}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 3. WYBÓR PIECZYWA (np. Samo Mięso, Wege)
  if (item.requiresBreadChoice && item.breadChoices) {
    html += `
      <div class="config-group">
        <label class="config-label">Wybierz pieczywo</label>
        <div class="config-options-grid">
          ${item.breadChoices.map((b, i) => `
            <div class="option-pill bread-opt ${i === 0 ? 'selected' : ''}" data-bread="${b}">
              <div>🥙 ${b}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 4. AUTORSKIE SOSY (GRATIS)
  if (item.category !== 'napoje') {
    html += `
      <div class="config-group">
        <label class="config-label">
          <span>Sosy robione własnoręcznie</span>
          <span style="color: #34d399; font-size: 0.75rem;">GRATIS</span>
        </label>
        <div class="addons-grid">
          ${SAUCES.map(s => `
            <div class="addon-pill sauce-opt ${s.id === 'czosnkowy' ? 'active' : ''}" data-sauce="${s.id}">
              <span>🍶 ${s.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // 5. POSYPKA / PRZYPRAWY (GRATIS)
    html += `
      <div class="config-group">
        <label class="config-label">
          <span>Przyprawy (Posypka)</span>
          <span style="color: #34d399; font-size: 0.75rem;">GRATIS</span>
        </label>
        <div class="addons-grid">
          ${SPICES.map(sp => `
            <div class="addon-pill spice-opt" data-spice="${sp.id}">
              <span>🌿 ${sp.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 6. DODATKI STANDARDOWE & PREMIUM (jeśli dozwolone)
  if (item.allowAddons) {
    const stdPrice = getAddonPrice('standard', currentConfig.sizeId);
    const premPrice = getAddonPrice('premium', currentConfig.sizeId);

    html += `
      <div class="config-group">
        <label class="config-label">
          <span>Dodatki do kebaba</span>
          <span style="color: var(--accent-cyan); font-size: 0.75rem;">+${stdPrice} zł / dodatek</span>
        </label>
        <div class="addons-grid">
          ${STANDARD_ADDONS.map(ad => `
            <div class="addon-pill std-addon-opt" data-addon="${ad.id}">
              <span>${ad.icon} ${ad.name}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="config-group">
        <label class="config-label">
          <span>Dodatki Premium</span>
          <span style="color: var(--accent-cyan); font-size: 0.75rem;">+${premPrice} zł / dodatek</span>
        </label>
        <div class="addons-grid">
          ${PREMIUM_ADDONS.map(pad => `
            <div class="addon-pill prem-addon-opt" data-addon="${pad.id}">
              <span>${pad.icon} ${pad.name}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="config-group">
        <label class="config-label">
          <span>Dodatkowe mięso (+)</span>
          <span style="color: var(--neon-yellow); font-size: 0.75rem;">Więcej energii</span>
        </label>
        <div class="addons-grid">
          ${EXTRA_MEAT_OPTIONS.map(em => `
            <div class="addon-pill extra-meat-opt" data-extra="${em.id}">
              <span>🥩 ${em.name} (+${em.price} zł)</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 7. UWAGI DO ZAMÓWIENIA
  html += `
    <div class="config-group">
      <label class="config-label">Uwagi do dania (np. bez cebuli, dobrze przypieczone)</label>
      <input type="text" id="itemCustomNotes" placeholder="Twoje życzenie..." style="
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.12);
        padding: 10px 14px;
        border-radius: 8px;
        color: #fff;
        outline: none;
      " />
    </div>
  `;

  body.innerHTML = html;
  bindModalOptionClicks(body);
  updateModalPrice();
  modal.classList.add('open');
};

function getSizePriceDisplay(item, size) {
  if (size.fixedPrice) return `${size.fixedPrice} zł`;
  if (size.prices) {
    return `${size.prices.kurczak} - ${size.prices.wolowina} zł`;
  }
  return '';
}

function getAddonPrice(type, sizeId) {
  // Rozmiary: mały -> 2/3, średni/duży -> 4/5, mega -> 8/9
  const isMega = sizeId === 'mega' || sizeId?.includes('mega');
  const isMaly = sizeId === 'maly' || sizeId?.includes('maly');

  if (type === 'standard') {
    if (isMega) return 8;
    if (isMaly) return 2;
    return 4; // średni / duży / standard
  } else {
    // premium
    if (isMega) return 9;
    if (isMaly) return 3;
    return 5;
  }
}

function bindModalOptionClicks(container) {
  // Rozmiar
  container.querySelectorAll('.size-opt').forEach(el => {
    el.addEventListener('click', () => {
      container.querySelectorAll('.size-opt').forEach(x => x.classList.remove('selected'));
      el.classList.add('selected');
      currentConfig.sizeId = el.getAttribute('data-size');
      updateModalPrice();
    });
  });

  // Mięso
  container.querySelectorAll('.meat-opt').forEach(el => {
    el.addEventListener('click', () => {
      container.querySelectorAll('.meat-opt').forEach(x => x.classList.remove('selected'));
      el.classList.add('selected');
      currentConfig.meatId = el.getAttribute('data-meat');
      updateModalPrice();
    });
  });

  // Pieczywo
  container.querySelectorAll('.bread-opt').forEach(el => {
    el.addEventListener('click', () => {
      container.querySelectorAll('.bread-opt').forEach(x => x.classList.remove('selected'));
      el.classList.add('selected');
      currentConfig.breadChoice = el.getAttribute('data-bread');
    });
  });

  // Sosy (multi-select)
  container.querySelectorAll('.sauce-opt').forEach(el => {
    el.addEventListener('click', () => {
      el.classList.toggle('active');
      const sId = el.getAttribute('data-sauce');
      if (el.classList.contains('active')) {
        currentConfig.sauces.push(sId);
      } else {
        currentConfig.sauces = currentConfig.sauces.filter(x => x !== sId);
      }
    });
  });

  // Przyprawy (multi-select)
  container.querySelectorAll('.spice-opt').forEach(el => {
    el.addEventListener('click', () => {
      el.classList.toggle('active');
      const spId = el.getAttribute('data-spice');
      if (el.classList.contains('active')) {
        currentConfig.spices.push(spId);
      } else {
        currentConfig.spices = currentConfig.spices.filter(x => x !== spId);
      }
    });
  });

  // Standard Addons
  container.querySelectorAll('.std-addon-opt').forEach(el => {
    el.addEventListener('click', () => {
      el.classList.toggle('active');
      const adId = el.getAttribute('data-addon');
      if (el.classList.contains('active')) {
        currentConfig.standardAddons.push(adId);
      } else {
        currentConfig.standardAddons = currentConfig.standardAddons.filter(x => x !== adId);
      }
      updateModalPrice();
    });
  });

  // Premium Addons
  container.querySelectorAll('.prem-addon-opt').forEach(el => {
    el.addEventListener('click', () => {
      el.classList.toggle('active');
      const adId = el.getAttribute('data-addon');
      if (el.classList.contains('active')) {
        currentConfig.premiumAddons.push(adId);
      } else {
        currentConfig.premiumAddons = currentConfig.premiumAddons.filter(x => x !== adId);
      }
      updateModalPrice();
    });
  });

  // Extra Mięso
  container.querySelectorAll('.extra-meat-opt').forEach(el => {
    el.addEventListener('click', () => {
      el.classList.toggle('active');
      const emId = el.getAttribute('data-extra');
      if (el.classList.contains('active')) {
        currentConfig.extraMeat.push(emId);
      } else {
        currentConfig.extraMeat = currentConfig.extraMeat.filter(x => x !== emId);
      }
      updateModalPrice();
    });
  });
}

function calculateCurrentItemPrice() {
  if (!currentSelectedItem) return 0;
  let price = 0;

  // 1. Cena bazowa z rozmiaru / mięsa
  const sizeObj = currentSelectedItem.sizes?.find(s => s.id === currentConfig.sizeId) || currentSelectedItem.sizes?.[0];
  if (sizeObj) {
    if (sizeObj.fixedPrice) {
      price += sizeObj.fixedPrice;
    } else if (sizeObj.prices) {
      if (currentConfig.meatId === 'mieszane') {
        // średnia dwóch cen (wg menu: "cena dwóch mięs podzielona na pół")
        const sum = (sizeObj.prices.kurczak + sizeObj.prices.wolowina) / 2;
        price += sum;
      } else {
        price += sizeObj.prices[currentConfig.meatId] || sizeObj.prices.kurczak || 0;
      }
    }
  }

  // 2. Dodatki standardowe
  const stdPrice = getAddonPrice('standard', currentConfig.sizeId);
  price += currentConfig.standardAddons.length * stdPrice;

  // 3. Dodatki premium
  const premPrice = getAddonPrice('premium', currentConfig.sizeId);
  price += currentConfig.premiumAddons.length * premPrice;

  // 4. Dodatkowe mięso
  currentConfig.extraMeat.forEach(emId => {
    const em = EXTRA_MEAT_OPTIONS.find(x => x.id === emId);
    if (em) price += em.price;
  });

  return price;
}

function updateModalPrice() {
  const priceDisplay = document.getElementById('modalTotalPrice');
  if (priceDisplay) {
    const total = calculateCurrentItemPrice();
    priceDisplay.textContent = `${total.toFixed(2)} zł`;
  }
}

function setupModalEvents() {
  const modal = document.getElementById('itemModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const addCartBtn = document.getElementById('modalAddCartBtn');

  const closeModal = () => modal.classList.remove('open');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (addCartBtn) {
    addCartBtn.addEventListener('click', () => {
      const notesInput = document.getElementById('itemCustomNotes');
      if (notesInput) currentConfig.notes = notesInput.value.trim();

      const calculatedPrice = calculateCurrentItemPrice();
      const sizeObj = currentSelectedItem.sizes?.find(s => s.id === currentConfig.sizeId) || currentSelectedItem.sizes?.[0];
      const meatObj = MEAT_TYPES.find(m => m.id === currentConfig.meatId);

      const cartItem = {
        cartItemId: 'ci_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        itemId: currentSelectedItem.id,
        name: currentSelectedItem.name,
        sizeName: sizeObj?.name || '',
        meatName: meatObj?.name || '',
        breadName: currentConfig.breadChoice || '',
        sauces: currentConfig.sauces.map(s => SAUCES.find(x => x.id === s)?.name).filter(Boolean),
        spices: currentConfig.spices.map(sp => SPICES.find(x => x.id === sp)?.name).filter(Boolean),
        standardAddons: currentConfig.standardAddons.map(a => STANDARD_ADDONS.find(x => x.id === a)?.name).filter(Boolean),
        premiumAddons: currentConfig.premiumAddons.map(a => PREMIUM_ADDONS.find(x => x.id === a)?.name).filter(Boolean),
        extraMeat: currentConfig.extraMeat.map(e => EXTRA_MEAT_OPTIONS.find(x => x.id === e)?.name).filter(Boolean),
        notes: currentConfig.notes,
        price: calculatedPrice,
        quantity: 1
      };

      cart.push(cartItem);
      saveCart();
      updateCartUI();
      closeModal();
      openCartDrawer();
    });
  }
}

// Obsługa koszyka
function saveCart() {
  localStorage.setItem('bulka_spolka_cart', JSON.stringify(cart));
}

function setupCartEvents() {
  const openCartBtn = document.getElementById('openCartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const overlay = document.getElementById('cartDrawerOverlay');

  if (openCartBtn) openCartBtn.addEventListener('click', openCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
  if (overlay) overlay.addEventListener('click', closeCartDrawer);
}

function openCartDrawer() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartDrawerOverlay').classList.add('open');
}

function closeCartDrawer() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartDrawerOverlay').classList.remove('open');
}

function updateCartUI() {
  const countEl = document.getElementById('cartCountBadge');
  const itemsContainer = document.getElementById('cartItemsList');
  const subtotalEl = document.getElementById('cartSubtotal');
  const deliveryEl = document.getElementById('cartDeliveryPrice');
  const totalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('btnProceedCheckout');

  const totalQuantity = cart.reduce((acc, it) => acc + it.quantity, 0);
  if (countEl) countEl.textContent = totalQuantity;

  if (!itemsContainer) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
        <span style="font-size: 3rem;">🥙</span>
        <p style="margin-top: 1rem; font-weight: 600;">Twój koszyk jest jeszcze pusty.</p>
        <p style="font-size: 0.8rem;">Dodaj swoje ulubione kebaby i napoje!</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '0.00 zł';
    if (deliveryEl) deliveryEl.textContent = '0.00 zł';
    if (totalEl) totalEl.textContent = '0.00 zł';
    if (checkoutBtn) {
      checkoutBtn.style.opacity = '0.5';
      checkoutBtn.style.pointerEvents = 'none';
    }
    return;
  }

  if (checkoutBtn) {
    checkoutBtn.style.opacity = '1';
    checkoutBtn.style.pointerEvents = 'auto';
  }

  const subtotal = cart.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const delivery = subtotal >= RESTAURANT_INFO.freeDeliveryThreshold ? 0 : RESTAURANT_INFO.deliveryPrice;
  const total = subtotal + delivery;

  itemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-top">
        <h4 class="cart-item-title">${item.name}</h4>
        <span class="cart-item-price">${(item.price * item.quantity).toFixed(2)} zł</span>
      </div>
      <div class="cart-item-details">
        ${item.sizeName ? `<span>• ${item.sizeName}</span> ` : ''}
        ${item.meatName ? `<span>• ${item.meatName}</span> ` : ''}
        ${item.breadName ? `<span>• ${item.breadName}</span> ` : ''}
        ${item.sauces?.length ? `<br><span>Sosy: ${item.sauces.join(', ')}</span>` : ''}
        ${item.spices?.length ? `<br><span>Posypka: ${item.spices.join(', ')}</span>` : ''}
        ${item.standardAddons?.length ? `<br><span>Dodatki: ${item.standardAddons.join(', ')}</span>` : ''}
        ${item.premiumAddons?.length ? `<br><span>Premium: ${item.premiumAddons.join(', ')}</span>` : ''}
        ${item.extraMeat?.length ? `<br><span>Ekstra mięso: ${item.extraMeat.join(', ')}</span>` : ''}
        ${item.notes ? `<br><span style="color:#ffb703">Uwagi: ${item.notes}</span>` : ''}
      </div>
      <div class="cart-item-actions">
        <div class="qty-control">
          <button class="qty-btn" onclick="window.changeQuantity('${item.cartItemId}', -1)">−</button>
          <span style="font-weight: 700; font-size: 0.9rem;">${item.quantity}</span>
          <button class="qty-btn" onclick="window.changeQuantity('${item.cartItemId}', 1)">+</button>
        </div>
        <button onclick="window.removeCartItem('${item.cartItemId}')" style="background:none; border:none; color:#f87171; cursor:pointer; font-size:0.8rem;">Usuń</button>
      </div>
    </div>
  `).join('');

  if (subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(2)} zł`;
  if (deliveryEl) {
    deliveryEl.innerHTML = delivery === 0 
      ? '<span style="color:#34d399">DARMOWA (od 70 zł)</span>' 
      : `${delivery.toFixed(2)} zł`;
  }
  if (totalEl) totalEl.textContent = `${total.toFixed(2)} zł`;
}

window.changeQuantity = function(cartItemId, delta) {
  const item = cart.find(x => x.cartItemId === cartItemId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(x => x.cartItemId !== cartItemId);
  }
  saveCart();
  updateCartUI();
};

window.removeCartItem = function(cartItemId) {
  cart = cart.filter(x => x.cartItemId !== cartItemId);
  saveCart();
  updateCartUI();
};
