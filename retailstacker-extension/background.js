// Background service worker for RetailStacker Chrome Extension
// Handles cross-origin requests, auth syncing, and state management

const DEV_API_URL = "http://localhost:3000";
const PROD_API_URL = "https://retailstacker.com";

// Helper to handle fetch responses safely and print readable server errors
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
    throw new Error(`Invalid response format (expected JSON, got HTML/text): ${text.slice(0, 250)}`);
  }

  return await res.json();
}

// Dynamically check which API backend is available
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
    // If local dev server is offline, fallback to production
  }
  return PROD_API_URL;
}

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "check-session") {
    handleCheckSession().then(sendResponse);
    return true; // Keep message channel open for async response
  }

  if (request.action === "login") {
    handleLogin(request.email, request.password).then(sendResponse);
    return true;
  }

  if (request.action === "register") {
    handleRegister(request.data).then(sendResponse);
    return true;
  }

  if (request.action === "fetch-xray") {
    handleFetchXray(request.asins).then(sendResponse);
    return true;
  }

  if (request.action === "fetch-storefront") {
    handleFetchStorefront(request.sellerId).then(sendResponse);
    return true;
  }

  if (request.action === "fetch-suggestions") {
    handleFetchSuggestions(request.query).then(sendResponse);
    return true;
  }
});

// Sync cookies session from the website
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
    console.error("Background check-session failed:", err.message || err);
    return { loggedIn: false, error: err.message || "Unable to connect to server" };
  }
}

// Handle email-password login
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
    console.error("Background login failed:", err.message || err);
    return { success: false, error: err.message || "Network error. Please try again." };
  }
}

// Handle signup registration
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
    console.error("Background register failed:", err.message || err);
    return { success: false, error: err.message || "Network error. Please try again." };
  }
}

// Fetch Keepa product analytics
async function handleFetchXray(asins) {
  try {
    const API_BASE = await getApiUrl();
    const data = await safeFetchJson(`${API_BASE}/api/extension/xray`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asins }),
      credentials: "include"
    });
    return data;
  } catch (err) {
    console.error("Background fetch-xray failed:", err.message || err);
    // Return unauthorized flow gracefully if status was 401
    if (err.message && err.message.includes("401")) {
      return { listings: [], gated: true, unauthorized: true };
    }
    return { listings: [], error: err.message || "Network error or Server Timeout" };
  }
}

// Fetch Amazon storefront catalog & metadata
async function handleFetchStorefront(sellerId) {
  try {
    const API_BASE = await getApiUrl();
    const data = await safeFetchJson(`${API_BASE}/api/amazon/scanner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "initialize", input: sellerId }),
      credentials: "include"
    });
    return data;
  } catch (err) {
    console.error("Background fetch-storefront failed:", err.message || err);
    return { error: err.message || "Network error or Server Timeout" };
  }
}

// Fetch Amazon search query completion suggestions (direct from Amazon completion API to bypass CORS/CSP and avoid server dependency)
async function handleFetchSuggestions(query) {
  try {
    const data = await safeFetchJson(`https://completion.amazon.in/api/2017/suggestions?limit=8&prefix=${encodeURIComponent(query)}&alias=aps&site-variant=desktop&version=2`);
    return data;
  } catch (err) {
    console.error("Background direct fetch-suggestions failed, trying API proxy:", err.message || err);
    try {
      const API_BASE = await getApiUrl();
      const data = await safeFetchJson(`${API_BASE}/api/extension/suggestions?q=${encodeURIComponent(query)}`, {
        credentials: "include"
      });
      return data;
    } catch (e) {
      console.error("Background fetch-suggestions fallback failed:", e.message || e);
      return { suggestions: [] };
    }
  }
}

