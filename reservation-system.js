const reservationTranslations = {
  fr: {
    pageTitle: "Reservation | Abir Al Horof",
    soiree: {
      eyebrow: "Soiree a venir",
      title: "Journee Therapie et Lecture : Se reconnecter a soi au coeur de la nature.",
      description: "Une rencontre sensorielle et poetique animee par Madame Bouchera Safriiwi, Lamia Jam et Tiya, entre meditation, marche consciente et lecture partagee.",
      notice: "Les places sont gratuites et limitees a une seule reservation par participant.",
      cta: "Reserver",
      posterLabel: "Affiche",
      posterTitle: "Une journee de therapie, lecture et reconnexion.",
      posterText: "Consultez l'affiche de l'evenement puis finalisez votre inscription depuis la page dediee."
    },
    reservation: {
      eyebrow: "Inscriptions",
      title: "Reservez votre place pour la soiree Abir Al Horof.",
      lead: "Completez le formulaire une seule fois. Si vous etes deja inscrit, nous vous montrerons directement votre fiche et votre PDF.",
      badgeFree: "Gratuit",
      badgeSingle: "1 reservation par email ou telephone",
      posterLabel: "Affiche officielle",
      posterTitle: "Journee Therapie et Lecture",
      posterText: "Se reconnecter a soi au coeur de la nature, dans une ambiance de lecture, de meditation et de marche consciente.",
      formKicker: "Formulaire bilingue",
      formTitle: "Confirmez votre participation",
      formText: "Tous les champs obligatoires doivent etre completes avant l'envoi. L'adresse est facultative.",
      fields: {
        nom: "Nom",
        prenom: "Prenom",
        sexe: "Sexe",
        email: "Adresse email",
        phone: "Numero de telephone",
        address: "Adresse"
      },
      placeholders: {
        nom: "Votre nom",
        prenom: "Votre prenom",
        sexe: "Selectionner",
        email: "nom@email.com",
        phone: "06 40 21 59 68",
        address: "Votre adresse"
      },
      gender: {
        male: "Homme",
        female: "Femme"
      },
      actions: {
        whatsapp: "Inscription via WhatsApp",
        confirm: "Confirmer ma reservation"
      },
      feedback: {
        required: "Merci de remplir correctement tous les champs obligatoires.",
        saving: "Verification de votre inscription en cours...",
        stored: "Votre inscription a bien ete enregistree.",
        duplicate: "Vous etes deja inscrit. Votre PDF est pret.",
        whatsapp: "Votre inscription a ete enregistree. WhatsApp va s'ouvrir avec vos informations.",
        localMode: "Mode local actif en attendant la connexion Supabase.",
        saveError: "Impossible d'enregistrer votre inscription pour le moment."
      },
      modal: {
        successEyebrow: "Inscription reussie",
        successTitle: "Votre inscription a ete enregistree avec succes.",
        successText: "Vous pouvez telecharger votre fiche en PDF ou poursuivre sur WhatsApp.",
        existingEyebrow: "Deja inscrit",
        existingTitle: "Cette personne est deja inscrite.",
        existingText: "Nous avons retrouve votre inscription. Vous pouvez telecharger a nouveau votre PDF.",
        download: "Telecharger le PDF",
        whatsapp: "Ouvrir WhatsApp"
      },
      pdf: {
        title: "Fiche de reservation",
        subtitle: "Journee Therapie et Lecture",
        intro: "Confirmation de participation a l'evenement Abir Al Horof",
        event: "Evenement",
        date: "Date d'inscription",
        name: "Nom",
        surname: "Prenom",
        gender: "Sexe",
        email: "Email",
        phone: "Telephone",
        address: "Adresse",
        footer: "Reservation validee - Abir Al Horof"
      }
    }
  },
  ar: {
    pageTitle: "الحجز | عبير الحروف",
    soiree: {
      eyebrow: "الامسية القادمة",
      title: "يوم علاج وقراءة: اعادة الاتصال بالذات في قلب الطبيعة.",
      description: "لقاء شعري وعلاجي تؤطره السيدة بشرى الصفريوي، لمياء جام، وتيا، ويجمع بين التأمل والمشي الواعي والقراءة المشتركة.",
      notice: "الدخول مجاني ومسموح بحجز واحد فقط لكل مشارك.",
      cta: "احجز الان",
      posterLabel: "الملصق",
      posterTitle: "يوم من العلاج والقراءة واعادة التواصل مع الذات.",
      posterText: "اطلعوا على ملصق الفعالية ثم اتموا التسجيل من صفحة الحجز المخصصة."
    },
    reservation: {
      eyebrow: "التسجيلات",
      title: "احجزوا مكانكم في سهرة عبير الحروف.",
      lead: "املؤوا الاستمارة مرة واحدة فقط. اذا كنتم مسجلين من قبل فسنظهر لكم بطاقتكم وملف PDF مباشرة.",
      badgeFree: "مجاني",
      badgeSingle: "حجز واحد فقط لكل بريد او رقم هاتف",
      posterLabel: "الملصق الرسمي",
      posterTitle: "يوم علاج وقراءة",
      posterText: "اعادة الاتصال بالذات في قلب الطبيعة، ضمن اجواء من القراءة والتأمل والمشي الواعي.",
      formKicker: "استمارة ثنائية اللغة",
      formTitle: "اكدوا مشاركتكم",
      formText: "يجب ملء جميع الحقول الالزامية قبل الارسال. العنوان اختياري.",
      fields: {
        nom: "الاسم العائلي",
        prenom: "الاسم الشخصي",
        sexe: "الجنس",
        email: "البريد الالكتروني",
        phone: "رقم الهاتف",
        address: "العنوان"
      },
      placeholders: {
        nom: "الاسم العائلي",
        prenom: "الاسم الشخصي",
        sexe: "اختر",
        email: "name@email.com",
        phone: "06 40 21 59 68",
        address: "عنوانكم"
      },
      gender: {
        male: "رجل",
        female: "امراة"
      },
      actions: {
        whatsapp: "التسجيل عبر واتساب",
        confirm: "تاكيد الحجز"
      },
      feedback: {
        required: "يرجى ملء جميع الحقول الالزامية بشكل صحيح.",
        saving: "جار التحقق من تسجيلكم...",
        stored: "تم حفظ تسجيلكم بنجاح.",
        duplicate: "انتم مسجلون بالفعل. ملف PDF جاهز.",
        whatsapp: "تم حفظ تسجيلكم. سيتم فتح واتساب مع معلوماتكم.",
        localMode: "الوضع المحلي مفعل الى حين ربط Supabase.",
        saveError: "تعذر حفظ التسجيل حاليا."
      },
      modal: {
        successEyebrow: "تم التسجيل بنجاح",
        successTitle: "تم تسجيل مشاركتكم بنجاح.",
        successText: "يمكنكم تحميل ملف PDF او متابعة الارسال عبر واتساب.",
        existingEyebrow: "مسجل من قبل",
        existingTitle: "هذا المشارك مسجل مسبقا.",
        existingText: "تم العثور على التسجيل. يمكنكم تحميل ملف PDF من جديد.",
        download: "تحميل PDF",
        whatsapp: "فتح واتساب"
      },
      pdf: {
        title: "استمارة الحجز",
        subtitle: "يوم علاج وقراءة",
        intro: "تاكيد المشاركة في فعالية عبير الحروف",
        event: "الفعالية",
        date: "تاريخ التسجيل",
        name: "الاسم العائلي",
        surname: "الاسم الشخصي",
        gender: "الجنس",
        email: "البريد الالكتروني",
        phone: "رقم الهاتف",
        address: "العنوان",
        footer: "تم تاكيد الحجز - عبير الحروف"
      }
    }
  }
};

const reservationStorageKey = "abir-al-horof-reservations";
let reservationPdfCache = null;

function reservationLang() {
  return sessionStorage.getItem("abir-al-horof-language") || "fr";
}

function reservationPick(path) {
  const dictionary = reservationTranslations[reservationLang()] || reservationTranslations.fr;
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), dictionary);
}

function getConfig() {
  return window.ABIR_RESERVATION_CONFIG || {};
}

function createSupabaseClient() {
  const config = getConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey || !window.supabase?.createClient) {
    return null;
  }
  return window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
}

function applyReservationTranslations() {
  document.querySelectorAll("[data-res-i18n]").forEach((element) => {
    const value = reservationPick(element.dataset.resI18n);
    if (typeof value === "string") {
      element.textContent = value;
    }
  });

  document.querySelectorAll("[data-res-placeholder]").forEach((element) => {
    const value = reservationPick(element.dataset.resPlaceholder);
    if (typeof value === "string") {
      element.setAttribute("placeholder", value);
    }
  });

  if (document.body.dataset.reservationPage === "true") {
    document.title = reservationPick("pageTitle") || document.title;
  }
}

function getReservations() {
  try {
    return JSON.parse(localStorage.getItem(reservationStorageKey) || "[]");
  } catch (error) {
    return [];
  }
}

function setReservations(reservations) {
  localStorage.setItem(reservationStorageKey, JSON.stringify(reservations));
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizePhone(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

function showReservationFeedback(key, state) {
  const feedback = document.getElementById("reservationFeedback");
  if (!feedback) return;
  feedback.dataset.state = state;
  feedback.textContent = reservationPick(`reservation.feedback.${key}`) || "";
}

function markReservationField(field) {
  const wrapper = field.closest(".form-field");
  if (!wrapper) return;
  wrapper.classList.toggle("is-invalid", !field.checkValidity());
}

function getGenderLabel(value) {
  return reservationPick(`reservation.gender.${value}`) || value;
}

function reservationFormData() {
  const form = document.getElementById("reservation-form");
  if (!form) return null;

  return {
    nom: form.nom.value.trim(),
    prenom: form.prenom.value.trim(),
    sexe: form.sexe.value.trim(),
    sexeLabel: getGenderLabel(form.sexe.value.trim()),
    email: normalizeEmail(form.email.value),
    phone: normalizePhone(form.phone.value),
    address: form.address.value.trim(),
    reservedAt: new Date().toLocaleString(reservationLang() === "ar" ? "ar-MA" : "fr-FR"),
    eventName: reservationLang() === "ar" ? "يوم علاج وقراءة - اعادة الاتصال بالذات في قلب الطبيعة" : "Journee Therapie et Lecture - Se reconnecter a soi au coeur de la nature"
  };
}

function validateReservationForm() {
  const form = document.getElementById("reservation-form");
  if (!form) return null;

  const fields = Array.from(form.querySelectorAll("[data-res-field]"));
  let firstInvalid = null;

  fields.forEach((field) => {
    markReservationField(field);
    if (!firstInvalid && !field.checkValidity()) {
      firstInvalid = field;
    }
  });

  if (firstInvalid) {
    firstInvalid.focus();
    showReservationFeedback("required", "error");
    return null;
  }

  return reservationFormData();
}

function openWhatsApp(data) {
  const config = getConfig();
  const message = reservationLang() === "ar"
    ? `السلام عليكم، اؤكد تسجيلي في يوم علاج وقراءة.\n\nالاسم العائلي: ${data.nom}\nالاسم الشخصي: ${data.prenom}\nالجنس: ${data.sexeLabel}\nالبريد الالكتروني: ${data.email}\nرقم الهاتف: ${data.phone}\nالعنوان: ${data.address || "غير مذكور"}`
    : `Bonjour, je confirme mon inscription a la Journee Therapie et Lecture.\n\nNom: ${data.nom}\nPrenom: ${data.prenom}\nSexe: ${data.sexeLabel}\nEmail: ${data.email}\nTelephone: ${data.phone}\nAdresse: ${data.address || "Non renseignee"}`;
  const url = `https://wa.me/${config.whatsappNumber || "212640215968"}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener");
}

function saveReservationLocal(data) {
  const reservations = getReservations();
  const existing = reservations.find((item) => item.email === data.email || item.phone === data.phone);
  if (existing) {
    return { status: "existing", data: existing, mode: "local" };
  }
  reservations.push(data);
  setReservations(reservations);
  return { status: "created", data, mode: "local" };
}

async function saveReservationRemote(data) {
  const client = createSupabaseClient();
  if (!client) {
    return saveReservationLocal(data);
  }

  const table = getConfig().reservationsTable || "reservations";
  const { data: existingRows, error: lookupError } = await client
    .from(table)
    .select("*")
    .or(`email.eq.${data.email},phone.eq.${data.phone}`)
    .limit(1);

  if (lookupError) {
    throw lookupError;
  }

  if (existingRows && existingRows.length) {
    return { status: "existing", data: existingRows[0], mode: "supabase" };
  }

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
    language: reservationLang()
  };

  const { data: insertedRows, error: insertError } = await client
    .from(table)
    .insert(payload)
    .select()
    .limit(1);

  if (insertError) {
    throw insertError;
  }

  const inserted = insertedRows?.[0] || payload;
  return {
    status: "created",
    mode: "supabase",
    data: {
      nom: inserted.nom,
      prenom: inserted.prenom,
      sexe: inserted.sexe,
      sexeLabel: inserted.sexe_label || getGenderLabel(inserted.sexe),
      email: inserted.email,
      phone: inserted.phone,
      address: inserted.address || "",
      reservedAt: inserted.reserved_at,
      eventName: inserted.event_name || data.eventName
    }
  };
}

async function ensurePosterDataUrl() {
  const response = await fetch("src/image/affiche.jpeg");
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function createTicketMarkup(data, posterDataUrl) {
  const lang = reservationLang();
  const copy = reservationTranslations[lang].reservation.pdf;
  const emptyAddress = lang === "ar" ? "غير مذكور" : "Non renseignee";

  return `
    <div class="reservation-ticket-render ${lang === "ar" ? "ticket-ar" : "ticket-fr"}">
      <div class="reservation-ticket-frame">
        <div class="reservation-ticket-header">
          <img class="reservation-ticket-poster" src="${posterDataUrl}" alt="Poster">
          <div class="reservation-ticket-copy">
            <p class="eyebrow">${copy.subtitle}</p>
            <h1 class="reservation-ticket-title">${copy.title}</h1>
            <p>${copy.intro}</p>
            <p>${copy.event}: ${data.eventName}</p>
          </div>
        </div>
        <div class="reservation-ticket-grid">
          <div class="reservation-ticket-item"><strong>${copy.name}</strong><span>${data.nom}</span></div>
          <div class="reservation-ticket-item"><strong>${copy.surname}</strong><span>${data.prenom}</span></div>
          <div class="reservation-ticket-item"><strong>${copy.gender}</strong><span>${data.sexeLabel}</span></div>
          <div class="reservation-ticket-item"><strong>${copy.date}</strong><span>${data.reservedAt}</span></div>
          <div class="reservation-ticket-item"><strong>${copy.email}</strong><span>${data.email}</span></div>
          <div class="reservation-ticket-item"><strong>${copy.phone}</strong><span>${data.phone}</span></div>
          <div class="reservation-ticket-item" style="grid-column: 1 / -1;"><strong>${copy.address}</strong><span>${data.address || emptyAddress}</span></div>
        </div>
        <div class="reservation-ticket-footer">${copy.footer}</div>
      </div>
    </div>
  `;
}

async function generateReservationPdf(data) {
  const { jsPDF } = window.jspdf;
  const posterDataUrl = await ensurePosterDataUrl();
  const wrapper = document.createElement("div");
  wrapper.innerHTML = createTicketMarkup(data, posterDataUrl);
  const ticketNode = wrapper.firstElementChild;
  document.body.appendChild(ticketNode);

  try {
    const canvas = await window.html2canvas(ticketNode, {
      scale: 2,
      backgroundColor: "#0b0907",
      useCORS: true
    });

    const imageData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min((pageWidth - 40) / canvas.width, (pageHeight - 40) / canvas.height);
    const renderWidth = canvas.width * ratio;
    const renderHeight = canvas.height * ratio;
    const x = (pageWidth - renderWidth) / 2;
    const y = 20;

    pdf.addImage(imageData, "PNG", x, y, renderWidth, renderHeight);

    const fileName = `reservation-${data.nom}-${data.prenom}.pdf`.replace(/\s+/g, "-").toLowerCase();
    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);

    reservationPdfCache = { blob, url, fileName, data };
    return reservationPdfCache;
  } finally {
    ticketNode.remove();
  }
}

function setPdfDownloadLink(pdfFile) {
  const link = document.getElementById("reservationPdfLink");
  if (!link || !pdfFile) return;
  link.href = pdfFile.url;
  link.download = pdfFile.fileName;
}

function openReservationModal(mode, data, pdfFile) {
  const modal = document.getElementById("reservationModal");
  if (!modal) return;

  const eyebrow = document.getElementById("reservationModalState");
  const title = document.getElementById("reservationModalTitle");
  const text = document.getElementById("reservationModalText");
  const whatsappButton = document.getElementById("reservationModalWhatsapp");

  eyebrow.textContent = reservationPick(`reservation.modal.${mode}Eyebrow`);
  title.textContent = reservationPick(`reservation.modal.${mode}Title`);
  text.textContent = reservationPick(`reservation.modal.${mode}Text`);
  setPdfDownloadLink(pdfFile);
  whatsappButton.onclick = () => openWhatsApp(data);

  modal.hidden = false;
  document.body.classList.add("gate-open");
}

function closeReservationModal() {
  const modal = document.getElementById("reservationModal");
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("gate-open");
}

function wireReservationFieldValidation() {
  const fields = document.querySelectorAll("#reservation-form [data-res-field]");
  fields.forEach((field) => {
    field.addEventListener("input", () => markReservationField(field));
    field.addEventListener("change", () => markReservationField(field));
  });
}

function bindModalEvents() {
  document.querySelectorAll("[data-close-reservation-modal]").forEach((node) => {
    node.addEventListener("click", closeReservationModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeReservationModal();
    }
  });
}

async function handleReservationSubmission(options = {}) {
  const formData = validateReservationForm();
  if (!formData) return;

  const confirmButton = document.getElementById("confirmReservation");
  const whatsappButton = document.getElementById("whatsappReservation");
  const usedLocalMode = !createSupabaseClient();

  showReservationFeedback("saving", "success");
  confirmButton.disabled = true;
  whatsappButton.disabled = true;

  try {
    const result = await saveReservationRemote(formData);
    const normalizedData = {
      nom: result.data.nom,
      prenom: result.data.prenom,
      sexe: result.data.sexe,
      sexeLabel: result.data.sexeLabel || result.data.sexe_label || getGenderLabel(result.data.sexe),
      email: result.data.email,
      phone: result.data.phone,
      address: result.data.address || "",
      reservedAt: result.data.reservedAt || result.data.reserved_at || formData.reservedAt,
      eventName: result.data.eventName || result.data.event_name || formData.eventName
    };

    const pdfFile = await generateReservationPdf(normalizedData);
    const modalMode = result.status === "existing" ? "existing" : "success";
    showReservationFeedback(result.status === "existing" ? "duplicate" : "stored", result.status === "existing" ? "error" : "success");
    if (usedLocalMode) {
      showReservationFeedback("localMode", "success");
    }
    openReservationModal(modalMode, normalizedData, pdfFile);

    if (options.openWhatsapp) {
      openWhatsApp(normalizedData);
      showReservationFeedback("whatsapp", "success");
    }
  } catch (error) {
    console.error(error);
    showReservationFeedback("saveError", "error");
  } finally {
    confirmButton.disabled = false;
    whatsappButton.disabled = false;
  }
}

function setupReservationForm() {
  const form = document.getElementById("reservation-form");
  const whatsappButton = document.getElementById("whatsappReservation");
  const confirmButton = document.getElementById("confirmReservation");
  if (!form || !whatsappButton || !confirmButton) return;

  wireReservationFieldValidation();
  bindModalEvents();

  whatsappButton.addEventListener("click", () => handleReservationSubmission({ openWhatsapp: true }));
  confirmButton.addEventListener("click", () => handleReservationSubmission({ openWhatsapp: false }));
}

function setupReservationLanguageBridge() {
  applyReservationTranslations();
  const button = document.querySelector(".lang-switch");
  if (button) {
    button.addEventListener("click", () => {
      window.setTimeout(() => {
        applyReservationTranslations();
        if (reservationPdfCache?.data) {
          generateReservationPdf(reservationPdfCache.data).then(setPdfDownloadLink).catch(() => {});
        }
      }, 20);
    });
  }
}

setupReservationLanguageBridge();
setupReservationForm();
