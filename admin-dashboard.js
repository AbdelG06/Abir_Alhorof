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
  const INSCRIPTIONS_COLUMN_COUNT = 13;

  const state = {
    reservations: [],
    filteredReservations: [],
    visits: [],
    formMessages: [],
    calendarMonthKey: "",
    selectedCalendarDateKey: "",
    dashboardPeriodDays: 7,
    inscriptionMessageRecipient: null
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
    toggleAddUserForm: document.getElementById("toggleAddUserForm"),
    addUserPanel: document.getElementById("addUserPanel"),
    addUserForm: document.getElementById("addUserForm"),
    cancelAddUser: document.getElementById("cancelAddUser"),
    addUserFeedback: document.getElementById("addUserFeedback"),
    resetFilters: document.getElementById("resetFilters"),
    sendInscriptionTemplateWhatsapp: document.getElementById("sendInscriptionTemplateWhatsapp"),

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
    dashboardPeriodButtons: document.getElementById("dashboardPeriodButtons"),
    dashboardInsights: document.getElementById("dashboardInsights"),
    insightsWindowLabel: document.getElementById("insightsWindowLabel"),
    activityTimeline: document.getElementById("activityTimeline"),
    activityWindowLabel: document.getElementById("activityWindowLabel"),
    statsCalendar: document.getElementById("statsCalendar"),
    calendarMonthPicker: document.getElementById("calendarMonthPicker"),
    calendarPrev: document.getElementById("calendarPrev"),
    calendarNext: document.getElementById("calendarNext"),
    calendarSelectionInfo: document.getElementById("calendarSelectionInfo"),

    whatsappMessageModal: document.getElementById("whatsappMessageModal"),
    whatsappMessageRecipient: document.getElementById("whatsappMessageRecipient"),
    whatsappMessageText: document.getElementById("whatsappMessageText"),
    sendWhatsAppMessage: document.getElementById("sendWhatsAppMessage"),
    closeWhatsAppMessage: document.getElementById("closeWhatsAppMessage"),
    cancelWhatsAppMessage: document.getElementById("cancelWhatsAppMessage"),

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
    [ui.refreshButton, ui.exportButton, ui.toggleAddUserForm, ui.sendInscriptionTemplateWhatsapp].forEach((button) => {
      if (button) button.disabled = disabled;
    });

    const submitAddUser = ui.addUserForm?.querySelector('button[type="submit"]');
    if (submitAddUser) {
      submitAddUser.disabled = disabled;
    }
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
      return "Femme";
    }
    if (normalized.includes("male") || normalized.includes("homme") || normalized.includes("رجل") || normalized.includes("ذكر")) {
      return "Homme";
    }
    return "Inconnu";
  }

  function participantGenderLabel(row) {
    const rawGender = row.sexe_label || row.sexeLabel || row.sexe || "";
    const normalized = String(rawGender).trim().toLowerCase();
    if (normalized === "female") return "Femme";
    if (normalized === "male") return "Homme";
    return String(rawGender || "-");
  }

  function participantDateLabel(row) {
    if (row.reserved_at) return String(row.reserved_at);
    if (row.reservedAt) return String(row.reservedAt);
    if (row.created_at) return String(row.created_at);
    return "-";
  }

  function normalizePdfSex(value) {
    const normalized = String(value || "").toLowerCase();
    if (normalized.includes("female") || normalized.includes("femme") || normalized.includes("انث") || normalized.includes("امر")) {
      return "female";
    }
    if (normalized.includes("male") || normalized.includes("homme") || normalized.includes("رجل") || normalized.includes("ذكر")) {
      return "male";
    }
    return "";
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

  function sanitizePhoneInput(raw) {
    return String(raw || "").replace(/[^\d+]/g, "");
  }

  function normalizeIdentityPhone(raw) {
    return String(raw || "").replace(/\D/g, "");
  }

  function normalizeIdentityEmail(raw) {
    return String(raw || "").trim().toLowerCase();
  }

  function setAddUserFeedback(message = "", type = "info") {
    if (!ui.addUserFeedback) return;
    ui.addUserFeedback.dataset.state = type;
    ui.addUserFeedback.textContent = message;
  }

  function closeAddUserPanel({ reset = false } = {}) {
    if (!ui.addUserPanel) return;
    ui.addUserPanel.classList.add("hidden");
    if (ui.toggleAddUserForm) {
      ui.toggleAddUserForm.textContent = "Ajouter user";
    }
    if (reset) {
      ui.addUserForm?.reset();
      setAddUserFeedback("", "info");
    }
  }

  function openAddUserPanel() {
    if (!ui.addUserPanel) return;
    ui.addUserPanel.classList.remove("hidden");
    if (ui.toggleAddUserForm) {
      ui.toggleAddUserForm.textContent = "Fermer ajout";
    }
  }

  function toggleAddUserPanel() {
    if (!ui.addUserPanel) return;
    if (ui.addUserPanel.classList.contains("hidden")) {
      openAddUserPanel();
      return;
    }
    closeAddUserPanel({ reset: false });
  }

  function adminGenderLabel(value) {
    return String(value || "").toLowerCase() === "female" ? "Femme" : "Homme";
  }

  function readAddUserFormData() {
    if (!ui.addUserForm) return null;

    const formData = new FormData(ui.addUserForm);
    const phoneRaw = String(formData.get("phone") || "").trim();
    const sanitizedPhone = sanitizePhoneInput(phoneRaw);
    const sexe = String(formData.get("sexe") || "").trim().toLowerCase();

    return {
      nom: String(formData.get("nom") || "").trim(),
      prenom: String(formData.get("prenom") || "").trim(),
      sexe,
      sexeLabel: adminGenderLabel(sexe),
      email: normalizeIdentityEmail(formData.get("email")),
      phone: sanitizedPhone,
      address: String(formData.get("address") || "").trim(),
      reservedAt: new Date().toLocaleString("fr-FR"),
      eventName: "Journee Therapie et Lecture - Se reconnecter a soi au coeur de la nature",
      language: "fr"
    };
  }

  function isDuplicateReservation(candidate, row) {
    const candidateEmail = normalizeIdentityEmail(candidate.email);
    const candidatePhone = normalizeIdentityPhone(candidate.phone);
    const rowEmail = normalizeIdentityEmail(row.email);
    const rowPhone = normalizeIdentityPhone(row.phone);

    const sameEmail = candidateEmail && rowEmail && candidateEmail === rowEmail;
    const samePhone = candidatePhone && rowPhone && candidatePhone === rowPhone;
    return sameEmail || samePhone;
  }

  function isDuplicateInsertError(error) {
    const code = String(error?.code || "");
    const message = String(error?.message || "").toLowerCase();
    return code === "23505" || message.includes("duplicate key") || message.includes("unique constraint");
  }

  async function findExistingReservationRemote(client, table, data) {
    if (data.email) {
      const { data: emailRows, error: emailError } = await client
        .from(table)
        .select("*")
        .ilike("email", data.email)
        .limit(1);

      if (emailError) {
        throw emailError;
      }

      if (Array.isArray(emailRows) && emailRows.length) {
        return emailRows[0];
      }
    }

    if (data.phone) {
      const { data: phoneRows, error: phoneError } = await client
        .from(table)
        .select("*")
        .eq("phone", data.phone)
        .limit(1);

      if (phoneError) {
        throw phoneError;
      }

      if (Array.isArray(phoneRows) && phoneRows.length) {
        return phoneRows[0];
      }
    }

    return null;
  }

  async function insertReservationFromAdmin(data) {
    const client = createSupabaseClient();
    const table = config.reservationsTable || "reservations";

    const payload = {
      nom: data.nom,
      prenom: data.prenom,
      sexe: data.sexe,
      sexe_label: data.sexeLabel,
      email: data.email,
      phone: data.phone,
      address: data.address,
      reserved_at: data.reservedAt,
      event_name: data.eventName,
      language: data.language
    };

    if (client) {
      const existingRow = await findExistingReservationRemote(client, table, data);
      if (existingRow) {
        return { status: "existing", mode: "supabase", data: existingRow };
      }

      const { data: insertedRows, error: insertError } = await client
        .from(table)
        .insert(payload)
        .select("*")
        .limit(1);

      if (insertError) {
        if (isDuplicateInsertError(insertError)) {
          const duplicatedRow = await findExistingReservationRemote(client, table, data);
          if (duplicatedRow) {
            return { status: "existing", mode: "supabase", data: duplicatedRow };
          }
          return { status: "existing", mode: "supabase", data: payload };
        }
        throw insertError;
      }

      return {
        status: "created",
        mode: "supabase",
        data: insertedRows?.[0] || payload
      };
    }

    const localReservations = readLocalArray(RESERVATION_LOCAL_KEY);
    const existingLocal = localReservations.find((row) => isDuplicateReservation(data, row));
    if (existingLocal) {
      return { status: "existing", mode: "local", data: existingLocal };
    }

    const localEntry = {
      nom: data.nom,
      prenom: data.prenom,
      sexe: data.sexe,
      sexeLabel: data.sexeLabel,
      email: data.email,
      phone: data.phone,
      address: data.address,
      reservedAt: data.reservedAt,
      eventName: data.eventName,
      language: data.language,
      presence_status: "unknown"
    };

    localReservations.unshift(localEntry);
    localStorage.setItem(RESERVATION_LOCAL_KEY, JSON.stringify(localReservations));

    return {
      status: "created",
      mode: "local",
      data: localEntry
    };
  }

  async function handleAddUserSubmit(event) {
    event.preventDefault();
    if (!ui.addUserForm) return;

    if (!ui.addUserForm.checkValidity()) {
      ui.addUserForm.reportValidity();
      setAddUserFeedback("Merci de remplir tous les champs obligatoires.", "error");
      return;
    }

    const data = readAddUserFormData();
    if (!data || !data.nom || !data.prenom || !data.sexe || !data.email || !data.phone) {
      setAddUserFeedback("Merci de remplir tous les champs obligatoires.", "error");
      return;
    }

    setAddUserFeedback("Ajout en cours...", "info");

    const submitButton = ui.addUserForm.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      const result = await insertReservationFromAdmin(data);

      if (result.status === "existing") {
        setAddUserFeedback("Cet utilisateur est deja inscrit (email ou telephone existant).", "error");
        showToast("Utilisateur deja inscrit.", "error");
        return;
      }

      setAddUserFeedback("Utilisateur ajoute avec succes.", "success");
      showToast("Nouvel utilisateur ajoute.", "success");
      closeAddUserPanel({ reset: true });
      await loadData();
    } catch (error) {
      setAddUserFeedback("Ajout impossible pour le moment.", "error");
      showToast("Ajout impossible. Verifiez la connexion ou les permissions Supabase.", "error");
      console.error(error);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
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
    const client = createSupabaseClient();
    if (!client) {
      return readLocalArray(VISITS_LOCAL_KEY);
    }

    const tableCandidates = [...new Set([
      config.visitsTable,
      "site",
      "site_visits"
    ].filter(Boolean))];

    const errors = [];
    for (const table of tableCandidates) {
      const { data, error } = await client.from(table).select("*").order("created_at", { ascending: false });
      if (!error) {
        return Array.isArray(data) ? data : [];
      }
      errors.push(`${table}: ${error.message || error}`);
    }

    throw new Error(errors.join(" | "));
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

  function periodLabel(days) {
    if (!days) return "toute la periode";
    return `${days} derniers jours`;
  }

  function periodStartDate(days) {
    if (!days) return null;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - days + 1);
    return start;
  }

  function filterByPeriod(items, dateExtractor, days) {
    const start = periodStartDate(days);
    if (!start) return [...items];
    return items.filter((item) => {
      const date = parseDate(dateExtractor(item));
      if (!date) return false;
      return date >= start;
    });
  }

  function mapCountsByDate(items, dateExtractor) {
    return items.reduce((acc, item) => {
      const key = toDateKey(dateExtractor(item));
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  function dateLabelFromKey(key) {
    const date = parseDate(`${key}T00:00:00`);
    if (!date) return key;
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
  }

  function topEntryByCount(mapObject) {
    const entries = Object.entries(mapObject);
    if (!entries.length) {
      return { key: "-", count: 0 };
    }
    const [key, count] = entries.sort((a, b) => b[1] - a[1])[0];
    return { key, count };
  }

  function setActivePeriodButton() {
    if (!ui.dashboardPeriodButtons) return;
    const activeValue = String(state.dashboardPeriodDays);
    ui.dashboardPeriodButtons.querySelectorAll(".period-btn").forEach((button) => {
      button.classList.toggle("active", button.dataset.period === activeValue);
    });
  }

  function renderDashboardInsights() {
    if (view !== "dashboard" || !ui.dashboardInsights) return;

    const days = state.dashboardPeriodDays;
    const scopedReservations = filterByPeriod(state.reservations, reservationDate, days);
    const scopedVisits = filterByPeriod(state.visits, (row) => row.created_at || row.createdAt, days);
    const scopedMessages = filterByPeriod(state.formMessages, (row) => row.createdAt || row.created_at, days);

    const scopedPresent = scopedReservations.filter((row) => row.presence_status === "present").length;
    const scopedMarked = scopedReservations.filter((row) => row.presence_status === "present" || row.presence_status === "absent").length;
    const scopedPresenceRate = scopedMarked > 0 ? Math.round((scopedPresent / scopedMarked) * 100) : 0;
    const scopedUniqueVisitors = new Set(
      scopedVisits.map((visit) => String(visit.visitor_key || "").trim()).filter(Boolean)
    ).size;
    const conversion = scopedVisits.length > 0 ? Math.round((scopedReservations.length / scopedVisits.length) * 100) : 0;

    const reservationByDay = mapCountsByDate(scopedReservations, reservationDate);
    const visitsByDay = mapCountsByDate(scopedVisits, (row) => row.created_at || row.createdAt);
    const topReservationDay = topEntryByCount(reservationByDay);
    const topVisitDay = topEntryByCount(visitsByDay);

    const cards = [
      { label: "Inscriptions periode", value: scopedReservations.length, detail: `${scopedPresent} present(s)` },
      { label: "Visites periode", value: scopedVisits.length, detail: `${scopedUniqueVisitors} uniques` },
      { label: "Messages Join", value: scopedMessages.length, detail: periodLabel(days) },
      { label: "Taux presence", value: `${scopedPresenceRate}%`, detail: `${scopedMarked} marque(s)` },
      { label: "Conversion", value: `${conversion}%`, detail: "inscriptions / visites" },
      { label: "Pic inscriptions", value: topReservationDay.count, detail: topReservationDay.count ? dateLabelFromKey(topReservationDay.key) : "-" },
      { label: "Pic visites", value: topVisitDay.count, detail: topVisitDay.count ? dateLabelFromKey(topVisitDay.key) : "-" }
    ];

    ui.dashboardInsights.innerHTML = cards
      .map((card) => `
        <article class="insight-card">
          <p>${escapeHtml(card.label)}</p>
          <strong>${escapeHtml(card.value)}</strong>
          <span>${escapeHtml(card.detail)}</span>
        </article>
      `)
      .join("");

    if (ui.insightsWindowLabel) {
      ui.insightsWindowLabel.textContent = `Analyse sur ${periodLabel(days)}.`;
    }

    setActivePeriodButton();
  }

  function renderActivityTimeline() {
    if (view !== "dashboard" || !ui.activityTimeline) return;

    const reservationsByDate = mapCountsByDate(state.reservations, reservationDate);
    const visitsByDate = mapCountsByDate(state.visits, (row) => row.created_at || row.createdAt);

    const days = [];
    for (let offset = 13; offset >= 0; offset -= 1) {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - offset);
      const key = toDateKey(day.toISOString());
      const res = reservationsByDate[key] || 0;
      const visits = visitsByDate[key] || 0;
      days.push({ key, label: dateLabelFromKey(key), res, visits, total: res + visits });
    }

    const maxTotal = days.reduce((max, day) => Math.max(max, day.total), 0) || 1;

    ui.activityTimeline.innerHTML = days
      .map((day) => {
        const resHeight = Math.max(8, Math.round((day.res / maxTotal) * 84));
        const visitsHeight = Math.max(8, Math.round((day.visits / maxTotal) * 84));
        return `
          <article class="activity-day">
            <p class="activity-day-label">${escapeHtml(day.label)}</p>
            <div class="activity-bars">
              <span class="activity-bar activity-bar-res" style="height:${resHeight}px"></span>
              <span class="activity-bar activity-bar-visits" style="height:${visitsHeight}px"></span>
            </div>
            <p class="activity-day-meta">I ${day.res} / V ${day.visits}</p>
          </article>
        `;
      })
      .join("");

    if (ui.activityWindowLabel) {
      ui.activityWindowLabel.textContent = `Derniers 14 jours. Pic journalier: ${maxTotal} interaction(s).`;
    }
  }

  function monthKeyFromDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  function parseMonthKey(value) {
    const match = String(value || "").match(/^(\d{4})-(\d{2})$/);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function shiftMonthKey(monthKey, delta) {
    const sourceDate = parseMonthKey(monthKey) || new Date();
    const shifted = new Date(sourceDate.getFullYear(), sourceDate.getMonth() + delta, 1);
    return monthKeyFromDate(shifted);
  }

  function ensureCalendarState() {
    if (!state.calendarMonthKey) {
      state.calendarMonthKey = monthKeyFromDate(new Date());
    }
    if (!state.selectedCalendarDateKey) {
      state.selectedCalendarDateKey = toDateKey(new Date().toISOString());
    }
  }

  function buildDailyStatsMaps() {
    const reservationsByDate = new Map();
    const visitsByDate = new Map();
    const uniqueVisitorsByDate = new Map();

    state.reservations.forEach((row) => {
      const key = toDateKey(reservationDate(row));
      if (!key) return;
      reservationsByDate.set(key, (reservationsByDate.get(key) || 0) + 1);
    });

    state.visits.forEach((row) => {
      const key = toDateKey(row.created_at || row.createdAt);
      if (!key) return;
      visitsByDate.set(key, (visitsByDate.get(key) || 0) + 1);

      const visitorKey = String(row.visitor_key || "").trim();
      if (!visitorKey) return;
      if (!uniqueVisitorsByDate.has(key)) {
        uniqueVisitorsByDate.set(key, new Set());
      }
      uniqueVisitorsByDate.get(key).add(visitorKey);
    });

    return { reservationsByDate, visitsByDate, uniqueVisitorsByDate };
  }

  function renderStatsCalendar() {
    if (view !== "dashboard" || !ui.statsCalendar) return;

    ensureCalendarState();
    const monthDate = parseMonthKey(state.calendarMonthKey) || new Date();
    const monthKey = monthKeyFromDate(monthDate);
    state.calendarMonthKey = monthKey;

    if (ui.calendarMonthPicker) {
      ui.calendarMonthPicker.value = monthKey;
    }

    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

    const { reservationsByDate, visitsByDate, uniqueVisitorsByDate } = buildDailyStatsMaps();

    const monthResTotal = Array.from({ length: daysInMonth }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      const dateKey = `${monthKey}-${day}`;
      return reservationsByDate.get(dateKey) || 0;
    }).reduce((sum, count) => sum + count, 0);

    const monthVisitsTotal = Array.from({ length: daysInMonth }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      const dateKey = `${monthKey}-${day}`;
      return visitsByDate.get(dateKey) || 0;
    }).reduce((sum, count) => sum + count, 0);

    const maxTotal = Array.from({ length: daysInMonth }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      const dateKey = `${monthKey}-${day}`;
      return (reservationsByDate.get(dateKey) || 0) + (visitsByDate.get(dateKey) || 0);
    }).reduce((max, value) => Math.max(max, value), 0);

    const todayKey = toDateKey(new Date().toISOString());
    const cells = [];

    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push('<div class="calendar-empty-cell" aria-hidden="true"></div>');
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dayText = String(day).padStart(2, "0");
      const dateKey = `${monthKey}-${dayText}`;
      const reservationCount = reservationsByDate.get(dateKey) || 0;
      const visitCount = visitsByDate.get(dateKey) || 0;
      const combined = reservationCount + visitCount;
      const intensity = maxTotal > 0 ? Math.min(4, Math.ceil((combined / maxTotal) * 4)) : 0;

      const classes = ["calendar-day", `calendar-day-intensity-${intensity}`];
      if (dateKey === todayKey) classes.push("calendar-day-today");
      if (dateKey === state.selectedCalendarDateKey) classes.push("calendar-day-selected");

      cells.push(`
        <button class="${classes.join(" ")}" type="button" role="gridcell" data-date="${dateKey}" aria-label="${day}/${month + 1}/${year}: ${reservationCount} inscriptions, ${visitCount} visites">
          <span class="calendar-day-number">${day}</span>
          <span class="calendar-day-count calendar-day-res">I: ${reservationCount}</span>
          <span class="calendar-day-count calendar-day-visits">V: ${visitCount}</span>
        </button>
      `);
    }

    ui.statsCalendar.innerHTML = cells.join("");

    const currentMonthPrefix = `${monthKey}-`;
    if (!state.selectedCalendarDateKey || !state.selectedCalendarDateKey.startsWith(currentMonthPrefix)) {
      const todayInMonth = todayKey.startsWith(currentMonthPrefix);
      state.selectedCalendarDateKey = todayInMonth ? todayKey : `${monthKey}-01`;
    }

    const selectedKey = state.selectedCalendarDateKey;
    const selectedDate = parseDate(`${selectedKey}T00:00:00`);
    const selectedRes = reservationsByDate.get(selectedKey) || 0;
    const selectedVisits = visitsByDate.get(selectedKey) || 0;
    const selectedUnique = uniqueVisitorsByDate.get(selectedKey)?.size || 0;

    if (ui.calendarSelectionInfo) {
      const monthLabel = monthDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
      const dateLabel = selectedDate ? selectedDate.toLocaleDateString("fr-FR") : selectedKey;
      ui.calendarSelectionInfo.textContent = `${monthLabel} - total: ${monthResTotal} inscription(s), ${monthVisitsTotal} visite(s). Jour ${dateLabel}: ${selectedRes} inscription(s), ${selectedVisits} visite(s), ${selectedUnique} visiteur(s) unique(s).`;
    }
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
      tr.innerHTML = `<td class="empty-cell" colspan="${INSCRIPTIONS_COLUMN_COUNT}">Aucune inscription trouvee.</td>`;
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
        <td data-label="Sexe">${escapeHtml(participantGenderLabel(row))}</td>
        <td data-label="Telephone">${escapeHtml(row.phone || "-")}</td>
        <td data-label="Email">${escapeHtml(row.email || "-")}</td>
        <td data-label="Adresse">${escapeHtml(row.address || "-")}</td>
        <td data-label="Date inscription">${escapeHtml(participantDateLabel(row))}</td>
        <td data-label="Presence">${presenceCell}</td>
        <td data-label="WhatsApp"><button class="mini-btn contact-btn" data-action="whatsapp" data-key="${escapeHtml(row.__key)}" type="button">Contacter</button></td>
        <td data-label="Message inscription"><button class="mini-btn template-btn" data-action="inscription-message" data-key="${escapeHtml(row.__key)}" type="button">Generer</button></td>
        <td data-label="Notifier"><button class="mini-btn notify-btn" data-action="notify" data-key="${escapeHtml(row.__key)}" type="button">Notifier</button></td>
        <td data-label="PDF"><button class="mini-btn" data-action="pdf" data-key="${escapeHtml(row.__key)}" type="button">Telecharger</button></td>
        <td data-label="Suppression"><button class="mini-btn delete-btn" data-action="delete" data-key="${escapeHtml(row.__key)}" type="button">Supprimer</button></td>
      `;

      ui.reservationRows.appendChild(tr);
    });
  }

  function participantByKey(key) {
    return state.reservations.find((row) => row.__key === key) || null;
  }

  async function generateParticipantPdf(row) {
    if (!window.jspdf?.jsPDF) {
      showToast("Librairie PDF indisponible.", "error");
      return;
    }

    const { jsPDF } = window.jspdf;

    const formatPdfDate = (value) => {
      if (!value) return "";

      if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toLocaleDateString("fr-FR");
      }

      if (typeof value === "string") {
        const trimmedValue = value.trim();
        const isoMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
          return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
        }

        const dateMatch = trimmedValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (dateMatch) {
          return `${dateMatch[1].padStart(2, "0")}/${dateMatch[2].padStart(2, "0")}/${dateMatch[3]}`;
        }

        const parsedDate = new Date(trimmedValue);
        if (!Number.isNaN(parsedDate.getTime())) {
          return parsedDate.toLocaleDateString("fr-FR");
        }
      }

      return String(value).substring(0, 10);
    };

    const containsArabic = (value) => /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(String(value || ""));

    const recoverArabicMojibake = (value) => {
      const text = String(value || "");
      if (!text || containsArabic(text)) return text;
      if (!/[\u00C0-\u00FF]/.test(text)) return text;

      const bytes = Array.from(text).map((char) => char.charCodeAt(0));
      if (bytes.some((code) => code > 255)) return text;

      try {
        const decoded = new TextDecoder("utf-8").decode(new Uint8Array(bytes));
        return containsArabic(decoded) ? decoded : text;
      } catch (error) {
        return text;
      }
    };

    const normalizePdfText = (value, { uppercase = false, keepCaseForArabic = true } = {}) => {
      const rawText = recoverArabicMojibake(value).trim().replace(/\s+/g, " ");
      if (!rawText) return "";
      if (keepCaseForArabic && containsArabic(rawText)) return rawText;
      return uppercase ? rawText.toUpperCase() : rawText;
    };

    const fitCanvasText = (ctx, value, maxWidthPx, options = {}) => {
      const normalizedText = normalizePdfText(value, options);
      if (!normalizedText) return "";
      if (ctx.measureText(normalizedText).width <= maxWidthPx) {
        return normalizedText;
      }

      let shortenedText = normalizedText;
      while (shortenedText.length > 1 && ctx.measureText(`${shortenedText}...`).width > maxWidthPx) {
        shortenedText = shortenedText.slice(0, -1).trimEnd();
      }

      return shortenedText ? `${shortenedText}...` : "";
    };

    await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);

          const fieldLayout = {
            nom: { x: 51.5, y: 198.8, maxWidth: 92, font: "bold", size: 11.5, uppercase: true },
            prenom: { x: 61, y: 208.4, maxWidth: 82, font: "bold", size: 11.2, uppercase: true },
            date: { x: 84.2, y: 224.8, maxWidth: 48, font: "bold", size: 9.4 },
            email: { x: 48.2, y: 233.3, maxWidth: 84, font: "normal", size: 8.6 },
            phone: { x: 75.8, y: 241.8, maxWidth: 57, font: "bold", size: 9.0 },
            address: { x: 55.2, y: 250.3, maxWidth: 78, font: "normal", size: 7.4 }
          };

          const TEMPLATE_BASE_HEIGHT = 3508;

          const mmToPxX = (mm) => (mm / 210) * canvas.width;
          const mmToPxY = (mm) => (mm / 297) * canvas.height;
          const scaledFontSize = (size) => {
            const scale = canvas.height / TEMPLATE_BASE_HEIGHT;
            const boostedSize = size * scale * 2.4;
            return Math.min(42, Math.max(12, boostedSize));
          };

          const drawField = (key, value) => {
            const layout = fieldLayout[key];
            const hasArabic = containsArabic(value);
            const sizePx = scaledFontSize(layout.size);
            const weight = layout.font === "bold" ? "700" : "400";
            const family = hasArabic ? '"Amiri", "Noto Naskh Arabic", Tahoma, serif' : '"Arial", sans-serif';
            ctx.font = `${weight} ${sizePx}px ${family}`;
            ctx.fillStyle = "#2c1810";
            ctx.textBaseline = "alphabetic";
            ctx.direction = hasArabic ? "rtl" : "ltr";
            ctx.textAlign = hasArabic ? "right" : "left";

            const maxWidthPx = mmToPxX(layout.maxWidth);
            const text = fitCanvasText(ctx, value, maxWidthPx, {
              uppercase: layout.uppercase,
              keepCaseForArabic: true
            });

            const x = hasArabic ? mmToPxX(layout.x) + maxWidthPx : mmToPxX(layout.x);
            const y = mmToPxY(layout.y);
            ctx.fillText(text, x, y);
          };

          const drawCheckboxMark = (boxX, boxY, boxSize) => {
            const inset = 0.7;
            const startX = mmToPxX(boxX + inset);
            const startY = mmToPxY(boxY + inset);
            const endX = mmToPxX(boxX + boxSize - inset);
            const endY = mmToPxY(boxY + boxSize - inset);
            ctx.strokeStyle = "#2c1810";
            ctx.lineWidth = Math.max(1, (0.75 / 297) * canvas.height);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.moveTo(endX, startY);
            ctx.lineTo(startX, endY);
            ctx.stroke();
          };

          drawField("nom", row.nom);
          drawField("prenom", row.prenom);

          const pdfSex = normalizePdfSex(row.sexe || row.sexe_label || row.sexeLabel);
          if (pdfSex === "male") {
            drawCheckboxMark(47.95, 212.85, 4.95);
          } else if (pdfSex === "female") {
            drawCheckboxMark(71.2, 212.85, 4.7);
          }

          drawField("date", formatPdfDate(reservationDate(row)));
          drawField("email", row.email);
          drawField("phone", row.phone);
          drawField("address", row.address);

          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
          });
          const finalImage = canvas.toDataURL("image/png");
          pdf.addImage(finalImage, "PNG", 0, 0, 210, 297);

          const fileName = `reservation-${String(row.nom || "").trim()}-${String(row.prenom || "").trim()}`
            .replace(/\s+/g, "-")
            .toLowerCase();
          pdf.save(`${fileName || "reservation"}.pdf`);
          showToast("PDF telecharge.", "success");
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error("Template PDF introuvable: src/image/affichepdf.png"));
      };

      img.src = "src/image/affichepdf.png";
    }).catch((error) => {
      showToast("Erreur generation PDF.", "error");
      console.error(error);
    });
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

  function buildInscriptionMessage(row) {
    const fullName = `${String(row.prenom || "").trim()} ${String(row.nom || "").trim()}`.trim() || "Participant";
    const gender = participantGenderLabel(row);
    const dateInscription = participantDateLabel(row);
    const eventName = String(row.event_name || row.eventName || "Soiree Abir Al Horof").trim();

    return [
      `Bonjour ${fullName},`,
      "",
      "Voici le recapitulatif de votre inscription :",
      `- Nom complet : ${fullName}`,
      `- Sexe : ${gender || "-"}`,
      `- Telephone : ${row.phone || "-"}`,
      `- Email : ${row.email || "-"}`,
      `- Adresse : ${row.address || "-"}`,
      `- Date d'inscription : ${dateInscription}`,
      `- Evenement : ${eventName}`,
      "",
      "Merci et a tres bientot.",
      "Equipe Abir Al Horof"
    ].join("\n");
  }

  function closeInscriptionMessageModal() {
    if (!ui.whatsappMessageModal) return;
    state.inscriptionMessageRecipient = null;
    ui.whatsappMessageModal.classList.add("hidden");
    ui.whatsappMessageModal.setAttribute("aria-hidden", "true");
    if (ui.whatsappMessageRecipient) {
      ui.whatsappMessageRecipient.textContent = "";
    }
  }

  function openInscriptionMessageModal(row) {
    if (!ui.whatsappMessageModal || !ui.whatsappMessageText) return;
    state.inscriptionMessageRecipient = row;
    ui.whatsappMessageText.value = buildInscriptionMessage(row);

    const fullName = `${String(row.prenom || "").trim()} ${String(row.nom || "").trim()}`.trim() || "Participant";
    const destination = normalizePhone(row.phone) || config.whatsappFallbackNumber || "";
    if (ui.whatsappMessageRecipient) {
      ui.whatsappMessageRecipient.textContent = destination
        ? `Destinataire: ${fullName} (${destination})`
        : `Destinataire: ${fullName} (numero non disponible)`;
    }

    ui.whatsappMessageModal.classList.remove("hidden");
    ui.whatsappMessageModal.setAttribute("aria-hidden", "false");
    ui.whatsappMessageText.focus();
  }

  function sendInscriptionMessageToWhatsapp() {
    if (!ui.whatsappMessageText) return;
    const recipient = state.inscriptionMessageRecipient;
    if (!recipient) {
      showToast("Aucun destinataire selectionne.", "error");
      return;
    }

    const message = String(ui.whatsappMessageText.value || "").trim();
    if (!message) {
      showToast("Le message est vide.", "error");
      return;
    }

    const destination = normalizePhone(recipient.phone) || config.whatsappFallbackNumber || "";
    if (!destination) {
      showToast("Aucun numero WhatsApp disponible.", "error");
      return;
    }

    const whatsappUrl = `https://wa.me/${destination}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener");
    closeInscriptionMessageModal();
  }

  function buildInscriptionRequestTemplateMessage() {
    return [
      "Salut, pour vous inscrire veuillez donner vos informations :",
      "- Nom :",
      "- Prenom :",
      "- Sexe :",
      "- Telephone :",
      "- Email :",
      "- Adresse :",
      "",
      "Des reception de vos infos, nous finalisons votre inscription.",
      "Equipe Abir Al Horof"
    ].join("\n");
  }

  function openInscriptionRequestTemplateWhatsapp() {
    const destination = normalizePhone(config.whatsappFallbackNumber || "");
    const message = buildInscriptionRequestTemplateMessage();
    const whatsappUrl = destination
      ? `https://wa.me/${destination}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener");
    showToast("Modele WhatsApp pret a envoyer.", "success");
  }

  function buildValidationNotificationMessage(row) {
    const fullName = `${String(row.prenom || "").trim()} ${String(row.nom || "").trim()}`.trim() || "Participant";
    return [
      `Bonjour ${fullName},`,
      "",
      "Votre inscription a Abir Al Horof est bien validee.",
      "Si vous n'avez pas recu le PDF d'inscription, dites-le nous sur ce numero et nous vous l'enverrons.",
      "",
      "Merci et a tres bientot.",
      "Equipe Abir Al Horof"
    ].join("\n");
  }

  function notifyParticipantViaWhatsapp(row) {
    const destination = normalizePhone(row.phone) || config.whatsappFallbackNumber || "";
    if (!destination) {
      showToast("Aucun numero WhatsApp disponible.", "error");
      return;
    }

    const text = buildValidationNotificationMessage(row);
    window.open(`https://wa.me/${destination}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    showToast("Message de validation pret a envoyer.", "success");
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

  function deleteReservationLocal(row) {
    const current = readLocalArray(RESERVATION_LOCAL_KEY);
    const next = current.filter((item) => {
      const sameEmail = String(item.email || "") === String(row.email || "");
      const samePhone = String(item.phone || "") === String(row.phone || "");
      const sameNom = String(item.nom || "") === String(row.nom || "");
      const samePrenom = String(item.prenom || "") === String(row.prenom || "");
      const sameReserved = String(item.reserved_at || item.reservedAt || "") === String(row.reserved_at || row.reservedAt || "");
      return !(sameEmail && samePhone && sameNom && samePrenom && sameReserved);
    });
    localStorage.setItem(RESERVATION_LOCAL_KEY, JSON.stringify(next));
  }

  function clearPresenceOverride(row) {
    const overrides = readLocalObject(PRESENCE_OVERRIDES_KEY);
    if (overrides[row.__key]) {
      delete overrides[row.__key];
      writeLocalObject(PRESENCE_OVERRIDES_KEY, overrides);
    }
  }

  async function deleteParticipantRemote(row) {
    const client = createSupabaseClient();
    const table = config.reservationsTable || "reservations";
    if (!client || !row.id) {
      return { ok: false, reason: "fallback" };
    }

    const { error } = await client.from(table).delete().eq("id", row.id);
    if (error) {
      return { ok: false, reason: error.message || "delete_failed" };
    }
    return { ok: true };
  }

  async function handleDelete(row) {
    const confirmed = window.confirm(`Supprimer l'inscription de ${row.prenom || ""} ${row.nom || ""} ?`);
    if (!confirmed) return;

    const deleteResult = await deleteParticipantRemote(row);
    if (!deleteResult.ok && deleteResult.reason !== "fallback") {
      showToast("Suppression impossible sur Supabase. Verifiez la policy DELETE.", "error");
      return;
    }

    if (deleteResult.reason === "fallback") {
      deleteReservationLocal(row);
    }

    clearPresenceOverride(row);
    state.reservations = state.reservations.filter((entry) => entry.__key !== row.__key);
    applyFilters();
    renderRows();
    computeStats();
    renderDashboardPanels();
    renderDashboardInsights();
    renderActivityTimeline();
    renderStatsCalendar();
    showToast("Inscription supprimee.", "success");
  }

  async function handlePresence(row, status) {
    row.presence_status = status;
    row.presence_checked_at = new Date().toISOString();
    savePresenceOverride(row, status);

    applyFilters();
    renderRows();
    computeStats();
    renderDashboardInsights();

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
      await generateParticipantPdf(row);
      return;
    }
    if (button.dataset.action === "whatsapp") {
      contactViaWhatsapp(row);
      return;
    }
    if (button.dataset.action === "inscription-message") {
      openInscriptionMessageModal(row);
      return;
    }
    if (button.dataset.action === "notify") {
      notifyParticipantViaWhatsapp(row);
      return;
    }
    if (button.dataset.action === "present") {
      await handlePresence(row, "present");
      return;
    }
    if (button.dataset.action === "absent") {
      await handlePresence(row, "absent");
      return;
    }
    if (button.dataset.action === "delete") {
      await handleDelete(row);
    }
  }

  function exportCsv() {
    const rows = state.filteredReservations;
    if (!rows.length) {
      showToast("Aucune ligne a exporter.", "error");
      return;
    }

    const header = ["Nom", "Prenom", "Sexe", "Telephone", "Email", "Adresse", "Date inscription", "Presence", "Langue"];
    const lines = rows.map((row) => [
      row.nom,
      row.prenom,
      participantGenderLabel(row),
      row.phone,
      row.email,
      row.address || "",
      participantDateLabel(row),
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
    renderDashboardInsights();
    renderActivityTimeline();
    renderStatsCalendar();
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

    ui.toggleAddUserForm?.addEventListener("click", () => {
      toggleAddUserPanel();
    });

    ui.sendInscriptionTemplateWhatsapp?.addEventListener("click", () => {
      openInscriptionRequestTemplateWhatsapp();
    });

    ui.cancelAddUser?.addEventListener("click", () => {
      closeAddUserPanel({ reset: true });
    });

    ui.addUserForm?.addEventListener("submit", (event) => {
      handleAddUserSubmit(event);
    });

    ui.calendarMonthPicker?.addEventListener("change", () => {
      const nextKey = String(ui.calendarMonthPicker?.value || "");
      if (!parseMonthKey(nextKey)) return;
      state.calendarMonthKey = nextKey;
      state.selectedCalendarDateKey = "";
      renderStatsCalendar();
    });

    ui.calendarPrev?.addEventListener("click", () => {
      state.calendarMonthKey = shiftMonthKey(state.calendarMonthKey, -1);
      state.selectedCalendarDateKey = "";
      renderStatsCalendar();
    });

    ui.calendarNext?.addEventListener("click", () => {
      state.calendarMonthKey = shiftMonthKey(state.calendarMonthKey, 1);
      state.selectedCalendarDateKey = "";
      renderStatsCalendar();
    });

    ui.statsCalendar?.addEventListener("click", (event) => {
      const trigger = event.target.closest("button[data-date]");
      if (!trigger) return;
      state.selectedCalendarDateKey = trigger.dataset.date || "";
      renderStatsCalendar();
    });

    ui.dashboardPeriodButtons?.addEventListener("click", (event) => {
      const trigger = event.target.closest("button[data-period]");
      if (!trigger) return;
      const parsed = Number(trigger.dataset.period);
      if (Number.isNaN(parsed)) return;
      state.dashboardPeriodDays = parsed;
      renderDashboardInsights();
      renderActivityTimeline();
    });

    ui.reservationRows?.addEventListener("click", (event) => {
      handleRowsClick(event);
    });

    ui.sendWhatsAppMessage?.addEventListener("click", () => {
      sendInscriptionMessageToWhatsapp();
    });

    ui.closeWhatsAppMessage?.addEventListener("click", () => {
      closeInscriptionMessageModal();
    });

    ui.cancelWhatsAppMessage?.addEventListener("click", () => {
      closeInscriptionMessageModal();
    });

    ui.whatsappMessageModal?.addEventListener("click", (event) => {
      if (event.target === ui.whatsappMessageModal) {
        closeInscriptionMessageModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeInscriptionMessageModal();
      }
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
