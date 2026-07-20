// Service worker for English Language Converter Chrome Extension
// Handles cross-origin requests, session sync, and translation batching

const DEV_API_URL = "http://localhost:3000";
const PROD_API_URL = "https://retailstacker.com";

// Helper to handle fetch responses safely
async function safeFetchJson(url, options) {
  const res = await fetch(url, options);
  const contentType = res.headers.get("content-type") || "";
  
  if (!res.ok) {
    let errDetail = "";
    try {
      if (contentType.includes("application/json")) {
        const errJson = await res.json();
        errDetail = errJson.error || errJson.message || `HTTP ${res.status}`;
      } else {
        const text = await res.text();
        errDetail = `HTTP ${res.status}: ${text.slice(0, 250)}`;
      }
    } catch (e) {
      errDetail = `HTTP ${res.status} (${res.statusText})`;
    }
    throw new Error(errDetail);
  }

  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(`Invalid response format: ${text.slice(0, 250)}`);
  }

  return await res.json();
}

async function getApiUrl() {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1000);
    const res = await fetch(`${DEV_API_URL}/api/extension/auth/me`, { 
      method: "HEAD",
      signal: controller.signal
    });
    clearTimeout(id);
    if (res.ok || res.status === 401) {
      return DEV_API_URL;
    }
  } catch (e) {
    // dev server offline
  }
  return PROD_API_URL;
}

// Translate batch of text using Google Translate free API
async function translateBatch(texts, targetLang = "en") {
  if (texts.length === 0) return [];

  // Group into batches to stay under URL size limit (~1800 chars)
  const batches = [];
  let currentBatch = [];
  let currentLength = 0;

  for (const text of texts) {
    const cleanText = text.trim();
    if (!cleanText) {
      currentBatch.push("");
      continue;
    }
    if (currentLength + cleanText.length > 1500) {
      batches.push(currentBatch);
      currentBatch = [cleanText];
      currentLength = cleanText.length;
    } else {
      currentBatch.push(cleanText);
      currentLength += cleanText.length + 5; // +5 for ' ||| '
    }
  }
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  let results = [];
  for (const batch of batches) {
    // Filter out empty items in the batch to avoid translation failures
    const nonEmptyIndices = [];
    const nonEmptyTexts = [];
    for (let i = 0; i < batch.length; i++) {
      if (batch[i]) {
        nonEmptyIndices.push(i);
        nonEmptyTexts.push(batch[i]);
      }
    }

    if (nonEmptyTexts.length === 0) {
      results = [...results, ...batch];
      continue;
    }

    // Join with a distinct delimiter that Google Translate preserves
    const joinedText = nonEmptyTexts.join(" ||| ");
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(joinedText)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Google Translate API Error: ${res.status}`);
      }
      const data = await res.json();
      
      let translatedText = "";
      if (data && data[0]) {
        translatedText = data[0].map(item => item[0]).join("");
      }

      // Split back by delimiter
      const translatedParts = translatedText.split(/\s*\|\|\|\s*/);
      
      const batchResult = [...batch];
      for (let i = 0; i < nonEmptyIndices.length; i++) {
        const idx = nonEmptyIndices[i];
        batchResult[idx] = translatedParts[i] || batch[idx];
      }
      results = [...results, ...batchResult];
    } catch (e) {
      console.error("Translation batch failed:", e);
      // Fallback: return originals
      results = [...results, ...batch];
    }
  }

  return results;
}

// Localized translation adjustments for US, UK, and India
function applyRegionalAdjustments(texts, region) {
  if (region === "us") return texts; // Standard English

  // Simple substitution rules for spelling and currency representation
  const rules = [];
  if (region === "uk") {
    rules.push(
      [/\bcolor\b/gi, "colour"], [/\bcolors\b/gi, "colours"],
      [/\bcenter\b/gi, "centre"], [/\bcenters\b/gi, "centres"],
      [/\borganize\b/gi, "organise"], [/\borganized\b/gi, "organised"],
      [/\borganizing\b/gi, "organising"], [/\borganization\b/gi, "organisation"],
      [/\btheater\b/gi, "theatre"], [/\btheaters\b/gi, "theatres"],
      [/\bflavor\b/gi, "flavour"], [/\bflavors\b/gi, "flavours"],
      [/\bbehavior\b/gi, "behaviour"], [/\bbehaviors\b/gi, "behaviours"]
    );
  } else if (region === "in") {
    rules.push(
      // India uses UK spellings, and we can adjust pricing notations if found
      [/\bcolor\b/gi, "colour"], [/\bcolors\b/gi, "colours"],
      [/\bcenter\b/gi, "centre"], [/\bcenters\b/gi, "centres"],
      [/\borganize\b/gi, "organise"], [/\borganized\b/gi, "organised"],
      [/\borganizing\b/gi, "organising"], [/\borganization\b/gi, "organisation"],
      [/\btheater\b/gi, "theatre"], [/\btheaters\b/gi, "theatres"],
      // Price symbols conversion guides (purely text mapping)
      [/\b(?:usd|\$)\s*(\d+(?:\.\d+)?)/gi, "₹$1 (INR)"],
      [/\b(?:rmb|cny|¥)\s*(\d+(?:\.\d+)?)/gi, "₹$1 (INR)"]
    );
  }

  return texts.map(text => {
    if (!text) return text;
    let adjusted = text;
    for (const [pattern, replacement] of rules) {
      adjusted = adjusted.replace(pattern, replacement);
    }
    return adjusted;
  });
}

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "check-session") {
    handleCheckSession().then(sendResponse);
    return true;
  }

  if (request.action === "login") {
    handleLogin(request.email, request.password).then(sendResponse);
    return true;
  }

  if (request.action === "register") {
    handleRegister(request.data).then(sendResponse);
    return true;
  }

  if (request.action === "translate") {
    translateBatch(request.texts, "en").then(translated => {
      const adjusted = applyRegionalAdjustments(translated, request.region || "us");
      sendResponse({ success: true, texts: adjusted });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }
});

async function handleCheckSession() {
  try {
    const API_BASE = await getApiUrl();
    const data = await safeFetchJson(`${API_BASE}/api/extension/auth/me`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      credentials: "include"
    });
    return data;
  } catch (err) {
    console.log("Session check failed:", err.message);
    return { loggedIn: false, error: err.message };
  }
}

async function handleLogin(email, password) {
  try {
    const API_BASE = await getApiUrl();
    const data = await safeFetchJson(`${API_BASE}/api/extension/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });
    return data;
  } catch (err) {
    console.log("Login failed:", err.message);
    return { success: false, error: err.message };
  }
}

async function handleRegister(payload) {
  try {
    const API_BASE = await getApiUrl();
    const data = await safeFetchJson(`${API_BASE}/api/extension/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include"
    });
    return data;
  } catch (err) {
    console.log("Registration failed:", err.message);
    return { success: false, error: err.message };
  }
}
