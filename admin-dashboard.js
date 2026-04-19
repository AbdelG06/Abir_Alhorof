(function () {
  const ADMIN_USERNAME = "Abir_alhorof";
  const ADMIN_PASSWORD = "abiralhorof2026";

  const ADMIN_SESSION_KEY = "abir-admin-session";
  const RESERVATION_LOCAL_KEY = "abir-al-horof-reservations";
  const VISITS_LOCAL_KEY = "abir-al-horof-local-visits";
  const PRESENCE_OVERRIDES_KEY = "abir-admin-presence-overrides";
  const JOIN_MESSAGES_LOCAL_KEY = "abir-join-form-messages";

  const config = window.ABIR_ADMIN_CONFIG || {};
  const view = document.body.dataset.adminView || "dashboard";

  const state = {
    reservations: [],
    filteredReservations: [],
    visits: [],
    formMessages: []
  };

  const ui = {
    loginScreen: document.getElementById("adminLoginScreen"),
    appScreen: document.getElementById("adminAppScreen"),
    loginForm: document.getElementById("adminLoginForm"),
    username: document.getElementById("adminUsername"),
    password: document.getElementById("adminPassword"),
    togglePassword: document.getElementById("togglePassword"),
    authFeedback: document.getElementById("authFeedback"),

    refreshButton: document.getElementById("refreshData"),
    exportButton: document.getElementById("exportCsv"),
    logoutButton: document.getElementById("logoutAdmin"),

    searchInput: document.getElementById("reservationSearch"),
    filterFrom: document.getElementById("filterFrom"),
    filterTo: document.getElementById("filterTo"),
    resetFilters: document.getElementById("resetFilters"),

    dataSourceBanner: document.getElementById("dataSourceBanner"),
    lastSync: document.getElementById("lastSync"),

    statTotalReservations: document.getElementById("statTotalReservations"),
    statPresent: document.getElementById("statPresent"),
    statAbsent: document.getElementById("statAbsent"),
    statUnknown: document.getElementById("statUnknown"),
    statPresenceRate: document.getElementById("statPresenceRate"),
    statTodayReservations: document.getElementById("statTodayReservations"),
    statTotalVisits: document.getElementById("statTotalVisits"),
    statUniqueVisitors: document.getElementById("statUniqueVisitors"),
    statFiltered: document.getElementById("statFiltered"),

    recentRegistrations: document.getElementById("recentRegistrations"),
    topPages: document.getElementById("topPages"),
    languageBreakdown: document.getElementById("languageBreakdown"),
    genderBreakdown: document.getElementById("genderBreakdown"),
    formspreeMessages: document.getElementById("formspreeMessages"),
    formspreeMessagesStatus: document.getElementById("formspreeMessagesStatus"),

    reservationRows: document.getElementById("reservationRows"),
    toast: document.getElementById("adminToast")
  };

  let toastTimer = 0;

  function readLocalArray(storageKey) {
    try {
      const raw = localStorage.getItem(storageKey) || "[]";
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function readLocalObject(storageKey) {
    try {
      const raw = localStorage.getItem(storageKey) || "{}";
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function writeLocalObject(storageKey, value) {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }

  function setAuthMessage(message, type) {
    if (!ui.authFeedback) return;
    ui.authFeedback.textContent = message || "";
    ui.authFeedback.style.color = type === "success" ? "#9fe6ae" : "#f48e7f";
  }

  function showToast(message, variant = "info") {
    if (!ui.toast) return;
    ui.toast.hidden = false;
    ui.toast.dataset.variant = variant;
    ui.toast.textContent = message;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      ui.toast.hidden = true;
    }, 3200);
  }

  function setButtonsDisabled(disabled) {
    [ui.refreshButton, ui.exportButton].forEach((button) => {
      if (button) button.disabled = disabled;
    });
  }

  function parseDate(value) {
    if (!value) return null;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;

    const slash = String(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (!slash) return null;
    const date = new Date(Number(slash[3]), Number(slash[2]) - 1, Number(slash[1]));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function toDateKey(value) {
    const date = parseDate(value);
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function formatDate(value) {
    const date = parseDate(value);
    if (!date) return "-";
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getParticipantKey(item, fallback = "") {
    return String(item.id || `${item.email || ""}|${item.phone || ""}|${fallback}`);
  }

  function normalizePresence(value) {
    const normalized = String(value || "").toLowerCase();
    if (normalized === "present") return "present";
    if (normalized === "absent") return "absent";
    return "unknown";
  }

  function genderDisplayLabel(value) {
    const normalized = String(value || "").toLowerCase();
    if (normalized.includes("female") || normalized.includes("femme") || normalized.includes("انث") || normalized.includes("امر")) {
      return "v";
    }
    if (normalized.includes("male") || normalized.includes("homme") || normalized.includes("رجل") || normalized.includes("ذكر")) {
      return "رجل";
    }
    return "Inconnu";
  }

  function extractMessageText(submission) {
    if (!submission) return "";
    if (typeof submission.message === "string" && submission.message.trim()) {
      return submission.message.trim();
    }
    if (submission.data && typeof submission.data === "object") {
      const candidate = submission.data.message || submission.data.Message || submission.data.msg;
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }
    return "";
  }

  function normalizePhone(raw) {
    const digits = String(raw || "").replace(/[^\d+]/g, "").replace(/^\+/, "");
    if (!digits) return "";
    if (digits.startsWith("212")) return digits;
    if (digits.startsWith("0") && digits.length >= 9) return `212${digits.slice(1)}`;
    return digits;
  }

  function reservationDate(item) {
    return item.created_at || item.reserved_at || item.reservedAt;
  }

  function createSupabaseClient() {
    if (!config.supabaseUrl || !config.supabaseAnonKey || !window.supabase?.createClient) {
      return null;
    }
    return window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  function mergePresenceOverrides(reservations) {
    const overrides = readLocalObject(PRESENCE_OVERRIDES_KEY);
    return reservations.map((item, index) => {
      const key = getParticipantKey(item, index);
      const override = overrides[key];
      const presence = normalizePresence(override?.presence_status || item.presence_status);
      return {
        ...item,
        __key: key,
        presence_status: presence,
        presence_checked_at: override?.presence_checked_at || item.presence_checked_at || null
      };
    });
  }

  function savePresenceOverride(item, presenceStatus) {
    const overrides = readLocalObject(PRESENCE_OVERRIDES_KEY);
    overrides[item.__key] = {
      presence_status: presenceStatus,
      presence_checked_at: new Date().toISOString()
    };
    writeLocalObject(PRESENCE_OVERRIDES_KEY, overrides);
  }

  async function loadReservations() {
    const table = config.reservationsTable || "reservations";
    const client = createSupabaseClient();
    if (client) {
      const { data, error } = await client.from(table).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    }

    return readLocalArray(RESERVATION_LOCAL_KEY);
  }

  async function loadVisits() {
    const table = config.visitsTable || "site_visits";
    const client = createSupabaseClient();
    if (client) {
      const { data, error } = await client.from(table).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    }

    return readLocalArray(VISITS_LOCAL_KEY);
  }

  async function loadFormspreeMessages() {
    const localMessages = readLocalArray(JOIN_MESSAGES_LOCAL_KEY)
      .map((message, index) => ({
        name: message.name || "",
        email: message.email || "",
        message: message.message || "",
        createdAt: message.createdAt || message.created_at || null,
        source: message.source || "local",
        _idx: index
      }))
      .filter((message) => message.message || message.email || message.name);

    const table = config.joinMessagesTable || "join_messages";
    const client = createSupabaseClient();
    if (!client) {
      return { mode: "local", messages: localMessages, detail: "Supabase indisponible, affichage local." };
    }

    try {
      const { data, error } = await client.from(table).select("*").order("created_at", { ascending: false });
      if (error) throw error;

      const remoteMessages = (Array.isArray(data) ? data : [])
        .map((entry) => ({
          name: entry.name || "",
          email: entry.email || "",
          message: entry.message || "",
          createdAt: entry.created_at || entry.createdAt || null,
          source: entry.source || "supabase"
        }))
        .filter((entry) => entry.message || entry.email || entry.name);

      if (remoteMessages.length) {
        return { mode: "supabase", messages: remoteMessages, detail: "" };
      }

      if (localMessages.length) {
        return { mode: "mixed", messages: localMessages, detail: "Aucun message distant pour l'instant." };
      }

      return { mode: "supabase", messages: [], detail: "" };
    } catch (error) {
      return {
        mode: "mixed",
        messages: localMessages,
        detail: error?.message || String(error)
      };
    }
  }

  function setDataSourceBanner(mode, detail) {
    if (!ui.dataSourceBanner) return;
    if (mode === "supabase") {
      ui.dataSourceBanner.textContent = "Source: Supabase (donnees en ligne).";
      return;
    }
    if (mode === "mixed") {
      ui.dataSourceBanner.textContent = `Source mixte: certaines donnees viennent du fallback local. ${detail || ""}`.trim();
      return;
    }
    ui.dataSourceBanner.textContent = `Source locale (fallback). ${detail || ""}`.trim();
  }

  function setLastSync() {
    if (!ui.lastSync) return;
    ui.lastSync.textContent = `Derniere synchro: ${formatDate(new Date())}`;
  }

  function computeStats() {
    const reservations = state.reservations;
    const filtered = state.filteredReservations;
    const visits = state.visits;

    const presentCount = reservations.filter((row) => row.presence_status === "present").length;
    const absentCount = reservations.filter((row) => row.presence_status === "absent").length;
    const unknownCount = reservations.length - presentCount - absentCount;
    const marked = presentCount + absentCount;
    const rate = marked > 0 ? Math.round((presentCount / marked) * 100) : 0;

    const today = toDateKey(new Date().toISOString());
    const todayReservations = reservations.filter((row) => toDateKey(reservationDate(row)) === today).length;
    const uniqueVisitors = new Set(
      visits.map((visit) => String(visit.visitor_key || "").trim()).filter(Boolean)
    ).size;

    if (ui.statTotalReservations) ui.statTotalReservations.textContent = String(reservations.length);
    if (ui.statPresent) ui.statPresent.textContent = String(presentCount);
    if (ui.statAbsent) ui.statAbsent.textContent = String(absentCount);
    if (ui.statUnknown) ui.statUnknown.textContent = String(unknownCount);
    if (ui.statPresenceRate) ui.statPresenceRate.textContent = `${rate}%`;
    if (ui.statTodayReservations) ui.statTodayReservations.textContent = String(todayReservations);
    if (ui.statTotalVisits) ui.statTotalVisits.textContent = String(visits.length);
    if (ui.statUniqueVisitors) ui.statUniqueVisitors.textContent = String(uniqueVisitors);
    if (ui.statFiltered) ui.statFiltered.textContent = String(filtered.length);
  }

  function renderList(container, items, emptyText) {
    if (!container) return;
    container.innerHTML = "";
    if (!items.length) {
      const li = document.createElement("li");
      li.className = "list-empty";
      li.textContent = emptyText;
      container.appendChild(li);
      return;
    }

    items.forEach((html) => {
      const li = document.createElement("li");
      li.innerHTML = html;
      container.appendChild(li);
    });
  }

  function renderDashboardPanels() {
    if (view !== "dashboard") return;

    const langCount = state.reservations.reduce((acc, row) => {
      const key = String(row.language || "fr").toUpperCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const genderCount = state.reservations.reduce((acc, row) => {
      const key = genderDisplayLabel(row.sexe_label || row.sexe || "Inconnu");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const pagesCount = state.visits.reduce((acc, row) => {
      const key = String(row.page_path || "page inconnue");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const recentRegistrations = [...state.reservations]
      .sort((a, b) => (parseDate(reservationDate(b))?.getTime() || 0) - (parseDate(reservationDate(a))?.getTime() || 0))
      .slice(0, 8)
      .map((row) => `<strong>${escapeHtml(`${row.nom || ""} ${row.prenom || ""}`.trim() || "Participant")}</strong><span>${escapeHtml(formatDate(reservationDate(row)))}</span>`);

    const topPages = Object.entries(pagesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([path, count]) => `<strong>${escapeHtml(path)}</strong><span>${count}</span>`);

    const langs = Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => `<strong>${escapeHtml(key)}</strong><span>${count}</span>`);

    const genders = Object.entries(genderCount)
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => `<strong>${escapeHtml(key)}</strong><span>${count}</span>`);

    renderList(ui.recentRegistrations, recentRegistrations, "Aucun inscrit.");
    renderList(ui.topPages, topPages, "Aucune visite.");
    renderList(ui.languageBreakdown, langs, "Aucune langue disponible.");
    renderList(ui.genderBreakdown, genders, "Aucune donnee sexe.");
  }

  function renderFormspreeMessages() {
    if (view !== "dashboard") return;
    if (!ui.formspreeMessages) return;

    const items = [...state.formMessages]
      .sort((a, b) => (parseDate(b.createdAt)?.getTime() || 0) - (parseDate(a.createdAt)?.getTime() || 0))
      .slice(0, 20)
      .map((entry) => {
        const identity = `${entry.name || "Anonyme"}${entry.email ? ` - ${entry.email}` : ""}`;
        const text = (entry.message || "").replace(/\s+/g, " ").trim();
        const preview = text.length > 180 ? `${text.slice(0, 177)}...` : text;
        return `<strong>${escapeHtml(identity)}</strong><span>${escapeHtml(formatDate(entry.createdAt) || "-")}</span><span>${escapeHtml(preview || "Message vide")}</span>`;
      });

    renderList(ui.formspreeMessages, items, "Aucun message trouve.");

    if (!ui.formspreeMessagesStatus) return;
    if (!state.formMessages.length) {
      ui.formspreeMessagesStatus.textContent = "Aucun message disponible.";
      return;
    }

    ui.formspreeMessagesStatus.textContent = `${state.formMessages.length} message(s) charge(s).`;
  }

  function applyFilters() {
    const query = String(ui.searchInput?.value || "").trim().toLowerCase();
    const from = ui.filterFrom?.value || "";
    const to = ui.filterTo?.value || "";

    state.filteredReservations = state.reservations.filter((row) => {
      const rowDate = parseDate(reservationDate(row));
      if (from) {
        const fromDate = new Date(`${from}T00:00:00`);
        if (rowDate && rowDate < fromDate) return false;
      }
      if (to) {
        const toDate = new Date(`${to}T23:59:59`);
        if (rowDate && rowDate > toDate) return false;
      }

      if (!query) return true;

      const stack = [
        row.nom,
        row.prenom,
        row.phone,
        row.email,
        row.address,
        row.sexe,
        row.sexe_label,
        row.language,
        row.presence_status
      ].map((value) => String(value || "").toLowerCase());

      return stack.some((value) => value.includes(query));
    });
  }

  function renderPresenceBadge(status) {
    const normalized = normalizePresence(status);
    if (normalized === "present") {
      return '<span class="presence-badge presence-present">Present</span>';
    }
    if (normalized === "absent") {
      return '<span class="presence-badge presence-absent">Absent</span>';
    }
    return '<span class="presence-badge presence-unknown">En attente</span>';
  }

  function renderRows() {
    if (!ui.reservationRows) return;
    const rows = state.filteredReservations;
    ui.reservationRows.innerHTML = "";

    if (!rows.length) {
      const tr = document.createElement("tr");
      tr.innerHTML = '<td class="empty-cell" colspan="8">Aucune inscription trouvee.</td>';
      ui.reservationRows.appendChild(tr);
      return;
    }

    rows.forEach((row) => {
      const tr = document.createElement("tr");

      const presenceCell = `
        <div class="presence-stack">
          ${renderPresenceBadge(row.presence_status)}
          <div class="presence-buttons">
            <button class="mini-btn ${row.presence_status === "present" ? "active" : ""}" data-action="present" data-key="${escapeHtml(row.__key)}" type="button">Present</button>
            <button class="mini-btn ${row.presence_status === "absent" ? "active" : ""}" data-action="absent" data-key="${escapeHtml(row.__key)}" type="button">Absent</button>
          </div>
        </div>
      `;

      tr.innerHTML = `
        <td data-label="Nom">${escapeHtml(row.nom || "-")}</td>
        <td data-label="Prenom">${escapeHtml(row.prenom || "-")}</td>
        <td data-label="Telephone">${escapeHtml(row.phone || "-")}</td>
        <td data-label="Email">${escapeHtml(row.email || "-")}</td>
        <td data-label="Date inscription">${escapeHtml(formatDate(reservationDate(row)))}</td>
        <td data-label="Presence">${presenceCell}</td>
        <td data-label="WhatsApp"><button class="mini-btn contact-btn" data-action="whatsapp" data-key="${escapeHtml(row.__key)}" type="button">Contacter</button></td>
        <td data-label="PDF"><button class="mini-btn" data-action="pdf" data-key="${escapeHtml(row.__key)}" type="button">Telecharger</button></td>
      `;

      ui.reservationRows.appendChild(tr);
    });
  }

  function participantByKey(key) {
    return state.reservations.find((row) => row.__key === key) || null;
  }

  function generateParticipantPdf(row) {
    if (!window.jspdf?.jsPDF) {
      showToast("Librairie PDF indisponible.", "error");
      return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    pdf.setFillColor(248, 239, 227);
    pdf.rect(0, 0, 210, 297, "F");

    pdf.setTextColor(45, 26, 13);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("Abir Al Horof", 16, 24);

    pdf.setFontSize(12);
    pdf.text("Fiche inscription participant", 16, 32);
    pdf.setLineWidth(0.5);
    pdf.line(16, 36, 194, 36);

    const fields = [
      ["Nom", row.nom],
      ["Prenom", row.prenom],
      ["Email", row.email],
      ["Telephone", row.phone],
      ["Presence", row.presence_status],
      ["Date inscription", formatDate(reservationDate(row))],
      ["Adresse", row.address || "-"]
    ];

    let y = 48;
    fields.forEach(([label, value]) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(`${label}:`, 18, y);
      pdf.setFont("helvetica", "normal");
      const lines = pdf.splitTextToSize(String(value || "-"), 120);
      pdf.text(lines, 64, y);
      y += Math.max(8, lines.length * 6);
    });

    pdf.setFontSize(9);
    pdf.text(`Genere le ${formatDate(new Date())}`, 16, 286);

    const filename = `inscrit-${String(row.nom || "").trim()}-${String(row.prenom || "").trim()}`.replace(/\s+/g, "-").toLowerCase();
    pdf.save(`${filename || "participant"}.pdf`);
    showToast("PDF telecharge.", "success");
  }

  function contactViaWhatsapp(row) {
    const destination = normalizePhone(row.phone) || config.whatsappFallbackNumber || "";
    if (!destination) {
      showToast("Aucun numero WhatsApp disponible.", "error");
      return;
    }
    const text = `Bonjour ${row.prenom || ""} ${row.nom || ""}, nous vous contactons depuis Abir Al Horof concernant votre inscription.`;
    window.open(`https://wa.me/${destination}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  async function updatePresenceRemote(row, status) {
    const client = createSupabaseClient();
    const table = config.reservationsTable || "reservations";
    if (!client || !row.id) {
      return { ok: false, reason: "fallback" };
    }

    const payload = {
      presence_status: status,
      presence_checked_at: new Date().toISOString()
    };

    const { error } = await client.from(table).update(payload).eq("id", row.id);
    if (error) {
      return { ok: false, reason: error.message || "update_failed" };
    }
    return { ok: true };
  }

  async function handlePresence(row, status) {
    row.presence_status = status;
    row.presence_checked_at = new Date().toISOString();
    savePresenceOverride(row, status);

    applyFilters();
    renderRows();
    computeStats();

    const updateResult = await updatePresenceRemote(row, status);
    if (!updateResult.ok && updateResult.reason !== "fallback") {
      showToast("Presence enregistree localement. Verifiez la policy UPDATE/colonnes Supabase.", "error");
      return;
    }

    showToast(`Presence mise a jour: ${status === "present" ? "Present" : "Absent"}.`, "success");
  }

  async function handleRowsClick(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const row = participantByKey(button.dataset.key);
    if (!row) {
      showToast("Participant introuvable.", "error");
      return;
    }

    if (button.dataset.action === "pdf") {
      generateParticipantPdf(row);
      return;
    }
    if (button.dataset.action === "whatsapp") {
      contactViaWhatsapp(row);
      return;
    }
    if (button.dataset.action === "present") {
      await handlePresence(row, "present");
      return;
    }
    if (button.dataset.action === "absent") {
      await handlePresence(row, "absent");
    }
  }

  function exportCsv() {
    const rows = state.filteredReservations;
    if (!rows.length) {
      showToast("Aucune ligne a exporter.", "error");
      return;
    }

    const header = ["Nom", "Prenom", "Telephone", "Email", "Date inscription", "Presence", "Langue"];
    const lines = rows.map((row) => [
      row.nom,
      row.prenom,
      row.phone,
      row.email,
      formatDate(reservationDate(row)),
      row.presence_status,
      row.language || "fr"
    ]);

    const csv = [header, ...lines]
      .map((line) => line.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inscriptions-soiree.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("CSV exporte.", "success");
  }

  async function loadData() {
    setButtonsDisabled(true);

    let reservations = [];
    let visits = [];
    let messagesResult = { mode: "local", messages: [], detail: "" };
    const issues = [];

    try {
      reservations = await loadReservations();
    } catch (error) {
      issues.push(`inscriptions: ${error?.message || error}`);
      reservations = readLocalArray(RESERVATION_LOCAL_KEY);
    }

    try {
      visits = await loadVisits();
    } catch (error) {
      issues.push(`visites: ${error?.message || error}`);
      visits = readLocalArray(VISITS_LOCAL_KEY);
    }

    messagesResult = await loadFormspreeMessages();

    const merged = mergePresenceOverrides(Array.isArray(reservations) ? reservations : []);
    state.reservations = merged.sort((a, b) => (parseDate(reservationDate(b))?.getTime() || 0) - (parseDate(reservationDate(a))?.getTime() || 0));
    state.visits = Array.isArray(visits) ? visits : [];
    state.formMessages = Array.isArray(messagesResult.messages) ? messagesResult.messages : [];

    if (!issues.length) {
      setDataSourceBanner("supabase");
    } else if (issues.length === 2) {
      setDataSourceBanner("local", issues.join(" | "));
    } else {
      setDataSourceBanner("mixed", issues.join(" | "));
    }

    applyFilters();
    computeStats();
    renderDashboardPanels();
    renderFormspreeMessages();
    renderRows();
    setLastSync();

    if (ui.formspreeMessagesStatus && view === "dashboard") {
      if (messagesResult.mode === "supabase") {
        ui.formspreeMessagesStatus.textContent = `Messages charges depuis Supabase (${state.formMessages.length}).`;
      } else if (messagesResult.mode === "mixed") {
        ui.formspreeMessagesStatus.textContent = `Fallback local active. ${messagesResult.detail || ""}`.trim();
      } else {
        ui.formspreeMessagesStatus.textContent = messagesResult.detail || (state.formMessages.length ? "Messages locaux charges." : "Aucun message local disponible.");
      }
    }

    setButtonsDisabled(false);
  }

  function showApp() {
    ui.loginScreen?.classList.add("hidden");
    ui.appScreen?.classList.remove("hidden");
    loadData();
  }

  function showLogin() {
    ui.appScreen?.classList.add("hidden");
    ui.loginScreen?.classList.remove("hidden");
  }

  function logout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    if (ui.password) ui.password.value = "";
    if (ui.password) ui.password.type = "password";
    if (ui.togglePassword) ui.togglePassword.textContent = "Afficher";
    setAuthMessage("", "error");
    showLogin();
  }

  function handleLogin(event) {
    event.preventDefault();
    const username = String(ui.username?.value || "").trim();
    const password = String(ui.password?.value || "");

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      setAuthMessage("Identifiants incorrects.", "error");
      return;
    }

    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
      user: ADMIN_USERNAME,
      loggedAt: new Date().toISOString()
    }));

    setAuthMessage("Connexion reussie.", "success");
    showApp();
  }

  function bindEvents() {
    ui.loginForm?.addEventListener("submit", handleLogin);
    ui.logoutButton?.addEventListener("click", logout);
    ui.refreshButton?.addEventListener("click", loadData);
    ui.exportButton?.addEventListener("click", exportCsv);

    ui.searchInput?.addEventListener("input", () => {
      applyFilters();
      renderRows();
      computeStats();
    });

    ui.filterFrom?.addEventListener("change", () => {
      applyFilters();
      renderRows();
      computeStats();
    });

    ui.filterTo?.addEventListener("change", () => {
      applyFilters();
      renderRows();
      computeStats();
    });

    ui.resetFilters?.addEventListener("click", () => {
      if (ui.searchInput) ui.searchInput.value = "";
      if (ui.filterFrom) ui.filterFrom.value = "";
      if (ui.filterTo) ui.filterTo.value = "";
      applyFilters();
      renderRows();
      computeStats();
    });

    ui.reservationRows?.addEventListener("click", (event) => {
      handleRowsClick(event);
    });

    ui.togglePassword?.addEventListener("click", () => {
      if (!ui.password) return;
      const hidden = ui.password.type === "password";
      ui.password.type = hidden ? "text" : "password";
      ui.togglePassword.textContent = hidden ? "Masquer" : "Afficher";
    });
  }

  function initialize() {
    bindEvents();
    const session = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (session) {
      showApp();
      return;
    }
    showLogin();
  }

  initialize();
})();
