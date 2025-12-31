const defaultMeals = [
  {
    id: 1,
    restaurant: "Bistro do Porto",
    neighborhood: "Centro",
    name: "Prato do dia mediterraneo",
    price: 5,
    original: 20,
    available: 2
  },
  {
    id: 2,
    restaurant: "Casa do Sabor",
    neighborhood: "Savassi",
    name: "Combo executivo",
    price: 5,
    original: 18,
    available: 1
  },
  {
    id: 3,
    restaurant: "Cantina 27",
    neighborhood: "Pinheiros",
    name: "Massa fresca + salada",
    price: 6,
    original: 22,
    available: 3
  },
  {
    id: 4,
    restaurant: "Estacao Verde",
    neighborhood: "Batel",
    name: "Bowl vegetariano",
    price: 7,
    original: 24,
    available: 1
  },
  {
    id: 5,
    restaurant: "Doce Pao",
    neighborhood: "Porto Alegre",
    name: "Cafe + torta do dia",
    price: 5,
    original: 19,
    available: 2
  }
];

const restaurantImages = [
  "image.png",
  "image copy.png",
  "image copy 2.png",
  "image copy 3.png",
  "image copy 4.png"
];

const categoryList = ["Padaria", "Refeicoes", "Mercados", "Vegetariano", "Doces"];

const storageKey = "reserve-meals";
const favoritesKey = "reserve-favorites";

const state = {
  meals: loadMeals(),
  cart: [],
  selectedRestaurant: null,
  favorites: loadFavorites(),
  searchQuery: "",
  activeCategory: "Todos",
  showFavoritesOnly: false,
  paymentMethod: "pix",
  paidOrders: []
};

const restaurantCategories = new Map();

function loadMeals() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return defaultMeals;
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : defaultMeals;
  } catch {
    return defaultMeals;
  }
}

function saveMeals() {
  localStorage.setItem(storageKey, JSON.stringify(state.meals));
}

function loadFavorites() {
  const saved = localStorage.getItem(favoritesKey);
  if (!saved) return new Set();
  try {
    const parsed = JSON.parse(saved);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveFavorites() {
  localStorage.setItem(favoritesKey, JSON.stringify(Array.from(state.favorites)));
}

function formatBRL(value) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function pickupLimit() {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function availabilityLabel() {
  return "Disponivel agora";
}

function uniqueRestaurants() {
  const map = new Map();
  state.meals.forEach(meal => {
    if (!map.has(meal.restaurant)) {
      map.set(meal.restaurant, {
        name: meal.restaurant,
        neighborhood: meal.neighborhood
      });
    }
  });
  return Array.from(map.values());
}

function assignCategories() {
  restaurantCategories.clear();
  const restaurants = uniqueRestaurants();
  restaurants.forEach((rest, index) => {
    const category = categoryList[index % categoryList.length];
    restaurantCategories.set(rest.name, category);
  });
}

function restaurantCounts() {
  const counts = new Map();
  state.meals.forEach(meal => {
    counts.set(meal.restaurant, (counts.get(meal.restaurant) || 0) + 1);
  });
  return counts;
}

function restaurantMatches(rest, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  if (rest.name.toLowerCase().includes(q)) return true;
  if (rest.neighborhood.toLowerCase().includes(q)) return true;
  return state.meals.some(meal =>
    meal.restaurant === rest.name && meal.name.toLowerCase().includes(q)
  );
}

function categoryMatches(rest) {
  if (state.activeCategory === "Todos") return true;
  return restaurantCategories.get(rest.name) === state.activeCategory;
}

function mealMatches(meal, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    meal.name.toLowerCase().includes(q) ||
    meal.restaurant.toLowerCase().includes(q) ||
    meal.neighborhood.toLowerCase().includes(q)
  );
}

function toggleFavorite(name) {
  if (state.favorites.has(name)) {
    state.favorites.delete(name);
  } else {
    state.favorites.add(name);
  }
  saveFavorites();
  renderRestaurants();
}

function getRestaurantImageMap() {
  const map = new Map();
  const restaurants = uniqueRestaurants();
  restaurants.forEach((rest, index) => {
    map.set(rest.name, restaurantImages[index] || "");
  });
  return map;
}

function updateOrdersBadge() {
  const badge = document.getElementById('orders-badge');
  const count = state.cart.length;
  badge.textContent = String(count);
  badge.style.display = count ? 'inline-block' : 'none';
}

function hashSeed(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function renderFakeQr(targetId, seed) {
  const container = document.getElementById(targetId);
  if (!container) return;
  const size = 12;
  container.innerHTML = '';
  let value = hashSeed(seed);
  for (let i = 0; i < size * size; i++) {
    value = (value * 9301 + 49297) % 233280;
    const cell = document.createElement('span');
    const on = value % 3 !== 0;
    cell.style.opacity = on ? '0.9' : '0.15';
    container.appendChild(cell);
  }
}

function renderPaymentSummary() {
  const container = document.getElementById('payment-summary');
  if (!container) return;
  if (!state.cart.length) {
    container.innerHTML = '<p><small>Nenhum item selecionado.</small></p>';
    return;
  }
  const grouped = groupCartItems();
  const total = state.cart.reduce((sum, item) => sum + item.price, 0);
  container.innerHTML = `
    <div class="modal-list">
      ${grouped.map(item => `
        <div class="list-item">
          <strong>${item.name}</strong>
          <div><small>${item.restaurant}</small></div>
          <div><small>Qtd: ${item.qty} • ${formatBRL(item.price * item.qty)}</small></div>
        </div>
      `).join('')}
    </div>
    <div class="list-item">
      <strong>Total</strong>
      <div><small>${formatBRL(total)}</small></div>
      <div><small>Retire ate ${pickupLimit()}</small></div>
    </div>
  `;
}

function setPaymentMethod(method) {
  state.paymentMethod = method;
  document.querySelectorAll('.method-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.method === method);
  });
  document.querySelectorAll('.method-panel').forEach(panel => {
    panel.classList.toggle('active', panel.dataset.panel === method);
  });
}

function openOverlayModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeOverlayModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

function closeAllOverlayModals() {
  ['orders-modal', 'profile-modal', 'payment-modal'].forEach(closeOverlayModal);
}

function setActiveNav(id) {
  document.querySelectorAll('#bottom-nav button').forEach(button => {
    button.classList.remove('active');
  });
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
}

function renderOrdersModal() {
  const container = document.getElementById('orders-list');
  const actions = document.getElementById('orders-actions');
  container.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'modal-list';
  if (!state.cart.length) {
    container.innerHTML = '<p><small>Nenhum pedido no carrinho.</small></p>';
    if (actions) actions.style.display = 'none';
  } else {
    if (actions) actions.style.display = 'flex';
    const grouped = groupCartItems();
    grouped.forEach(item => {
      const row = document.createElement('div');
      row.className = 'list-item';
      row.innerHTML = `
        <strong>${item.name}</strong>
        <div><small>${item.restaurant}</small></div>
        <div><small>${formatBRL(item.price)}</small></div>
        <div class="qty-controls">
          <button class="qty-btn qty-remove" data-id="${item.id}">-</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn qty-add" data-id="${item.id}">+</button>
        </div>
      `;
      list.appendChild(row);
    });
    const total = state.cart.reduce((sum, item) => sum + item.price, 0);
    const summary = document.createElement('div');
    summary.className = 'list-item';
    summary.innerHTML = `
      <strong>Total</strong>
      <div><small>${formatBRL(total)}</small></div>
      <div><small>Retire ate ${pickupLimit()}</small></div>
    `;
    container.appendChild(list);
    container.appendChild(summary);
  }

  const paidSection = document.createElement('div');
  paidSection.className = 'modal-list';
  if (!state.paidOrders.length) {
    const empty = document.createElement('div');
    empty.className = 'list-item';
    empty.innerHTML = '<strong>Pedidos pagos</strong><div><small>Nenhum pedido pago ainda.</small></div>';
    paidSection.appendChild(empty);
  } else {
    state.paidOrders.forEach(order => {
      const itemsHtml = order.items.map(item => `
        <div><small>${item.qty}x ${item.name} — ${formatBRL(item.price * item.qty)}</small></div>
      `).join('');
      const row = document.createElement('div');
      row.className = 'list-item';
      row.innerHTML = `
        <strong>Pedido #${order.id}</strong>
        <div><small>Total: ${formatBRL(order.total)}</small></div>
        <div><small>Status: Pago</small></div>
        <div><small>Retire ate ${order.pickupBy}</small></div>
        <div class="map-preview">
          <div class="map-pin">Retirada</div>
          <div class="map-meta">
            <small>Rua Principal, 123</small>
            <small>Joao Pessoa, PB</small>
          </div>
          <div class="map-actions">
            <button class="btn secondary map-open" data-lat="-7.1195" data-lng="-34.8450">Abrir no mapa</button>
          </div>
        </div>
        <div class="receipt">
          <div><small>Itens:</small></div>
          ${itemsHtml}
        </div>
        <div class="pix-qr">
          <div class="fake-qr" id="paid-qr-${order.id}"></div>
          <small>QR de retirada</small>
        </div>
      `;
      paidSection.appendChild(row);
    });
  }
  container.appendChild(paidSection);

  state.paidOrders.forEach(order => {
    renderFakeQr(`paid-qr-${order.id}`, order.qrToken);
  });
}

function renderProfileModal() {
  const container = document.getElementById('profile-content');
  const favoritesCount = state.favorites.size;
  const ordersCount = state.cart.length;
  container.innerHTML = `
    <div class="profile-card">
      <div class="profile-header">
        <div class="profile-avatar">CL</div>
        <div class="profile-meta">
          <strong>Cliente Demo</strong>
          <small>cliente@reserve.app</small>
        </div>
      </div>
      <div class="list-item">
        <strong>Endereco</strong>
        <div><small>Rua Principal, 123 - Joao Pessoa</small></div>
      </div>
      <div class="list-item">
        <strong>Resumo</strong>
        <div><small>Favoritos: ${favoritesCount}</small></div>
        <div><small>Pedidos no carrinho: ${ordersCount}</small></div>
      </div>
      <div class="list-item">
        <strong>Historico</strong>
        <div><small>Ultimos pedidos aparecem aqui.</small></div>
      </div>
    </div>
  `;
}

function renderRestaurants() {
  const container = document.getElementById('restaurant-list');
  container.innerHTML = '';
  assignCategories();
  const restaurants = uniqueRestaurants();
  const counts = restaurantCounts();
  const imageMap = getRestaurantImageMap();
  let rendered = 0;
  restaurants.forEach((rest, index) => {
    if (!restaurantMatches(rest, state.searchQuery)) return;
    if (!categoryMatches(rest)) return;
    if (state.showFavoritesOnly && !state.favorites.has(rest.name)) return;
    const card = document.createElement('div');
    const isActive = state.selectedRestaurant === rest.name || (!state.selectedRestaurant && index === 0);
    card.className = 'restaurant-card';
    const mealCount = counts.get(rest.name) || 0;
    const image = imageMap.get(rest.name);
    const isFavorite = state.favorites.has(rest.name);
    card.innerHTML = `
      <div class="restaurant-thumb" style="${image ? `background-image: url('${encodeURI(image)}');` : 'background: linear-gradient(135deg, #f8d9b6, #f1c373);'}">
        <button class="favorite ${isFavorite ? 'active' : ''}" aria-label="Favoritar">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 6-7 10-7 10z"/></svg>
        </button>
      </div>
      <span class="badge">${mealCount} refeicoes disponiveis</span>
      <strong>${rest.name}</strong>
      <div class="meta">
        <span class="pill">${rest.neighborhood}</span>
        <span class="pill">Retire ate ${pickupLimit()}</span>
        <span class="chip-now">${availabilityLabel()}</span>
      </div>
      <div class="price">R$ 5,00</div>
      <button class="btn open-meals ${isActive ? '' : 'secondary'}">Ver refeicoes</button>
    `;
    card.querySelector('.favorite').onclick = event => {
      event.stopPropagation();
      toggleFavorite(rest.name);
    };
    card.querySelector('.open-meals').onclick = () => {
      state.selectedRestaurant = rest.name;
      renderRestaurants();
      openModal();
    };
    const wrapper = document.createElement('div');
    wrapper.className = 'card';
    wrapper.appendChild(card);
    container.appendChild(wrapper);
    rendered += 1;
  });

  if (!state.selectedRestaurant && restaurants.length) {
    state.selectedRestaurant = restaurants[0].name;
  }

  if (!rendered) {
    container.innerHTML = '<div class="card"><p><small>Nenhum restaurante encontrado.</small></p></div>';
  }
}

function renderMeals(containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const meals = state.meals.filter(meal =>
    meal.restaurant === state.selectedRestaurant && mealMatches(meal, state.searchQuery)
  );
  if (!meals.length) {
    container.innerHTML = '<p><small>Nenhuma refeicao disponivel.</small></p>';
    return;
  }
  const imageMap = getRestaurantImageMap();
  meals.forEach(meal => {
    const image = imageMap.get(meal.restaurant);
    const inCart = countInCart(meal.id);
    const remaining = Math.max(0, (meal.available || 1) - inCart);
    const disabled = remaining === 0;
    const row = document.createElement('div');
    row.className = 'meal';
    row.innerHTML = `
      <div class="meal-thumb" style="${image ? `background-image: url('${encodeURI(image)}');` : 'background: linear-gradient(135deg, #f8d9b6, #f1c373);'}"></div>
      <div>
        <strong>${meal.name}</strong>
        <div><small>${meal.restaurant} - ${meal.neighborhood}</small></div>
        <div><small>Retire ate ${pickupLimit()}</small></div>
        <div><small>De ${formatBRL(meal.original)} por ${formatBRL(meal.price)}</small></div>
        <div><small>Disponiveis: ${remaining}</small></div>
        <div><span class="chip-now">${availabilityLabel()}</span></div>
      </div>
      <button class="btn" onclick="addToCart(${meal.id})" ${disabled ? 'disabled' : ''}>Adicionar</button>
    `;
    container.appendChild(row);
  });
}

function renderCart() {
  const total = state.cart.reduce((sum, item) => sum + item.price, 0);
  renderPaymentSummary();
}

function countInCart(id) {
  return state.cart.filter(item => item.id === id).length;
}

function groupCartItems() {
  const map = new Map();
  state.cart.forEach(item => {
    if (!map.has(item.id)) {
      map.set(item.id, { ...item, qty: 1 });
    } else {
      map.get(item.id).qty += 1;
    }
  });
  return Array.from(map.values());
}

function addToCart(id) {
  const meal = state.meals.find(item => item.id === id);
  if (!meal) return;
  const available = meal.available || 1;
  const inCart = countInCart(id);
  if (inCart >= available) {
    alert('Nao ha mais unidades disponiveis para esta refeicao.');
    return;
  }
  state.cart.push(meal);
  renderCart();
  updateOrdersBadge();
  renderMeals('modal-meal-list');
  renderMeals('detail-meal-list');
}

function removeFromCart(id) {
  const index = state.cart.findIndex(item => item.id === id);
  if (index === -1) return;
  state.cart.splice(index, 1);
  renderCart();
  updateOrdersBadge();
  renderMeals('modal-meal-list');
  renderMeals('detail-meal-list');
}

function createPaidOrder() {
  const grouped = groupCartItems();
  const total = state.cart.reduce((sum, item) => sum + item.price, 0);
  const token = Math.random().toString(36).slice(2, 10).toUpperCase();
  return {
    id: Date.now(),
    items: grouped,
    total,
    qrToken: token,
    pickupBy: pickupLimit()
  };
}

function openModal() {
  const modal = document.getElementById('meal-modal');
  const title = document.getElementById('modal-title');
  title.textContent = state.selectedRestaurant ? `Refeicoes - ${state.selectedRestaurant}` : 'Refeicoes';
  renderMeals('modal-meal-list');
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  const modal = document.getElementById('meal-modal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

function openDetail() {
  closeModal();
  document.getElementById('restaurant-detail').classList.remove('hidden');
  document.getElementById('marketplace').classList.add('hidden');
  const title = document.getElementById('detail-title');
  title.textContent = state.selectedRestaurant ? `Refeicoes - ${state.selectedRestaurant}` : 'Refeicoes';
  document.getElementById('detail-chip').textContent = availabilityLabel();
  renderMeals('detail-meal-list');
  scrollToSection('restaurant-detail');
}

function backToRestaurants() {
  document.getElementById('restaurant-detail').classList.add('hidden');
  document.getElementById('marketplace').classList.remove('hidden');
  scrollToSection('marketplace');
}

function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('admin-form').addEventListener('submit', event => {
  event.preventDefault();
  const meal = {
    id: Date.now(),
    restaurant: document.getElementById('r-name').value.trim(),
    neighborhood: document.getElementById('r-neighborhood').value.trim(),
    name: document.getElementById('meal-name').value.trim(),
    price: Number(document.getElementById('meal-price').value),
    original: Number(document.getElementById('meal-original').value)
  };

  state.meals.unshift(meal);
  saveMeals();
  renderRestaurants();
  renderMeals('modal-meal-list');
  event.target.reset();
});

function updateRoute() {
  const isAdmin = window.location.hash === '#admin';
  document.getElementById('admin').style.display = isAdmin ? 'block' : 'none';
  document.getElementById('marketplace').style.display = isAdmin ? 'none' : 'block';
  document.getElementById('bottom-nav').style.display = isAdmin ? 'none' : 'grid';
  if (isAdmin) {
    document.getElementById('restaurant-detail').classList.add('hidden');
  }
}

document.getElementById('close-modal').addEventListener('click', closeModal);
document.getElementById('back-button').addEventListener('click', backToRestaurants);
document.getElementById('meal-modal').addEventListener('click', event => {
  if (event.target.id === 'meal-modal') closeModal();
});
document.getElementById('search-input').addEventListener('input', event => {
  state.searchQuery = event.target.value.trim();
  renderRestaurants();
  renderMeals('modal-meal-list');
  renderMeals('detail-meal-list');
});

document.querySelectorAll('#category-row .category').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('#category-row .category').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    state.activeCategory = button.dataset.category || "Todos";
    renderRestaurants();
  });
});

document.querySelectorAll('.modal-close').forEach(button => {
  button.addEventListener('click', event => {
    const target = event.currentTarget.getAttribute('data-close');
    if (target) closeOverlayModal(target);
  });
});

['orders-modal', 'profile-modal', 'payment-modal', 'map-modal'].forEach(id => {
  const modal = document.getElementById(id);
  modal.addEventListener('click', event => {
    if (event.target.id === id) closeOverlayModal(id);
  });
});

document.getElementById('nav-discover').addEventListener('click', () => {
  closeAllOverlayModals();
  setActiveNav('nav-discover');
  state.showFavoritesOnly = false;
  scrollToSection('marketplace');
  renderRestaurants();
});

document.getElementById('nav-favorites').addEventListener('click', () => {
  closeAllOverlayModals();
  setActiveNav('nav-favorites');
  state.searchQuery = '';
  document.getElementById('search-input').value = '';
  state.showFavoritesOnly = true;
  renderRestaurants();
});

document.getElementById('nav-orders').addEventListener('click', () => {
  renderOrdersModal();
  closeAllOverlayModals();
  openOverlayModal('orders-modal');
  setActiveNav('nav-orders');
});

document.getElementById('nav-profile').addEventListener('click', () => {
  renderProfileModal();
  closeAllOverlayModals();
  openOverlayModal('profile-modal');
  setActiveNav('nav-profile');
});

document.getElementById('go-to-checkout').addEventListener('click', () => {
  closeOverlayModal('orders-modal');
  renderPaymentSummary();
  setPaymentMethod(state.paymentMethod);
  openOverlayModal('payment-modal');
});

document.getElementById('pay-now').addEventListener('click', () => {
  closeModal();
  renderPaymentSummary();
  setPaymentMethod(state.paymentMethod);
  openOverlayModal('payment-modal');
});

document.querySelectorAll('.method-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    setPaymentMethod(tab.dataset.method);
  });
});

document.querySelectorAll('.pix-option').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.pix-option').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const target = button.dataset.pix;
    document.querySelectorAll('.pix-panel').forEach(panel => {
      panel.classList.toggle('active', panel.dataset.pixPanel === target);
    });
  });
});

document.getElementById('confirm-payment').addEventListener('click', () => {
  if (!state.cart.length) return;
  const order = createPaidOrder();
  state.paidOrders.unshift(order);
  state.cart = [];
  updateOrdersBadge();
  renderOrdersModal();
  renderPaymentSummary();
  const success = document.getElementById('payment-success');
  if (success) success.classList.add('active');
});

document.getElementById('view-qr').addEventListener('click', () => {
  closeOverlayModal('payment-modal');
  renderOrdersModal();
  openOverlayModal('orders-modal');
  setActiveNav('nav-orders');
});

document.addEventListener('click', event => {
  const mapButton = event.target.closest('.map-open');
  if (!mapButton) return;
  const lat = mapButton.dataset.lat;
  const lng = mapButton.dataset.lng;
  const google = document.getElementById('map-google');
  const apple = document.getElementById('map-apple');
  const waze = document.getElementById('map-waze');
  const query = `${lat},${lng}`;
  google.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
  apple.href = `https://maps.apple.com/?q=${query}`;
  waze.href = `https://waze.com/ul?ll=${query}&navigate=yes`;
  openOverlayModal('map-modal');
});

document.getElementById('copy-pix').addEventListener('click', async () => {
  const code = document.getElementById('pix-code').textContent;
  const feedback = document.getElementById('pix-feedback');
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(code);
    }
    feedback.textContent = 'Codigo copiado.';
  } catch {
    feedback.textContent = 'Copie manualmente.';
  }
  setTimeout(() => {
    feedback.textContent = '';
  }, 2000);
});

document.addEventListener('click', event => {
  const addBtn = event.target.closest('.qty-add');
  const removeBtn = event.target.closest('.qty-remove');
  if (addBtn) {
    const id = Number(addBtn.dataset.id);
    addToCart(id);
    renderOrdersModal();
    return;
  }
  if (removeBtn) {
    const id = Number(removeBtn.dataset.id);
    removeFromCart(id);
    renderOrdersModal();
  }
});

window.addEventListener('hashchange', updateRoute);

renderRestaurants();
renderCart();
updateOrdersBadge();
setPaymentMethod(state.paymentMethod);
updateRoute();
renderFakeQr('pix-qr-grid', 'PIX-DEMO');
