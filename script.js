// SECTION: Utility - DOM helpers
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// SECTION: Data - category & generator definitions
const QR_TYPES = {
  url: {
    label: "Website URL",
    description: "Open a website, landing page or online store.",
    buildPayload: ({ url }) => url,
    validate: ({ url }) => {
      if (!url || !url.trim()) return "Enter a website URL.";
      if (!/^https?:\/\//i.test(url.trim())) return "Include http:// or https:// in your URL.";
      return null;
    },
    fields: [
      {
        id: "url",
        label: "Website URL",
        type: "url",
        placeholder: "https://artvizual.com",
        required: true,
      },
    ],
  },
  text: {
    label: "Plain text",
    description: "Display any short block of text when scanned.",
    buildPayload: ({ text }) => text,
    validate: ({ text }) => (!text || !text.trim() ? "Enter some text for your QR code." : null),
    fields: [
      {
        id: "text",
        label: "Text",
        type: "textarea",
        placeholder: "Thank you for visiting our event!",
        required: true,
      },
    ],
  },
  email: {
    label: "Email",
    description: "Open a new email draft.",
    buildPayload: ({ email, subject, body }) => {
      const params = new URLSearchParams();
      if (subject) params.set("subject", subject);
      if (body) params.set("body", body);
      return `mailto:${email}?${params.toString()}`;
    },
    validate: ({ email }) => {
      if (!email || !email.trim()) return "Enter an email address.";
      const simple = /.+@.+\..+/;
      if (!simple.test(email.trim())) return "Enter a valid email address.";
      return null;
    },
    fields: [
      { id: "email", label: "Email address", type: "email", placeholder: "hello@yourbrand.com", required: true },
      { id: "subject", label: "Subject (optional)", type: "text", placeholder: "Quick question" },
      { id: "body", label: "Message (optional)", type: "textarea", placeholder: "Hi, I found you via your QR code..." },
    ],
  },
  phone: {
    label: "Phone number",
    description: "Start a phone call.",
    buildPayload: ({ phone }) => `tel:${phone}`,
    validate: ({ phone }) => (!phone || !phone.trim() ? "Enter a phone number." : null),
    fields: [{ id: "phone", label: "Phone number", type: "tel", placeholder: "+1 555 123 4567", required: true }],
  },
  sms: {
    label: "SMS",
    description: "Compose a text message.",
    buildPayload: ({ phone, message }) => {
      const encoded = encodeURIComponent(message || "");
      return `sms:${phone}?&body=${encoded}`;
    },
    validate: ({ phone }) => (!phone || !phone.trim() ? "Enter a phone number for the SMS." : null),
    fields: [
      { id: "phone", label: "Recipient phone number", type: "tel", placeholder: "+1 555 123 4567", required: true },
      { id: "message", label: "Message (optional)", type: "textarea", placeholder: "Thanks for visiting our event!" },
    ],
  },
  wifi: {
    label: "Wi‑Fi credentials",
    description: "Share secure Wi‑Fi access.",
    buildPayload: ({ ssid, password, encryption, hidden }) => {
      const enc = encryption || "WPA";
      const hiddenFlag = hidden ? "H:true;" : "";
      return `WIFI:T:${enc};S:${ssid};P:${password};${hiddenFlag};`;
    },
    validate: ({ ssid }) => (!ssid || !ssid.trim() ? "Enter your Wi‑Fi network name (SSID)." : null),
    fields: [
      { id: "ssid", label: "Network name (SSID)", type: "text", placeholder: "Artvizual Studio", required: true },
      { id: "password", label: "Password", type: "text", placeholder: "Your Wi‑Fi password" },
      {
        id: "encryption",
        label: "Security",
        type: "select",
        options: [
          { value: "WPA", label: "WPA/WPA2" },
          { value: "WEP", label: "WEP" },
          { value: "nopass", label: "No password" },
        ],
      },
      { id: "hidden", label: "Hidden network", type: "checkbox" },
    ],
  },
  vcard: {
    label: "Contact card (vCard)",
    description: "Share a digital contact card.",
    buildPayload: ({ firstName, lastName, phone, email, company, title, website }) => {
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${lastName || ""};${firstName || ""};;;`,
        `FN:${[firstName, lastName].filter(Boolean).join(" ")}`,
      ];
      if (company) lines.push(`ORG:${company}`);
      if (title) lines.push(`TITLE:${title}`);
      if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
      if (email) lines.push(`EMAIL:${email}`);
      if (website) lines.push(`URL:${website}`);
      lines.push("END:VCARD");
      return lines.join("\n");
    },
    validate: ({ firstName, lastName }) =>
      !firstName && !lastName ? "Enter at least a first or last name for the contact." : null,
    fields: [
      { id: "firstName", label: "First name", type: "text", placeholder: "Alex" },
      { id: "lastName", label: "Last name", type: "text", placeholder: "Rivera" },
      { id: "phone", label: "Phone", type: "tel", placeholder: "+1 555 123 4567" },
      { id: "email", label: "Email", type: "email", placeholder: "hello@company.com" },
      { id: "company", label: "Company", type: "text", placeholder: "Artvizual" },
      { id: "title", label: "Job title", type: "text", placeholder: "Creative Director" },
      { id: "website", label: "Website", type: "url", placeholder: "https://artvizual.com" },
    ],
  },
  whatsapp: {
    label: "WhatsApp",
    description: "Start a WhatsApp chat.",
    buildPayload: ({ phone, message }) => {
      const base = "https://wa.me/" + phone.replace(/[^0-9]/g, "");
      if (!message) return base;
      return `${base}?text=${encodeURIComponent(message)}`;
    },
    validate: ({ phone }) => (!phone || !phone.trim() ? "Enter a phone number with country code." : null),
    fields: [
      { id: "phone", label: "Phone with country code", type: "tel", placeholder: "15551234567", required: true },
      { id: "message", label: "Pre-filled message (optional)", type: "textarea", placeholder: "Hi, I found your QR code..." },
    ],
  },
  youtube: {
    label: "YouTube",
    description: "Link to a YouTube video, Short or channel.",
    buildPayload: ({ url }) => url,
    validate: ({ url }) => (!url || !url.trim() ? "Enter a YouTube URL." : null),
    fields: [
      { id: "url", label: "YouTube URL", type: "url", placeholder: "https://youtube.com/watch?v=...", required: true },
    ],
  },
  instagram: {
    label: "Instagram",
    description: "Send scanners to your Instagram profile or post.",
    buildPayload: ({ url }) => url,
    validate: ({ url }) => (!url || !url.trim() ? "Enter an Instagram URL." : null),
    fields: [
      { id: "url", label: "Instagram URL", type: "url", placeholder: "https://instagram.com/yourprofile", required: true },
    ],
  },
  spotify: {
    label: "Spotify / music",
    description: "Share a track, album, artist or playlist.",
    buildPayload: ({ url }) => url,
    validate: ({ url }) => (!url || !url.trim() ? "Enter a Spotify or music link URL." : null),
    fields: [
      {
        id: "url",
        label: "Spotify or music URL",
        type: "url",
        placeholder: "https://open.spotify.com/track/...",
        required: true,
      },
    ],
  },
  maps: {
    label: "Google Maps location",
    description: "Share a pinned location or address.",
    buildPayload: ({ url }) => url,
    validate: ({ url }) => (!url || !url.trim() ? "Paste a Google Maps share URL." : null),
    fields: [
      {
        id: "url",
        label: "Google Maps URL",
        type: "url",
        placeholder: "https://maps.app.goo.gl/...",
        required: true,
      },
    ],
  },
  event: {
    label: "Event details",
    description: "Add a calendar event (ICS text).",
    buildPayload: ({ title, location, start, end, description }) => {
      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `SUMMARY:${title}`,
      ];
      if (location) lines.push(`LOCATION:${location}`);
      if (start) lines.push(`DTSTART:${start.replace(/[-:]/g, "").split(".")[0]}Z`);
      if (end) lines.push(`DTEND:${end.replace(/[-:]/g, "").split(".")[0]}Z`);
      if (description) lines.push(`DESCRIPTION:${description}`);
      lines.push("END:VEVENT", "END:VCALENDAR");
      return lines.join("\n");
    },
    validate: ({ title }) => (!title || !title.trim() ? "Enter an event title." : null),
    fields: [
      { id: "title", label: "Event title", type: "text", placeholder: "Artvizual launch party", required: true },
      { id: "location", label: "Location", type: "text", placeholder: "Studio address or venue" },
      { id: "start", label: "Start (UTC, optional)", type: "datetime-local" },
      { id: "end", label: "End (UTC, optional)", type: "datetime-local" },
      { id: "description", label: "Description (optional)", type: "textarea", placeholder: "Join us for..." },
    ],
  },
};

// Categories (24) mapping to primary qrType + description
const CATEGORY_CONFIGS = [
  { id: "website", icon: "🌐", title: "Website QR Code Generator", description: "Turn any URL into a QR code for print, packaging or screens.", qrType: "url" },
  { id: "music", icon: "🎵", title: "Music QR Code Generator", description: "Share music links to Spotify, Apple Music or more.", qrType: "spotify" },
  { id: "spotify", icon: "🎧", title: "Spotify QR Code Generator", description: "Link directly to tracks, albums or playlists.", qrType: "spotify" },
  { id: "youtube", icon: "▶️", title: "YouTube QR Code Generator", description: "Promote YouTube videos, Shorts or channels.", qrType: "youtube" },
  { id: "instagram", icon: "📸", title: "Instagram QR Code Generator", description: "Send people straight to your Instagram profile.", qrType: "instagram" },
  { id: "social", icon: "👥", title: "Social Media QR Code Generator", description: "Connect people to your social profiles in a tap.", qrType: "url" },
  { id: "wedding", icon: "💍", title: "Wedding QR Code Generator", description: "Share RSVPs, schedules, gift lists and more.", qrType: "url" },
  { id: "event", icon: "🎫", title: "Event QR Code Generator", description: "Add events to guests' calendars in one scan.", qrType: "event" },
  { id: "restaurant", icon: "🍽️", title: "Restaurant Menu QR Code Generator", description: "Link guests to digital menus and ordering.", qrType: "url" },
  { id: "business", icon: "💼", title: "Business QR Code Generator", description: "Connect customers to websites, booking and more.", qrType: "url" },
  { id: "wifi", icon: "📶", title: "Wi‑Fi QR Code Generator", description: "Share secure Wi‑Fi credentials without typing.", qrType: "wifi" },
  { id: "email", icon: "✉️", title: "Email QR Code Generator", description: "Open a pre‑addressed email with one scan.", qrType: "email" },
  { id: "whatsapp", icon: "💬", title: "WhatsApp QR Code Generator", description: "Start a WhatsApp conversation instantly.", qrType: "whatsapp" },
  { id: "contact", icon: "📇", title: "Contact Card QR Code Generator", description: "Share full contact details as a vCard.", qrType: "vcard" },
  { id: "maps", icon: "📍", title: "Google Maps QR Code Generator", description: "Guide people to venues, stores and events.", qrType: "maps" },
  { id: "book", icon: "📚", title: "Book and Author QR Code Generator", description: "Link readers to author pages, reviews or extras.", qrType: "url" },
  { id: "real-estate", icon: "🏡", title: "Real Estate QR Code Generator", description: "Connect property signs to full listings.", qrType: "url" },
  { id: "travel", icon: "✈️", title: "Travel QR Code Generator", description: "Share itineraries, guides and booking pages.", qrType: "url" },
  { id: "charity", icon: "❤️", title: "Charity & Fundraising QR Code Generator", description: "Link donors directly to secure donation pages.", qrType: "url" },
  { id: "gift", icon: "🎁", title: "Gift & Birthday QR Code Generator", description: "Add videos, playlists or wishlists to gifts.", qrType: "url" },
  { id: "product", icon: "📦", title: "Product QR Code Generator", description: "Connect packaging to manuals, stories or offers.", qrType: "url" },
  { id: "digital-card", icon: "🪪", title: "Digital Business Card QR Code Generator", description: "Share a vCard or link to your online profile.", qrType: "vcard" },
  { id: "pdf", icon: "📄", title: "PDF QR Code Generator", description: "Link to hosted PDFs such as menus or brochures.", qrType: "url" },
  { id: "app", icon: "📱", title: "App Download QR Code Generator", description: "Send users to your app store listing or page.", qrType: "url" },
];

// SECTION: State
let currentTypeKey = "url";
let lastGeneratedDataUrl = null;
let lastGeneratedSvg = null;

// SECTION: Dynamic field rendering
function renderFieldsForType(typeKey) {
  const typeConfig = QR_TYPES[typeKey];
  const container = $("#qr-dynamic-fields");
  container.innerHTML = "";
  if (!typeConfig) return;

  typeConfig.fields.forEach((field) => {
    const group = document.createElement("div");
    group.className = "field-group";

    const label = document.createElement("label");
    label.className = "field-label";
    label.setAttribute("for", `field-${field.id}`);
    label.textContent = field.label;

    let input;
    if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.className = "field-input";
    } else if (field.type === "select") {
      input = document.createElement("select");
      input.className = "field-input";
      (field.options || []).forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        input.appendChild(option);
      });
    } else if (field.type === "checkbox") {
      group.classList.add("field-group--inline");
      input = document.createElement("input");
      input.type = "checkbox";
      input.className = "field-input-checkbox";
      label.prepend(input);
      container.appendChild(label);
      return;
    } else {
      input = document.createElement("input");
      input.type = field.type || "text";
      input.className = "field-input";
    }

    input.id = `field-${field.id}`;
    input.name = field.id;
    if (field.placeholder) input.placeholder = field.placeholder;
    if (field.required) input.required = true;

    group.appendChild(label);
    group.appendChild(input);
    container.appendChild(group);
  });
}

// SECTION: Value collection and validation
function collectFieldValues(typeKey) {
  const typeConfig = QR_TYPES[typeKey];
  const values = {};
  if (!typeConfig) return values;

  typeConfig.fields.forEach((field) => {
    if (field.type === "checkbox") {
      const input = document.querySelector(`label[for='field-${field.id}'] input`);
      values[field.id] = input ? input.checked : false;
    } else {
      const el = $(`#field-${field.id}`);
      values[field.id] = el ? el.value.trim() : "";
    }
  });
  return values;
}

// SECTION: QR generation core
async function generateQr({ text, size, fgColor, bgColor, errorCorrectionLevel }) {
  // Guard if QRCode library is not available
  if (typeof window.QRCode === "undefined") {
    console.error("QRCode library not loaded");
    const canvasContainer = document.getElementById("qr-preview");
    if (canvasContainer) {
      canvasContainer.innerHTML = '<div class="preview-placeholder"><p>QR library failed to load. Check your connection and reload the page.</p></div>';
    }
    return;
  }
  const canvasContainer = $("#qr-preview");
  canvasContainer.innerHTML = "";

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  canvasContainer.appendChild(canvas);

  const options = {
    errorCorrectionLevel,
    margin: 2,
    width: size,
    color: {
      dark: fgColor,
      light: bgColor,
    },
  };

  try {
    await window.QRCode.toCanvas(canvas, text, options);
    lastGeneratedDataUrl = canvas.toDataURL("image/png");
    try {
      lastGeneratedSvg = await window.QRCode.toString(text, { ...options, type: "svg" });
    } catch (svgErr) {
      lastGeneratedSvg = null;
    }
    $("#download-png-btn").disabled = false;
    $("#download-svg-btn").disabled = !lastGeneratedSvg;
  } catch (err) {
    console.error("QR generation error", err);
    canvasContainer.innerHTML = '<div class="preview-placeholder"><p>There was a problem creating your QR code. Please try again.</p></div>';
    $("#download-png-btn").disabled = true;
    $("#download-svg-btn").disabled = true;
  }
}

// SECTION: Download helpers
function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadSvg(svgString, filename) {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  URL.revokeObjectURL(url);
}

// SECTION: Category grid rendering
function renderCategoryGrid() {
  const grid = document.getElementById("category-grid");
  if (!grid) return;
  grid.innerHTML = "";

  CATEGORY_CONFIGS.forEach((cat) => {
    const card = document.createElement("a");
    card.className = "card card--link";
    card.href = `#generator-${cat.id}`;
    card.setAttribute("data-category-id", cat.id);

    const icon = document.createElement("div");
    icon.className = "card-icon";
    icon.textContent = cat.icon;

    const title = document.createElement("h3");
    title.textContent = cat.title;

    const desc = document.createElement("p");
    desc.textContent = cat.description;

    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(desc);
    grid.appendChild(card);
  });
}

// SECTION: Specialized generator views
function renderGeneratorViews() {
  const container = document.getElementById("generator-views");
  if (!container) return;
  container.innerHTML = "";

  // Choose a subset for richer SEO-style content
  const importantIds = [
    "website",
    "wifi",
    "business",
    "music",
    "event",
    "instagram",
    "youtube",
    "whatsapp",
  ];

  importantIds.forEach((id) => {
    const cat = CATEGORY_CONFIGS.find((c) => c.id === id);
    if (!cat) return;

    const card = document.createElement("article");
    card.className = "generator-view-card";
    card.id = `generator-${cat.id}`;

    const header = document.createElement("div");
    header.className = "generator-view-header";

    const title = document.createElement("h3");
    title.textContent = cat.title;

    const meta = document.createElement("div");
    meta.className = "generator-view-meta";
    meta.textContent = cat.description;

    const actions = document.createElement("div");
    actions.className = "generator-view-actions";

    const useBtn = document.createElement("button");
    useBtn.type = "button";
    useBtn.className = "btn btn--secondary";
    useBtn.textContent = "Load in main generator";
    useBtn.addEventListener("click", () => {
      const select = document.getElementById("qr-type");
      if (select && QR_TYPES[cat.qrType]) {
        select.value = cat.qrType;
        handleTypeChange();
        window.scrollTo({
          top: document.querySelector(".hero-generator").offsetTop - 80,
          behavior: "smooth",
        });
      }
    });

    const link = document.createElement("a");
    link.href = "#top";
    link.className = "btn btn--tertiary";
    link.textContent = "Back to general generator";

    header.appendChild(title);
    header.appendChild(meta);
    actions.appendChild(useBtn);
    actions.appendChild(link);
    card.appendChild(header);
    card.appendChild(actions);
    container.appendChild(card);
  });
}

// SECTION: Event handlers
function handleTypeChange() {
  const select = document.getElementById("qr-type");
  if (!select) return;
  currentTypeKey = select.value;
  renderFieldsForType(currentTypeKey);
  $("#form-error").textContent = "";
}

function handleFormSubmit(event) {
  event.preventDefault();
  const errorEl = $("#form-error");
  errorEl.textContent = "";

  const typeConfig = QR_TYPES[currentTypeKey];
  if (!typeConfig) {
    errorEl.textContent = "Select a QR code type to continue.";
    return;
  }

  const fieldValues = collectFieldValues(currentTypeKey);
  const validationError = typeConfig.validate(fieldValues);
  if (validationError) {
    errorEl.textContent = validationError;
    return;
  }

  const payload = typeConfig.buildPayload(fieldValues);
  if (!payload) {
    errorEl.textContent = "Could not build QR code content. Please check your fields.";
    return;
  }

  const sizeInput = document.getElementById("qr-size");
  const fgColor = document.getElementById("fg-color").value || "#000000";
  const bgColor = document.getElementById("bg-color").value || "#ffffff";
  const ecc = document.getElementById("qr-ecc").value || "M";
  const size = Math.min(Math.max(parseInt(sizeInput.value, 10) || 320, 128), 1024);

  sizeInput.value = size;

  generateQr({ text: payload, size, fgColor, bgColor, errorCorrectionLevel: ecc });
}

function handleClear() {
  const dynamic = document.getElementById("qr-dynamic-fields");
  if (dynamic) {
    const inputs = dynamic.querySelectorAll("input, textarea, select");
    inputs.forEach((el) => {
      if (el.type === "checkbox") {
        el.checked = false;
      } else {
        el.value = "";
      }
    });
  }
  const preview = document.getElementById("qr-preview");
  if (preview) {
    preview.innerHTML = '<div class="preview-placeholder"><p>Fill in your details and generate your QR code.</p></div>';
  }
  document.getElementById("form-error").textContent = "";
  lastGeneratedDataUrl = null;
  lastGeneratedSvg = null;
  document.getElementById("download-png-btn").disabled = true;
  document.getElementById("download-svg-btn").disabled = true;
}

function handleDownloadPng() {
  if (!lastGeneratedDataUrl) return;
  downloadDataUrl(lastGeneratedDataUrl, "artvizual-qr-code.png");
}

function handleDownloadSvg() {
  if (!lastGeneratedSvg) return;
  downloadSvg(lastGeneratedSvg, "artvizual-qr-code.svg");
}

// SECTION: Initialization
function init() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  renderCategoryGrid();
  renderGeneratorViews();

  const typeSelect = document.getElementById("qr-type");
  if (typeSelect) {
    typeSelect.addEventListener("change", handleTypeChange);
    renderFieldsForType(typeSelect.value);
  }

  const form = document.getElementById("qr-form");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }

  const clearBtn = document.getElementById("clear-btn");
  if (clearBtn) clearBtn.addEventListener("click", handleClear);

  const downloadPngBtn = document.getElementById("download-png-btn");
  if (downloadPngBtn) downloadPngBtn.addEventListener("click", handleDownloadPng);

  const downloadSvgBtn = document.getElementById("download-svg-btn");
  if (downloadSvgBtn) downloadSvgBtn.addEventListener("click", handleDownloadSvg);
}

window.addEventListener("DOMContentLoaded", init);
