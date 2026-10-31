// Campus Lost & Found Platform - Application Logic & State Engine
// Apex University Student Recovery Hub

const SEED_DATA = {
  users: [
    {
      id: "sarah",
      name: "Sarah Jenkins",
      email: "sarah.j@apex.edu",
      role: "student",
      badge: "Finder"
    },
    {
      id: "alex",
      name: "Alex Chen",
      email: "alex.c@apex.edu",
      role: "student",
      badge: "Claimant"
    },
    {
      id: "admin",
      name: "Officer Davis",
      email: "davis.security@apex.edu",
      role: "admin",
      badge: "Campus Security & Admin"
    }
  ],
  items: [
    {
      id: "item-101",
      type: "FOUND",
      title: "Apple AirPods Pro (2nd Gen) in White Case",
      category: "Electronics",
      building: "Central Library",
      location: "2nd Floor Silent Study Booth #14",
      date: "2026-10-28",
      description: "Found white wireless earbuds in case left on the side desk. Item is safe and charged.",
      photo: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80",
      status: "ACTIVE", // ACTIVE, UNDER_REVIEW, APPROVED, RECOVERED, HIDDEN
      reporterId: "sarah",
      secretQuestion: "What color is the silicone lanyard loop attached to the case and what initials are inside the lid?",
      secretAnswer: "Bright orange lanyard with initials AC",
      claimsCount: 1,
      createdAt: "2026-10-28T14:30:00Z"
    },
    {
      id: "item-102",
      type: "FOUND",
      title: "Official Student University ID Card - Alex Chen",
      category: "ID Cards",
      building: "Student Cafeteria",
      location: "Main Dining Hall, Table 8 near juice counter",
      date: "2026-10-29",
      description: "Found student RFID badge under cafeteria chair. Kept in protective sleeve.",
      photo: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
      status: "ACTIVE",
      reporterId: "sarah",
      secretQuestion: "What is your student matriculation prefix (first 4 digits) and blood group on the card?",
      secretAnswer: "2024-B and O+",
      claimsCount: 0,
      createdAt: "2026-10-29T11:15:00Z"
    },
    {
      id: "item-103",
      type: "LOST",
      title: "Casio fx-991EX ClassWiz Scientific Calculator",
      category: "Stationery",
      building: "Engineering Block A",
      location: "Room 302 during Advanced Calculus Midterms",
      date: "2026-10-30",
      description: "Black and white solar scientific calculator. Has a small NASA space shuttle sticker on the hard slide cover.",
      photo: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80",
      status: "ACTIVE",
      reporterId: "alex",
      secretQuestion: "",
      secretAnswer: "",
      claimsCount: 0,
      createdAt: "2026-10-30T09:45:00Z"
    },
    {
      id: "item-104",
      type: "LOST",
      title: "Matte Navy SwissGear Laptop Backpack",
      category: "Bags",
      building: "Science Lab Complex",
      location: "Physics Lab Benches (Lab 104)",
      date: "2026-10-27",
      description: "Dark blue 15-inch backpack with red Swiss cross emblem. Contains laboratory notebook and thermal flask.",
      photo: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
      status: "ACTIVE",
      reporterId: "alex",
      secretQuestion: "",
      secretAnswer: "",
      claimsCount: 0,
      createdAt: "2026-10-27T16:20:00Z"
    },
    {
      id: "item-105",
      type: "FOUND",
      title: "Keychain with Blue Car Fob & Brass Dorm Key",
      category: "Keys",
      building: "Sports Complex",
      location: "Bleachers near Basketball Court 2",
      date: "2026-10-31",
      description: "Ring with automotive remote key and dorm room key with stamped room number.",
      photo: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80",
      status: "ACTIVE",
      reporterId: "sarah",
      secretQuestion: "What vehicle brand is on the key fob and what 3-digit number is stamped on the brass key?",
      secretAnswer: "Subaru and Room 214",
      claimsCount: 0,
      createdAt: "2026-10-31T08:10:00Z"
    }
  ],
  claims: [
    {
      id: "claim-501",
      itemId: "item-101",
      claimantId: "alex",
      claimantName: "Alex Chen",
      claimantEmail: "alex.c@apex.edu",
      submittedAnswer: "Bright orange silicone loop and initials 'AC' etched inside the lid.",
      additionalProof: "I can unlock them immediately with my paired iPhone (named Alex's AirPods Pro).",
      status: "APPROVED", // PENDING, APPROVED, REJECTED, COMPLETED
      handoverLocation: "Central Library Front Desk",
      handoverTime: "Today at 4:30 PM",
      createdAt: "2026-10-29T15:00:00Z",
      messages: [
        {
          id: "m-1",
          senderId: "sarah",
          senderName: "Sarah Jenkins (Finder)",
          text: "Hi Alex! Your answer matched the orange lanyard and initials perfectly.",
          timestamp: "2026-10-29T15:10:00Z"
        },
        {
          id: "m-2",
          senderId: "alex",
          senderName: "Alex Chen (Owner)",
          text: "Thank you so much Sarah! I was so worried I lost them before midterms. Shall we meet at the Central Library desk?",
          timestamp: "2026-10-29T15:15:00Z"
        },
        {
          id: "m-3",
          senderId: "sarah",
          senderName: "Sarah Jenkins (Finder)",
          text: "Yes, I deposited them with Librarian Mrs. Evans at the Front Desk under claim #501. You can collect anytime with your student card!",
          timestamp: "2026-10-29T15:20:00Z"
        }
      ]
    }
  ],
  notifications: [
    {
      id: "notif-1",
      userId: "sarah",
      title: "Claim Approved & Handover Scheduled",
      message: "Handover set for AirPods Pro at Central Library Front Desk.",
      timestamp: "10 mins ago",
      read: false
    },
    {
      id: "notif-2",
      userId: "alex",
      title: "Claim Approved!",
      message: "Sarah approved your claim for Apple AirPods Pro (2nd Gen).",
      timestamp: "15 mins ago",
      read: false
    }
  ],
  auditLogs: [
    {
      id: "audit-1",
      action: "CLAIM_APPROVED",
      details: "Claim #501 approved by Sarah Jenkins for item #item-101 after successful question match.",
      timestamp: "2026-10-29T15:10:00Z"
    },
    {
      id: "audit-2",
      action: "ITEM_REPORTED",
      details: "Found item #item-105 reported at Sports Complex by Sarah Jenkins.",
      timestamp: "2026-10-31T08:10:00Z"
    }
  ]
};

// State Storage Engine (LocalStorage)
const STORAGE_KEY = 'campus_lost_found_db_v1';
const CURRENT_USER_KEY = 'campus_lost_found_user_v1';

function getDatabase() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return JSON.parse(JSON.stringify(SEED_DATA));
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return JSON.parse(JSON.stringify(SEED_DATA));
  }
}

function saveDatabase(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function getCurrentUser() {
  const uid = localStorage.getItem(CURRENT_USER_KEY) || 'sarah';
  const db = getDatabase();
  return db.users.find(u => u.id === uid) || db.users[0];
}

function setCurrentUser(uid) {
  localStorage.setItem(CURRENT_USER_KEY, uid);
  updateHeaderUser();
  renderCurrentView();
}

// Router State
let currentView = 'home';
let viewParams = {};
let uploadedImageBase64 = null;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  // Check URL query parameters (e.g. ?view=browse or ?item=101)
  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view');
  if (viewParam) {
    currentView = viewParam;
  }
  
  updateHeaderUser();
  renderCurrentView();
  lucide.createIcons();
});

function navigate(view, params = {}) {
  currentView = view;
  viewParams = params;
  
  // Update nav active states
  ['home', 'browse', 'dashboard', 'admin'].forEach(v => {
    const el = document.getElementById(`nav-${v}`);
    if (el) {
      if (v === view) {
        el.classList.add('bg-slate-800', 'text-white');
        el.classList.remove('text-slate-200');
      } else {
        el.classList.remove('bg-slate-800', 'text-white');
        el.classList.add('text-slate-200');
      }
    }
  });

  renderCurrentView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCurrentView() {
  const container = document.getElementById('app-container');
  if (!container) return;

  switch (currentView) {
    case 'home':
      container.innerHTML = renderHomeView();
      break;
    case 'browse':
      container.innerHTML = renderBrowseView();
      break;
    case 'item-detail':
      container.innerHTML = renderItemDetailView(viewParams.id);
      break;
    case 'dashboard':
      container.innerHTML = renderDashboardView();
      break;
    case 'admin':
      container.innerHTML = renderAdminView();
      break;
    default:
      container.innerHTML = renderHomeView();
  }

  updateBadges();
  lucide.createIcons();
}

// -------------------------------------------------------------
// Views
// -------------------------------------------------------------

function renderHomeView() {
  const db = getDatabase();
  const recentItems = db.items.filter(i => i.status !== 'HIDDEN').slice(0, 4);
  const totalRecovered = db.items.filter(i => i.status === 'RECOVERED').length + 142; // seed + simulated
  const activeFound = db.items.filter(i => i.type === 'FOUND' && i.status === 'ACTIVE').length;
  const activeLost = db.items.filter(i => i.type === 'LOST' && i.status === 'ACTIVE').length;

  return `
    <!-- Hero Banner -->
    <section class="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Background subtle grid pattern -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
      
      <div class="max-w-5xl mx-auto text-center relative z-10">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 text-blue-400"></i>
          <span>Official Campus Lost & Found Network</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Lost Something on Campus?<br>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300">
            Recover It With Verified Proof.
          </span>
        </h1>

        <p class="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          No more chaotic WhatsApp groups or lost flyers. Apex University's official platform lets students report, search, and verify ownership through secret security questions and safe campus handover desks.
        </p>

        <!-- Quick Search Bar -->
        <div class="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 mb-8">
          <div class="flex items-center gap-3 w-full px-3 py-1">
            <i data-lucide="search" class="w-5 h-5 text-slate-400 shrink-0"></i>
            <input type="text" id="hero-search-input" placeholder="Search AirPods, student ID, Casio calculator, keys..." 
              class="w-full text-slate-900 placeholder-slate-400 text-sm focus:outline-none"
              onkeydown="if(event.key==='Enter') executeHeroSearch()">
          </div>
          <button onclick="executeHeroSearch()" class="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 shrink-0 shadow-md shadow-blue-500/20">
            <span>Search</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Action Callouts -->
        <div class="flex flex-wrap items-center justify-center gap-4">
          <button onclick="openReportModal('LOST')" class="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition flex items-center gap-2">
            <i data-lucide="alert-circle" class="w-4 h-4 text-slate-950"></i>
            <span>Report a Lost Item</span>
          </button>
          <button onclick="openReportModal('FOUND')" class="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center gap-2">
            <i data-lucide="plus-circle" class="w-4 h-4 text-slate-950"></i>
            <span>Report a Found Item</span>
          </button>
          <button onclick="navigate('browse')" class="px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition flex items-center gap-2">
            <i data-lucide="compass" class="w-4 h-4 text-slate-300"></i>
            <span>Browse All Listings (${db.items.length})</span>
          </button>
        </div>

        <!-- Live Statistics Counter -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 pt-10 border-t border-slate-800 text-center">
          <div>
            <div class="text-3xl font-black text-white">${totalRecovered}</div>
            <div class="text-xs text-slate-400 mt-1 uppercase tracking-wider">Items Safely Returned</div>
          </div>
          <div>
            <div class="text-3xl font-black text-emerald-400">${activeFound}</div>
            <div class="text-xs text-slate-400 mt-1 uppercase tracking-wider">Active Found Listings</div>
          </div>
          <div>
            <div class="text-3xl font-black text-amber-400">${activeLost}</div>
            <div class="text-xs text-slate-400 mt-1 uppercase tracking-wider">Active Lost Reports</div>
          </div>
          <div>
            <div class="text-3xl font-black text-blue-400">100%</div>
            <div class="text-xs text-slate-400 mt-1 uppercase tracking-wider">Anti-Fraud Protected</div>
          </div>
        </div>
      </div>
    </section>

    <!-- How Verification Works Section -->
    <section class="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="text-center max-w-2xl mx-auto mb-12">
        <h2 class="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Safe Campus Recovery</h2>
        <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">How We Prevent Lost & Found Fraud</h3>
        <p class="text-sm text-slate-600 mt-2">
          Anyone can claim an item, but only the true owner knows the unlisted details. Here's our 3-step integrity system:
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
            1
          </div>
          <h4 class="font-bold text-slate-900 text-base mb-2">Item Reported with Secret Clue</h4>
          <p class="text-xs text-slate-600 leading-relaxed">
            The finder posts the item with a public overview, but sets a secret question (e.g. engraving, sticker, keychain color) only the real owner can answer.
          </p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4">
            2
          </div>
          <h4 class="font-bold text-slate-900 text-base mb-2">Confidential Claim Review</h4>
          <p class="text-xs text-slate-600 leading-relaxed">
            The claimant answers the confidential question. The finder reviews the response inside the secure portal without revealing private phone or email details.
          </p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4">
            3
          </div>
          <h4 class="font-bold text-slate-900 text-base mb-2">Safe Campus Desk Handover</h4>
          <p class="text-xs text-slate-600 leading-relaxed">
            Once approved, the item is transferred safely at a designated campus station (Central Library Front Desk or Security Gate 1) with student ID verification.
          </p>
        </div>
      </div>
    </section>

    <!-- Recently Reported Items -->
    <section class="py-12 bg-slate-100/70 border-t border-b border-slate-200/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h3 class="text-xl font-bold text-slate-900">Recently Reported on Campus</h3>
            <p class="text-xs text-slate-500">Live listings updated in real-time across university zones</p>
          </div>
          <button onclick="navigate('browse')" class="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
            <span>View All</span>
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${recentItems.map(item => renderItemCard(item)).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderItemCard(item) {
  const isLost = item.type === 'LOST';
  const badgeClass = isLost ? 'badge-lost' : 'badge-found';
  const typeText = isLost ? 'LOST' : 'FOUND';
  const icon = isLost ? 'alert-triangle' : 'check-circle';

  return `
    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group cursor-pointer" onclick="navigate('item-detail', { id: '${item.id}' })">
      <!-- Image Thumbnail -->
      <div class="h-44 bg-slate-100 relative overflow-hidden">
        ${item.photo ? `
          <img src="${item.photo}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
        ` : `
          <div class="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
            <i data-lucide="package" class="w-10 h-10 mb-1"></i>
            <span class="text-[11px] font-medium">No photo uploaded</span>
          </div>
        `}
        <div class="absolute top-3 left-3">
          <span class="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${badgeClass} shadow-sm flex items-center gap-1">
            <i data-lucide="${icon}" class="w-3 h-3"></i>
            <span>${typeText}</span>
          </span>
        </div>
        ${item.status === 'RECOVERED' ? `
          <div class="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            Recovered
          </div>
        ` : item.status === 'UNDER_REVIEW' ? `
          <div class="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            Claim Pending
          </div>
        ` : ''}
      </div>

      <!-- Card Body -->
      <div class="p-4 flex flex-col flex-grow">
        <div class="text-[11px] font-medium text-blue-600 uppercase tracking-wider mb-1">${item.category}</div>
        <h4 class="font-bold text-slate-900 text-sm leading-snug line-clamp-1 mb-1.5 group-hover:text-blue-600 transition">
          ${item.title}
        </h4>
        <p class="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
          ${item.description}
        </p>

        <div class="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span class="flex items-center gap-1">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400"></i>
            <span class="truncate max-w-[130px]">${item.building}</span>
          </span>
          <span>${item.date}</span>
        </div>
      </div>
    </div>
  `;
}

function renderBrowseView() {
  const db = getDatabase();
  const query = (viewParams.query || '').toLowerCase();
  const selectedType = viewParams.type || 'ALL';
  const selectedCategory = viewParams.category || 'ALL';
  const selectedBuilding = viewParams.building || 'ALL';
  const sortBy = viewParams.sort || 'NEWEST';

  let filtered = db.items.filter(i => i.status !== 'HIDDEN');

  if (query) {
    filtered = filtered.filter(i => 
      i.title.toLowerCase().includes(query) ||
      i.description.toLowerCase().includes(query) ||
      i.building.toLowerCase().includes(query) ||
      i.location.toLowerCase().includes(query) ||
      i.category.toLowerCase().includes(query)
    );
  }

  if (selectedType !== 'ALL') {
    filtered = filtered.filter(i => i.type === selectedType);
  }

  if (selectedCategory !== 'ALL') {
    filtered = filtered.filter(i => i.category === selectedCategory);
  }

  if (selectedBuilding !== 'ALL') {
    filtered = filtered.filter(i => i.building === selectedBuilding);
  }

  // Sort
  if (sortBy === 'NEWEST') {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortBy === 'OLDEST') {
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Title & Search Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Browse Campus Belongings</h1>
          <p class="text-xs text-slate-500 mt-1">Search through verified lost and found listings across all campus buildings.</p>
        </div>
        <div class="flex items-center gap-3">
          <button onclick="openReportModal('LOST')" class="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5">
            <i data-lucide="alert-circle" class="w-4 h-4"></i> Report Lost
          </button>
          <button onclick="openReportModal('FOUND')" class="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5">
            <i data-lucide="plus-circle" class="w-4 h-4"></i> Report Found
          </button>
        </div>
      </div>

      <!-- Filters & Controls Card -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4">
        <!-- Search Input -->
        <div class="relative">
          <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-3"></i>
          <input type="text" id="browse-search" value="${viewParams.query || ''}" 
            placeholder="Search keywords, items, buildings, descriptions..." 
            oninput="applyBrowseFilter('query', this.value)"
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500">
        </div>

        <!-- Filter Row -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <!-- Type -->
          <div>
            <label class="block font-semibold text-slate-600 mb-1">Listing Type</label>
            <select onchange="applyBrowseFilter('type', this.value)" class="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white">
              <option value="ALL" ${selectedType === 'ALL' ? 'selected' : ''}>All (Lost & Found)</option>
              <option value="LOST" ${selectedType === 'LOST' ? 'selected' : ''}>Lost Items Only</option>
              <option value="FOUND" ${selectedType === 'FOUND' ? 'selected' : ''}>Found Items Only</option>
            </select>
          </div>

          <!-- Category -->
          <div>
            <label class="block font-semibold text-slate-600 mb-1">Category</label>
            <select onchange="applyBrowseFilter('category', this.value)" class="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white">
              <option value="ALL" ${selectedCategory === 'ALL' ? 'selected' : ''}>All Categories</option>
              <option value="Electronics" ${selectedCategory === 'Electronics' ? 'selected' : ''}>Electronics</option>
              <option value="ID Cards" ${selectedCategory === 'ID Cards' ? 'selected' : ''}>ID Cards & Badges</option>
              <option value="Stationery" ${selectedCategory === 'Stationery' ? 'selected' : ''}>Stationery & Calculators</option>
              <option value="Bags" ${selectedCategory === 'Bags' ? 'selected' : ''}>Bags & Backpacks</option>
              <option value="Keys" ${selectedCategory === 'Keys' ? 'selected' : ''}>Keys & Access Cards</option>
              <option value="Books and Notes" ${selectedCategory === 'Books and Notes' ? 'selected' : ''}>Books & Notes</option>
              <option value="Other" ${selectedCategory === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          </div>

          <!-- Building -->
          <div>
            <label class="block font-semibold text-slate-600 mb-1">Campus Location</label>
            <select onchange="applyBrowseFilter('building', this.value)" class="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white">
              <option value="ALL" ${selectedBuilding === 'ALL' ? 'selected' : ''}>All Campus Zones</option>
              <option value="Central Library" ${selectedBuilding === 'Central Library' ? 'selected' : ''}>Central Library</option>
              <option value="Engineering Block A" ${selectedBuilding === 'Engineering Block A' ? 'selected' : ''}>Engineering Block A</option>
              <option value="Science Lab Complex" ${selectedBuilding === 'Science Lab Complex' ? 'selected' : ''}>Science Lab Complex</option>
              <option value="Student Cafeteria" ${selectedBuilding === 'Student Cafeteria' ? 'selected' : ''}>Student Cafeteria</option>
              <option value="Sports Complex" ${selectedBuilding === 'Sports Complex' ? 'selected' : ''}>Sports Complex</option>
            </select>
          </div>

          <!-- Sort -->
          <div>
            <label class="block font-semibold text-slate-600 mb-1">Sort By</label>
            <select onchange="applyBrowseFilter('sort', this.value)" class="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white">
              <option value="NEWEST" ${sortBy === 'NEWEST' ? 'selected' : ''}>Newest First</option>
              <option value="OLDEST" ${sortBy === 'OLDEST' ? 'selected' : ''}>Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Results Count and Clear Filter -->
      <div class="flex items-center justify-between mb-4 text-xs text-slate-500">
        <div>Showing <span class="font-bold text-slate-800">${filtered.length}</span> matching campus listings</div>
        ${(query || selectedType !== 'ALL' || selectedCategory !== 'ALL' || selectedBuilding !== 'ALL') ? `
          <button onclick="clearBrowseFilters()" class="text-blue-600 hover:underline flex items-center gap-1 font-medium">
            <i data-lucide="rotate-ccw" class="w-3 h-3"></i> Clear all filters
          </button>
        ` : ''}
      </div>

      <!-- Items Grid -->
      ${filtered.length > 0 ? `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          ${filtered.map(item => renderItemCard(item)).join('')}
        </div>
      ` : `
        <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
          <div class="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <i data-lucide="inbox" class="w-6 h-6"></i>
          </div>
          <h3 class="font-bold text-slate-800 text-base mb-1">No matching items found</h3>
          <p class="text-xs text-slate-500 mb-4">Try clearing filters or check another campus building.</p>
          <button onclick="clearBrowseFilters()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold">
            Reset Filters
          </button>
        </div>
      `}
    </div>
  `;
}

function renderItemDetailView(itemId) {
  const db = getDatabase();
  const item = db.items.find(i => i.id === itemId);
  const currentUser = getCurrentUser();

  if (!item) {
    return `
      <div class="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 class="text-xl font-bold text-slate-800">Item not found</h2>
        <button onclick="navigate('browse')" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs">Back to Browse</button>
      </div>
    `;
  }

  const isLost = item.type === 'LOST';
  const badgeClass = isLost ? 'badge-lost' : 'badge-found';
  const isReporter = item.reporterId === currentUser.id;
  const existingClaim = db.claims.find(c => c.itemId === item.id && c.claimantId === currentUser.id);

  return `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <button onclick="navigate('browse')" class="hover:text-blue-600 flex items-center gap-1">
          <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> Back to Browse
        </button>
        <span>/</span>
        <span>${item.category}</span>
        <span>/</span>
        <span class="text-slate-800 font-medium truncate max-w-xs">${item.title}</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
        <!-- Photo Column -->
        <div class="md:col-span-6">
          <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative">
            ${item.photo ? `
              <img src="${item.photo}" alt="${item.title}" class="w-full h-80 sm:h-96 object-cover">
            ` : `
              <div class="w-full h-80 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                <i data-lucide="package" class="w-16 h-16 mb-2"></i>
                <span class="text-xs">No photo uploaded</span>
              </div>
            `}
            <div class="absolute top-4 left-4">
              <span class="text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${badgeClass} shadow-md flex items-center gap-1.5">
                <i data-lucide="${isLost ? 'alert-triangle' : 'check-circle'}" class="w-4 h-4"></i>
                <span>${item.type}</span>
              </span>
            </div>
            ${item.status === 'RECOVERED' ? `
              <div class="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow">
                Recovered / Handover Complete
              </div>
            ` : ''}
          </div>

          <!-- Handover Locations Reminder -->
          <div class="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
            <i data-lucide="shield-check" class="w-5 h-5 text-blue-600 shrink-0 mt-0.5"></i>
            <div>
              <span class="font-bold">Official Campus Handover Guarantee</span>
              <p class="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                Found items must be collected in person at the Central Library Desk or Security Gate 1 with student identity verification.
              </p>
            </div>
          </div>
        </div>

        <!-- Details Column -->
        <div class="md:col-span-6 flex flex-col">
          <div class="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">${item.category}</div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-3">
            ${item.title}
          </h1>

          <div class="flex items-center gap-4 text-xs text-slate-500 mb-6 pb-4 border-b border-slate-200">
            <span class="flex items-center gap-1">
              <i data-lucide="calendar" class="w-4 h-4 text-slate-400"></i>
              <span>${item.date}</span>
            </span>
            <span class="flex items-center gap-1">
              <i data-lucide="map-pin" class="w-4 h-4 text-slate-400"></i>
              <span>${item.building}</span>
            </span>
            <span class="flex items-center gap-1">
              <i data-lucide="clock" class="w-4 h-4 text-slate-400"></i>
              <span>Report #${item.id}</span>
            </span>
          </div>

          <!-- Description -->
          <div class="mb-6">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Description & Notes</h3>
            <p class="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              ${item.description}
            </p>
          </div>

          <!-- Specific Location -->
          <div class="mb-6">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Campus Location Detail</h3>
            <div class="flex items-center gap-2 text-sm text-slate-800">
              <div class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <i data-lucide="building" class="w-4 h-4"></i>
              </div>
              <div>
                <span class="font-semibold">${item.building}</span> &bull; 
                <span class="text-slate-600">${item.location}</span>
              </div>
            </div>
          </div>

          <!-- Claim Action Card -->
          <div class="mt-auto pt-6 border-t border-slate-200">
            ${item.type === 'FOUND' && item.status !== 'RECOVERED' ? `
              ${isReporter ? `
                <div class="p-4 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                  <i data-lucide="user-check" class="w-4 h-4 text-blue-600"></i>
                  <span>You reported this found item. View incoming claims in your <button onclick="navigate('dashboard')" class="text-blue-600 font-bold hover:underline">Dashboard</button>.</span>
                </div>
              ` : existingClaim ? `
                <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                  <div class="font-bold flex items-center gap-1.5 mb-1">
                    <i data-lucide="clock" class="w-4 h-4 text-blue-600"></i>
                    <span>Claim Submitted (${existingClaim.status})</span>
                  </div>
                  <p class="text-blue-800">You submitted a claim for this item. Track status or chat in your <button onclick="navigate('dashboard')" class="underline font-bold">Dashboard</button>.</p>
                </div>
              ` : `
                <div class="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
                  <div class="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h4 class="font-bold text-slate-900 text-sm">Is this your item?</h4>
                      <p class="text-xs text-slate-600 mt-0.5">Answer the finder's confidential verification question to claim ownership.</p>
                    </div>
                    <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <i data-lucide="key" class="w-4 h-4"></i>
                    </div>
                  </div>
                  <button onclick="openClaimModal('${item.id}')" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2">
                    <i data-lucide="shield-check" class="w-4 h-4"></i>
                    <span>Claim This Item (Verify Ownership)</span>
                  </button>
                </div>
              `}
            ` : item.status === 'RECOVERED' ? `
              <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2 font-medium">
                <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i>
                <span>This item has been safely recovered and returned to its verified owner.</span>
              </div>
            ` : `
              <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <div class="font-bold mb-1">Lost Item Report</div>
                <p>If you have found this item, please report it or turn it in at the Central Library desk quoting Report #${item.id}.</p>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderDashboardView() {
  const db = getDatabase();
  const currentUser = getCurrentUser();

  const myLost = db.items.filter(i => i.reporterId === currentUser.id && i.type === 'LOST');
  const myFound = db.items.filter(i => i.reporterId === currentUser.id && i.type === 'FOUND');
  const myClaims = db.claims.filter(c => c.claimantId === currentUser.id);

  // Incoming claims for items I found
  const myFoundItemIds = myFound.map(f => f.id);
  const incomingClaims = db.claims.filter(c => myFoundItemIds.includes(c.itemId));

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Dashboard Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div class="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Student Portal</div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard: ${currentUser.name}
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">${currentUser.email} &bull; ${currentUser.badge}</p>
        </div>
        <div class="flex items-center gap-3">
          <button onclick="openReportModal('LOST')" class="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm">
            <i data-lucide="alert-circle" class="w-4 h-4"></i> New Lost Report
          </button>
          <button onclick="openReportModal('FOUND')" class="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm">
            <i data-lucide="plus-circle" class="w-4 h-4"></i> New Found Report
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="bg-white p-4 rounded-xl border border-slate-200">
          <div class="text-2xl font-black text-slate-800">${myLost.length}</div>
          <div class="text-xs text-slate-500">My Lost Reports</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200">
          <div class="text-2xl font-black text-slate-800">${myFound.length}</div>
          <div class="text-xs text-slate-500">My Found Reports</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200">
          <div class="text-2xl font-black text-blue-600">${incomingClaims.length}</div>
          <div class="text-xs text-slate-500">Incoming Claims to Review</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200">
          <div class="text-2xl font-black text-indigo-600">${myClaims.length}</div>
          <div class="text-xs text-slate-500">My Submitted Claims</div>
        </div>
      </div>

      <!-- Incoming Claims to Review (Finder View) -->
      ${incomingClaims.length > 0 ? `
        <div class="mb-10">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="shield-alert" class="w-5 h-5 text-blue-600"></i>
                <span>Claims Requiring Your Verification</span>
              </h2>
              <p class="text-xs text-slate-500">Review answers submitted by claimants for items you found.</p>
            </div>
          </div>

          <div class="space-y-4">
            ${incomingClaims.map(claim => {
              const item = db.items.find(i => i.id === claim.itemId);
              return renderIncomingClaimCard(claim, item);
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- My Submitted Claims (Claimant View) -->
      <div class="mb-10">
        <h2 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
          <i data-lucide="key" class="w-5 h-5 text-indigo-600"></i>
          <span>My Submitted Claims & Handover Hub</span>
        </h2>
        <p class="text-xs text-slate-500 mb-4">Track verification progress and coordinate campus pickup.</p>

        ${myClaims.length > 0 ? `
          <div class="space-y-4">
            ${myClaims.map(claim => {
              const item = db.items.find(i => i.id === claim.itemId);
              return renderSubmittedClaimCard(claim, item);
            }).join('')}
          </div>
        ` : `
          <div class="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
            You haven't submitted any claims yet.
          </div>
        `}
      </div>

      <!-- My Active Reports Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- My Found Items -->
        <div>
          <h3 class="font-bold text-slate-900 text-sm mb-3">Items I've Found (${myFound.length})</h3>
          <div class="space-y-3">
            ${myFound.map(item => `
              <div class="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 class="font-bold text-sm text-slate-800">${item.title}</h4>
                  <p class="text-xs text-slate-500">${item.building} &bull; ${item.date}</p>
                </div>
                <span class="text-xs px-2.5 py-1 rounded-full font-bold ${item.status === 'RECOVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
                  ${item.status}
                </span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- My Lost Items -->
        <div>
          <h3 class="font-bold text-slate-900 text-sm mb-3">Items I've Reported Lost (${myLost.length})</h3>
          <div class="space-y-3">
            ${myLost.map(item => `
              <div class="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 class="font-bold text-sm text-slate-800">${item.title}</h4>
                  <p class="text-xs text-slate-500">${item.building} &bull; ${item.date}</p>
                </div>
                <span class="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-800">
                  ${item.status}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderIncomingClaimCard(claim, item) {
  const isApproved = claim.status === 'APPROVED';
  const isCompleted = claim.status === 'COMPLETED';

  return `
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div class="text-xs font-bold uppercase tracking-wider text-blue-600">Claim for Item #${item.id}</div>
          <h3 class="text-base font-bold text-slate-900">${item.title}</h3>
        </div>
        <div>
          <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isCompleted ? 'bg-emerald-100 text-emerald-800' :
            isApproved ? 'bg-blue-100 text-blue-800' :
            claim.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
            'bg-amber-100 text-amber-800'
          }">
            Status: ${claim.status}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 text-xs">
        <div class="p-4 bg-slate-50 rounded-xl space-y-2">
          <div class="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Your Secret Question & Expected Answer</div>
          <div>
            <span class="font-semibold text-slate-600">Question:</span> ${item.secretQuestion}
          </div>
          <div class="text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200 font-mono">
            <span class="font-bold">Target Answer:</span> ${item.secretAnswer}
          </div>
        </div>

        <div class="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
          <div class="font-bold text-blue-900 uppercase tracking-wider text-[10px]">Claimant's Submission</div>
          <div>
            <span class="font-semibold text-slate-700">Claimant:</span> ${claim.claimantName} (${claim.claimantEmail})
          </div>
          <div>
            <span class="font-semibold text-slate-700">Answer Given:</span>
            <div class="p-2 bg-white rounded border border-blue-200 mt-1 font-semibold text-slate-900">
              "${claim.submittedAnswer}"
            </div>
          </div>
          ${claim.additionalProof ? `
            <div class="text-slate-600 mt-1">
              <span class="font-semibold">Additional Proof:</span> ${claim.additionalProof}
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Action Buttons -->
      ${claim.status === 'PENDING' ? `
        <div class="flex items-center justify-end gap-3 pt-2">
          <button onclick="handleClaimReview('${claim.id}', 'REJECTED')" class="px-4 py-2 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition">
            Reject (Does not match)
          </button>
          <button onclick="handleClaimReview('${claim.id}', 'APPROVED')" class="px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition flex items-center gap-1.5">
            <i data-lucide="check" class="w-4 h-4"></i> Approve & Open Handover
          </button>
        </div>
      ` : isApproved ? `
        <!-- Handover Messaging Hub -->
        ${renderHandoverChat(claim)}
      ` : isCompleted ? `
        <div class="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
          <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i>
          <span>Handover completed and recorded at ${claim.handoverLocation}. Item safely returned to owner.</span>
        </div>
      ` : ''}
    </div>
  `;
}

function renderSubmittedClaimCard(claim, item) {
  const isApproved = claim.status === 'APPROVED';
  const isCompleted = claim.status === 'COMPLETED';

  return `
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div class="text-xs font-bold uppercase tracking-wider text-indigo-600">Submitted Claim</div>
          <h3 class="text-base font-bold text-slate-900">${item ? item.title : 'Campus Item'}</h3>
        </div>
        <div>
          <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isCompleted ? 'bg-emerald-100 text-emerald-800' :
            isApproved ? 'bg-blue-100 text-blue-800' :
            claim.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
            'bg-amber-100 text-amber-800'
          }">
            Status: ${claim.status}
          </span>
        </div>
      </div>

      <div class="my-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl space-y-1">
        <div><span class="font-semibold text-slate-800">Your Answer:</span> ${claim.submittedAnswer}</div>
        <div><span class="font-semibold text-slate-800">Handover Desk:</span> ${claim.handoverLocation || 'Central Library Desk'}</div>
      </div>

      ${isApproved ? `
        ${renderHandoverChat(claim)}
      ` : isCompleted ? `
        <div class="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <i data-lucide="check" class="w-4 h-4 text-emerald-600"></i>
          <span>Handover Verified! You have safely recovered your item.</span>
        </div>
      ` : `
        <div class="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center gap-2">
          <i data-lucide="clock" class="w-4 h-4 text-amber-600 shrink-0"></i>
          <span>Pending review by the finder. You will be notified once verified.</span>
        </div>
      `}
    </div>
  `;
}

function renderHandoverChat(claim) {
  const currentUser = getCurrentUser();

  return `
    <div class="mt-4 pt-4 border-t border-slate-200 space-y-3">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <i data-lucide="message-square" class="w-4 h-4 text-blue-600"></i>
          <span>Campus Handover Coordination & In-App Chat</span>
        </h4>
        <div class="text-[11px] text-slate-500">Private &bull; Phone numbers hidden</div>
      </div>

      <!-- Messages list -->
      <div class="bg-slate-50 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2.5 border border-slate-200 text-xs">
        ${(claim.messages || []).map(m => {
          const isMe = m.senderId === currentUser.id;
          return `
            <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'}">
              <div class="text-[10px] text-slate-500 font-medium mb-0.5">${m.senderName}</div>
              <div class="px-3 py-2 rounded-xl max-w-xs ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}">
                ${m.text}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Send input -->
      <div class="flex items-center gap-2">
        <input type="text" id="chat-input-${claim.id}" placeholder="Type a message to coordinate pickup..." 
          onkeydown="if(event.key==='Enter') sendChatMessage('${claim.id}')"
          class="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white">
        <button onclick="sendChatMessage('${claim.id}')" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1">
          <i data-lucide="send" class="w-3.5 h-3.5"></i>
        </button>
      </div>

      <!-- Complete Handover Button -->
      <div class="pt-2 flex items-center justify-between">
        <div class="text-[11px] text-slate-500">Meetup point: <strong>${claim.handoverLocation}</strong></div>
        <button onclick="completeHandover('${claim.id}')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition">
          <i data-lucide="check-check" class="w-4 h-4"></i>
          <span>Confirm Safe Handover Completed</span>
        </button>
      </div>
    </div>
  `;
}

function renderAdminView() {
  const db = getDatabase();
  const currentUser = getCurrentUser();

  if (currentUser.role !== 'admin') {
    return `
      <div class="max-w-2xl mx-auto px-4 py-16 text-center">
        <div class="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <i data-lucide="shield-alert" class="w-6 h-6"></i>
        </div>
        <h2 class="text-xl font-bold text-slate-900 mb-2">Campus Security & Admin Portal Only</h2>
        <p class="text-xs text-slate-500 mb-4">You are currently logged in as <strong>${currentUser.name} (${currentUser.role})</strong>. Please switch to the Officer Davis admin account using the top-right profile switcher to access moderation and security controls.</p>
        <button onclick="switchUser('admin')" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition">
          Switch to Officer Davis (Admin)
        </button>
      </div>
    `;
  }

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Admin Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 text-[11px] font-bold uppercase tracking-wider mb-1">
            <i data-lucide="shield" class="w-3.5 h-3.5"></i> Campus Security Command
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Moderation & Audit Console
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">Manage reported content, resolve claims, and inspect security audit trails.</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="resetDemoData()" class="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5">
            <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Reset All Data
          </button>
        </div>
      </div>

      <!-- Admin Metrics -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="bg-white p-4 rounded-xl border border-slate-200">
          <div class="text-2xl font-black text-slate-900">${db.items.length}</div>
          <div class="text-xs text-slate-500">Total System Reports</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200">
          <div class="text-2xl font-black text-blue-600">${db.claims.length}</div>
          <div class="text-xs text-slate-500">Total Claim Submissions</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200">
          <div class="text-2xl font-black text-emerald-600">${db.items.filter(i => i.status === 'RECOVERED').length + 142}</div>
          <div class="text-xs text-slate-500">Recoveries Handed Over</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200">
          <div class="text-2xl font-black text-purple-600">${db.auditLogs.length}</div>
          <div class="text-xs text-slate-500">Security Audit Logs</div>
        </div>
      </div>

      <!-- Moderation Table -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 class="font-bold text-slate-900 text-sm">Active Campus Listings Moderation</h3>
          <span class="text-xs text-slate-500">${db.items.length} listings</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th class="p-3">ID & Title</th>
                <th class="p-3">Type</th>
                <th class="p-3">Location</th>
                <th class="p-3">Status</th>
                <th class="p-3 text-right">Moderator Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${db.items.map(item => `
                <tr class="hover:bg-slate-50">
                  <td class="p-3">
                    <div class="font-bold text-slate-900">${item.title}</div>
                    <div class="text-[10px] text-slate-400">#${item.id} &bull; ${item.category}</div>
                  </td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded font-bold ${item.type === 'LOST' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">
                      ${item.type}
                    </span>
                  </td>
                  <td class="p-3 text-slate-600">${item.building}</td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded font-bold ${item.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' : item.status === 'RECOVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">
                      ${item.status}
                    </span>
                  </td>
                  <td class="p-3 text-right space-x-2">
                    ${item.status !== 'HIDDEN' ? `
                      <button onclick="adminToggleHide('${item.id}', true)" class="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded font-medium">
                        Hide / Flag
                      </button>
                    ` : `
                      <button onclick="adminToggleHide('${item.id}', false)" class="px-2 py-1 text-emerald-600 hover:bg-emerald-50 rounded font-medium">
                        Unhide
                      </button>
                    `}
                    <button onclick="adminDelete('${item.id}')" class="px-2 py-1 text-slate-500 hover:text-slate-800 rounded font-medium">
                      Delete
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Security Audit Trail -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <h3 class="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
          <i data-lucide="file-text" class="w-4 h-4 text-slate-500"></i>
          <span>Security Audit Trail</span>
        </h3>
        <div class="space-y-2 max-h-60 overflow-y-auto text-xs">
          ${db.auditLogs.map(log => `
            <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4">
              <div>
                <span class="font-bold text-slate-800 uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-200 mr-2">${log.action}</span>
                <span class="text-slate-700">${log.details}</span>
              </div>
              <div class="text-[10px] text-slate-400 shrink-0 font-mono">${new Date(log.timestamp).toLocaleTimeString()}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// Interactive Operations & Modals
// -------------------------------------------------------------

function openReportModal(type) {
  const modal = document.getElementById('report-modal');
  const typeInput = document.getElementById('report-type');
  const title = document.getElementById('modal-title');
  const subtitle = document.getElementById('modal-subtitle');
  const iconContainer = document.getElementById('modal-icon-container');
  const foundSecret = document.getElementById('found-secret-config');
  const submitBtn = document.getElementById('report-submit-btn');

  if (!modal) return;

  typeInput.value = type;
  document.getElementById('report-form').reset();
  uploadedImageBase64 = null;
  document.getElementById('image-preview').innerHTML = '<i data-lucide="image" class="w-6 h-6 text-slate-400"></i>';

  // Default date to today
  document.getElementById('report-date').value = new Date().toISOString().split('T')[0];

  if (type === 'LOST') {
    title.textContent = 'Report a Lost Item';
    subtitle.textContent = 'Describe the belonging you lost on campus so the finder can locate you.';
    iconContainer.className = 'w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center';
    iconContainer.innerHTML = '<i data-lucide="alert-circle" class="w-5 h-5"></i>';
    foundSecret.classList.add('hidden');
    document.getElementById('report-secret-question').removeAttribute('required');
    document.getElementById('report-secret-answer').removeAttribute('required');
    submitBtn.className = 'px-5 py-2.5 text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition';
  } else {
    title.textContent = 'Report a Found Item';
    subtitle.textContent = 'Report an item found on campus. Set a secret verification question to prevent false claims.';
    iconContainer.className = 'w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center';
    iconContainer.innerHTML = '<i data-lucide="plus-circle" class="w-5 h-5"></i>';
    foundSecret.classList.remove('hidden');
    document.getElementById('report-secret-question').setAttribute('required', 'true');
    document.getElementById('report-secret-answer').setAttribute('required', 'true');
    submitBtn.className = 'px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition';
  }

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeReportModal() {
  const modal = document.getElementById('report-modal');
  if (modal) modal.classList.add('hidden');
}

function previewPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedImageBase64 = e.target.result;
    document.getElementById('image-preview').innerHTML = `
      <img src="${uploadedImageBase64}" class="w-full h-full object-cover">
    `;
  };
  reader.readAsDataURL(file);
}

function handleReportSubmit(e) {
  e.preventDefault();
  const db = getDatabase();
  const currentUser = getCurrentUser();

  const type = document.getElementById('report-type').value;
  const title = document.getElementById('report-item-title').value.trim();
  const category = document.getElementById('report-category').value;
  const date = document.getElementById('report-date').value;
  const building = document.getElementById('report-building').value;
  const location = document.getElementById('report-specific-location').value.trim() || building;
  const description = document.getElementById('report-description').value.trim();
  const secretQuestion = document.getElementById('report-secret-question').value.trim();
  const secretAnswer = document.getElementById('report-secret-answer').value.trim();

  const newItem = {
    id: `item-${Date.now().toString().slice(-4)}`,
    type: type,
    title: title,
    category: category,
    building: building,
    location: location,
    date: date,
    description: description,
    photo: uploadedImageBase64 || (type === 'LOST' 
      ? 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
      : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80'),
    status: 'ACTIVE',
    reporterId: currentUser.id,
    secretQuestion: secretQuestion,
    secretAnswer: secretAnswer,
    claimsCount: 0,
    createdAt: new Date().toISOString()
  };

  db.items.unshift(newItem);

  // Add audit log
  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: `ITEM_${type}_REPORTED`,
    details: `${type} item #${newItem.id} (${newItem.title}) reported by ${currentUser.name} at ${building}.`,
    timestamp: new Date().toISOString()
  });

  saveDatabase(db);
  closeReportModal();
  showToast(`Successfully reported ${type.toLowerCase()} item!`, 'success');

  navigate('browse', { type: type });
}

function openClaimModal(itemId) {
  const db = getDatabase();
  const item = db.items.find(i => i.id === itemId);
  if (!item) return;

  const modal = document.getElementById('claim-modal');
  document.getElementById('claim-item-id').value = item.id;
  document.getElementById('claim-question-text').textContent = item.secretQuestion || "Please provide details only the true owner would know.";
  document.getElementById('claim-answer').value = '';
  document.getElementById('claim-additional-proof').value = '';

  document.getElementById('claim-item-summary').innerHTML = `
    <div class="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden shrink-0">
      ${item.photo ? `<img src="${item.photo}" class="w-full h-full object-cover">` : ''}
    </div>
    <div class="text-xs">
      <div class="font-bold text-slate-800">${item.title}</div>
      <div class="text-slate-500">${item.building} &bull; ${item.date}</div>
    </div>
  `;

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeClaimModal() {
  const modal = document.getElementById('claim-modal');
  if (modal) modal.classList.add('hidden');
}

function handleClaimSubmit(e) {
  e.preventDefault();
  const db = getDatabase();
  const currentUser = getCurrentUser();

  const itemId = document.getElementById('claim-item-id').value;
  const item = db.items.find(i => i.id === itemId);
  const answer = document.getElementById('claim-answer').value.trim();
  const additionalProof = document.getElementById('claim-additional-proof').value.trim();

  if (!item) return;

  const newClaim = {
    id: `claim-${Date.now().toString().slice(-4)}`,
    itemId: item.id,
    claimantId: currentUser.id,
    claimantName: currentUser.name,
    claimantEmail: currentUser.email,
    submittedAnswer: answer,
    additionalProof: additionalProof,
    status: 'PENDING',
    handoverLocation: 'Central Library Front Desk',
    handoverTime: 'Pending finder approval',
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: `m-${Date.now()}`,
        senderId: currentUser.id,
        senderName: `${currentUser.name} (Claimant)`,
        text: `Hello! I have submitted an ownership claim with my verification answer.`,
        timestamp: new Date().toISOString()
      }
    ]
  };

  db.claims.unshift(newClaim);
  item.status = 'UNDER_REVIEW';

  // Notification for finder
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: item.reporterId,
    title: 'New Ownership Claim Submitted',
    message: `${currentUser.name} submitted a claim for ${item.title}.`,
    timestamp: 'Just now',
    read: false
  });

  // Audit log
  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: 'CLAIM_SUBMITTED',
    details: `Claim #${newClaim.id} submitted by ${currentUser.name} for item #${item.id}.`,
    timestamp: new Date().toISOString()
  });

  saveDatabase(db);
  closeClaimModal();
  showToast('Claim submitted! The finder has been notified.', 'success');

  navigate('dashboard');
}

function handleClaimReview(claimId, newStatus) {
  const db = getDatabase();
  const currentUser = getCurrentUser();
  const claim = db.claims.find(c => c.id === claimId);
  if (!claim) return;

  const item = db.items.find(i => i.id === claim.itemId);

  claim.status = newStatus;
  if (newStatus === 'APPROVED') {
    if (item) item.status = 'UNDER_REVIEW';
    claim.messages.push({
      id: `m-${Date.now()}`,
      senderId: currentUser.id,
      senderName: `${currentUser.name} (Finder)`,
      text: `Your answer matched! I've approved your claim. Let's coordinate pickup at ${claim.handoverLocation}.`,
      timestamp: new Date().toISOString()
    });

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: claim.claimantId,
      title: 'Claim Approved!',
      message: `${currentUser.name} approved your claim for ${item ? item.title : 'item'}.`,
      timestamp: 'Just now',
      read: false
    });
  } else if (newStatus === 'REJECTED') {
    if (item) item.status = 'ACTIVE';
  }

  // Audit
  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: `CLAIM_${newStatus}`,
    details: `Claim #${claim.id} set to ${newStatus} by ${currentUser.name}.`,
    timestamp: new Date().toISOString()
  });

  saveDatabase(db);
  showToast(`Claim marked as ${newStatus}!`, 'info');
  renderCurrentView();
}

function sendChatMessage(claimId) {
  const input = document.getElementById(`chat-input-${claimId}`);
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  const db = getDatabase();
  const currentUser = getCurrentUser();
  const claim = db.claims.find(c => c.id === claimId);

  if (!claim) return;

  claim.messages = claim.messages || [];
  claim.messages.push({
    id: `m-${Date.now()}`,
    senderId: currentUser.id,
    senderName: `${currentUser.name} (${currentUser.role === 'admin' ? 'Security' : currentUser.id === claim.claimantId ? 'Owner' : 'Finder'})`,
    text: text,
    timestamp: new Date().toISOString()
  });

  saveDatabase(db);
  renderCurrentView();
}

function completeHandover(claimId) {
  const db = getDatabase();
  const currentUser = getCurrentUser();
  const claim = db.claims.find(c => c.id === claimId);
  if (!claim) return;

  const item = db.items.find(i => i.id === claim.itemId);
  claim.status = 'COMPLETED';
  if (item) item.status = 'RECOVERED';

  // Audit
  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: 'HANDOVER_COMPLETED',
    details: `Safe campus handover confirmed for item #${item ? item.id : ''} at ${claim.handoverLocation}.`,
    timestamp: new Date().toISOString()
  });

  saveDatabase(db);
  showToast('Handover confirmed! Item safely returned to owner.', 'success');
  renderCurrentView();
}

function adminToggleHide(itemId, shouldHide) {
  const db = getDatabase();
  const item = db.items.find(i => i.id === itemId);
  if (!item) return;

  item.status = shouldHide ? 'HIDDEN' : 'ACTIVE';
  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: shouldHide ? 'ITEM_MODERATED_HIDDEN' : 'ITEM_UNHIDDEN',
    details: `Item #${item.id} was ${shouldHide ? 'hidden from public registry' : 'restored'} by Admin.`,
    timestamp: new Date().toISOString()
  });

  saveDatabase(db);
  showToast(shouldHide ? 'Item listing hidden.' : 'Item listing restored.', 'info');
  renderCurrentView();
}

function adminDelete(itemId) {
  if (!confirm("Are you sure you want to permanently delete this report?")) return;
  const db = getDatabase();
  db.items = db.items.filter(i => i.id !== itemId);
  saveDatabase(db);
  showToast('Item deleted by Admin.', 'info');
  renderCurrentView();
}

// -------------------------------------------------------------
// Search and Filter Helpers
// -------------------------------------------------------------

function executeHeroSearch() {
  const input = document.getElementById('hero-search-input');
  const query = input ? input.value.trim() : '';
  navigate('browse', { query: query });
}

function applyBrowseFilter(key, value) {
  viewParams[key] = value;
  renderCurrentView();
}

function clearBrowseFilters() {
  viewParams = {};
  renderCurrentView();
}

// -------------------------------------------------------------
// Header & User Switching
// -------------------------------------------------------------

function updateHeaderUser() {
  const user = getCurrentUser();
  const nameEl = document.getElementById('current-user-name');
  const roleEl = document.getElementById('current-user-role');
  const avatarEl = document.getElementById('current-user-avatar');

  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.badge;
  if (avatarEl) {
    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    avatarEl.textContent = initials;
  }
}

function toggleUserDropdown() {
  const el = document.getElementById('user-dropdown');
  if (el) el.classList.toggle('hidden');
}

function switchUser(uid) {
  setCurrentUser(uid);
  const el = document.getElementById('user-dropdown');
  if (el) el.classList.add('hidden');
  showToast(`Switched account to ${getCurrentUser().name}`, 'info');
}

function toggleNotifications() {
  const el = document.getElementById('notif-dropdown');
  if (!el) return;
  el.classList.toggle('hidden');
  renderNotificationList();
}

function renderNotificationList() {
  const db = getDatabase();
  const currentUser = getCurrentUser();
  const listEl = document.getElementById('notif-list');
  if (!listEl) return;

  const userNotifs = db.notifications.filter(n => n.userId === currentUser.id);
  if (userNotifs.length === 0) {
    listEl.innerHTML = '<div class="p-4 text-center text-xs text-slate-400">No new notifications</div>';
    return;
  }

  listEl.innerHTML = userNotifs.map(n => `
    <div class="p-3 text-xs hover:bg-slate-50 transition">
      <div class="font-bold text-slate-900">${n.title}</div>
      <div class="text-slate-600 mt-0.5">${n.message}</div>
      <div class="text-[10px] text-slate-400 mt-1">${n.timestamp}</div>
    </div>
  `).join('');
}

function clearNotifications() {
  const db = getDatabase();
  const currentUser = getCurrentUser();
  db.notifications = db.notifications.filter(n => n.userId !== currentUser.id);
  saveDatabase(db);
  renderNotificationList();
  updateBadges();
}

function updateBadges() {
  const db = getDatabase();
  const currentUser = getCurrentUser();
  const notifBadge = document.getElementById('notif-badge');
  const claimsBadge = document.getElementById('nav-claims-badge');

  const unreadNotifs = db.notifications.filter(n => n.userId === currentUser.id);
  if (notifBadge) {
    if (unreadNotifs.length > 0) notifBadge.classList.remove('hidden');
    else notifBadge.classList.add('hidden');
  }

  // Pending incoming claims for current user
  const myFoundIds = db.items.filter(i => i.reporterId === currentUser.id && i.type === 'FOUND').map(i => i.id);
  const pendingIncoming = db.claims.filter(c => myFoundIds.includes(c.itemId) && c.status === 'PENDING').length;

  if (claimsBadge) {
    if (pendingIncoming > 0) {
      claimsBadge.textContent = pendingIncoming;
      claimsBadge.classList.remove('hidden');
    } else {
      claimsBadge.classList.add('hidden');
    }
  }
}

function toggleMobileMenu() {
  const el = document.getElementById('mobile-menu');
  if (el) el.classList.toggle('hidden');
}

function resetDemoData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
  localStorage.setItem(CURRENT_USER_KEY, 'sarah');
  updateHeaderUser();
  showToast('Reset all database state to initial demo seed!', 'info');
  navigate('home');
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-message');
  const iconEl = document.getElementById('toast-icon');

  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  iconEl.innerHTML = type === 'success' 
    ? '<i data-lucide="check-circle" class="w-5 h-5 text-emerald-400"></i>'
    : '<i data-lucide="info" class="w-5 h-5 text-blue-400"></i>';

  toast.classList.remove('hidden');
  lucide.createIcons();

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
