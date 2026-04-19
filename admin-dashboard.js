(function () {
  const ADMIN_USERNAME = "Abir_alhorof";
  const ADMIN_PASSWORD = "abiralhorof2026";

  const ADMIN_SESSION_KEY = "abir-admin-session";
  const RESERVATION_LOCAL_KEY = "abir-al-horof-reservations";
  const VISITS_LOCAL_KEY = "abir-al-horof-local-visits";

  const config = window.ABIR_ADMIN_CONFIG || {};

  const state = {
    reservations: [],
    visits: [],
    reservationsFiltered: []
  };

  const ui = {
    loginScreen: document.getElementById("loginScreen"),
    dashboardScreen: document.getElementById("dashboardScreen"),
    loginForm: document.getElementById("adminLoginForm"),
    username: document.getElementById("adminUsername"),
    password: document.getElementById("adminPassword"),
    authFeedback: document.getElementById("authFeedback"),
    refreshButton: document.getElementById("refreshData"),
    logoutButton: document.getElementById("logoutAdmin"),
    exportButton: document.getElementById("exportCsv"),
    searchInput: document.getElementById("reservationSearch"),
    dataSourceBanner: document.getElementById("dataSourceBanner"),
    totalVisits: document.getElementById("totalVisits"),
    uniqueVisitors: document.getElementById("uniqueVisitors"),
    todayVisits: document.getElementById("todayVisits"),
    totalReservations: document.getElementById("totalReservations"),
    visitFeed: document.getElementById("visitFeed"),
    reservationRows: document.getElementById("reservationRows")
  };

  function readLocalArray(storageKey) {
    try {
      const raw = localStorage.getItem(storageKey) || "[]";
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  }

  function setAuthMessage(message, type) {
    if (!ui.authFeedback) return;
    ui.authFeedback.textContent = message || "";
    ui.authFeedback.style.color = type === "success" ? "#9fe6ae" : "#f48e7f";
  }

  function setButtonsDisabled(disabled) {
    if (ui.refreshButton) ui.refreshButton.disabled = disabled;
    if (ui.exportButton) ui.exportButton.disabled = disabled;
  }

  function formatDate(value) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) {
      return "-";
    }
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function toDateKey(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function sortByDateDesc(items, ...keys) {
    return [...items].sort((a, b) => {
      const aValue = keys.map((key) => a?.[key]).find(Boolean);
      const bValue = keys.map((key) => b?.[key]).find(Boolean);
      return new Date(bValue || 0) - new Date(aValue || 0);
    });
  }

  function createSupabaseClient() {
    if (!config.supabaseUrl || !config.supabaseAnonKey || !window.supabase?.createClient) {
      return null;
    }
    return window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  async function fetchSupabase(endpoint, options) {
    const supabaseUrl = config.supabaseUrl;
    const supabaseAnonKey = config.supabaseAnonKey;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Configuration Supabase manquante.");
    }

    const requestOptions = options || {};
    const response = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
      method: requestOptions.method || "GET",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: requestOptions.body ? JSON.stringify(requestOptions.body) : undefined
    });

    if (!response.ok) {
      const reason = await response.text();
      throw new Error(reason || "Erreur Supabase");
    }

    return response.json();
  }

  async function loadReservations() {
    const table = config.reservationsTable || "reservations";

    const client = createSupabaseClient();
    if (client) {
      const { data, error } = await client.from(table).select("*");
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    }

    return fetchSupabase(`${table}?select=*&order=created_at.desc`);
  }

  async function loadVisits() {
    const table = config.visitsTable || "site_visits";

    const client = createSupabaseClient();
    if (client) {
      const { data, error } = await client.from(table).select("*");
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    }

    return fetchSupabase(`${table}?select=*&order=created_at.desc`);
  }

  function updateStats() {
    const visits = state.visits;
    const reservations = state.reservations;

    const uniqueVisitorCount = new Set(
      visits
        .map((item) => String(item.visitor_key || "").trim())
        .filter(Boolean)
    ).size;

    const today = toDateKey(new Date().toISOString());
    const todayCount = visits.filter((item) => toDateKey(item.created_at) === today).length;

    ui.totalVisits.textContent = String(visits.length);
    ui.uniqueVisitors.textContent = String(uniqueVisitorCount);
    ui.todayVisits.textContent = String(todayCount);
    ui.totalReservations.textContent = String(reservations.length);
  }

  function renderVisitFeed() {
    const visits = [...state.visits]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 18);

    if (!visits.length) {
      ui.visitFeed.innerHTML = '<li><span class="visit-meta">Aucune visite enregistree.</span></li>';
      return;
    }

    ui.visitFeed.innerHTML = "";
    visits.forEach((visit) => {
      const item = document.createElement("li");
      const page = String(visit.page_path || "page inconnue");
      const title = String(visit.page_title || "Sans titre");
      const when = formatDate(visit.created_at);
      const visitorShort = String(visit.visitor_key || "-").slice(0, 10);
      item.innerHTML = `
        <strong class="visit-title">${escapeHtml(title)}</strong>
        <span class="visit-meta">Page: ${escapeHtml(page)}</span><br>
        <span class="visit-meta">Date: ${escapeHtml(when)} | Visiteur: ${escapeHtml(visitorShort)}</span>
      `;
      ui.visitFeed.appendChild(item);
    });
  }

  function renderReservationsRows() {
    const rows = state.reservationsFiltered;
    ui.reservationRows.innerHTML = "";

    if (!rows.length) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = '<td class="empty-cell" colspan="8">Aucune inscription trouvee.</td>';
      ui.reservationRows.appendChild(emptyRow);
      return;
    }

    rows.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = [
        item.nom,
        item.prenom,
        item.sexe_label || item.sexe,
        item.email,
        item.phone,
        item.address || "-",
        formatDate(item.created_at || item.reserved_at),
        item.language || "fr"
      ]
        .map((value) => `<td>${escapeHtml(String(value || "-"))}</td>`)
        .join("");
      ui.reservationRows.appendChild(row);
    });
  }

  function applyReservationFilter() {
    const query = String(ui.searchInput.value || "").trim().toLowerCase();
    if (!query) {
      state.reservationsFiltered = [...state.reservations];
      renderReservationsRows();
      return;
    }

    state.reservationsFiltered = state.reservations.filter((item) => {
      const parts = [
        item.nom,
        item.prenom,
        item.email,
        item.phone,
        item.address,
        item.sexe_label,
        item.sexe
      ]
        .map((value) => String(value || "").toLowerCase());
      return parts.some((part) => part.includes(query));
    });

    renderReservationsRows();
  }

  function renderDataSource(source, reason) {
    if (source === "supabase") {
      ui.dataSourceBanner.textContent = "Source: Supabase (donnees globales du site).";
      return;
    }

    if (source === "partial") {
      const reasonText = reason ? ` Details: ${String(reason).slice(0, 220)}` : "";
      ui.dataSourceBanner.textContent = `Source mixte: certaines donnees viennent de Supabase, d'autres du fallback local.${reasonText}`;
      return;
    }

    const reasonText = reason ? ` Erreur: ${String(reason).slice(0, 180)}` : "";
    ui.dataSourceBanner.textContent = `Source: locale (fallback). Verifiez la connexion Supabase pour voir toutes les donnees.${reasonText}`;
  }

  async function loadDashboard() {
    setButtonsDisabled(true);

    const issues = [];
    let reservations = [];
    let visits = [];

    try {
      reservations = await loadReservations();
    } catch (error) {
      issues.push(`reservations: ${error?.message || error}`);
      reservations = readLocalArray(RESERVATION_LOCAL_KEY);
    }

    try {
      visits = await loadVisits();
    } catch (error) {
      issues.push(`visites: ${error?.message || error}`);
      visits = readLocalArray(VISITS_LOCAL_KEY);
    }

    state.reservations = sortByDateDesc(Array.isArray(reservations) ? reservations : [], "created_at", "reserved_at");
    state.visits = sortByDateDesc(Array.isArray(visits) ? visits : [], "created_at");

    if (!issues.length) {
      renderDataSource("supabase");
    } else if (issues.length === 2) {
      renderDataSource("local", issues.join(" | "));
    } else {
      renderDataSource("partial", issues.join(" | "));
    }

    state.reservationsFiltered = [...state.reservations];
    updateStats();
    renderVisitFeed();
    renderReservationsRows();
    setButtonsDisabled(false);
  }

  function exportCsv() {
    if (!state.reservationsFiltered.length) {
      return;
    }

    const header = ["Nom", "Prenom", "Sexe", "Email", "Telephone", "Adresse", "Date", "Langue"];
    const lines = state.reservationsFiltered.map((item) => [
      item.nom,
      item.prenom,
      item.sexe_label || item.sexe,
      item.email,
      item.phone,
      item.address || "",
      formatDate(item.created_at || item.reserved_at),
      item.language || "fr"
    ]);

    const csvBody = [header, ...lines]
      .map((line) => line.map((value) => `"${String(value || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvBody], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "abir-inscriptions.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function showDashboard() {
    ui.loginScreen.classList.add("hidden");
    ui.dashboardScreen.classList.remove("hidden");
    loadDashboard();
  }

  function logout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    ui.dashboardScreen.classList.add("hidden");
    ui.loginScreen.classList.remove("hidden");
    ui.password.value = "";
    setAuthMessage("", "error");
  }

  function handleLogin(event) {
    event.preventDefault();

    const username = String(ui.username.value || "").trim();
    const password = String(ui.password.value || "");

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      setAuthMessage("Identifiants incorrects.", "error");
      return;
    }

    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
      user: ADMIN_USERNAME,
      loggedAt: new Date().toISOString()
    }));

    setAuthMessage("Connexion reussie.", "success");
    showDashboard();
  }

  function bindEvents() {
    ui.loginForm.addEventListener("submit", handleLogin);
    ui.logoutButton.addEventListener("click", logout);
    ui.refreshButton.addEventListener("click", loadDashboard);
    ui.exportButton.addEventListener("click", exportCsv);
    ui.searchInput.addEventListener("input", applyReservationFilter);
  }

  function initialize() {
    bindEvents();

    const session = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (session) {
      showDashboard();
      return;
    }

    ui.loginScreen.classList.remove("hidden");
    ui.dashboardScreen.classList.add("hidden");
  }

  initialize();
})();
