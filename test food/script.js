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
const restaurantMealsKey = "reserve-restaurant-meals";
const restaurantOrdersKey = "reserve-restaurant-orders";
const restaurantProfileKey = "reserve-restaurant-profile";
const adminPendingKey = "reserve-admin-pending";
const adminApprovedKey = "reserve-admin-approved";
const adminPayoutsKey = "reserve-admin-payouts";
const adminSupportKey = "reserve-admin-support";
const adminAuditKey = "reserve-admin-audit";

const state = {
  meals: loadMeals(),
  cart: [],
  selectedRestaurant: null,
  favorites: loadFavorites(),
  searchQuery: "",
  activeCategory: "Todos",
  showFavoritesOnly: false,
  paymentMethod: "pix",
  paidOrders: [],
  role: "client",
  restaurantProfile: loadRestaurantProfile(),
  confirmOrderLineId: null,
  adminSearch: "",
  adminScope: "all",
  adminPayoutSearch: "",
  adminSupportSearch: "",
  adminSupportFilter: "novos",
  adminSelectedTicketId: null
};

const restaurantCategories = new Map();
let restaurantAllergens = [];

function loadMeals() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return defaultMeals.map(meal => ({
    ...meal,
    ingredients: demoIngredients(meal.name),
    allergens: demoAllergens(meal.name)
  }));
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

function loadRestaurantMeals() {
  const saved = localStorage.getItem(restaurantMealsKey);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRestaurantMeals(meals) {
  localStorage.setItem(restaurantMealsKey, JSON.stringify(meals));
}

function loadRestaurantProfile() {
  const saved = localStorage.getItem(restaurantProfileKey);
  if (!saved) return { name: "Restaurante Demo", neighborhood: "Centro" };
  try {
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === 'object'
      ? parsed
      : { name: "Restaurante Demo", neighborhood: "Centro" };
  } catch {
    return { name: "Restaurante Demo", neighborhood: "Centro" };
  }
}

function saveRestaurantProfile(profile) {
  localStorage.setItem(restaurantProfileKey, JSON.stringify(profile));
}

function loadAdminPending() {
  const saved = localStorage.getItem(adminPendingKey);
  if (!saved) {
    const seed = [
      {
        id: 201,
        name: 'Sabor da Vila',
        neighborhood: 'Tambau',
        docNumber: '12.345.678/0001-99',
        category: 'Refeicoes',
        hours: '10:00 - 22:00',
        contact: 'contato@sabordavila.com',
        docStatus: 'pendente',
        photos: 3,
        documents: ['CNPJ.pdf', 'Alvara.pdf'],
        photoUrls: ['image.png', 'image copy.png'],
        photoNames: ['salao.jpg', 'buffet.jpg'],
        photoNames: ['fachada.jpg', 'menu.jpg'],
        createdAt: 'Hoje'
      },
      {
        id: 202,
        name: 'Cantinho Mineiro',
        neighborhood: 'Manaira',
        docNumber: '98.765.432/0001-55',
        category: 'Padaria',
        hours: '06:00 - 20:00',
        contact: 'contato@cantinhomineiro.com',
        docStatus: 'verificado',
        photos: 4,
        documents: ['CNPJ.pdf', 'Licenca.pdf', 'Responsavel.pdf'],
        photoUrls: ['image copy 2.png', 'image copy 3.png'],
        photoNames: ['vitrine.jpg', 'cozinha.jpg'],
        createdAt: 'Ontem'
      }
    ];
    localStorage.setItem(adminPendingKey, JSON.stringify(seed));
    return seed;
  }
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAdminPending(list) {
  localStorage.setItem(adminPendingKey, JSON.stringify(list));
}

function loadAdminApproved() {
  const saved = localStorage.getItem(adminApprovedKey);
  if (!saved) {
    const seed = [
      {
        id: 301,
        name: 'Bistro do Porto',
        neighborhood: 'Centro',
        docNumber: '45.123.987/0001-11',
        category: 'Refeicoes',
        hours: '11:00 - 22:00',
        contact: 'contato@bistrodoporto.com',
        docStatus: 'verificado',
        documents: ['CNPJ.pdf', 'Alvara.pdf'],
        photoUrls: ['image.png', 'image copy.png'],
        createdAt: 'Semana passada'
      },
      {
        id: 302,
        name: 'Casa do Sabor',
        neighborhood: 'Savassi',
        docNumber: '22.456.789/0001-33',
        category: 'Refeicoes',
        hours: '10:00 - 21:00',
        contact: 'contato@casadosabor.com',
        docStatus: 'verificado',
        documents: ['CNPJ.pdf', 'Licenca.pdf'],
        photoUrls: ['image copy 2.png'],
        photoNames: ['fachada.jpg'],
        createdAt: 'Semana passada'
      },
      {
        id: 303,
        name: 'Cantina 27',
        neighborhood: 'Pinheiros',
        docNumber: '33.987.654/0001-22',
        category: 'Doces',
        hours: '09:00 - 20:00',
        contact: 'contato@cantina27.com',
        docStatus: 'verificado',
        documents: ['CNPJ.pdf', 'Responsavel.pdf'],
        photoUrls: ['image copy 3.png'],
        photoNames: ['cozinha.jpg'],
        createdAt: 'Ontem'
      },
      {
        id: 304,
        name: 'Estacao Verde',
        neighborhood: 'Batel',
        docNumber: '55.111.222/0001-66',
        category: 'Vegetariano',
        hours: '08:00 - 19:00',
        contact: 'contato@estacaoverde.com',
        docStatus: 'verificado',
        documents: ['CNPJ.pdf', 'Licenca.pdf', 'Responsavel.pdf'],
        photoUrls: ['image copy 4.png'],
        photoNames: ['pratos.jpg'],
        createdAt: 'Hoje'
      }
    ];
    localStorage.setItem(adminApprovedKey, JSON.stringify(seed));
    return seed;
  }
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAdminApproved(list) {
  localStorage.setItem(adminApprovedKey, JSON.stringify(list));
}

function loadAdminList(source) {
  return source === 'approved' ? loadAdminApproved() : loadAdminPending();
}

function saveAdminList(source, list) {
  if (source === 'approved') {
    saveAdminApproved(list);
  } else {
    saveAdminPending(list);
  }
}

function loadAdminPayouts() {
  const saved = localStorage.getItem(adminPayoutsKey);
  if (!saved) {
    const seed = [
      { id: 401, orderId: 1201, restaurant: 'Bistro do Porto', user: 'Marina Lopes', amount: 12.5, status: 'pendente' },
      { id: 402, orderId: 1202, restaurant: 'Cantina 27', user: 'Joao Silva', amount: 9.5, status: 'pendente' },
      { id: 403, orderId: 1203, restaurant: 'Casa do Sabor', user: 'Carla Mendes', amount: 18, status: 'pago' },
      { id: 404, orderId: 1204, restaurant: 'Estacao Verde', user: 'Ana Souza', amount: 7, status: 'pendente' }
    ];
    localStorage.setItem(adminPayoutsKey, JSON.stringify(seed));
    return seed;
  }
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAdminPayouts(list) {
  localStorage.setItem(adminPayoutsKey, JSON.stringify(list));
}

function syncPayoutsFromPaidOrders() {
  const payouts = loadAdminPayouts();
  const existingOrderIds = new Set(payouts.map(item => item.orderId));
  const newEntries = [];
  state.paidOrders.forEach(order => {
    if (!order || existingOrderIds.has(order.id)) return;
    order.items.forEach(item => {
      newEntries.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        orderId: order.id,
        restaurant: item.restaurant,
        user: order.user || 'Cliente Demo',
        amount: item.price * item.qty,
        status: 'pendente'
      });
    });
  });
  if (newEntries.length) {
    saveAdminPayouts([...newEntries, ...payouts]);
  }
}

function loadAdminSupport() {
  const saved = localStorage.getItem(adminSupportKey);
  if (!saved) {
    const seed = [
      {
        id: 501,
        user: 'Ana Souza',
        issue: 'Pedido atrasado',
        status: 'aberto',
        priority: 'alta',
        sla: '2h',
        note: '',
        createdAt: 'Hoje 08:10',
        assigned: 'Equipe A',
        history: [
          { time: '08:10', actor: 'Cliente', action: 'Ticket aberto' },
          { time: '08:35', actor: 'Suporte', action: 'Contato com restaurante' }
        ]
      },
      {
        id: 502,
        user: 'Lucas Lima',
        issue: 'Item faltando',
        status: 'em andamento',
        priority: 'media',
        sla: '6h',
        note: '',
        createdAt: 'Hoje 07:20',
        assigned: 'Equipe B',
        history: [
          { time: '07:20', actor: 'Cliente', action: 'Ticket aberto' },
          { time: '07:45', actor: 'Suporte', action: 'Solicitou comprovante' }
        ]
      },
      {
        id: 503,
        user: 'Carla Mendes',
        issue: 'Nao conseguiu retirar',
        status: 'aberto',
        priority: 'alta',
        sla: '4h',
        note: '',
        createdAt: 'Ontem 18:10',
        assigned: 'Equipe A',
        history: [
          { time: '18:10', actor: 'Cliente', action: 'Ticket aberto' }
        ]
      },
      {
        id: 504,
        user: 'Pedro Santos',
        issue: 'Cobranca duplicada',
        status: 'aberto',
        priority: 'alta',
        sla: '1h',
        note: '',
        createdAt: 'Hoje 09:00',
        assigned: 'Equipe C',
        history: [
          { time: '09:00', actor: 'Cliente', action: 'Ticket aberto' },
          { time: '09:05', actor: 'Suporte', action: 'Analise iniciada' }
        ]
      },
      {
        id: 505,
        user: 'Fernanda Lima',
        issue: 'Problema com QR',
        status: 'aberto',
        priority: 'baixa',
        sla: '12h',
        note: '',
        createdAt: 'Hoje 06:40',
        assigned: 'Equipe D',
        history: [
          { time: '06:40', actor: 'Cliente', action: 'Ticket aberto' }
        ]
      },
      {
        id: 506,
        user: 'Rafael Costa',
        issue: 'Nao recebeu o pedido',
        status: 'em andamento',
        priority: 'alta',
        sla: '2h',
        note: '',
        createdAt: 'Ontem 19:10',
        assigned: 'Equipe B',
        history: [
          { time: '19:10', actor: 'Cliente', action: 'Ticket aberto' },
          { time: '19:35', actor: 'Suporte', action: 'Contato com entregador' }
        ]
      },
      {
        id: 507,
        user: 'Juliana Prado',
        issue: 'Restaurante fechado',
        status: 'aberto',
        priority: 'alta',
        sla: '3h',
        note: '',
        createdAt: 'Hoje 10:05',
        assigned: 'Equipe A',
        history: [
          { time: '10:05', actor: 'Cliente', action: 'Ticket aberto' }
        ]
      },
      {
        id: 508,
        user: 'Bruno Alves',
        issue: 'Pix nao confirmado',
        status: 'em andamento',
        priority: 'media',
        sla: '5h',
        note: '',
        createdAt: 'Hoje 09:20',
        assigned: 'Equipe C',
        history: [
          { time: '09:20', actor: 'Cliente', action: 'Ticket aberto' },
          { time: '09:40', actor: 'Suporte', action: 'Solicitou comprovante' }
        ]
      },
      {
        id: 509,
        user: 'Patricia Nunes',
        issue: 'Dificuldade no login',
        status: 'aberto',
        priority: 'baixa',
        sla: '12h',
        note: '',
        createdAt: 'Hoje 08:50',
        assigned: 'Equipe D',
        history: [
          { time: '08:50', actor: 'Cliente', action: 'Ticket aberto' }
        ]
      },
      {
        id: 510,
        user: 'Carlos Mota',
        issue: 'Pedido cancelado sem aviso',
        status: 'resolvido',
        priority: 'media',
        sla: '8h',
        note: '',
        createdAt: 'Ontem 15:30',
        assigned: 'Equipe B',
        history: [
          { time: '15:30', actor: 'Cliente', action: 'Ticket aberto' },
          { time: '16:10', actor: 'Suporte', action: 'Reembolso aprovado' },
          { time: '16:40', actor: 'Suporte', action: 'Ticket resolvido' }
        ]
      }
    ];
    localStorage.setItem(adminSupportKey, JSON.stringify(seed));
    return seed;
  }
  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set();
    const deduped = [];
    parsed.forEach(item => {
      if (!item || seen.has(item.id)) return;
      seen.add(item.id);
      deduped.push(item);
    });
    if (deduped.length !== parsed.length) {
      localStorage.setItem(adminSupportKey, JSON.stringify(deduped));
    }
    return deduped;
  } catch {
    return [];
  }
}

function saveAdminSupport(list) {
  localStorage.setItem(adminSupportKey, JSON.stringify(list));
}

function loadAdminAudit() {
  const saved = localStorage.getItem(adminAuditKey);
  if (!saved) {
    const seed = [
      { id: 601, action: 'Painel acessado', target: 'Admin', time: 'Hoje 09:02' },
      { id: 602, action: 'Restaurante aprovado', target: 'Cantinho Mineiro', time: 'Ontem 18:40' }
    ];
    localStorage.setItem(adminAuditKey, JSON.stringify(seed));
    return seed;
  }
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAdminAudit(list) {
  localStorage.setItem(adminAuditKey, JSON.stringify(list));
}

function addAuditEntry(action, target) {
  const entries = loadAdminAudit();
  entries.unshift({
    id: Date.now(),
    action,
    target,
    time: new Date().toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  });
  saveAdminAudit(entries.slice(0, 20));
}

function getAllMeals() {
  const restaurantMeals = loadRestaurantMeals();
  const enriched = restaurantMeals.map(meal => ({
    ...meal,
    restaurant: meal.restaurant || state.restaurantProfile.name,
    neighborhood: meal.neighborhood || state.restaurantProfile.neighborhood
  }));
  return [...state.meals, ...enriched];
}

function loadRestaurantOrders() {
  const saved = localStorage.getItem(restaurantOrdersKey);
  if (!saved) {
    const seed = [
      { id: 1001, name: 'Marina Lopes', meal: 'Prato do dia mediterraneo', status: 'preparando', history: [] },
      { id: 1002, name: 'Joao Silva', meal: 'Combo executivo', status: 'novo', history: [] },
      { id: 1003, name: 'Carla Mendes', meal: 'Bowl vegetariano', status: 'pronto', history: [] }
    ];
    localStorage.setItem(restaurantOrdersKey, JSON.stringify(seed));
    return seed;
  }
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRestaurantOrders(orders) {
  localStorage.setItem(restaurantOrdersKey, JSON.stringify(orders));
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

function demoIngredients(name) {
  const key = name.toLowerCase();
  if (key.includes('mediterraneo')) return 'frango, arroz, tomate, azeitona, ervas';
  if (key.includes('executivo')) return 'carne, arroz, feijao, batata, salada';
  if (key.includes('massa')) return 'massa, molho de tomate, queijo, manjericao';
  if (key.includes('bowl')) return 'quinoa, grao de bico, cenoura, abobrinha';
  if (key.includes('cafe')) return 'cafe, leite, farinha, acucar, ovos';
  return 'ingredientes variados';
}

function demoAllergens(name) {
  const key = name.toLowerCase();
  if (key.includes('massa')) return ['Gluten', 'Lactose'];
  if (key.includes('executivo')) return ['Gluten'];
  if (key.includes('cafe')) return ['Lactose', 'Ovos', 'Gluten'];
  if (key.includes('mediterraneo')) return ['Gluten'];
  return [];
}

function uniqueRestaurants() {
  const map = new Map();
  getAllMeals().forEach(meal => {
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
  getAllMeals().forEach(meal => {
    counts.set(meal.restaurant, (counts.get(meal.restaurant) || 0) + 1);
  });
  return counts;
}

function restaurantMatches(rest, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  if (rest.name.toLowerCase().includes(q)) return true;
  if (rest.neighborhood.toLowerCase().includes(q)) return true;
  return getAllMeals().some(meal =>
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

function adminScopeActive(scope) {
  return state.adminScope === 'all' || state.adminScope === scope;
}

function adminMatchesSearch(text, scope) {
  if (!adminScopeActive(scope)) return true;
  if (!state.adminSearch) return true;
  return text.toLowerCase().includes(state.adminSearch);
}

function payoutMatchesSearch(item) {
  if (!state.adminPayoutSearch) return false;
  const search = state.adminPayoutSearch;
  return `${item.orderId} ${item.restaurant} ${item.user}`.toLowerCase().includes(search);
}

function supportMatches(ticket) {
  if (state.adminSupportFilter === 'novos') {
    if (ticket.status !== 'aberto') return false;
  } else if (ticket.priority !== state.adminSupportFilter) {
    return false;
  }
  if (!state.adminSupportSearch) return true;
  return `${ticket.user} ${ticket.issue} ${ticket.id}`.toLowerCase().includes(state.adminSupportSearch);
}

function supportPriorityScore(priority) {
  if (priority === 'alta') return 1;
  if (priority === 'media') return 2;
  return 3;
}

function supportStatusScore(status) {
  if (status === 'aberto') return 1;
  if (status === 'em andamento') return 2;
  return 3;
}

function sortSupportTickets(list) {
  return list.slice().sort((a, b) => {
    const priorityDiff = supportPriorityScore(a.priority) - supportPriorityScore(b.priority);
    if (priorityDiff !== 0) return priorityDiff;
    const statusDiff = supportStatusScore(a.status) - supportStatusScore(b.status);
    if (statusDiff !== 0) return statusDiff;
    return b.id - a.id;
  });
}

function allergenLetter(value) {
  const normalized = value.toLowerCase();
  if (normalized.includes('gluten')) return 'G';
  if (normalized.includes('lactose')) return 'L';
  if (normalized.includes('castanha')) return 'C';
  if (normalized.includes('ovo')) return 'O';
  if (normalized.includes('fruto do mar') || normalized.includes('mar')) return 'F';
  return value.trim().charAt(0).toUpperCase() || '?';
}

function renderAllergenChips() {
  const container = document.getElementById('allergen-chips');
  if (!container) return;
  container.innerHTML = '';
  if (!restaurantAllergens.length) return;
  restaurantAllergens.forEach(item => {
    const chip = document.createElement('span');
    chip.className = 'allergen-chip';
    chip.innerHTML = `${item}<button type="button" data-item="${item}">x</button>`;
    container.appendChild(chip);
  });
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

function renderRestaurantMeals() {
  const container = document.getElementById('restaurant-meals');
  if (!container) return;
  const meals = loadRestaurantMeals();
  if (!meals.length) {
    container.innerHTML = '<p><small>Nenhuma refeicao publicada.</small></p>';
    return;
  }
  container.innerHTML = '';
  meals.forEach(meal => {
    const row = document.createElement('div');
    row.className = 'list-item';
    const allergens = Array.isArray(meal.allergens) && meal.allergens.length
      ? meal.allergens.join(', ')
      : 'Nenhum';
    row.innerHTML = `
      <strong>${meal.name}</strong>
      <div><small>De ${formatBRL(meal.original)} por ${formatBRL(meal.price)}</small></div>
      <div><small>Disponivel: ${meal.available}</small></div>
      <div><small>Ingredientes: ${meal.ingredients || 'Nao informado'}</small></div>
      <div><small>Alergenos: ${allergens}</small></div>
    `;
    container.appendChild(row);
  });
}

function renderRestaurantOrders() {
  const container = document.getElementById('restaurant-orders');
  if (!container) return;
  const orders = loadRestaurantOrders();
  let changed = false;
  orders.forEach(order => {
    if (!order.lineId) {
      const safe = String(order.meal || 'item').toLowerCase().replace(/\s+/g, '-');
      order.lineId = `${order.id}-${safe}`;
      changed = true;
    }
  });
  if (changed) saveRestaurantOrders(orders);
  container.innerHTML = '';
  orders.forEach(order => {
    const row = document.createElement('div');
    row.className = 'list-item';
    const statusClass = order.status === 'pronto' || order.status === 'retirado'
      ? 'status-ready'
      : order.status === 'preparando'
        ? 'status-prep'
        : '';
    const history = Array.isArray(order.history) ? order.history : [];
    const historyHtml = history.length
      ? history.map(item => `<div>${item.time} - ${item.status}</div>`).join('')
      : '<div>Sem atualizacoes</div>';
    row.innerHTML = `
      <strong>Pedido #${order.id}</strong>
      <div><small>${order.name}</small></div>
      <div><small>${order.meal}</small></div>
      <span class="status-pill ${statusClass}">${order.status}</span>
      <div class="status-history"><small>Historico</small>${historyHtml}</div>
      <div class="modal-actions">
        <button class="btn secondary order-status" data-line-id="${order.lineId}" data-status="preparando">Preparando</button>
        <button class="btn secondary order-status" data-line-id="${order.lineId}" data-status="pronto">Pronto</button>
        <button class="btn order-status" data-line-id="${order.lineId}" data-status="retirado">Confirmar retirada</button>
      </div>
    `;
    container.appendChild(row);
  });
}

function renderAdminDashboard() {
  const metrics = document.getElementById('admin-metrics');
  const approvals = document.getElementById('admin-approvals');
  const summary = document.getElementById('admin-summary');
  const restaurantsList = document.getElementById('admin-restaurants');
  const ordersList = document.getElementById('admin-orders');
  const payoutsList = document.getElementById('admin-payouts');
  const supportList = document.getElementById('admin-support');
  const alertsList = document.getElementById('admin-alerts');
  const auditList = document.getElementById('admin-audit');
  const supportFilters = document.querySelectorAll('.support-filter');
  const supportCountsEl = document.getElementById('support-counts');
  if (!metrics || !approvals) return;

  const restaurants = uniqueRestaurants();
  const pending = loadAdminPending();
  const approved = loadAdminApproved();
  syncPayoutsFromPaidOrders();
  const payouts = loadAdminPayouts();
  const support = sortSupportTickets(loadAdminSupport());
  const audit = loadAdminAudit();
  const restaurantOrders = loadRestaurantOrders();
  const supportFiltered = support.filter(ticket => supportMatches(ticket));
  const supportCounts = {
    novos: support.filter(item => item.status === 'aberto').length,
    alta: support.filter(item => item.priority === 'alta').length,
    media: support.filter(item => item.priority === 'media').length,
    baixa: support.filter(item => item.priority === 'baixa').length
  };

  supportFilters.forEach(button => {
    button.classList.toggle('active', button.dataset.priority === state.adminSupportFilter);
    const key = button.dataset.priority;
    if (key && supportCounts[key] !== undefined) {
      const label = key === 'novos'
        ? `Novos (${supportCounts[key]})`
        : `${key.charAt(0).toUpperCase() + key.slice(1)} (${supportCounts[key]})`;
      button.textContent = label;
    }
  });
  if (supportCountsEl) {
    supportCountsEl.innerHTML = `<span>Tickets: ${support.length}</span><span>Novos: ${supportCounts.novos}</span>`;
  }

  metrics.innerHTML = '';
  const metricItems = [
    { label: 'Restaurantes ativos', value: restaurants.length },
    { label: 'Refeicoes no feed', value: getAllMeals().length },
    { label: 'Pedidos pagos', value: state.paidOrders.length },
    { label: 'Pendentes', value: pending.length },
    { label: 'Aprovados', value: approved.length },
    { label: 'Tickets abertos', value: support.filter(item => item.status !== 'resolvido').length }
  ];
  metricItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'admin-metric';
    card.innerHTML = `<strong>${item.value}</strong><small>${item.label}</small>`;
    metrics.appendChild(card);
  });

  approvals.innerHTML = '';
  pending
    .filter(item => adminMatchesSearch(`${item.name} ${item.neighborhood} ${item.category || ''}`, 'restaurants'))
    .forEach(item => {
    const row = document.createElement('div');
    row.className = 'list-item';
    const docClass = item.docStatus === 'verificado' ? 'success' : 'warn';
    const photoCount = Array.isArray(item.photoUrls) ? item.photoUrls.length : (item.photos || 0);
    row.innerHTML = `
      <strong>${item.name}</strong>
      <div><small>${item.neighborhood}</small></div>
      <div class="admin-meta">
        <span class="admin-pill">${item.category || 'Categoria'}</span>
        <span class="admin-pill ${docClass}">Docs: ${item.docStatus || 'pendente'}</span>
        <span class="admin-pill">Fotos: ${photoCount}</span>
      </div>
      <div class="admin-actions">
        <button class="btn secondary admin-restaurant-view" data-id="${item.id}" data-source="pending">Ver detalhes</button>
        <button class="btn secondary admin-action" data-id="${item.id}" data-action="reject">Rejeitar</button>
        <button class="btn admin-action" data-id="${item.id}" data-action="approve">Aprovar</button>
      </div>
    `;
    approvals.appendChild(row);
  });

  if (summary) {
    const pendingPayouts = payouts.filter(item => item.status === 'pendente').length;
    summary.innerHTML = `
      <div class="admin-metric"><strong>${pending.length}</strong><small>Solicitacoes pendentes</small></div>
      <div class="admin-metric"><strong>${approved.length}</strong><small>Restaurantes aprovados</small></div>
      <div class="admin-metric"><strong>${state.paidOrders.length}</strong><small>Pedidos pagos</small></div>
      <div class="admin-metric"><strong>${pendingPayouts}</strong><small>Pagamentos pendentes</small></div>
    `;
  }

  if (restaurantsList) {
    restaurantsList.innerHTML = '';
    const list = approved.length ? approved : restaurants.map((r, i) => ({
      id: 300 + i,
      name: r.name,
      neighborhood: r.neighborhood
    }));
    list
      .filter(item => adminMatchesSearch(`${item.name} ${item.neighborhood}`, 'restaurants'))
      .forEach(item => {
      const row = document.createElement('div');
      row.className = 'list-item';
      const category = item.category || 'Refeicoes';
      row.innerHTML = `
        <strong>${item.name}</strong>
        <div><small>${item.neighborhood}</small></div>
        <div class="admin-meta"><span class="admin-pill">${category}</span><span class="admin-pill success">ativo</span></div>
        <div class="admin-actions">
          <button class="btn secondary admin-restaurant-view" data-id="${item.id}" data-source="approved">Ver</button>
          <button class="btn secondary">Pausar</button>
        </div>
      `;
      restaurantsList.appendChild(row);
    });
  }

  if (ordersList) {
    ordersList.innerHTML = '';
    const orders = state.paidOrders
      .filter(order => adminMatchesSearch(`${order.id} ${order.items.map(item => item.name).join(' ')}`, 'orders'))
      .slice(0, 6);
    if (!orders.length) {
      ordersList.innerHTML = '<p><small>Nenhum pedido pago ainda.</small></p>';
    } else {
      orders.forEach(order => {
        const row = document.createElement('div');
        row.className = 'list-item';
        row.innerHTML = `
          <strong>Pedido #${order.id}</strong>
          <div><small>Total: ${formatBRL(order.total)}</small></div>
          <div><small>Status: Pago</small></div>
          <div class="admin-actions">
            <button class="btn secondary admin-order-view" data-order-id="${order.id}">Detalhes</button>
            <button class="btn secondary">Reembolso</button>
          </div>
        `;
        ordersList.appendChild(row);
      });
    }
  }

  if (payoutsList) {
    payoutsList.innerHTML = '';
    if (!state.adminPayoutSearch) {
      payoutsList.innerHTML = '<p><small>Use a busca para localizar pagamentos.</small></p>';
    } else {
      const filtered = payouts.filter(item => payoutMatchesSearch(item));
      if (!filtered.length) {
        payoutsList.innerHTML = '<p><small>Nenhum pagamento encontrado.</small></p>';
      } else {
        filtered.forEach(item => {
        const row = document.createElement('div');
        row.className = 'list-item';
        const statusClass = item.status === 'pago' ? 'success' : 'warn';
        row.innerHTML = `
          <strong>Pedido #${item.orderId}</strong>
          <div><small>${item.restaurant} - ${item.user}</small></div>
          <div><small>Repasse: ${formatBRL(item.amount)}</small></div>
          <div class="admin-row">
            <span class="admin-pill ${statusClass}">${item.status}</span>
          </div>
          <div class="admin-actions">
            <button class="btn secondary">Detalhes</button>
            ${item.status === 'pendente'
              ? `<button class="btn admin-payout" data-id="${item.id}">Marcar pago</button>`
              : `<button class="btn secondary" disabled>Pago</button>`}
          </div>
        `;
        payoutsList.appendChild(row);
        });
      }
    }
  }

  if (supportList) {
    supportList.innerHTML = '';
    if (!supportFiltered.length) {
      supportList.innerHTML = '<p><small>Nenhum ticket encontrado.</small></p>';
    } else {
      supportFiltered.forEach(ticket => {
      const row = document.createElement('div');
      row.className = 'list-item';
      const priorityClass = ticket.priority === 'alta' ? 'danger' : ticket.priority === 'media' ? 'warn' : 'success';
      const isSelected = ticket.id === state.adminSelectedTicketId;
      row.innerHTML = `
        <strong>Ticket #${ticket.id}</strong>
        <div><small>${ticket.user}</small></div>
        <div><small>${ticket.issue}</small></div>
        <div class="admin-row">
          <span class="admin-pill ${priorityClass}">${ticket.priority}</span>
          <span class="admin-pill">${ticket.sla}</span>
          <span class="admin-pill">${ticket.status}</span>
        </div>
        <select class="support-priority admin-support-priority" data-id="${ticket.id}">
          <option value="alta" ${ticket.priority === 'alta' ? 'selected' : ''}>Alta</option>
          <option value="media" ${ticket.priority === 'media' ? 'selected' : ''}>Media</option>
          <option value="baixa" ${ticket.priority === 'baixa' ? 'selected' : ''}>Baixa</option>
        </select>
        <textarea class="admin-note" id="support-note-${ticket.id}" placeholder="Notas internas">${ticket.note || ''}</textarea>
        <div class="admin-actions">
          <button class="btn secondary admin-support" data-id="${ticket.id}" data-action="save">Salvar nota</button>
          <button class="btn secondary admin-support" data-id="${ticket.id}" data-action="close">Encerrar</button>
          <button class="btn ${isSelected ? '' : 'secondary'} admin-support-view" data-id="${ticket.id}">Ver detalhes</button>
        </div>
      `;
      supportList.appendChild(row);
      });
    }
  }

  if (alertsList) {
    alertsList.innerHTML = '';
    const pendingDocs = pending.filter(item => item.docStatus !== 'verificado').length;
    const pendingPayouts = payouts.filter(item => item.status === 'pendente').length;
    const highPriority = support.filter(item => item.priority === 'alta' && item.status !== 'resolvido').length;
    const newOrders = restaurantOrders.filter(item => item.status === 'novo').length;
    const alerts = [];
    if (pending.length) alerts.push({ label: `${pending.length} restaurantes aguardando aprovacao`, level: 'warn' });
    if (pendingDocs) alerts.push({ label: `${pendingDocs} cadastros com docs pendentes`, level: 'danger' });
    if (pendingPayouts) alerts.push({ label: `${pendingPayouts} pagamentos pendentes`, level: 'warn' });
    if (highPriority) alerts.push({ label: `${highPriority} tickets alta prioridade`, level: 'danger' });
    if (newOrders) alerts.push({ label: `${newOrders} pedidos novos sem status`, level: 'warn' });
    if (!alerts.length) {
      alertsList.innerHTML = '<p><small>Nenhum alerta no momento.</small></p>';
    } else {
      alerts.forEach(alert => {
        const row = document.createElement('div');
        row.className = 'admin-alert';
        row.innerHTML = `
          <div class="admin-row">
            <span class="admin-pill ${alert.level}">${alert.level}</span>
            <span><small>${alert.label}</small></span>
          </div>
        `;
        alertsList.appendChild(row);
      });
    }
  }

  if (auditList) {
    auditList.innerHTML = '';
    const entries = audit.slice(0, 8);
    if (!entries.length) {
      auditList.innerHTML = '<p><small>Nenhuma acao registrada.</small></p>';
    } else {
      entries.forEach(entry => {
        const row = document.createElement('div');
        row.className = 'admin-audit-item';
        row.innerHTML = `
          <strong>${entry.action}</strong>
          <div><small>${entry.target}</small></div>
          <div><small>${entry.time}</small></div>
        `;
        auditList.appendChild(row);
      });
    }
  }
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
          <div><small>Qtd: ${item.qty} - ${formatBRL(item.price * item.qty)}</small></div>
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

function renderAdminRestaurantModal(item, source) {
  const container = document.getElementById('admin-restaurant-body');
  if (!container || !item) return;
  const documents = Array.isArray(item.documents) ? item.documents : [];
  const photos = Array.isArray(item.photoUrls) ? item.photoUrls : [];
  const photoNames = Array.isArray(item.photoNames) ? item.photoNames : [];
  const docHtml = documents.length
    ? documents.map(doc => `
      <div class="admin-doc">
        <span>${doc}</span>
        <button class="btn secondary admin-doc-download" data-id="${item.id}" data-doc="${doc}">Baixar</button>
      </div>
    `).join('')
    : '<div class="admin-doc">Sem documentos enviados</div>';
  const photoHtml = photos.length
    ? photos.map((url, index) => {
        const label = photoNames[index] || `Foto ${index + 1}`;
        return `
          <div class="admin-doc">
            <span>${label}</span>
            <button class="btn secondary admin-photo-open" data-url="${url}">Abrir</button>
          </div>
        `;
      }).join('')
    : '<div class="admin-doc">Sem fotos enviadas</div>';
  container.innerHTML = `
    <div class="list-item">
      <strong>${item.name}</strong>
      <div><small>${item.neighborhood}</small></div>
      <div class="admin-meta">
        <span class="admin-pill">${item.category || 'Categoria'}</span>
        <span class="admin-pill">${item.docNumber || '-'}</span>
        <span class="admin-pill">${item.contact || '-'}</span>
      </div>
      <div><small>Horario: ${item.hours || '-'}</small></div>
      <div><small>Recebido: ${item.createdAt || '-'}</small></div>
    </div>
    <div class="list-item">
      <strong>Documentos</strong>
      <div><small>Status dos documentos</small></div>
      <select class="support-priority admin-doc-status" id="admin-doc-status">
        <option value="pendente" ${item.docStatus === 'pendente' ? 'selected' : ''}>Pendente</option>
        <option value="verificado" ${item.docStatus === 'verificado' ? 'selected' : ''}>Verificado</option>
      </select>
      <div class="admin-doc-list">${docHtml}</div>
      <div class="admin-upload">
        <label class="upload-label">
          <input type="file" id="admin-doc-upload" multiple />
          <span>Enviar documentos</span>
        </label>
      </div>
    </div>
    <div class="list-item">
      <strong>Fotos do restaurante</strong>
      <div class="admin-doc-list">${photoHtml}</div>
      <div class="admin-upload">
        <label class="upload-label">
          <input type="file" id="admin-photo-upload" accept="image/*" multiple />
          <span>Enviar fotos</span>
        </label>
      </div>
    </div>
  `;
  const docInput = document.getElementById('admin-doc-upload');
  const photoInput = document.getElementById('admin-photo-upload');
  if (docInput) {
    docInput.addEventListener('change', () => {
      const list = loadAdminList(source);
      const target = list.find(entry => entry.id === item.id);
      if (!target) return;
      const names = Array.from(docInput.files).map(file => file.name);
      target.documents = Array.from(new Set([...(target.documents || []), ...names]));
      saveAdminList(source, list);
      addAuditEntry('Documentos enviados', target.name);
      renderAdminRestaurantModal(target, source);
      renderAdminDashboard();
    });
  }
  const statusSelect = document.getElementById('admin-doc-status');
  if (statusSelect) {
    statusSelect.addEventListener('change', () => {
      const list = loadAdminList(source);
      const target = list.find(entry => entry.id === item.id);
      if (!target) return;
      target.docStatus = statusSelect.value;
      saveAdminList(source, list);
      addAuditEntry('Status de documentos atualizado', target.name);
      renderAdminRestaurantModal(target, source);
      renderAdminDashboard();
    });
  }
  if (photoInput) {
    photoInput.addEventListener('change', () => {
      const list = loadAdminList(source);
      const target = list.find(entry => entry.id === item.id);
      if (!target) return;
      const files = Array.from(photoInput.files);
      const readers = files.map(file => new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      }));
      Promise.all(readers).then(results => {
        target.photoUrls = [...(target.photoUrls || []), ...results];
        const names = files.map(file => file.name);
        target.photoNames = [...(target.photoNames || []), ...names];
        target.photos = target.photoUrls.length;
        saveAdminList(source, list);
        addAuditEntry('Fotos enviadas', target.name);
        renderAdminRestaurantModal(target, source);
        renderAdminDashboard();
      });
    });
  }
}

function renderAdminOrderModal(order) {
  const container = document.getElementById('admin-order-body');
  if (!container || !order) return;
  const itemsHtml = order.items.map(item => `
    <div class="list-item">
      <strong>${item.name}</strong>
      <div><small>${item.restaurant}</small></div>
      <div><small>Qtd: ${item.qty} - ${formatBRL(item.price * item.qty)}</small></div>
    </div>
  `).join('');
  container.innerHTML = `
    <div class="list-item">
      <strong>Pedido #${order.id}</strong>
      <div><small>Cliente: ${order.user || 'Cliente Demo'}</small></div>
      <div><small>Pagamento: ${order.paymentMethod || '-'}</small></div>
      <div><small>Hora: ${order.createdAt || '-'}</small></div>
      <div><small>Retirada ate: ${order.pickupBy || '-'}</small></div>
      <div><small>Total: ${formatBRL(order.total)}</small></div>
    </div>
    <div class="modal-list">${itemsHtml}</div>
  `;
}

function renderSupportModal(ticket) {
  const container = document.getElementById('support-modal-body');
  if (!container || !ticket) return;
  const history = Array.isArray(ticket.history) ? ticket.history : [];
  const historyHtml = history.length
    ? history.map(item => `<div>${item.time} - ${item.actor}: ${item.action}</div>`).join('')
    : '<div>Sem historico.</div>';
  container.innerHTML = `
    <div class="list-item">
      <strong>Ticket #${ticket.id}</strong>
      <div><small>Aberto em: ${ticket.createdAt || '-'}</small></div>
      <div><small>Cliente: ${ticket.user}</small></div>
      <div><small>Responsavel: ${ticket.assigned || 'Nao definido'}</small></div>
      <div><small>Status: ${ticket.status}</small></div>
      <div><small>Assunto: ${ticket.issue}</small></div>
      <div><small>Prioridade atual:</small></div>
      <select class="support-priority admin-support-priority" data-id="${ticket.id}">
        <option value="alta" ${ticket.priority === 'alta' ? 'selected' : ''}>Alta</option>
        <option value="media" ${ticket.priority === 'media' ? 'selected' : ''}>Media</option>
        <option value="baixa" ${ticket.priority === 'baixa' ? 'selected' : ''}>Baixa</option>
      </select>
      <div class="support-history">${historyHtml}</div>
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
  ['orders-modal', 'profile-modal', 'payment-modal', 'map-modal', 'login-modal', 'restaurant-confirm-modal', 'admin-register-modal', 'support-modal', 'admin-restaurant-modal', 'admin-order-modal'].forEach(closeOverlayModal);
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
        <div><small>${item.qty}x ${item.name} - ${formatBRL(item.price * item.qty)}</small></div>
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
  const meals = getAllMeals().filter(meal =>
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
    const shortIngredients = meal.ingredients
      ? meal.ingredients.slice(0, 60) + (meal.ingredients.length > 60 ? '...' : '')
      : 'Ingredientes nao informados';
    const allergens = Array.isArray(meal.allergens) ? meal.allergens : [];
    const allergenIcons = allergens.length
      ? allergens.map(item => `<span class="allergen-icon" title="${item}">${allergenLetter(item)}</span>`).join('')
      : '';
    const row = document.createElement('div');
    row.className = 'meal';
    row.innerHTML = `
      <div class="meal-thumb" style="${meal.image ? `background-image: url('${meal.image}');` : image ? `background-image: url('${encodeURI(image)}');` : 'background: linear-gradient(135deg, #f8d9b6, #f1c373);'}"></div>
      <div>
        <strong>${meal.name}</strong>
        <div><small>${meal.restaurant} - ${meal.neighborhood}</small></div>
        <div><small>Retire ate ${pickupLimit()}</small></div>
        <div><small>De ${formatBRL(meal.original)} por ${formatBRL(meal.price)}</small></div>
        <div class="ingredient-line">
          <span>Ingredientes: ${shortIngredients}</span>
          <span class="info-icon" data-tip="${meal.ingredients || 'Nao informado'}">i</span>
        </div>
        ${allergenIcons ? `<div class="allergen-icons">${allergenIcons}</div>` : ''}
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
  const meal = getAllMeals().find(item => item.id === id);
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
    pickupBy: pickupLimit(),
    createdAt: new Date().toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    paymentMethod: state.paymentMethod,
    user: 'Cliente Demo'
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
  const pending = loadAdminPending();
  const entry = {
    id: Date.now(),
    name: document.getElementById('r-name').value.trim(),
    neighborhood: document.getElementById('r-neighborhood').value.trim(),
    docNumber: document.getElementById('r-doc').value.trim(),
    category: document.getElementById('r-category').value,
    hours: document.getElementById('r-hours').value.trim(),
    contact: document.getElementById('r-contact').value.trim(),
    docStatus: document.getElementById('r-doc-status').value,
    photos: 3,
    createdAt: 'Hoje'
  };

  pending.unshift(entry);
  saveAdminPending(pending);
  addAuditEntry('Cadastro recebido', `${entry.name} - ${entry.neighborhood}`);
  renderAdminDashboard();
  event.target.reset();
});

function updateRoute() {
  const isAdmin = window.location.hash === '#admin';
  const isRestaurant = window.location.hash === '#restaurant';
  const showUser = !isAdmin && !isRestaurant;

  const topBar = document.getElementById('top-bar');
  if (topBar) topBar.style.display = isAdmin ? 'none' : 'grid';

  const adminRoot = document.getElementById('admin');
  if (adminRoot) adminRoot.style.display = isAdmin ? 'block' : 'none';
  document.getElementById('admin-dashboard').style.display = isAdmin ? 'block' : 'none';
  document.getElementById('restaurant-dashboard').style.display = isRestaurant ? 'block' : 'none';
  document.getElementById('marketplace').style.display = showUser ? 'block' : 'none';
  document.getElementById('bottom-nav').style.display = showUser ? 'grid' : 'none';
  if (!showUser) {
    document.getElementById('restaurant-detail').classList.add('hidden');
  }
  if (isRestaurant) {
    renderRestaurantMeals();
    renderRestaurantOrders();
  }
  if (isAdmin) {
    renderAdminDashboard();
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

document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(panel => panel.classList.remove('active'));
    tab.classList.add('active');
    document.querySelector(`[data-admin-panel="${tab.dataset.admin}"]`)?.classList.add('active');
  });
});

const adminPayoutSearch = document.getElementById('admin-payout-search');
if (adminPayoutSearch) {
  adminPayoutSearch.addEventListener('input', event => {
    state.adminPayoutSearch = event.target.value.trim().toLowerCase();
    renderAdminDashboard();
  });
}

const adminSupportSearch = document.getElementById('admin-support-search');
if (adminSupportSearch) {
  adminSupportSearch.addEventListener('input', event => {
    state.adminSupportSearch = event.target.value.trim().toLowerCase();
    renderAdminDashboard();
  });
}

document.querySelectorAll('.support-filter').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.support-filter').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    state.adminSupportFilter = button.dataset.priority || 'novos';
    renderAdminDashboard();
  });
});


document.querySelectorAll('.modal-close').forEach(button => {
  button.addEventListener('click', event => {
    const target = event.currentTarget.getAttribute('data-close');
    if (target) closeOverlayModal(target);
  });
});

['orders-modal', 'profile-modal', 'payment-modal', 'map-modal', 'login-modal', 'restaurant-confirm-modal', 'admin-register-modal', 'support-modal', 'admin-restaurant-modal', 'admin-order-modal'].forEach(id => {
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
  const restaurantOrders = loadRestaurantOrders();
  const payouts = loadAdminPayouts();
  order.items.forEach(item => {
    const lineId = `${order.id}-${item.id}`;
    restaurantOrders.unshift({
      id: order.id,
      lineId,
      name: 'Cliente Demo',
      meal: item.name,
      status: 'novo',
      history: [
        {
          status: 'novo',
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ]
    });
    payouts.unshift({
      id: Date.now() + Math.floor(Math.random() * 1000),
      orderId: order.id,
      restaurant: item.restaurant,
      user: order.user || 'Cliente Demo',
      amount: item.price * item.qty,
      status: 'pendente'
    });
  });
  saveRestaurantOrders(restaurantOrders);
  saveAdminPayouts(payouts);
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

document.addEventListener('click', event => {
  const statusButton = event.target.closest('.order-status');
  if (!statusButton) return;
  const lineId = statusButton.dataset.lineId;
  const status = statusButton.dataset.status;
  if (status === 'retirado') {
    state.confirmOrderLineId = lineId;
    const order = loadRestaurantOrders().find(item => item.lineId === lineId);
    const label = order ? `Pedido #${order.id} - ${order.meal}` : 'Pedido';
    document.getElementById('confirm-order-text').textContent = label;
    openOverlayModal('restaurant-confirm-modal');
    return;
  }
  const orders = loadRestaurantOrders();
  const target = orders.find(order => order.lineId === lineId);
  if (!target) return;
  const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  target.status = status;
  target.history = Array.isArray(target.history) ? target.history : [];
  target.history.unshift({ status, time });
  saveRestaurantOrders(orders);
  renderRestaurantOrders();
});

document.getElementById('open-login').addEventListener('click', () => {
  openOverlayModal('login-modal');
});

document.getElementById('open-admin-register').addEventListener('click', () => {
  openOverlayModal('admin-register-modal');
});

document.getElementById('login-role').addEventListener('change', event => {
  const fields = document.getElementById('restaurant-fields');
  fields.classList.toggle('hidden', event.target.value !== 'restaurant');
});

document.getElementById('add-allergen').addEventListener('click', () => {
  const input = document.getElementById('r-meal-allergen');
  const value = input.value.trim();
  if (!value) return;
  if (!restaurantAllergens.includes(value)) {
    restaurantAllergens.push(value);
    renderAllergenChips();
  }
  input.value = '';
});

document.getElementById('r-meal-allergen').addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    document.getElementById('add-allergen').click();
  }
});

document.getElementById('allergen-chips').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  const item = button.dataset.item;
  restaurantAllergens = restaurantAllergens.filter(value => value !== item);
  renderAllergenChips();
});

document.getElementById('login-form').addEventListener('submit', event => {
  event.preventDefault();
  const role = document.getElementById('login-role').value;
  state.role = role;
  if (role === 'restaurant') {
    const name = document.getElementById('login-restaurant-name').value.trim() || 'Restaurante Demo';
    const neighborhood = document.getElementById('login-restaurant-neighborhood').value.trim() || 'Centro';
    state.restaurantProfile = { name, neighborhood };
    saveRestaurantProfile(state.restaurantProfile);
  }
  closeOverlayModal('login-modal');
  if (role === 'restaurant') {
    window.location.hash = '#restaurant';
  } else if (role === 'admin') {
    window.location.hash = '#admin';
  } else {
    window.location.hash = '';
  }
});

document.addEventListener('click', event => {
  const adminButton = event.target.closest('.admin-action');
  if (!adminButton) return;
  const id = Number(adminButton.dataset.id);
  const action = adminButton.dataset.action;
  const pending = loadAdminPending();
  const approved = loadAdminApproved();
  const target = pending.find(item => item.id === id);
  if (!target) return;
  const updatedPending = pending.filter(item => item.id !== id);
  saveAdminPending(updatedPending);
  if (action === 'approve') {
    const approvedEntry = {
      ...target,
      docStatus: target.docStatus || 'verificado',
      documents: Array.isArray(target.documents) ? target.documents : [],
      photoUrls: Array.isArray(target.photoUrls) ? target.photoUrls : [],
      createdAt: target.createdAt || 'Hoje'
    };
    approved.unshift(approvedEntry);
    saveAdminApproved(approved);
    addAuditEntry('Restaurante aprovado', target.name);
  } else {
    addAuditEntry('Restaurante rejeitado', target.name);
  }
  renderAdminDashboard();
});

document.addEventListener('click', event => {
  const viewButton = event.target.closest('.admin-restaurant-view');
  if (!viewButton) return;
  const id = Number(viewButton.dataset.id);
  const source = viewButton.dataset.source || 'pending';
  const list = loadAdminList(source);
  const target = list.find(item => item.id === id);
  if (!target) return;
  renderAdminRestaurantModal(target, source);
  openOverlayModal('admin-restaurant-modal');
});

document.addEventListener('click', event => {
  const orderButton = event.target.closest('.admin-order-view');
  if (!orderButton) return;
  const id = Number(orderButton.dataset.orderId);
  const order = state.paidOrders.find(item => item.id === id);
  if (!order) return;
  renderAdminOrderModal(order);
  openOverlayModal('admin-order-modal');
});

document.addEventListener('click', event => {
  const payoutButton = event.target.closest('.admin-payout');
  if (!payoutButton) return;
  const id = Number(payoutButton.dataset.id);
  const payouts = loadAdminPayouts();
  const target = payouts.find(item => item.id === id);
  if (!target) return;
  target.status = 'pago';
  saveAdminPayouts(payouts);
  addAuditEntry('Pagamento realizado', target.restaurant);
  renderAdminDashboard();
});

document.addEventListener('click', event => {
  const supportButton = event.target.closest('.admin-support');
  if (!supportButton) return;
  const id = Number(supportButton.dataset.id);
  const action = supportButton.dataset.action;
  const tickets = loadAdminSupport();
  const target = tickets.find(item => item.id === id);
  if (!target) return;
  if (action === 'save') {
    const note = document.getElementById(`support-note-${id}`);
    target.note = note ? note.value.trim() : '';
    saveAdminSupport(tickets);
    addAuditEntry('Nota atualizada', `Ticket #${id}`);
  }
  if (action === 'close') {
    target.status = 'resolvido';
    saveAdminSupport(tickets);
    addAuditEntry('Ticket encerrado', `Ticket #${id}`);
  }
  renderAdminDashboard();
});

document.addEventListener('click', event => {
  const viewButton = event.target.closest('.admin-support-view');
  if (!viewButton) return;
  const id = Number(viewButton.dataset.id);
  const tickets = loadAdminSupport();
  const target = tickets.find(item => item.id === id);
  if (!target) return;
  if (target.status === 'aberto') {
    target.status = 'em andamento';
    target.history = Array.isArray(target.history) ? target.history : [];
    target.history.unshift({
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      actor: 'Suporte',
      action: 'Atendimento iniciado'
    });
    saveAdminSupport(tickets);
    addAuditEntry('Ticket em andamento', `Ticket #${id}`);
  }
  state.adminSelectedTicketId = id;
  renderSupportModal(target);
  openOverlayModal('support-modal');
  renderAdminDashboard();
});

document.addEventListener('click', event => {
  const downloadButton = event.target.closest('.admin-doc-download');
  if (!downloadButton) return;
  const docName = downloadButton.dataset.doc || 'documento.txt';
  const id = Number(downloadButton.dataset.id);
  const pending = loadAdminPending();
  const approved = loadAdminApproved();
  const target = pending.find(item => item.id === id) || approved.find(item => item.id === id);
  const content = `Documento: ${docName}\nRestaurante: ${target ? target.name : 'Desconhecido'}`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = docName.replace(/\s+/g, '_');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

document.addEventListener('click', event => {
  const photoButton = event.target.closest('.admin-photo-open');
  if (!photoButton) return;
  const url = photoButton.dataset.url;
  if (!url) return;
  window.open(url, '_blank', 'noopener');
});

document.addEventListener('change', event => {
  const select = event.target.closest('.admin-support-priority');
  if (!select) return;
  const id = Number(select.dataset.id);
  const tickets = loadAdminSupport();
  const target = tickets.find(item => item.id === id);
  if (!target) return;
  target.priority = select.value;
  target.history = Array.isArray(target.history) ? target.history : [];
  target.history.unshift({
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    actor: 'Admin',
    action: `Prioridade ajustada para ${select.value}`
  });
  saveAdminSupport(tickets);
  addAuditEntry('Prioridade alterada', `Ticket #${id}`);
  renderSupportModal(target);
  renderAdminDashboard();
});

document.getElementById('confirm-by-number').addEventListener('click', () => {
  if (!state.confirmOrderLineId) return;
  const orders = loadRestaurantOrders();
  const target = orders.find(order => order.lineId === state.confirmOrderLineId);
  if (!target) return;
  const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  target.status = 'retirado';
  target.history = Array.isArray(target.history) ? target.history : [];
  target.history.unshift({ status: 'retirado', time });
  saveRestaurantOrders(orders);
  renderRestaurantOrders();
  closeOverlayModal('restaurant-confirm-modal');
  state.confirmOrderLineId = null;
});

document.getElementById('confirm-by-qr').addEventListener('click', () => {
  document.getElementById('confirm-by-number').click();
});

document.getElementById('restaurant-meal-form').addEventListener('submit', event => {
  event.preventDefault();
  const imageInput = document.getElementById('r-meal-image');
  const file = imageInput.files[0];
  const readFile = file
    ? new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      })
    : Promise.resolve('');

  readFile.then(imageData => {
    const meal = {
      id: Date.now(),
      restaurant: state.restaurantProfile.name,
      neighborhood: state.restaurantProfile.neighborhood,
      name: document.getElementById('r-meal-name').value.trim(),
      ingredients: document.getElementById('r-meal-ingredients').value.trim(),
      allergens: restaurantAllergens,
      image: imageData,
      price: Number(document.getElementById('r-meal-price').value),
      original: Number(document.getElementById('r-meal-original').value),
      available: Number(document.getElementById('r-meal-available').value)
    };
    const meals = loadRestaurantMeals();
    meals.unshift(meal);
    saveRestaurantMeals(meals);
    renderRestaurantMeals();
    renderRestaurants();
    restaurantAllergens = [];
    renderAllergenChips();
    event.target.reset();
  });
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

