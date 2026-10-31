// Campus Lost & Found Platform - Production Engine
// Apex University Student Recovery Hub

// Cryptographic Secret for Client Session Token Integrity Verification
const SESSION_SIGNING_SALT = "apex_campus_security_session_salt_2026";

// Default System Users with Pre-computed WebCrypto SHA-256 Hashes
const DEFAULT_USERS = [
  {
    id: "admin-sec",
    name: "Officer Davis",
    email: "security@apex.edu",
    passwordHash: "7bbe0d843d1294ab9f88320bdde8582be0221f1f3cb038b13a4e2401690f4470",
    role: "admin",
    badge: "Campus Security & Admin"
  },
  {
    id: "student-1",
    name: "Rachel Adams",
    email: "rachel.a@apex.edu",
    passwordHash: "58f2566134ee9b87379fcf369d62c8871240ead64767952d4af603f98be76b6d",
    role: "student",
    badge: "Student"
  }
];

const INITIAL_ITEMS = [
  {
    id: "item-101",
    type: "FOUND",
    title: "Apple AirPods Pro (2nd Gen) in White Case",
    category: "Electronics",
    building: "Central Library",
    location: "2nd Floor Silent Study Booth #14",
    date: "2026-10-28",
    description: "Found white wireless earbuds in case left on the side study desk. Safely stored with battery intact.",
    photo: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80",
    status: "ACTIVE", // ACTIVE, UNDER_REVIEW, APPROVED, RECOVERED, HIDDEN
    reporterId: "admin-sec",
    secretQuestion: "What color is the silicone lanyard loop attached to the case and what initials are inside the lid?",
    secretAnswer: "Bright orange lanyard with initials AC",
    claimsCount: 0,
    createdAt: "2026-10-28T14:30:00Z"
  },
  {
    id: "item-102",
    type: "FOUND",
    title: "Official Student University ID Card",
    category: "ID Cards",
    building: "Student Cafeteria",
    location: "Main Dining Hall, Table 8 near juice counter",
    date: "2026-10-29",
    description: "Found student RFID badge under cafeteria chair. Kept in protective sleeve at information desk.",
    photo: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
    status: "ACTIVE",
    reporterId: "admin-sec",
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
    location: "Room 302 during Calculus Midterms",
    date: "2026-10-30",
    description: "Black and white solar scientific calculator. Has a small space shuttle sticker on the hard slide cover.",
    photo: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80",
    status: "ACTIVE",
    reporterId: "student-1",
    secretQuestion: "",
    secretAnswer: "",
    claimsCount: 0,
    createdAt: "2026-10-30T09:45:00Z"
  },
  {
    id: "item-104",
    type: "FOUND",
    title: "Keychain with Blue Car Remote & Brass Dorm Key",
    category: "Keys",
    building: "Sports Complex",
    location: "Bleachers near Basketball Court 2",
    date: "2026-10-31",
    description: "Ring with automotive remote key and dorm room key with stamped room number.",
    photo: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80",
    status: "ACTIVE",
    reporterId: "admin-sec",
    secretQuestion: "What vehicle brand is on the key fob and what 3-digit number is stamped on the brass key?",
    secretAnswer: "Subaru and Room 214",
    claimsCount: 0,
    createdAt: "2026-10-31T08:10:00Z"
  }
];

// LocalStorage Keys
const DB_ITEMS_KEY = 'campus_items_prod';
const DB_USERS_KEY = 'campus_users_prod';
const DB_CLAIMS_KEY = 'campus_claims_prod';
const DB_NOTIFS_KEY = 'campus_notifs_prod';
const DB_AUDIT_KEY = 'campus_audit_prod';
const SESSION_USER_KEY = 'campus_session_user';

// -------------------------------------------------------------
// Issue 5: XSS Sanitization Engine
// -------------------------------------------------------------

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// -------------------------------------------------------------
// Issue 6: HTML5 Canvas Image Compression Helper (< 100 KB)
// -------------------------------------------------------------

function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    if (!file.type.startsWith("image/")) {
      return reject(new Error("Selected file must be an image."));
    }
    // Hard limit: 12MB input
    if (file.size > 12 * 1024 * 1024) {
      return reject(new Error("File size exceeds 12MB limit. Please choose a smaller image."));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load and downscale image."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

// Safe localStorage wrapper to guard against QuotaExceededError
function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.error("Storage error:", err);
    showToast("Storage quota warning: browser local cache is full.", "error");
    return false;
  }
}

// -------------------------------------------------------------
// Cryptographic Password Hashing (Web Crypto API)
// -------------------------------------------------------------

async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const data = enc.encode(password + ":" + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function createSignedSessionToken(user) {
  const payload = `${user.id}:${user.email}:${user.role}:${SESSION_SIGNING_SALT}`;
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", enc.encode(payload));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function verifySessionToken(user, token) {
  if (!user || !token) return false;
  const expectedToken = await createSignedSessionToken(user);
  return expectedToken === token;
}

// -------------------------------------------------------------
// Database Access & Sanitization
// -------------------------------------------------------------

function getItems() {
  const d = localStorage.getItem(DB_ITEMS_KEY);
  if (!d) {
    safeStorageSet(DB_ITEMS_KEY, JSON.stringify(INITIAL_ITEMS));
    return [...INITIAL_ITEMS];
  }
  try { return JSON.parse(d); } catch(e) { return [...INITIAL_ITEMS]; }
}

function saveItems(items) {
  safeStorageSet(DB_ITEMS_KEY, JSON.stringify(items));
}

function getUsers() {
  const d = localStorage.getItem(DB_USERS_KEY);
  if (!d) {
    safeStorageSet(DB_USERS_KEY, JSON.stringify(DEFAULT_USERS));
    return [...DEFAULT_USERS];
  }
  try {
    let users = JSON.parse(d);
    let migrated = false;
    users = users.map(u => {
      if (u.password) {
        migrated = true;
        delete u.password;
        if (!u.passwordHash) {
          u.passwordHash = u.email === "security@apex.edu"
            ? "7bbe0d843d1294ab9f88320bdde8582be0221f1f3cb038b13a4e2401690f4470"
            : "58f2566134ee9b87379fcf369d62c8871240ead64767952d4af603f98be76b6d";
        }
      }
      return u;
    });
    if (migrated) {
      safeStorageSet(DB_USERS_KEY, JSON.stringify(users));
    }
    return users;
  } catch(e) {
    return [...DEFAULT_USERS];
  }
}

function saveUsers(users) {
  const sanitized = users.map(u => {
    const copy = { ...u };
    delete copy.password;
    return copy;
  });
  safeStorageSet(DB_USERS_KEY, JSON.stringify(sanitized));
}

function getClaims() {
  const d = localStorage.getItem(DB_CLAIMS_KEY);
  if (!d) return [];
  try { return JSON.parse(d); } catch(e) { return []; }
}

function saveClaims(claims) {
  safeStorageSet(DB_CLAIMS_KEY, JSON.stringify(claims));
}

function getNotifications() {
  const d = localStorage.getItem(DB_NOTIFS_KEY);
  if (!d) return [];
  try { return JSON.parse(d); } catch(e) { return []; }
}

function saveNotifications(notifs) {
  safeStorageSet(DB_NOTIFS_KEY, JSON.stringify(notifs));
}

function getAuditLogs() {
  const d = localStorage.getItem(DB_AUDIT_KEY);
  if (!d) {
    return [
      {
        id: "audit-init",
        action: "REGISTRY_INITIALIZED",
        details: "Apex University Central Lost & Found Registry online with WebCrypto & XSS protection.",
        timestamp: new Date().toISOString()
      }
    ];
  }
  try { return JSON.parse(d); } catch(e) { return []; }
}

function saveAuditLogs(logs) {
  safeStorageSet(DB_AUDIT_KEY, JSON.stringify(logs));
}

// -------------------------------------------------------------
// Session Management & Cryptographic Integrity Check
// -------------------------------------------------------------

function getLoggedInUser() {
  const d = localStorage.getItem(SESSION_USER_KEY);
  if (!d) return null;
  try {
    const session = JSON.parse(d);
    return session.user || null;
  } catch(e) {
    return null;
  }
}

async function verifyActiveSession() {
  const d = localStorage.getItem(SESSION_USER_KEY);
  if (!d) return null;
  try {
    const session = JSON.parse(d);
    if (!session.user || !session.token) {
      localStorage.removeItem(SESSION_USER_KEY);
      return null;
    }
    const isValid = await verifySessionToken(session.user, session.token);
    if (!isValid) {
      const logs = getAuditLogs();
      logs.unshift({
        id: `audit-${Date.now()}`,
        action: "SESSION_TAMPERING_DETECTED",
        details: `Cryptographic signature mismatch for session user ${session.user.email || 'unknown'}. Revoking session.`,
        timestamp: new Date().toISOString()
      });
      saveAuditLogs(logs);
      localStorage.removeItem(SESSION_USER_KEY);
      showToast("Security notice: Session expired or signature invalid. Please sign in again.", "error");
      updateAuthUI();
      return null;
    }
    return session.user;
  } catch(e) {
    localStorage.removeItem(SESSION_USER_KEY);
    return null;
  }
}

async function setLoggedInUser(user) {
  if (!user) {
    localStorage.removeItem(SESSION_USER_KEY);
  } else {
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      badge: user.badge
    };
    const token = await createSignedSessionToken(safeUser);
    safeStorageSet(SESSION_USER_KEY, JSON.stringify({ user: safeUser, token: token }));
  }
  updateAuthUI();
  renderCurrentView();
}

// -------------------------------------------------------------
// Non-Blocking Confirmation Modal Helper
// -------------------------------------------------------------

let confirmResolve = null;

function showConfirmDialog(title, message, confirmText = "Confirm") {
  return new Promise((resolve) => {
    confirmResolve = resolve;
    const modal = document.getElementById("confirm-modal");
    const titleEl = document.getElementById("confirm-title");
    const msgEl = document.getElementById("confirm-message");
    const okBtn = document.getElementById("confirm-ok-btn");
    const cancelBtn = document.getElementById("confirm-cancel-btn");

    if (!modal) {
      resolve(false);
      return;
    }

    titleEl.textContent = title;
    msgEl.textContent = message;
    okBtn.textContent = confirmText;

    okBtn.onclick = () => {
      modal.classList.add("hidden");
      if (confirmResolve) confirmResolve(true);
      confirmResolve = null;
    };

    cancelBtn.onclick = () => {
      modal.classList.add("hidden");
      if (confirmResolve) confirmResolve(false);
      confirmResolve = null;
    };

    modal.classList.remove("hidden");
    lucide.createIcons();
  });
}

// -------------------------------------------------------------
// Form Inline Field Validation Helper
// -------------------------------------------------------------

function validateForm(formElement) {
  if (!formElement) return false;
  let isValid = true;
  let firstInvalid = null;

  formElement.querySelectorAll(".field-error-msg").forEach(el => el.remove());
  formElement.querySelectorAll(".input-error").forEach(el => {
    el.classList.remove("input-error");
  });

  const inputs = formElement.querySelectorAll("input, select, textarea");

  inputs.forEach(input => {
    if (!input.dataset.validationBound) {
      input.dataset.validationBound = "true";
      input.addEventListener("input", () => clearInputError(input));
      input.addEventListener("change", () => clearInputError(input));
    }

    if (input.type === "hidden" || input.disabled || input.closest(".hidden")) return;

    let error = null;

    if (input.required && !input.value.trim()) {
      error = "This field is required.";
    } else if (input.type === "email" && input.value.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(input.value.trim())) {
        error = "Please enter a valid email address.";
      }
    } else if (input.minLength && input.value.trim().length < input.minLength) {
      error = `Must be at least ${input.minLength} characters.`;
    }

    if (error) {
      isValid = false;
      input.classList.add("input-error");
      const errP = document.createElement("p");
      errP.className = "field-error-msg text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1";
      errP.innerHTML = `<i data-lucide="alert-circle" class="w-3.5 h-3.5 text-red-500 shrink-0"></i><span>${escapeHTML(error)}</span>`;
      input.parentNode.appendChild(errP);

      if (!firstInvalid) firstInvalid = input;
    }
  });

  if (firstInvalid) {
    firstInvalid.focus();
  }

  lucide.createIcons();
  return isValid;
}

function clearInputError(input) {
  input.classList.remove("input-error");
  const err = input.parentNode.querySelector(".field-error-msg");
  if (err) err.remove();
}

// -------------------------------------------------------------
// Issue 8: Hash Routing & History Navigation Engine
// -------------------------------------------------------------

let currentView = 'home';
let viewParams = {};
let uploadedImageBase64 = null;

function parseRouteFromHash() {
  const hash = window.location.hash || '#/';
  const cleanHash = hash.replace(/^#\/?/, '');
  const [pathPart, queryPart] = cleanHash.split('?');

  const params = {};
  if (queryPart) {
    const searchParams = new URLSearchParams(queryPart);
    for (const [k, v] of searchParams.entries()) {
      params[k] = v;
    }
  }

  if (!pathPart || pathPart === '') {
    return { view: 'home', params };
  }

  const segments = pathPart.split('/');
  if (segments[0] === 'item' && segments[1]) {
    return { view: 'item-detail', params: { ...params, id: segments[1] } };
  } else if (segments[0] === 'browse') {
    return { view: 'browse', params };
  } else if (segments[0] === 'dashboard') {
    return { view: 'dashboard', params };
  } else if (segments[0] === 'admin') {
    return { view: 'admin', params };
  }

  return { view: 'home', params };
}

async function navigate(view, params = {}, updateHash = true) {
  currentView = view;
  viewParams = params;

  // Protect Dashboard & Admin routes
  const user = await verifyActiveSession();
  if ((view === 'dashboard' || view === 'admin') && !user) {
    openAuthModal('Please sign in to access your dashboard and records.');
    return;
  }

  if (view === 'admin' && user.role !== 'admin') {
    showToast("Access Restricted: Campus Security clearance required.", "error");
    navigate('home');
    return;
  }

  if (updateHash) {
    let hashUrl = '#/';
    if (view === 'browse') {
      const q = new URLSearchParams(params).toString();
      hashUrl = `#/browse${q ? '?' + q : ''}`;
    } else if (view === 'item-detail' && params.id) {
      hashUrl = `#/item/${encodeURIComponent(params.id)}`;
    } else if (view === 'dashboard') {
      hashUrl = `#/dashboard`;
    } else if (view === 'admin') {
      hashUrl = `#/admin`;
    }

    if (window.location.hash !== hashUrl) {
      window.location.hash = hashUrl;
    }
  }

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

// -------------------------------------------------------------
// Issue 7: Cross-Tab Storage Event Synchronization
// -------------------------------------------------------------

window.addEventListener('storage', async (event) => {
  if ([DB_ITEMS_KEY, DB_CLAIMS_KEY, DB_NOTIFS_KEY, SESSION_USER_KEY, DB_AUDIT_KEY].includes(event.key)) {
    await verifyActiveSession();
    updateAuthUI();
    renderCurrentView();
  }
});

// History & Hash listener
window.addEventListener('hashchange', () => {
  const route = parseRouteFromHash();
  navigate(route.view, route.params, false);
});

// Initialize on Load
document.addEventListener('DOMContentLoaded', async () => {
  await verifyActiveSession();
  updateAuthUI();

  // Load initial route from URL Hash
  const route = parseRouteFromHash();
  navigate(route.view, route.params, false);
  lucide.createIcons();
});

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
  const items = getItems();
  const recentItems = items.filter(i => i.status !== 'HIDDEN').slice(0, 4);
  const totalRecovered = items.filter(i => i.status === 'RECOVERED').length;
  const activeFound = items.filter(i => i.type === 'FOUND' && i.status === 'ACTIVE').length;
  const activeLost = items.filter(i => i.type === 'LOST' && i.status === 'ACTIVE').length;

  return `
    <!-- Hero Banner -->
    <section class="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
      
      <div class="max-w-5xl mx-auto text-center relative z-10">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6">
          <i data-lucide="shield-check" class="w-3.5 h-3.5 text-blue-400"></i>
          <span>Apex University Official Registry</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Lost Something on Campus?<br>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300">
            Recover It With Verified Proof.
          </span>
        </h1>

        <p class="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          The centralized campus lost and found registry for students and staff. Report belongings, browse active reports, and verify ownership through secure verification questions and authorized handover desks.
        </p>

        <!-- Quick Search Bar -->
        <div class="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 mb-8">
          <div class="flex items-center gap-3 w-full px-3 py-1">
            <i data-lucide="search" class="w-5 h-5 text-slate-400 shrink-0"></i>
            <input type="text" id="hero-search-input" placeholder="Search AirPods, student ID, calculator, keys, bags..." 
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
            <span>Browse All Listings (${items.length})</span>
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
        <h2 class="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Verified Campus Recovery</h2>
        <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">How Ownership Verification Works</h3>
        <p class="text-sm text-slate-600 mt-2">
          Protecting student personal belongings from fraudulent claims through a 3-step integrity check:
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
            1
          </div>
          <h4 class="font-bold text-slate-900 text-base mb-2">Found Item Registered with Secret Clue</h4>
          <p class="text-xs text-slate-600 leading-relaxed">
            The finder posts the item with a public overview, but sets a confidential question (e.g. engravings, case stickers, keychain details) only the true owner can answer.
          </p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4">
            2
          </div>
          <h4 class="font-bold text-slate-900 text-base mb-2">Private Verification Review</h4>
          <p class="text-xs text-slate-600 leading-relaxed">
            The claimant submits an answer. The finder or campus security verifies the details without disclosing personal contact numbers publicly.
          </p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4">
            3
          </div>
          <h4 class="font-bold text-slate-900 text-base mb-2">Handover at Campus Station</h4>
          <p class="text-xs text-slate-600 leading-relaxed">
            Items are collected in person at designated campus desks (Central Library Front Desk or Campus Security Gate 1) with student ID verification.
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
            <p class="text-xs text-slate-500">Live listings updated across university buildings</p>
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
    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group cursor-pointer" onclick="navigate('item-detail', { id: '${escapeHTML(item.id)}' })">
      <div class="h-44 bg-slate-100 relative overflow-hidden">
        ${item.photo ? `
          <img src="${escapeHTML(item.photo)}" alt="${escapeHTML(item.title)}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
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

      <div class="p-4 flex flex-col flex-grow">
        <div class="text-[11px] font-medium text-blue-600 uppercase tracking-wider mb-1">${escapeHTML(item.category)}</div>
        <h4 class="font-bold text-slate-900 text-sm leading-snug line-clamp-1 mb-1.5 group-hover:text-blue-600 transition">
          ${escapeHTML(item.title)}
        </h4>
        <p class="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
          ${escapeHTML(item.description)}
        </p>

        <div class="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span class="flex items-center gap-1">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400"></i>
            <span class="truncate max-w-[130px]">${escapeHTML(item.building)}</span>
          </span>
          <span>${escapeHTML(item.date)}</span>
        </div>
      </div>
    </div>
  `;
}

function renderBrowseView() {
  const items = getItems();
  const query = (viewParams.query || '').toLowerCase();
  const selectedType = viewParams.type || 'ALL';
  const selectedCategory = viewParams.category || 'ALL';
  const selectedBuilding = viewParams.building || 'ALL';
  const sortBy = viewParams.sort || 'NEWEST';

  let filtered = items.filter(i => i.status !== 'HIDDEN');

  if (query) {
    filtered = filtered.filter(i => 
      (i.title || '').toLowerCase().includes(query) ||
      (i.description || '').toLowerCase().includes(query) ||
      (i.building || '').toLowerCase().includes(query) ||
      (i.location || '').toLowerCase().includes(query) ||
      (i.category || '').toLowerCase().includes(query)
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

  if (sortBy === 'NEWEST') {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortBy === 'OLDEST') {
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div class="relative">
          <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-3"></i>
          <input type="text" id="browse-search" value="${escapeHTML(viewParams.query || '')}" 
            placeholder="Search keywords, items, buildings, descriptions..." 
            oninput="applyBrowseFilter('query', this.value)"
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500">
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-600 mb-1">Listing Type</label>
            <select onchange="applyBrowseFilter('type', this.value)" class="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white">
              <option value="ALL" ${selectedType === 'ALL' ? 'selected' : ''}>All (Lost & Found)</option>
              <option value="LOST" ${selectedType === 'LOST' ? 'selected' : ''}>Lost Items Only</option>
              <option value="FOUND" ${selectedType === 'FOUND' ? 'selected' : ''}>Found Items Only</option>
            </select>
          </div>

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

          <div>
            <label class="block font-semibold text-slate-600 mb-1">Sort By</label>
            <select onchange="applyBrowseFilter('sort', this.value)" class="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white">
              <option value="NEWEST" ${sortBy === 'NEWEST' ? 'selected' : ''}>Newest First</option>
              <option value="OLDEST" ${sortBy === 'OLDEST' ? 'selected' : ''}>Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between mb-4 text-xs text-slate-500">
        <div>Showing <span class="font-bold text-slate-800">${filtered.length}</span> matching campus listings</div>
        ${(query || selectedType !== 'ALL' || selectedCategory !== 'ALL' || selectedBuilding !== 'ALL') ? `
          <button onclick="clearBrowseFilters()" class="text-blue-600 hover:underline flex items-center gap-1 font-medium">
            <i data-lucide="rotate-ccw" class="w-3 h-3"></i> Clear all filters
          </button>
        ` : ''}
      </div>

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
  const items = getItems();
  const item = items.find(i => i.id === itemId);
  const currentUser = getLoggedInUser();

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
  const isReporter = currentUser && item.reporterId === currentUser.id;
  const claims = getClaims();
  const existingClaim = currentUser ? claims.find(c => c.itemId === item.id && c.claimantId === currentUser.id) : null;

  return `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <button onclick="navigate('browse')" class="hover:text-blue-600 flex items-center gap-1">
          <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> Back to Browse
        </button>
        <span>/</span>
        <span>${escapeHTML(item.category)}</span>
        <span>/</span>
        <span class="text-slate-800 font-medium truncate max-w-xs">${escapeHTML(item.title)}</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div class="md:col-span-6">
          <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative">
            ${item.photo ? `
              <img src="${escapeHTML(item.photo)}" alt="${escapeHTML(item.title)}" class="w-full h-80 sm:h-96 object-cover">
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

          <div class="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
            <i data-lucide="shield-check" class="w-5 h-5 text-blue-600 shrink-0 mt-0.5"></i>
            <div>
              <span class="font-bold">Official Campus Handover Guarantee</span>
              <p class="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                Found items are collected in person at the Central Library Desk or Security Gate 1 with student identity verification.
              </p>
            </div>
          </div>
        </div>

        <div class="md:col-span-6 flex flex-col">
          <div class="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">${escapeHTML(item.category)}</div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-3">
            ${escapeHTML(item.title)}
          </h1>

          <div class="flex items-center gap-4 text-xs text-slate-500 mb-6 pb-4 border-b border-slate-200">
            <span class="flex items-center gap-1">
              <i data-lucide="calendar" class="w-4 h-4 text-slate-400"></i>
              <span>${escapeHTML(item.date)}</span>
            </span>
            <span class="flex items-center gap-1">
              <i data-lucide="map-pin" class="w-4 h-4 text-slate-400"></i>
              <span>${escapeHTML(item.building)}</span>
            </span>
            <span class="flex items-center gap-1">
              <i data-lucide="clock" class="w-4 h-4 text-slate-400"></i>
              <span>Report #${escapeHTML(item.id)}</span>
            </span>
          </div>

          <div class="mb-6">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Description & Notes</h3>
            <p class="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              ${escapeHTML(item.description)}
            </p>
          </div>

          <div class="mb-6">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Campus Location Detail</h3>
            <div class="flex items-center gap-2 text-sm text-slate-800">
              <div class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <i data-lucide="building" class="w-4 h-4"></i>
              </div>
              <div>
                <span class="font-semibold">${escapeHTML(item.building)}</span> &bull; 
                <span class="text-slate-600">${escapeHTML(item.location)}</span>
              </div>
            </div>
          </div>

          <!-- Actions Column (Addresses Issue 10 - Symmetrical workflow for LOST and FOUND) -->
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
                    <span>Claim Submitted (${escapeHTML(existingClaim.status)})</span>
                  </div>
                  <p class="text-blue-800">You submitted a claim for this item. Track status in your <button onclick="navigate('dashboard')" class="underline font-bold">Dashboard</button>.</p>
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
                  <button onclick="promptClaim('${escapeHTML(item.id)}')" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2">
                    <i data-lucide="shield-check" class="w-4 h-4"></i>
                    <span>Claim This Item (Verify Ownership)</span>
                  </button>
                </div>
              `}
            ` : item.type === 'LOST' && item.status !== 'RECOVERED' ? `
              ${isReporter ? `
                <div class="p-4 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                  <i data-lucide="info" class="w-4 h-4 text-blue-600"></i>
                  <span>You reported this item as lost. Check your <button onclick="navigate('dashboard')" class="text-blue-600 font-bold hover:underline">Dashboard</button> for finder notifications.</span>
                </div>
              ` : `
                <div class="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl">
                  <div class="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h4 class="font-bold text-emerald-950 text-sm">Did you find this belonging?</h4>
                      <p class="text-xs text-emerald-700 mt-0.5">Directly notify the student who lost it and arrange a safe campus handover.</p>
                    </div>
                    <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <i data-lucide="sparkles" class="w-4 h-4"></i>
                    </div>
                  </div>
                  <button onclick="openNotifyFoundModal('${escapeHTML(item.id)}')" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2">
                    <i data-lucide="send" class="w-4 h-4"></i>
                    <span>I Found This Item! (Notify Owner)</span>
                  </button>
                </div>
              `}
            ` : `
              <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2 font-medium">
                <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i>
                <span>This item has been recovered and returned to its verified owner.</span>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

function promptClaim(itemId) {
  const user = getLoggedInUser();
  if (!user) {
    openAuthModal('Please sign in to submit an ownership claim.');
    return;
  }
  openClaimModal(itemId);
}

// -------------------------------------------------------------
// Issue 10: "I Found This Item" Interactive Notification Flow
// -------------------------------------------------------------

function openNotifyFoundModal(itemId) {
  const user = getLoggedInUser();
  if (!user) {
    openAuthModal('Please sign in to notify the owner of a found item.');
    return;
  }

  const items = getItems();
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  const modal = document.getElementById("notify-found-modal");
  const form = document.getElementById("notify-found-form");

  form.reset();
  form.querySelectorAll('.field-error-msg').forEach(el => el.remove());
  form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

  document.getElementById("notify-item-id").value = item.id;
  document.getElementById("notify-item-summary").innerHTML = `
    <div class="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden shrink-0">
      ${item.photo ? `<img src="${escapeHTML(item.photo)}" class="w-full h-full object-cover">` : ''}
    </div>
    <div class="text-xs">
      <div class="font-bold text-slate-800">${escapeHTML(item.title)}</div>
      <div class="text-slate-500">${escapeHTML(item.building)} &bull; Reported Lost on ${escapeHTML(item.date)}</div>
    </div>
  `;

  modal.classList.remove("hidden");
  lucide.createIcons();
}

function closeNotifyFoundModal() {
  const modal = document.getElementById("notify-found-modal");
  if (modal) modal.classList.add("hidden");
}

function handleNotifyFoundSubmit(e) {
  e.preventDefault();
  const form = document.getElementById("notify-found-form");

  if (!validateForm(form)) {
    showToast("Please fill in where the item is located.", "error");
    return;
  }

  const user = getLoggedInUser();
  if (!user) {
    openAuthModal("Please sign in to continue.");
    return;
  }

  const items = getItems();
  const claims = getClaims();
  const itemId = document.getElementById("notify-item-id").value;
  const item = items.find(i => i.id === itemId);
  const location = document.getElementById("notify-location").value.trim();
  const message = document.getElementById("notify-message").value.trim();

  if (!item) return;

  // Create an automated Handover Match Claim
  const matchClaim = {
    id: `claim-${Date.now().toString().slice(-4)}`,
    itemId: item.id,
    claimantId: item.reporterId, // The person who lost it
    claimantName: "Owner",
    claimantEmail: "student@apex.edu",
    submittedAnswer: "Found by fellow student / staff",
    additionalProof: `Spotted at: ${location}`,
    status: 'APPROVED',
    handoverLocation: location,
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: `m-${Date.now()}`,
        senderId: user.id,
        senderName: `${user.name} (Finder)`,
        text: `Good news! I have located your lost belonging. ${message} (Location: ${location})`,
        timestamp: new Date().toISOString()
      }
    ]
  };

  claims.unshift(matchClaim);
  saveClaims(claims);

  item.status = 'UNDER_REVIEW';
  saveItems(items);

  const notifs = getNotifications();
  notifs.unshift({
    id: `notif-${Date.now()}`,
    userId: item.reporterId,
    title: 'Good News: Someone Found Your Item!',
    message: `${user.name} located your lost ${item.title}. Check dashboard to coordinate pickup.`,
    timestamp: 'Just now',
    read: false
  });
  saveNotifications(notifs);

  const logs = getAuditLogs();
  logs.unshift({
    id: `audit-${Date.now()}`,
    action: 'LOST_ITEM_LOCATED',
    details: `${user.name} notified owner of lost item #${item.id} (${location}).`,
    timestamp: new Date().toISOString()
  });
  saveAuditLogs(logs);

  closeNotifyFoundModal();
  showToast("Owner notified! Coordination channel opened in your Dashboard.", "success");
  navigate('dashboard');
}

function renderDashboardView() {
  const user = getLoggedInUser();
  if (!user) return '';

  const items = getItems();
  const claims = getClaims();

  const myLost = items.filter(i => i.reporterId === user.id && i.type === 'LOST');
  const myFound = items.filter(i => i.reporterId === user.id && i.type === 'FOUND');
  const myClaims = claims.filter(c => c.claimantId === user.id);

  const myFoundIds = myFound.map(f => f.id);
  const myLostIds = myLost.map(l => l.id);
  // Incoming claims for items I found OR items I lost that someone notified me about
  const incomingClaims = claims.filter(c => myFoundIds.includes(c.itemId) || myLostIds.includes(c.itemId));

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div class="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Campus Portal</div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ${escapeHTML(user.name)}'s Dashboard
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">${escapeHTML(user.email)} &bull; ${escapeHTML(user.badge || 'Verified Member')}</p>
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
          <div class="text-xs text-slate-500">Active Claims & Matches</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200">
          <div class="text-2xl font-black text-indigo-600">${myClaims.length}</div>
          <div class="text-xs text-slate-500">My Submitted Claims</div>
        </div>
      </div>

      ${incomingClaims.length > 0 ? `
        <div class="mb-10">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                <i data-lucide="shield-alert" class="w-5 h-5 text-blue-600"></i>
                <span>Claims & Active Matches Requiring Review</span>
              </h2>
              <p class="text-xs text-slate-500">Coordinate recovery with students who found or claimed items.</p>
            </div>
          </div>

          <div class="space-y-4">
            ${incomingClaims.map(claim => {
              const item = items.find(i => i.id === claim.itemId);
              return renderIncomingClaimCard(claim, item);
            }).join('')}
          </div>
        </div>
      ` : ''}

      <div class="mb-10">
        <h2 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
          <i data-lucide="key" class="w-5 h-5 text-indigo-600"></i>
          <span>My Submitted Claims & Handover Hub</span>
        </h2>
        <p class="text-xs text-slate-500 mb-4">Track verification progress and coordinate campus pickup.</p>

        ${myClaims.length > 0 ? `
          <div class="space-y-4">
            ${myClaims.map(claim => {
              const item = items.find(i => i.id === claim.itemId);
              return renderSubmittedClaimCard(claim, item);
            }).join('')}
          </div>
        ` : `
          <div class="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
            You haven't submitted any claims yet.
          </div>
        `}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 class="font-bold text-slate-900 text-sm mb-3">Items I've Found (${myFound.length})</h3>
          <div class="space-y-3">
            ${myFound.length > 0 ? myFound.map(item => `
              <div class="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 class="font-bold text-sm text-slate-800">${escapeHTML(item.title)}</h4>
                  <p class="text-xs text-slate-500">${escapeHTML(item.building)} &bull; ${escapeHTML(item.date)}</p>
                </div>
                <span class="text-xs px-2.5 py-1 rounded-full font-bold ${item.status === 'RECOVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
                  ${escapeHTML(item.status)}
                </span>
              </div>
            `).join('') : '<div class="text-xs text-slate-400 p-4 bg-white rounded-xl border border-slate-200">No found items reported yet.</div>'}
          </div>
        </div>

        <div>
          <h3 class="font-bold text-slate-900 text-sm mb-3">Items I've Reported Lost (${myLost.length})</h3>
          <div class="space-y-3">
            ${myLost.length > 0 ? myLost.map(item => `
              <div class="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 class="font-bold text-sm text-slate-800">${escapeHTML(item.title)}</h4>
                  <p class="text-xs text-slate-500">${escapeHTML(item.building)} &bull; ${escapeHTML(item.date)}</p>
                </div>
                <span class="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-800">
                  ${escapeHTML(item.status)}
                </span>
              </div>
            `).join('') : '<div class="text-xs text-slate-400 p-4 bg-white rounded-xl border border-slate-200">No lost items reported yet.</div>'}
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
          <div class="text-xs font-bold uppercase tracking-wider text-blue-600">Claim for Item #${item ? escapeHTML(item.id) : ''}</div>
          <h3 class="text-base font-bold text-slate-900">${item ? escapeHTML(item.title) : 'Item'}</h3>
        </div>
        <div>
          <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isCompleted ? 'bg-emerald-100 text-emerald-800' :
            isApproved ? 'bg-blue-100 text-blue-800' :
            claim.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
            'bg-amber-100 text-amber-800'
          }">
            Status: ${escapeHTML(claim.status)}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 text-xs">
        <div class="p-4 bg-slate-50 rounded-xl space-y-2">
          <div class="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Verification Target</div>
          <div>
            <span class="font-semibold text-slate-600">Question:</span> ${item ? escapeHTML(item.secretQuestion || 'General proof of ownership') : ''}
          </div>
          <div class="text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200 font-mono">
            <span class="font-bold">Target Answer:</span> ${item ? escapeHTML(item.secretAnswer || 'Owner verification') : ''}
          </div>
        </div>

        <div class="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
          <div class="font-bold text-blue-900 uppercase tracking-wider text-[10px]">Claimant / Match Submission</div>
          <div>
            <span class="font-semibold text-slate-700">Contact:</span> ${escapeHTML(claim.claimantName)} (${escapeHTML(claim.claimantEmail)})
          </div>
          <div>
            <span class="font-semibold text-slate-700">Answer / Location Given:</span>
            <div class="p-2 bg-white rounded border border-blue-200 mt-1 font-semibold text-slate-900">
              "${escapeHTML(claim.submittedAnswer)}"
            </div>
          </div>
          ${claim.additionalProof ? `
            <div class="text-slate-600 mt-1">
              <span class="font-semibold">Additional Details:</span> ${escapeHTML(claim.additionalProof)}
            </div>
          ` : ''}
        </div>
      </div>

      ${claim.status === 'PENDING' ? `
        <div class="flex items-center justify-end gap-3 pt-2">
          <button onclick="handleClaimReview('${escapeHTML(claim.id)}', 'REJECTED')" class="px-4 py-2 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition">
            Reject (Does not match)
          </button>
          <button onclick="handleClaimReview('${escapeHTML(claim.id)}', 'APPROVED')" class="px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition flex items-center gap-1.5">
            <i data-lucide="check" class="w-4 h-4"></i> Approve & Open Handover
          </button>
        </div>
      ` : isApproved ? `
        ${renderHandoverChat(claim)}
      ` : isCompleted ? `
        <div class="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
          <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i>
          <span>Handover completed at ${escapeHTML(claim.handoverLocation)}. Item safely returned to owner.</span>
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
          <h3 class="text-base font-bold text-slate-900">${item ? escapeHTML(item.title) : 'Campus Item'}</h3>
        </div>
        <div>
          <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isCompleted ? 'bg-emerald-100 text-emerald-800' :
            isApproved ? 'bg-blue-100 text-blue-800' :
            claim.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
            'bg-amber-100 text-amber-800'
          }">
            Status: ${escapeHTML(claim.status)}
          </span>
        </div>
      </div>

      <div class="my-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl space-y-1">
        <div><span class="font-semibold text-slate-800">Your Answer:</span> ${escapeHTML(claim.submittedAnswer)}</div>
        <div><span class="font-semibold text-slate-800">Handover Desk:</span> ${escapeHTML(claim.handoverLocation || 'Central Library Desk')}</div>
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
  const user = getLoggedInUser();

  return `
    <div class="mt-4 pt-4 border-t border-slate-200 space-y-3">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <i data-lucide="message-square" class="w-4 h-4 text-blue-600"></i>
          <span>Campus Handover Coordination & In-App Chat</span>
        </h4>
        <div class="text-[11px] text-slate-500">Private &bull; Phone numbers hidden</div>
      </div>

      <!-- Messages list (Escaped for Issue 5) -->
      <div class="bg-slate-50 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2.5 border border-slate-200 text-xs">
        ${(claim.messages || []).map(m => {
          const isMe = user && m.senderId === user.id;
          return `
            <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'}">
              <div class="text-[10px] text-slate-500 font-medium mb-0.5">${escapeHTML(m.senderName)}</div>
              <div class="px-3 py-2 rounded-xl max-w-xs ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}">
                ${escapeHTML(m.text)}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="flex items-center gap-2">
        <input type="text" id="chat-input-${escapeHTML(claim.id)}" placeholder="Type a message to coordinate pickup..." 
          onkeydown="if(event.key==='Enter') sendChatMessage('${escapeHTML(claim.id)}')"
          class="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white">
        <button onclick="sendChatMessage('${escapeHTML(claim.id)}')" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1">
          <i data-lucide="send" class="w-3.5 h-3.5"></i>
        </button>
      </div>

      <div class="pt-2 flex items-center justify-between">
        <div class="text-[11px] text-slate-500">Meetup point: <strong>${escapeHTML(claim.handoverLocation)}</strong></div>
        <button onclick="completeHandover('${escapeHTML(claim.id)}')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition">
          <i data-lucide="check-check" class="w-4 h-4"></i>
          <span>Confirm Safe Handover Completed</span>
        </button>
      </div>
    </div>
  `;
}

function renderAdminView() {
  const user = getLoggedInUser();
  if (!user || user.role !== 'admin') {
    return `
      <div class="max-w-2xl mx-auto px-4 py-16 text-center">
        <div class="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <i data-lucide="shield-alert" class="w-6 h-6"></i>
        </div>
        <h2 class="text-xl font-bold text-slate-900 mb-2">Campus Security & Admin Portal Only</h2>
        <p class="text-xs text-slate-500 mb-4">You must be logged in as an authorized Campus Security administrator to access content moderation and audit logs.</p>
        <button onclick="openAuthModal('Sign in with Campus Security credentials')" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition">
          Sign In as Officer Davis
        </button>
      </div>
    `;
  }

  const items = getItems();
  const claims = getClaims();
  const auditLogs = getAuditLogs();

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 text-[11px] font-bold uppercase tracking-wider mb-1">
            <i data-lucide="shield" class="w-3.5 h-3.5"></i> Campus Security Command
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Security Moderation & Audit Console
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">Manage reported content, resolve claims, and inspect security audit trails.</p>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="bg-white p-4 rounded-xl border border-slate-200">
          <div class="text-2xl font-black text-slate-900">${items.length}</div>
          <div class="text-xs text-slate-500">Total System Reports</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200">
          <div class="text-2xl font-black text-blue-600">${claims.length}</div>
          <div class="text-xs text-slate-500">Total Claim Submissions</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200">
          <div class="text-2xl font-black text-emerald-600">${items.filter(i => i.status === 'RECOVERED').length}</div>
          <div class="text-xs text-slate-500">Recoveries Handed Over</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200">
          <div class="text-2xl font-black text-purple-600">${auditLogs.length}</div>
          <div class="text-xs text-slate-500">Security Audit Logs</div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 class="font-bold text-slate-900 text-sm">Active Campus Listings Moderation</h3>
          <span class="text-xs text-slate-500">${items.length} listings</span>
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
              ${items.map(item => `
                <tr class="hover:bg-slate-50">
                  <td class="p-3">
                    <div class="font-bold text-slate-900">${escapeHTML(item.title)}</div>
                    <div class="text-[10px] text-slate-400">#${escapeHTML(item.id)} &bull; ${escapeHTML(item.category)}</div>
                  </td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded font-bold ${item.type === 'LOST' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">
                      ${escapeHTML(item.type)}
                    </span>
                  </td>
                  <td class="p-3 text-slate-600">${escapeHTML(item.building)}</td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded font-bold ${item.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' : item.status === 'RECOVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">
                      ${escapeHTML(item.status)}
                    </span>
                  </td>
                  <td class="p-3 text-right space-x-2">
                    ${item.status !== 'HIDDEN' ? `
                      <button onclick="adminToggleHide('${escapeHTML(item.id)}', true)" class="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded font-medium">
                        Hide / Flag
                      </button>
                    ` : `
                      <button onclick="adminToggleHide('${escapeHTML(item.id)}', false)" class="px-2 py-1 text-emerald-600 hover:bg-emerald-50 rounded font-medium">
                        Unhide
                      </button>
                    `}
                    <button onclick="adminDelete('${escapeHTML(item.id)}')" class="px-2 py-1 text-slate-500 hover:text-slate-800 rounded font-medium">
                      Delete
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <h3 class="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
          <i data-lucide="file-text" class="w-4 h-4 text-slate-500"></i>
          <span>Security Audit Trail</span>
        </h3>
        <div class="space-y-2 max-h-60 overflow-y-auto text-xs">
          ${auditLogs.map(log => `
            <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4">
              <div>
                <span class="font-bold text-slate-800 uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-200 mr-2">${escapeHTML(log.action)}</span>
                <span class="text-slate-700">${escapeHTML(log.details)}</span>
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
// Interactive Operations & Modals (Addresses Issue 9: Field Overwrite)
// -------------------------------------------------------------

function openReportModal(type) {
  const user = getLoggedInUser();
  if (!user) {
    openAuthModal(`Please sign in with your campus account to report a ${type.toLowerCase()} item.`);
    return;
  }

  const modal = document.getElementById('report-modal');
  const form = document.getElementById('report-form');
  const typeInput = document.getElementById('report-type');
  const title = document.getElementById('modal-title');
  const subtitle = document.getElementById('modal-subtitle');
  const iconContainer = document.getElementById('modal-icon-container');
  const foundSecret = document.getElementById('found-secret-config');
  const submitBtn = document.getElementById('report-submit-btn');

  if (!modal || !form) return;

  // Issue 9 Fix: Execute form.reset() FIRST before assigning typeInput.value!
  form.reset();
  typeInput.value = type;

  form.querySelectorAll('.field-error-msg').forEach(el => el.remove());
  form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

  uploadedImageBase64 = null;
  document.getElementById('image-preview').innerHTML = '<i data-lucide="image" class="w-6 h-6 text-slate-400"></i>';
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

// Issue 6: Client-Side Compressed Image Preview
async function previewPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;

  const feedback = document.getElementById("photo-size-feedback");
  if (feedback) feedback.textContent = "Compressing photo via canvas...";

  try {
    const compressed = await compressImage(file, 800, 0.7);
    uploadedImageBase64 = compressed;
    document.getElementById('image-preview').innerHTML = `
      <img src="${compressed}" class="w-full h-full object-cover">
    `;
    const kb = (compressed.length / 1024).toFixed(1);
    if (feedback) feedback.textContent = `Optimized for storage (~${kb} KB)`;
  } catch (err) {
    showToast(err.message || "Failed to process photo.", "error");
    if (feedback) feedback.textContent = "Photo upload error.";
  }
}

function handleReportSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('report-form');

  if (!validateForm(form)) {
    showToast("Please fill in all required fields indicated in red.", "error");
    return;
  }

  const user = getLoggedInUser();
  if (!user) {
    openAuthModal('Session expired. Please sign in to report items.');
    return;
  }

  const items = getItems();
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
    reporterId: user.id,
    secretQuestion: secretQuestion,
    secretAnswer: secretAnswer,
    claimsCount: 0,
    createdAt: new Date().toISOString()
  };

  items.unshift(newItem);
  saveItems(items);

  const logs = getAuditLogs();
  logs.unshift({
    id: `audit-${Date.now()}`,
    action: `ITEM_${type}_REPORTED`,
    details: `${type} item #${newItem.id} (${newItem.title}) reported by ${user.name} at ${building}.`,
    timestamp: new Date().toISOString()
  });
  saveAuditLogs(logs);

  closeReportModal();
  showToast(`Successfully reported ${type.toLowerCase()} item!`, 'success');
  navigate('browse', { type: type });
}

function openClaimModal(itemId) {
  const items = getItems();
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  const modal = document.getElementById('claim-modal');
  const form = document.getElementById('claim-form');

  form.reset();
  form.querySelectorAll('.field-error-msg').forEach(el => el.remove());
  form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

  document.getElementById('claim-item-id').value = item.id;
  document.getElementById('claim-question-text').textContent = item.secretQuestion || "Please provide details only the true owner would know.";
  document.getElementById('claim-answer').value = '';
  document.getElementById('claim-additional-proof').value = '';

  document.getElementById('claim-item-summary').innerHTML = `
    <div class="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden shrink-0">
      ${item.photo ? `<img src="${escapeHTML(item.photo)}" class="w-full h-full object-cover">` : ''}
    </div>
    <div class="text-xs">
      <div class="font-bold text-slate-800">${escapeHTML(item.title)}</div>
      <div class="text-slate-500">${escapeHTML(item.building)} &bull; ${escapeHTML(item.date)}</div>
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
  const form = document.getElementById('claim-form');

  if (!validateForm(form)) {
    showToast("Please enter your verification answer.", "error");
    return;
  }

  const user = getLoggedInUser();
  if (!user) {
    openAuthModal('Please sign in to submit a claim.');
    return;
  }

  const items = getItems();
  const claims = getClaims();
  const itemId = document.getElementById('claim-item-id').value;
  const item = items.find(i => i.id === itemId);
  const answer = document.getElementById('claim-answer').value.trim();
  const additionalProof = document.getElementById('claim-additional-proof').value.trim();

  if (!item) return;

  const newClaim = {
    id: `claim-${Date.now().toString().slice(-4)}`,
    itemId: item.id,
    claimantId: user.id,
    claimantName: user.name,
    claimantEmail: user.email,
    submittedAnswer: answer,
    additionalProof: additionalProof,
    status: 'PENDING',
    handoverLocation: 'Central Library Front Desk',
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: `m-${Date.now()}`,
        senderId: user.id,
        senderName: `${user.name} (Claimant)`,
        text: `Hello! I have submitted an ownership claim with my verification answer.`,
        timestamp: new Date().toISOString()
      }
    ]
  };

  claims.unshift(newClaim);
  saveClaims(claims);

  item.status = 'UNDER_REVIEW';
  saveItems(items);

  const notifs = getNotifications();
  notifs.unshift({
    id: `notif-${Date.now()}`,
    userId: item.reporterId,
    title: 'New Ownership Claim Submitted',
    message: `${user.name} submitted a claim for ${item.title}.`,
    timestamp: 'Just now',
    read: false
  });
  saveNotifications(notifs);

  const logs = getAuditLogs();
  logs.unshift({
    id: `audit-${Date.now()}`,
    action: 'CLAIM_SUBMITTED',
    details: `Claim #${newClaim.id} submitted by ${user.name} for item #${item.id}.`,
    timestamp: new Date().toISOString()
  });
  saveAuditLogs(logs);

  closeClaimModal();
  showToast('Claim submitted! The finder has been notified.', 'success');
  navigate('dashboard');
}

function handleClaimReview(claimId, newStatus) {
  const user = getLoggedInUser();
  const claims = getClaims();
  const items = getItems();
  const claim = claims.find(c => c.id === claimId);
  if (!claim) return;

  const item = items.find(i => i.id === claim.itemId);

  claim.status = newStatus;
  if (newStatus === 'APPROVED') {
    if (item) item.status = 'UNDER_REVIEW';
    claim.messages.push({
      id: `m-${Date.now()}`,
      senderId: user ? user.id : 'finder',
      senderName: `${user ? user.name : 'Finder'} (Finder)`,
      text: `Your answer matched! I've approved your claim. Let's coordinate pickup at ${claim.handoverLocation}.`,
      timestamp: new Date().toISOString()
    });

    const notifs = getNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      userId: claim.claimantId,
      title: 'Claim Approved!',
      message: `Your claim for ${item ? item.title : 'item'} was approved.`,
      timestamp: 'Just now',
      read: false
    });
    saveNotifications(notifs);
  } else if (newStatus === 'REJECTED') {
    if (item) item.status = 'ACTIVE';
  }

  saveClaims(claims);
  saveItems(items);

  const logs = getAuditLogs();
  logs.unshift({
    id: `audit-${Date.now()}`,
    action: `CLAIM_${newStatus}`,
    details: `Claim #${claim.id} set to ${newStatus} by ${user ? user.name : 'reviewer'}.`,
    timestamp: new Date().toISOString()
  });
  saveAuditLogs(logs);

  showToast(`Claim marked as ${newStatus}!`, 'info');
  renderCurrentView();
}

function sendChatMessage(claimId) {
  const input = document.getElementById(`chat-input-${claimId}`);
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  const user = getLoggedInUser();
  const claims = getClaims();
  const claim = claims.find(c => c.id === claimId);

  if (!claim) return;

  claim.messages = claim.messages || [];
  claim.messages.push({
    id: `m-${Date.now()}`,
    senderId: user ? user.id : 'anon',
    senderName: user ? `${user.name} (${user.role === 'admin' ? 'Security' : user.id === claim.claimantId ? 'Owner' : 'Finder'})` : 'User',
    text: text,
    timestamp: new Date().toISOString()
  });

  saveClaims(claims);
  renderCurrentView();
}

function completeHandover(claimId) {
  const claims = getClaims();
  const items = getItems();
  const claim = claims.find(c => c.id === claimId);
  if (!claim) return;

  const item = items.find(i => i.id === claim.itemId);
  claim.status = 'COMPLETED';
  if (item) item.status = 'RECOVERED';

  saveClaims(claims);
  saveItems(items);

  const logs = getAuditLogs();
  logs.unshift({
    id: `audit-${Date.now()}`,
    action: 'HANDOVER_COMPLETED',
    details: `Safe campus handover confirmed for item #${item ? item.id : ''} at ${claim.handoverLocation}.`,
    timestamp: new Date().toISOString()
  });
  saveAuditLogs(logs);

  showToast('Handover confirmed! Item safely returned to owner.', 'success');
  renderCurrentView();
}

async function adminToggleHide(itemId, shouldHide) {
  const user = await verifyActiveSession();
  if (!user || user.role !== 'admin') {
    showToast("Unauthorized: Admin clearance required.", "error");
    return;
  }

  const items = getItems();
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  item.status = shouldHide ? 'HIDDEN' : 'ACTIVE';
  saveItems(items);

  const logs = getAuditLogs();
  logs.unshift({
    id: `audit-${Date.now()}`,
    action: shouldHide ? 'ITEM_MODERATED_HIDDEN' : 'ITEM_UNHIDDEN',
    details: `Item #${item.id} was ${shouldHide ? 'hidden' : 'restored'} by Admin ${user.name}.`,
    timestamp: new Date().toISOString()
  });
  saveAuditLogs(logs);

  showToast(shouldHide ? 'Item listing hidden.' : 'Item listing restored.', 'info');
  renderCurrentView();
}

async function adminDelete(itemId) {
  const user = await verifyActiveSession();
  if (!user || user.role !== 'admin') {
    showToast("Unauthorized: Admin clearance required.", "error");
    return;
  }

  const confirmed = await showConfirmDialog(
    "Delete Listing",
    "Are you sure you want to permanently delete this report? This action is recorded in the security audit trail.",
    "Permanently Delete"
  );

  if (!confirmed) return;

  let items = getItems();
  items = items.filter(i => i.id !== itemId);
  saveItems(items);

  const logs = getAuditLogs();
  logs.unshift({
    id: `audit-${Date.now()}`,
    action: "ITEM_DELETED_BY_ADMIN",
    details: `Report #${itemId} permanently removed by Admin ${user.name}.`,
    timestamp: new Date().toISOString()
  });
  saveAuditLogs(logs);

  showToast('Item deleted by Admin.', 'info');
  renderCurrentView();
}

// -------------------------------------------------------------
// Authentication System with WebCrypto SHA-256 Passwords
// -------------------------------------------------------------

function openAuthModal(message) {
  const modal = document.getElementById('auth-modal');
  if (message) {
    showToast(message, 'info');
  }
  hideAuthBanners();
  if (modal) modal.classList.remove('hidden');
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.add('hidden');
  hideAuthBanners();
}

function hideAuthBanners() {
  const logBanner = document.getElementById('login-error-banner');
  const regBanner = document.getElementById('register-error-banner');
  if (logBanner) logBanner.classList.add('hidden');
  if (regBanner) regBanner.classList.add('hidden');
}

function setAuthTab(tab) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const authTitle = document.getElementById('auth-title');

  hideAuthBanners();

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    tabLogin.className = 'flex-1 py-2 text-xs font-bold text-blue-600 border-b-2 border-blue-600';
    tabRegister.className = 'flex-1 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 border-b-2 border-transparent';
    authTitle.textContent = 'Sign in to CampusFind';
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    tabLogin.className = 'flex-1 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 border-b-2 border-transparent';
    tabRegister.className = 'flex-1 py-2 text-xs font-bold text-blue-600 border-b-2 border-blue-600';
    authTitle.textContent = 'Register Student Account';
  }
}

async function handleAuthLogin(e) {
  e.preventDefault();
  const form = document.getElementById('login-form');
  const errorBanner = document.getElementById('login-error-banner');
  const errorMsg = document.getElementById('login-error-message');

  if (!validateForm(form)) {
    return;
  }

  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email);

  const inputHash = await hashPassword(password, email);

  if (!user || user.passwordHash !== inputHash) {
    if (errorBanner && errorMsg) {
      errorMsg.textContent = "Invalid university email or password. Default admin: security@apex.edu / admin";
      errorBanner.classList.remove('hidden');
    }
    showToast("Invalid email or password. Please try again.", "error");
    return;
  }

  await setLoggedInUser(user);
  closeAuthModal();
  showToast(`Welcome back, ${user.name}!`, 'success');
}

async function handleAuthRegister(e) {
  e.preventDefault();
  const form = document.getElementById('register-form');
  const errorBanner = document.getElementById('register-error-banner');
  const errorMsg = document.getElementById('register-error-message');

  if (!validateForm(form)) {
    return;
  }

  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim().toLowerCase();
  const role = document.getElementById('register-role').value;
  const password = document.getElementById('register-password').value;

  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email)) {
    if (errorBanner && errorMsg) {
      errorMsg.textContent = "An account with this university email already exists. Please sign in.";
      errorBanner.classList.remove('hidden');
    }
    showToast("Account already exists. Please sign in.", "error");
    return;
  }

  const passwordHash = await hashPassword(password, email);

  const newUser = {
    id: `usr-${Date.now().toString().slice(-4)}`,
    name: name,
    email: email,
    passwordHash: passwordHash,
    role: role,
    badge: role === 'staff' ? 'University Staff' : 'Student'
  };

  users.push(newUser);
  saveUsers(users);

  await setLoggedInUser(newUser);
  closeAuthModal();
  showToast(`Account created! Welcome, ${newUser.name}.`, 'success');
}

async function handleLogout() {
  await setLoggedInUser(null);
  showToast('You have been signed out.', 'info');
  navigate('home');
}

function updateAuthUI() {
  const container = document.getElementById('auth-nav-container');
  if (!container) return;

  const user = getLoggedInUser();

  if (user) {
    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    container.innerHTML = `
      <div class="relative">
        <button onclick="toggleUserDropdown()" class="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition text-sm">
          <div class="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">${escapeHTML(initials)}</div>
          <div class="text-left hidden sm:block">
            <div class="font-medium text-xs leading-none">${escapeHTML(user.name)}</div>
            <div class="text-[10px] text-slate-400 mt-0.5">${escapeHTML(user.badge || user.role)}</div>
          </div>
          <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400"></i>
        </button>
        <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800">
          <div class="px-4 py-2 border-b border-slate-100">
            <div class="font-bold text-xs text-slate-900">${escapeHTML(user.name)}</div>
            <div class="text-[11px] text-slate-500">${escapeHTML(user.email)}</div>
          </div>
          <button onclick="navigate('dashboard'); toggleUserDropdown()" class="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs flex items-center gap-2">
            <i data-lucide="layout-dashboard" class="w-3.5 h-3.5 text-slate-500"></i>
            <span>My Dashboard & Claims</span>
          </button>
          ${user.role === 'admin' ? `
            <button onclick="navigate('admin'); toggleUserDropdown()" class="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs flex items-center gap-2 text-purple-700 font-semibold">
              <i data-lucide="shield" class="w-3.5 h-3.5"></i>
              <span>Security & Moderation</span>
            </button>
          ` : ''}
          <div class="border-t border-slate-100 my-1"></div>
          <button onclick="handleLogout()" class="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2">
            <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="flex items-center gap-2">
        <button onclick="openAuthModal()" class="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition">
          Sign In
        </button>
        <button onclick="openAuthModal(); setAuthTab('register')" class="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition">
          Register
        </button>
      </div>
    `;
  }

  lucide.createIcons();
}

function toggleUserDropdown() {
  const el = document.getElementById('user-dropdown');
  if (el) el.classList.toggle('hidden');
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
// Notifications & Badges
// -------------------------------------------------------------

function toggleNotifications() {
  const el = document.getElementById('notif-dropdown');
  if (!el) return;
  el.classList.toggle('hidden');
  renderNotificationList();
}

function renderNotificationList() {
  const user = getLoggedInUser();
  const listEl = document.getElementById('notif-list');
  if (!listEl) return;

  if (!user) {
    listEl.innerHTML = '<div class="p-4 text-center text-xs text-slate-400">Please sign in to view notifications</div>';
    return;
  }

  const notifs = getNotifications().filter(n => n.userId === user.id);
  if (notifs.length === 0) {
    listEl.innerHTML = '<div class="p-4 text-center text-xs text-slate-400">No new notifications</div>';
    return;
  }

  listEl.innerHTML = notifs.map(n => `
    <div class="p-3 text-xs hover:bg-slate-50 transition">
      <div class="font-bold text-slate-900">${escapeHTML(n.title)}</div>
      <div class="text-slate-600 mt-0.5">${escapeHTML(n.message)}</div>
      <div class="text-[10px] text-slate-400 mt-1">${escapeHTML(n.timestamp)}</div>
    </div>
  `).join('');
}

function clearNotifications() {
  const user = getLoggedInUser();
  if (!user) return;
  let notifs = getNotifications();
  notifs = notifs.filter(n => n.userId !== user.id);
  saveNotifications(notifs);
  renderNotificationList();
  updateBadges();
}

function updateBadges() {
  const user = getLoggedInUser();
  const notifBadge = document.getElementById('notif-badge');
  const claimsBadge = document.getElementById('nav-claims-badge');

  if (!user) {
    if (notifBadge) notifBadge.classList.add('hidden');
    if (claimsBadge) claimsBadge.classList.add('hidden');
    return;
  }

  const notifs = getNotifications().filter(n => n.userId === user.id && !n.read);
  if (notifBadge) {
    if (notifs.length > 0) notifBadge.classList.remove('hidden');
    else notifBadge.classList.add('hidden');
  }

  const items = getItems();
  const claims = getClaims();
  const myFoundIds = items.filter(i => i.reporterId === user.id && i.type === 'FOUND').map(i => i.id);
  const myLostIds = items.filter(i => i.reporterId === user.id && i.type === 'LOST').map(i => i.id);
  const pendingIncoming = claims.filter(c => (myFoundIds.includes(c.itemId) || myLostIds.includes(c.itemId)) && c.status === 'PENDING').length;

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

// -------------------------------------------------------------
// Non-Blocking Toast Notification System
// -------------------------------------------------------------

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-message');
  const iconEl = document.getElementById('toast-icon');

  if (!toast || !msgEl) return;

  msgEl.textContent = message;

  if (type === 'error') {
    iconEl.innerHTML = '<i data-lucide="alert-circle" class="w-5 h-5 text-rose-400 shrink-0"></i>';
    toast.className = "fixed bottom-6 right-6 z-50 bg-rose-950 text-rose-100 border border-rose-800 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all transform duration-300";
  } else if (type === 'success') {
    iconEl.innerHTML = '<i data-lucide="check-circle" class="w-5 h-5 text-emerald-400 shrink-0"></i>';
    toast.className = "fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-emerald-800 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all transform duration-300";
  } else {
    iconEl.innerHTML = '<i data-lucide="info" class="w-5 h-5 text-blue-400 shrink-0"></i>';
    toast.className = "fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-slate-800 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all transform duration-300";
  }

  toast.classList.remove('hidden');
  lucide.createIcons();

  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 4000);
}
