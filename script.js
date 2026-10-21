// SECTION: Utility - DOM helpers
const $ = (selector) => document.querySelector(selector);

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
      { id: "url", label: "Website URL", type: "url", placeholder: "https://artvizual.com", required: true },
    ],
  },
  text: {
    label: "Plain text",
    description: "Display any short block of text when scanned.",
    buildPayload: ({ text }) => text,
    validate: ({ text }) => (!text || !text.trim() ? "Enter some text for your QR code." : null),
    fields: [{ id: "text", label: "Text", type: "textarea", placeholder: "Thank you for visiting our event!", required: true }],
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
    buildPayload: ({ phone, message }) => `sms:${phone}?&body=${encodeURIComponent(message || "")}`,
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
      { id: "encryption", label: "Security", type: "select", options: [{ value: "WPA", label: "WPA/WPA2" }, { value: "WEP", label: "WEP" }, { value: "nopass", label: "No password" }] },
      { id: "hidden", label: "Hidden network", type: "checkbox" },
    ],
  },
  vcard: {
    label: "Contact card (vCard)",
    description: "Share a digital contact card.",
    buildPayload: ({ firstName, lastName, phone, email, company, title, website }) => {
      const lines = ["BEGIN:VCARD", "VERSION:3.0", `N:${lastName || ""};${firstName || ""};;;`, `FN:${[firstName, lastName].filter(Boolean).join(" ")}`];
      if (company) lines.push(`ORG:${company}`);
      if (title) lines.push(`TITLE:${title}`);
      if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
      if (email) lines.push(`EMAIL:${email}`);
      if (website) lines.push(`URL:${website}`);
      lines.push("END:VCARD");
      return lines.join("\n");
    },
    validate: ({ firstName, lastName }) => (!firstName && !lastName ? "Enter at least a first or last name for the contact." : null),
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
      return message ? `${base}?text=${encodeURIComponent(message)}` : base;
    },
    validate: ({ phone }) => (!phone || !phone.trim() ? "Enter a phone number with country code." : null),
    fields: [
      { id: "phone", label: "Phone with country code", type: "tel", placeholder: "15551234567", required: true },
      { id: "message", label: "Pre-filled message (optional)", type: "textarea", placeholder: "Hi, I found your QR code..." },
    ],
  },
  youtube: { label: "YouTube", description: "Link to a YouTube video.", buildPayload: ({ url }) => url, validate: ({ url }) => (!url ? "Enter a YouTube URL." : null), fields: [{ id: "url", label: "YouTube URL", type: "url", placeholder: "https://youtube.com/watch?v=...", required: true }] },
  instagram: { label: "Instagram", description: "Send scanners to Instagram.", buildPayload: ({ url }) => url, validate: ({ url }) => (!url ? "Enter an Instagram URL." : null), fields: [{ id: "url", label: "Instagram URL", type: "url", placeholder: "https://instagram.com/yourprofile", required: true }] },
  spotify: { label: "Spotify", description: "Share a track or playlist.", buildPayload: ({ url }) => url, validate: ({ url }) => (!url ? "Enter a Spotify link." : null), fields: [{ id: "url", label: "Spotify URL", type: "url", placeholder: "https://open.spotify.com/track/...", required: true }] },
  maps: { label: "Google Maps", description: "Share a pinned location.", buildPayload: ({ url }) => url, validate: ({ url }) => (!url ? "Paste a Google Maps URL." : null), fields: [{ id: "url", label: "Google Maps URL", type: "url", placeholder: "https://maps.app.goo.gl/...", required: true }] },
  event: {
    label: "Event details",
    description: "Add a calendar event.",
    buildPayload: ({ title, location, start, end, description }) => {
      const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", `SUMMARY:${title}`];
      if (location) lines.push(`LOCATION:${location}`);
      if (start) lines.push(`DTSTART:${start.replace(/[-:]/g, "").split(".")[0]}Z`);
      if (end) lines.push(`DTEND:${end.replace(/[-:]/g, "").split(".")[0]}Z`);
      if (description) lines.push(`DESCRIPTION:${description}`);
      lines.push("END:VEVENT", "END:VCALENDAR");
      return lines.join("\n");
    },
    validate: ({ title }) => (!title ? "Enter an event title." : null),
    fields: [
      { id: "title", label: "Event title", type: "text", placeholder: "Artvizual launch party", required: true },
      { id: "location", label: "Location", type: "text", placeholder: "Studio address" },
      { id: "start", label: "Start (UTC)", type: "datetime-local" },
      { id: "end", label: "End (UTC)", type: "datetime-local" },
      { id: "description", label: "Description", type: "textarea", placeholder: "Join us for..." },
    ],
  },
};

const CATEGORY_CONFIGS = [
  { id: "website", icon: "🌐", title: "Website QR Code", description: "Turn any URL into a QR code.", qrType: "url" },
  { id: "music", icon: "🎵", title: "Music QR Code", description: "Share music links.", qrType: "spotify" },
  { id: "spotify", icon: "🎧", title: "Spotify QR Code", description: "Link to playlists.", qrType: "spotify" },
  { id: "youtube", icon: "▶️", title: "YouTube QR Code", description: "Promote videos.", qrType: "youtube" },
  { id: "instagram", icon: "📸", title: "Instagram QR Code", description: "Link to profile.", qrType: "instagram" },
  { id: "business", icon: "💼", title: "Business QR Code", description: "Connect customers.", qrType: "url" },
  { id: "wifi", icon: "📶", title: "Wi‑Fi QR Code", description: "Share Wi‑Fi credentials.", qrType: "wifi" },
  { id: "whatsapp", icon: "💬", title: "WhatsApp QR Code", description: "Start a conversation.", qrType: "whatsapp" },
  { id: "event", icon: "🎫", title: "Event QR Code", description: "Add to calendars.", qrType: "event" },
  { id: "maps", icon: "📍", title: "Maps QR Code", description: "Guide people to venues.", qrType: "maps" },
];

let currentTypeKey = "url";
let lastGeneratedDataUrl = null;
let lastGeneratedSvg = null;

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
      input = document.createElement("input");
      input.type = "checkbox";
      label.prepend(input);
      group.appendChild(label);
      container.appendChild(group);
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

// ADDED FALLBACK: Function to dynamically load the QR library if it's missing
function loadQRScript(callback) {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js";
  script.onload = callback;
  script.onerror = () => {
    $("#qr-preview").innerHTML = '<div class="preview-placeholder"><p>QR library failed to load. Please check your internet connection and refresh.</p></div>';
  };
  document.head.appendChild(script);
}

async function generateQr({ text, size, fgColor, bgColor, errorCorrectionLevel }) {
  
  // If library isn't loaded, trigger the fallback loader!
  if (typeof window.QRCode === "undefined") {
    console.log("QRCode library missing. Forcing manual load...");
    $("#qr-preview").innerHTML = '<div class="preview-placeholder"><p>Loading QR library... please wait.</p></div>';
    
    loadQRScript(() => {
      // Once it loads, call this function again with the same data
      generateQr({ text, size, fgColor, bgColor, errorCorrectionLevel });
    });
    return; 
  }
  
  // If we get here, the library is successfully loaded.
  const canvasContainer = $("#qr-preview");
  canvasContainer.innerHTML = "";

  const canvas = document.createElement("canvas");
  canvasContainer.appendChild(canvas);

  const options = { errorCorrectionLevel, margin: 2, width: size, color: { dark: fgColor, light: bgColor } };

  try {
    // Wrap text in String() so the library doesn't crash
    await window.QRCode.toCanvas(canvas, String(text), options);
    
    lastGeneratedDataUrl = canvas.toDataURL("image/png");
    try {
      lastGeneratedSvg = await window.QRCode.toString(String(text), { ...options, type: "svg" });
    } catch (svgErr) {
      lastGeneratedSvg = null;
    }
    $("#download-png-btn").disabled = false;
    $("#download-svg-btn").disabled = !lastGeneratedSvg;
  } catch (err) {
    console.error(err);
    canvasContainer.innerHTML = '<div class="preview-placeholder"><p>Error generating QR code.</p></div>';
  }
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function renderCategoryGrid() {
  const grid = document.getElementById("category-grid");
  if (!grid) return;
  grid.innerHTML = "";
  CATEGORY_CONFIGS.forEach((cat) => {
    const card = document.createElement("a");
    card.className = "card card--link";
    card.href = `#generator-${cat.id}`;
    card.innerHTML = `<div class="card-icon">${cat.icon}</div><h3>${cat.title}</h3><p>${cat.description}</p>`;
    grid.appendChild(card);
  });
}

function renderGeneratorViews() {
  const container = document.getElementById("generator-views");
  if (!container) return;
  container.innerHTML = "";

  ["website", "wifi", "business", "music", "event", "instagram", "youtube", "whatsapp"].forEach((id) => {
    const cat = CATEGORY_CONFIGS.find((c) => c.id === id);
    if (!cat) return;

    const card = document.createElement("article");
    card.className = "generator-view-card";
    card.id = `generator-${cat.id}`;
    card.innerHTML = `
      <div class="generator-view-header">
        <h3>${cat.title}</h3>
        <div class="generator-view-meta">${cat.description}</div>
      </div>
      <div class="generator-view-actions">
        <button type="button" class="btn btn--secondary">Load in main generator</button>
      </div>
    `;

    card.querySelector("button").addEventListener("click", () => {
      const select = document.getElementById("qr-type");
      if (select && QR_TYPES[cat.qrType]) {
        select.value = cat.qrType;
        handleTypeChange();
        window.scrollTo({ top: document.querySelector(".hero-generator").offsetTop - 80, behavior: "smooth" });
      }
    });

    container.appendChild(card);
  });
}

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
  if (!typeConfig) return;

  const fieldValues = collectFieldValues(currentTypeKey);
  const validationError = typeConfig.validate(fieldValues);
  if (validationError) {
    errorEl.textContent = validationError;
    return;
  }

  const payload = typeConfig.buildPayload(fieldValues);
  const size = Math.min(Math.max(parseInt(document.getElementById("qr-size").value, 10) || 320, 128), 1024);
  
  generateQr({
    text: payload,
    size: size,
    fgColor: document.getElementById("fg-color").value || "#000000",
    bgColor: document.getElementById("bg-color").value || "#ffffff",
    errorCorrectionLevel: document.getElementById("qr-ecc").value || "M"
  });
}

function handleClear() {
  const inputs = document.querySelectorAll("#qr-dynamic-fields input, #qr-dynamic-fields textarea, #qr-dynamic-fields select");
  inputs.forEach((el) => (el.type === "checkbox" ? (el.checked = false) : (el.value = "")));
  document.getElementById("qr-preview").innerHTML = '<div class="preview-placeholder"><p>Fill in your details and generate your QR code.</p></div>';
  document.getElementById("form-error").textContent = "";
  lastGeneratedDataUrl = null;
  lastGeneratedSvg = null;
  document.getElementById("download-png-btn").disabled = true;
  document.getElementById("download-svg-btn").disabled = true;
}

function init() {
  document.getElementById("year").textContent = new Date().getFullYear();
  renderCategoryGrid();
  renderGeneratorViews();

  const typeSelect = document.getElementById("qr-type");
  if (typeSelect) {
    typeSelect.addEventListener("change", handleTypeChange);
    renderFieldsForType(typeSelect.value);
  }

  document.getElementById("qr-form")?.addEventListener("submit", handleFormSubmit);
  document.getElementById("clear-btn")?.addEventListener("click", handleClear);
  
  document.getElementById("download-png-btn")?.addEventListener("click", () => {
    if (lastGeneratedDataUrl) downloadDataUrl(lastGeneratedDataUrl, "qr-code.png");
  });
  
  document.getElementById("download-svg-btn")?.addEventListener("click", () => {
    if (lastGeneratedSvg) {
      const blob = new Blob([lastGeneratedSvg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      downloadDataUrl(url, "qr-code.svg");
      URL.revokeObjectURL(url);
    }
  });
}

window.addEventListener("DOMContentLoaded", init);
