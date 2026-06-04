// Content Script for RetailStacker Chrome Extension
// Injected into amazon.in pages to provide live overlay intelligence

(function () {
  let activeSession = null;
  let xrayModal = null;
  let calculatorWidget = null;

  // ─── 1. Initialize Floating Logo Trigger ──────────────────────────────────
  function initFloatingTrigger() {
    if (document.getElementById("rs-floating-trigger")) return;

    const trigger = document.createElement("div");
    trigger.id = "rs-floating-trigger";
    trigger.innerHTML = `<img src="${chrome.runtime.getURL("icons/icon48.png")}" style="width: 32px; height: 32px; object-fit: contain;" alt="logo">`;
    trigger.title = "Launch RetailStacker Xray";
    
    trigger.addEventListener("click", handleTriggerClick);
    document.body.appendChild(trigger);
  }

  // ─── 2. Trigger Action Handler ─────────────────────────────────────────────
  async function handleTriggerClick() {
    const res = await chrome.runtime.sendMessage({ action: "check-session" });
    if (res && res.loggedIn) {
      activeSession = res.user;
      launchXray();
    } else {
      showLoginRequiredModal();
    }
  }

  // ─── 3. Injected Login/Signup Alert Modal ─────────────────────────────────
  function showLoginRequiredModal() {
    removeExistingModals();

    const modal = document.createElement("div");
    modal.className = "rs-overlay-modal active";
    modal.id = "rs-auth-notice-modal";

    const overlay = document.createElement("div");
    overlay.className = "rs-auth-overlay";

    const infoDiv = document.createElement("div");
    infoDiv.style.textAlign = "center";
    infoDiv.style.marginBottom = "18px";
    infoDiv.innerHTML = `
      <img src="${chrome.runtime.getURL("icons/icon128.png")}" style="width: 48px; height: 48px; object-fit: contain; margin-bottom: 10px; filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.4));" alt="logo">
      <h3 style="font-size: 18px; font-weight: 700; color: var(--rs-text-primary); margin-bottom: 6px;">Authentication Required</h3>
      <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">To display live Amazon India sales volumes, revenues, active seller counts, and FBA fees, please sign in or register your workspace.</p>
    `;
    overlay.appendChild(infoDiv);

    const loginBtn = document.createElement("button");
    loginBtn.className = "rs-btn rs-btn-primary";
    loginBtn.style.width = "100%";
    loginBtn.style.justifyContent = "center";
    loginBtn.style.padding = "10px";
    loginBtn.style.fontSize = "14px";
    loginBtn.textContent = "Open RetailStacker Console";
    loginBtn.addEventListener("click", () => {
      alert("Please click the RetailStacker 'R' logo inside your Chrome extensions toolbar in the top right of the browser to log in or register instantly!");
      modal.remove();
    });
    overlay.appendChild(loginBtn);

    const closeBtn = document.createElement("button");
    closeBtn.className = "rs-btn";
    closeBtn.style.width = "100%";
    closeBtn.style.justifyContent = "center";
    closeBtn.style.marginTop = "8px";
    closeBtn.style.padding = "8px";
    closeBtn.style.border = "none";
    closeBtn.style.background = "transparent";
    closeBtn.style.color = "#94a3b8";
    closeBtn.style.fontSize = "12px";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", () => {
      modal.remove();
    });
    overlay.appendChild(closeBtn);

    modal.appendChild(overlay);
    document.body.appendChild(modal);
  }

  // ─── 4. ASIN Extractor ─────────────────────────────────────────────────────
  function extractPageAsins() {
    const asins = new Set();
    
    // Method A: Grab elements with data-asin attribute
    const elements = document.querySelectorAll("[data-asin]");
    elements.forEach(el => {
      const asin = el.getAttribute("data-asin");
      if (asin && asin.length === 10 && /^[A-Z0-9]{10}$/.test(asin)) {
        asins.add(asin);
      }
    });

    // Method B: Parse links containing /dp/ or /gp/product/
    const links = document.querySelectorAll("a[href*='/dp/'], a[href*='/gp/product/']");
    links.forEach(link => {
      const href = link.href;
      const dpMatch = href.match(/\/dp\/([A-Z0-9]{10})/i) || href.match(/\/gp\/product\/([A-Z0-9]{10})/i);
      if (dpMatch && dpMatch[1]) {
        asins.add(dpMatch[1].toUpperCase());
      }
    });

    return Array.from(asins);
  }

  // ─── 5. Launch Full Xray Modal Overlay ──────────────────────────────
  async function launchXray(overrideAsins = null) {
    removeExistingModals();
    
    const asins = overrideAsins || extractPageAsins();
    if (asins.length === 0) {
      alert("No active Amazon product listings detected on this page. Navigate to an Amazon India search results grid or product page to trigger Xray!");
      return;
    }

    xrayModal = document.createElement("div");
    xrayModal.className = "rs-overlay-modal active";
    xrayModal.id = "rs-xray-modal";

    const content = document.createElement("div");
    content.className = "rs-modal-content";

    const header = document.createElement("div");
    header.className = "rs-modal-header";
    header.innerHTML = `
      <div class="rs-logo-area">
        <img class="rs-logo-icon" src="${chrome.runtime.getURL("icons/icon48.png")}" style="object-fit: contain; padding: 2px;" alt="logo">
        <div>
          <span class="rs-logo-text">RetailStacker Xray</span>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Analyzing ${asins.length} active marketplace listings...</div>
        </div>
      </div>
    `;

    const closeBtn = document.createElement("button");
    closeBtn.className = "rs-close-btn";
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", removeExistingModals);
    header.appendChild(closeBtn);
    content.appendChild(header);

    const body = document.createElement("div");
    body.className = "rs-modal-body";
    body.style.display = "flex";
    body.style.alignItems = "center";
    body.style.justifyContent = "center";
    body.innerHTML = `
      <div style="text-align:center;">
        <div style="border: 4px solid rgba(6,182,212,0.1); border-top: 4px solid #06b6d4; border-radius: 50%; width: 42px; height: 42px; animation: rs-spin 1s linear infinite; margin: 0 auto 12px;"></div>
        <div style="font-size: 14px; color: #94a3b8;">Querying Live Keepa Intel and Estimating FBA Margins...</div>
      </div>
    `;
    content.appendChild(body);
    xrayModal.appendChild(content);

    document.body.appendChild(xrayModal);

    const style = document.createElement("style");
    style.id = "rs-spin-style";
    style.textContent = "@keyframes rs-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }";
    document.head.appendChild(style);

    const data = await chrome.runtime.sendMessage({ action: "fetch-xray", asins });
    
    if (data && data.listings && data.listings.length > 0) {
      renderXrayDashboard(data.listings, data.plan);
    } else {
      renderXrayError(data?.error || "Keepa API limit reached. Please try again in a few moments.");
    }
  }

  // ─── 6. Render Modal Dashboard Results ─────────────────────────────────────
  function renderXrayDashboard(listings, plan) {
    const isFree = plan.toLowerCase() === "free";
    const body = xrayModal.querySelector(".rs-modal-body");
    body.style.display = "block";
    body.innerHTML = "";

    if (isFree) {
      const banner = document.createElement("div");
      banner.className = "rs-teaser-banner";
      
      const textDiv = document.createElement("div");
      textDiv.className = "rs-teaser-banner-text";
      textDiv.innerHTML = `
        <h4>Free Account Gating Active</h4>
        <p>You are viewing a free preview of Xray (3 items). Upgrade your RetailStacker subscription to Growth or Diamond for unlimited scans and active seller insights.</p>
      `;
      banner.appendChild(textDiv);

      const upgradeBtn = document.createElement("button");
      upgradeBtn.className = "rs-btn rs-btn-primary";
      upgradeBtn.textContent = "Upgrade Plan";
      upgradeBtn.addEventListener("click", () => {
        window.open("https://retailstacker.com/pricing", "_blank");
      });
      banner.appendChild(upgradeBtn);
      body.appendChild(banner);
    }

    const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.justifyContent = "space-between";
    controls.style.alignItems = "center";
    controls.style.marginBottom = "14px";

    const planLabel = document.createElement("div");
    planLabel.style.fontSize = "13px";
    planLabel.style.color = "#94a3b8";
    planLabel.innerHTML = `Active subscription: <strong style="color: #06b6d4; text-transform: uppercase;">${plan} Tier</strong>`;
    controls.appendChild(planLabel);

    const csvBtn = document.createElement("button");
    csvBtn.className = "rs-btn";
    csvBtn.textContent = "📥 Export data as CSV";
    csvBtn.addEventListener("click", () => {
      exportXrayToCsv(listings);
    });
    controls.appendChild(csvBtn);
    body.appendChild(controls);

    const tableContainer = document.createElement("div");
    tableContainer.className = "rs-table-container";

    let tableHtml = `
      <table class="rs-table">
        <thead>
          <tr>
            <th>Product Details</th>
            <th>Brand</th>
            <th>Price</th>
            <th>Category BSR</th>
            <th>Est. Sales (mo)</th>
            <th>Est. Revenue</th>
            <th>Active Sellers</th>
            <th>FBA Margin</th>
            <th>Rating</th>
            <th>Reviews</th>
          </tr>
        </thead>
        <tbody>
    `;

    listings.forEach((item, idx) => {
      const gatedClass = item.gated ? "rs-row-gated" : "";
      
      tableHtml += `
        <tr class="${gatedClass}" style="position: relative;">
          <td>
            <div class="rs-prod-col">
              <img class="rs-prod-img" src="${item.img}" alt="thumbnail">
              <div style="overflow: hidden;">
                <div class="rs-prod-title" title="${item.title}">${item.shortTitle}</div>
                <div class="rs-prod-asin">${item.asin}</div>
              </div>
            </div>
            ${item.gated ? `<div class="rs-gated-lock-badge">🔒 Locked · Growth Plan Required</div>` : ""}
          </td>
          <td>${item.brand}</td>
          <td style="font-weight: 600; color: var(--rs-text-primary);">${item.formattedPrice || "—"}</td>
          <td>#${item.bsr ? item.bsr.toLocaleString() : "—"}</td>
          <td>${item.monthlySold ? item.monthlySold.toLocaleString() : "—"}</td>
          <td style="color: #4ade80; font-weight: 600;">${item.formattedMonthlyRevenue || "—"}</td>
          <td style="text-align: center; font-weight: 600;">${item.activeSellers || "—"}</td>
          <td>
            <span style="font-weight:700; color: ${item.netMargin >= 30 ? '#4ade80' : item.netMargin >= 15 ? '#3b82f6' : '#ef4444'}">
              ${item.netMargin ? `${item.netMargin}%` : "—"}
            </span>
          </td>
          <td>${item.rating ? `${item.rating}★` : "—"}</td>
          <td>${item.reviews ? item.reviews.toLocaleString() : "—"}</td>
        </tr>
      `;
    });

    tableHtml += `
        </tbody>
      </table>
    `;

    tableContainer.innerHTML = tableHtml;
    body.appendChild(tableContainer);
  }

  function renderXrayError(errorMsgText) {
    const body = xrayModal.querySelector(".rs-modal-body");
    body.style.display = "flex";
    body.style.alignItems = "center";
    body.style.justifyContent = "center";
    body.innerHTML = "";

    const errorContainer = document.createElement("div");
    errorContainer.style.textAlign = "center";
    errorContainer.style.maxWidth = "450px";
    errorContainer.style.padding = "20px";
    
    errorContainer.innerHTML = `
      <span style="font-size: 40px;">⚠️</span>
      <h4 style="font-size: 16px; font-weight: 700; color: var(--rs-text-primary); margin-top: 10px; margin-bottom: 8px;">Analysis Failed</h4>
      <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">${errorMsgText}</p>
    `;

    const retryBtn = document.createElement("button");
    retryBtn.className = "rs-btn rs-btn-primary";
    retryBtn.style.marginTop = "14px";
    retryBtn.style.display = "inline-flex";
    retryBtn.style.marginLeft = "auto";
    retryBtn.style.marginRight = "auto";
    retryBtn.textContent = "Try again";
    retryBtn.addEventListener("click", launchXray);
    errorContainer.appendChild(retryBtn);
    body.appendChild(errorContainer);
  }

  function exportXrayToCsv(listings) {
    const headers = ["ASIN", "Product Title", "Brand", "Price (INR)", "BSR", "Estimated Monthly Sales", "Estimated Revenue", "Active Sellers", "Net Margin", "Rating", "Reviews"];
    const rows = listings.map(item => [
      item.asin,
      `"${item.title.replace(/"/g, '""')}"`,
      item.brand,
      item.price || 0,
      item.bsr || 999999,
      item.monthlySold || 0,
      item.monthlyRevenue || 0,
      item.activeSellers || 1,
      item.netMargin || 0,
      item.rating || 0,
      item.reviews || 0
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `retailstacker_xray_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function removeExistingModals() {
    const existing = document.getElementById("rs-xray-modal");
    if (existing) existing.remove();
    const existingAuth = document.getElementById("rs-auth-notice-modal");
    if (existingAuth) existingAuth.remove();
    const existingKeywords = document.getElementById("rs-keywords-modal");
    if (existingKeywords) existingKeywords.remove();
  }

  // ─── 7. In-Grid Page Overlays (Top Stats & Per-Product details) ───────────
  async function initSearchPageOverlays() {
    const isSearchPage = window.location.search.includes("k=") || 
                         window.location.search.includes("field-keywords") || 
                         window.location.pathname.includes("/s") || 
                         document.querySelector(".s-result-item[data-asin]") !== null;

    if (!isSearchPage) return;

    const auth = await chrome.runtime.sendMessage({ action: "check-session" });
    if (!auth || !auth.loggedIn) return;
    activeSession = auth.user;

    const asins = extractPageAsins().slice(0, 12);
    if (asins.length === 0) return;

    if (!document.getElementById("rs-search-header-averages")) {
      injectSearchHeaderLoading();
    }

    const res = await chrome.runtime.sendMessage({ action: "fetch-xray", asins });
    if (res && res.listings && res.listings.length > 0) {
      renderSearchHeaderStats(res.listings, res.plan);
      renderGridCardsDetails(res.listings, res.plan);
    } else {
      const header = document.getElementById("rs-search-header-averages");
      if (header) header.remove();
    }
  }

  function injectSearchHeaderLoading() {
    const target = document.querySelector(".s-breadcrumb") || 
                   document.querySelector(".s-search-results") || 
                   document.getElementById("search");
    if (!target) return;

    const loader = document.createElement("div");
    loader.className = "rs-search-header-bar";
    loader.id = "rs-search-header-averages";
    loader.innerHTML = `
      <div class="rs-sh-brand-info">
        <img class="rs-sh-logo" src="${chrome.runtime.getURL("icons/icon48.png")}" style="object-fit: contain; padding: 2px;" alt="logo">
        <div>
          <span style="font-weight: 700;">RetailStacker Intel</span>
          <div style="font-size: 10px; color: var(--rs-text-secondary);">Calculating page averages...</div>
        </div>
      </div>
      <div style="border: 2px solid rgba(6,182,212,0.1); border-top: 2px solid #06b6d4; border-radius: 50%; width: 16px; height: 16px; animation: rs-spin 1s linear infinite;"></div>
    `;

    const mainList = document.querySelector(".s-result-list") || document.querySelector(".s-search-results");
    if (mainList && mainList.parentNode) {
      mainList.parentNode.insertBefore(loader, mainList);
    }
  }

  function renderSearchHeaderStats(listings, plan) {
    const header = document.getElementById("rs-search-header-averages");
    if (!header) return;

    const validListings = listings.filter(l => !l.gated && l.price > 0);
    if (validListings.length === 0) {
      header.remove();
      return;
    }

    const avgPrice = Math.round(validListings.reduce((sum, l) => sum + l.price, 0) / validListings.length);
    const avgBsr = Math.round(validListings.reduce((sum, l) => sum + l.bsr, 0) / validListings.length);
    const avgSales = Math.round(validListings.reduce((sum, l) => sum + l.monthlySold, 0) / validListings.length);
    const avgRevenue = Math.round(validListings.reduce((sum, l) => sum + l.monthlyRevenue, 0) / validListings.length);

    header.innerHTML = `
      <div class="rs-sh-brand-info">
        <img class="rs-sh-logo" src="${chrome.runtime.getURL("icons/icon48.png")}" style="object-fit: contain; padding: 2px;" alt="logo">
        <div>
          <span style="font-weight: 800; font-size: 15px; background: var(--rs-accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">RetailStacker Grid Intel</span>
          <div style="font-size: 10px; color: var(--rs-text-secondary);">Market averages across search results</div>
        </div>
      </div>

      <div class="rs-sh-stats-container">
        <div class="rs-sh-stat-box">
          <div class="rs-sh-stat-label">Avg Price</div>
          <div class="rs-sh-stat-val">₹${avgPrice.toLocaleString("en-IN")}</div>
        </div>
        <div class="rs-sh-stat-box">
          <div class="rs-sh-stat-label">Avg BSR</div>
          <div class="rs-sh-stat-val">#${avgBsr.toLocaleString()}</div>
        </div>
        <div class="rs-sh-stat-box">
          <div class="rs-sh-stat-label">Avg Sales (mo)</div>
          <div class="rs-sh-stat-val" style="color: #06b6d4;">${avgSales.toLocaleString()}</div>
        </div>
        <div class="rs-sh-stat-box">
          <div class="rs-sh-stat-label">Avg Revenue</div>
          <div class="rs-sh-stat-val" style="color: #4ade80;">₹${avgRevenue.toLocaleString("en-IN")}</div>
        </div>
      </div>
    `;

    const triggerBtn = document.createElement("button");
    triggerBtn.className = "rs-ts-btn";
    triggerBtn.textContent = "Xray Search results";
    triggerBtn.addEventListener("click", () => {
      launchXray();
    });
    header.appendChild(triggerBtn);
  }

  function renderGridCardsDetails(listings, plan) {
    listings.forEach((item, idx) => {
      const card = document.querySelector(`.s-result-item[data-asin="${item.asin}"]`);
      if (!card || card.querySelector(".rs-grid-card-overlay")) return;

      const overlay = document.createElement("div");
      overlay.className = "rs-grid-card-overlay";
      
      const variationCount = (item.asin.charCodeAt(6) % 5) + 1;

      if (item.gated) {
        overlay.innerHTML = `
          <div class="rs-gc-item">
            <span class="rs-gc-label">Sellers:</span>
            <span class="rs-gc-value">🔒 locked</span>
          </div>
          <div class="rs-gc-item">
            <span class="rs-gc-label">BSR:</span>
            <span class="rs-gc-value">🔒 locked</span>
          </div>
        `;

        const gatedLink = document.createElement("div");
        gatedLink.className = "rs-gc-item";
        gatedLink.innerHTML = `<span class="rs-gc-value locked" style="text-decoration: underline;">Upgrade plan ↗</span>`;
        gatedLink.addEventListener("click", (e) => {
          e.preventDefault();
          window.open("https://retailstacker.com/pricing", "_blank");
        });
        overlay.appendChild(gatedLink);
        
        const target = card.querySelector(".s-card-container") || card.querySelector(".a-section") || card;
        target.prepend(overlay);
      } else {
        overlay.innerHTML = `
          <div class="rs-gc-item">
            <span class="rs-gc-label">BSR Rank:</span>
            <span class="rs-gc-value">#${item.bsr ? item.bsr.toLocaleString() : "—"}</span>
          </div>
          <div class="rs-gc-item">
            <span class="rs-gc-label">Var:</span>
            <span class="rs-gc-value" style="color: var(--rs-text-primary);">${variationCount} Var</span>
          </div>
          <div class="rs-gc-item">
            <span class="rs-gc-label">Sellers:</span>
            <span class="rs-gc-value" style="color: #4ade80;">${item.activeSellers} Sellers</span>
          </div>
        `;
        
        const target = card.querySelector(".s-card-container") || card.querySelector(".a-section") || card;
        target.prepend(overlay);
      }
    });
  }

  // ─── 8. Product Detail Page Key Stats Bar (Under Product Title) ──────────────
  async function initProductTitleStatsBar() {
    const dpMatch = window.location.pathname.match(/\/dp\/([A-Z0-9]{10})/i) || window.location.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/i);
    if (!dpMatch) return;
    
    const asin = dpMatch[1].toUpperCase();

    const titleArea = document.getElementById("titleSection") || document.getElementById("title");
    if (!titleArea || document.getElementById("rs-title-stats-bar-widget")) return;

    // Synchronously insert placeholder to immediately lock execution and avoid race condition duplicates
    const bar = document.createElement("div");
    bar.id = "rs-title-stats-bar-widget";
    bar.className = "rs-title-stats-bar rs-title-stats-bar-loading";
    bar.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px; padding: 4px 12px; color: var(--rs-text-secondary); font-size: 12px; font-weight: 500;">
        <span class="rs-loading-spinner" style="width:12px; height:12px; border:2px solid var(--rs-accent-color); border-top-color:transparent; border-radius:50%; animation:rs-spin 0.8s linear infinite;"></span>
        Analyzing Product with RetailStacker...
      </div>
    `;
    titleArea.parentNode.insertBefore(bar, titleArea.nextSibling);

    try {
      const auth = await chrome.runtime.sendMessage({ action: "check-session" });
      if (!auth || !auth.loggedIn) {
        bar.remove();
        return;
      }

      const res = await chrome.runtime.sendMessage({ action: "fetch-xray", asins: [asin] });
      if (res && res.listings && res.listings.length > 0) {
        renderProductTitleStatsBar(res.listings[0], res.plan, bar);
      } else {
        bar.remove();
      }
    } catch (err) {
      console.error("RetailStacker stats bar load error:", err);
      bar.remove();
    }
  }

  function renderProductTitleStatsBar(product, plan, bar) {
    if (!bar) return;
    bar.classList.remove("rs-title-stats-bar-loading");
    bar.innerHTML = ""; // Clear loader contents

    const isFree = plan.toLowerCase() === "free";
    const healthScore = product.rating >= 4.3 && product.reviews >= 200 ? "9.2/10 (Excellent)" :
                        product.rating >= 3.9 && product.reviews >= 50 ? "7.8/10 (Good)" : "5.4/10 (Average)";
    
    const kws = getKeywordPhrases(product);
    const topKeywords = kws && kws.length > 0 ? kws.slice(0, 2).join(", ") : "Top Seller, Premium Quality";

    if (isFree) {
      bar.innerHTML = `
        <div class="rs-ts-item">
          <div class="rs-ts-label">BSR Rank</div>
          <div class="rs-ts-val accent">#${product.bsr ? product.bsr.toLocaleString() : "—"}</div>
        </div>
        <div class="rs-ts-item">
          <div class="rs-ts-label">Est. Revenue</div>
          <div class="rs-ts-val" style="color: #ef4444;">🔒 locked</div>
        </div>
        <div class="rs-ts-item">
          <div class="rs-ts-label">Listing health</div>
          <div class="rs-ts-val" style="color: #ef4444;">🔒 locked</div>
        </div>
      `;

      const upgradeBtn = document.createElement("button");
      upgradeBtn.className = "rs-ts-btn";
      upgradeBtn.textContent = "Upgrade Plan";
      upgradeBtn.addEventListener("click", () => {
        window.open("https://retailstacker.com/pricing", "_blank");
      });
      bar.appendChild(upgradeBtn);
    } else {
      bar.innerHTML = `
        <div class="rs-ts-item">
          <div class="rs-ts-label">BSR Rank</div>
          <div class="rs-ts-val accent">#${product.bsr ? product.bsr.toLocaleString() : "—"}</div>
        </div>
        <div class="rs-ts-item">
          <div class="rs-ts-label">30-Day Revenue</div>
          <div class="rs-ts-val" style="color: #4ade80;">${product.formattedMonthlyRevenue || "—"}</div>
        </div>
        <div class="rs-ts-item">
          <div class="rs-ts-label">Listing health</div>
          <div class="rs-ts-val" style="color: #3b82f6;">${healthScore}</div>
        </div>
        <div class="rs-ts-item" style="max-width: 250px;">
          <div class="rs-ts-label">Top Keywords</div>
          <div class="rs-ts-val" style="font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${topKeywords}">${topKeywords}</div>
        </div>
      `;

      const kwBtn = document.createElement("button");
      kwBtn.className = "rs-ts-btn";
      kwBtn.textContent = "Xray Keywords";
      kwBtn.addEventListener("click", () => {
        openKeywordsModal(product);
      });
      bar.appendChild(kwBtn);
    }
  }

  // ─── 9. In-Page Keywords Research Popup Panel (Cerebro Style) ──────────────
  function getKeywordPhrases(product) {
    const title = product.title || document.getElementById("productTitle")?.textContent || "";
    const brand = product.brand || "";
    
    if (!title || title.includes("Upgrade to Access Details")) {
      return ["Top Seller", "Amazon Choice", "Premium", "Best Seller"];
    }

    // Clean and split title
    const cleanTitle = title.replace(/[()\[\].,\-:\/]/g, " ").replace(/\s+/g, " ").trim();
    const words = cleanTitle.split(" ").map(w => w.trim()).filter(w => w.length > 2);
    
    // Filter common non-keyword words
    const stopWords = new Set(["with", "from", "that", "this", "under", "over", "best", "good", "great", "high", "quality", "free", "pack", "size", "inch", "color", "black", "white", "blue", "grey", "gray", "gold", "silver"]);
    const filtered = words.filter(w => !stopWords.has(w.toLowerCase()) && isNaN(w));

    const phrases = [];
    const lowerBrand = brand.toLowerCase();
    
    // Generate brand specific keyword phrases
    if (brand && filtered.length > 1) {
      const brandIdx = filtered.findIndex(w => w.toLowerCase() === lowerBrand);
      if (brandIdx !== -1) {
        const p1 = filtered.slice(brandIdx, brandIdx + 2).join(" ");
        const p2 = filtered.slice(brandIdx, brandIdx + 3).join(" ");
        if (p1) phrases.push(p1);
        if (p2 && p2 !== p1) phrases.push(p2);
      } else {
        phrases.push(`${brand} ${filtered[0]}`);
        if (filtered[1]) phrases.push(`${brand} ${filtered[0]} ${filtered[1]}`);
      }
    }

    // Extract key word combinations from the title
    for (let i = 0; i < Math.min(filtered.length - 1, 6); i++) {
      phrases.push(filtered.slice(i, i + 2).join(" "));
      if (i < filtered.length - 2) {
        phrases.push(filtered.slice(i, i + 3).join(" "));
      }
    }

    // Unique-ify, format to Title Case, and filter out short/single words
    const titleCase = (str) => str.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    let uniquePhrases = Array.from(new Set(phrases.map(p => p.toLowerCase())))
      .filter(p => p.split(" ").length > 1 && p.length > 5)
      .map(titleCase)
      .slice(0, 6);

    if (uniquePhrases.length > 0) {
      return uniquePhrases;
    }

    // Fallback to capitalizing API keywords if present
    if (product.keywords && product.keywords.length > 0) {
      return product.keywords.map(titleCase);
    }
    
    return ["Top Seller", "Amazon Choice", "Premium", "Best Seller"];
  }

  // ─── 9. In-Page Keywords Research Popup Panel (Cerebro Style) ──────────────
  function openKeywordsModal(product) {
    removeExistingModals();

    const keywords = getKeywordPhrases(product);
    const keywordData = keywords.map((word, index) => {
      const searchVolume = Math.round(50000 / (index + 1) + (product.asin.charCodeAt(5) * 12));
      const relevance = 100 - (index * 8);
      const organicRank = index + 1;
      return { word, searchVolume, relevance, organicRank };
    });

    const modal = document.createElement("div");
    modal.className = "rs-overlay-modal active";
    modal.id = "rs-keywords-modal";

    const content = document.createElement("div");
    content.className = "rs-modal-content";
    content.style.maxWidth = "650px";
    content.style.height = "auto";
    content.style.maxHeight = "80vh";

    const header = document.createElement("div");
    header.className = "rs-modal-header";
    header.innerHTML = `
      <div class="rs-logo-area">
        <img class="rs-logo-icon" src="${chrome.runtime.getURL("icons/icon48.png")}" style="object-fit: contain; padding: 2px;" alt="logo">
        <div>
          <span class="rs-logo-text">Cerebro Keywords Xray</span>
          <div style="font-size: 11px; color: var(--rs-text-secondary);">ASIN: ${product.asin} · Top Keywords Analysis</div>
        </div>
      </div>
    `;

    const closeBtn = document.createElement("button");
    closeBtn.className = "rs-close-btn";
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", () => modal.remove());
    header.appendChild(closeBtn);
    content.appendChild(header);

    const body = document.createElement("div");
    body.className = "rs-modal-body";
    body.innerHTML = `
      <div class="rs-table-container">
        <table class="rs-table" style="min-width: 550px !important;">
          <thead>
            <tr>
              <th>Keyword Phrase</th>
              <th>Search Volume (mo)</th>
              <th>Relevance Score</th>
              <th>Organic Rank</th>
            </tr>
          </thead>
          <tbody>
            ${keywordData.map(kw => `
              <tr>
                <td style="font-weight:600; color:var(--rs-text-primary);">${kw.word}</td>
                <td style="color:#06b6d4; font-weight:700;">${kw.searchVolume.toLocaleString()}</td>
                <td>${kw.relevance}%</td>
                <td style="text-align:center; font-weight:700; color:#4ade80;">#${kw.organicRank}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <div style="margin-top: 18px; text-align: center;" id="rs-kw-deep-btn-wrapper"></div>
    `;

    const deepBtn = document.createElement("button");
    deepBtn.className = "rs-btn rs-btn-primary";
    deepBtn.style.display = "inline-flex";
    deepBtn.style.padding = "8px 16px";
    deepBtn.textContent = "View Full Magnet & Cerebro Panel";
    deepBtn.addEventListener("click", () => {
      window.open(`https://retailstacker.com/tools/cerebro?asin=${product.asin}`, "_blank");
      modal.remove();
    });

    body.querySelector("#rs-kw-deep-btn-wrapper").appendChild(deepBtn);
    content.appendChild(body);
    modal.appendChild(content);

    document.body.appendChild(modal);
  }

  // ─── 10. Individual Product Page Detail Widget (FBA Profit Calculator) ───────────
  async function initProductPageCalculator() {
    const dpMatch = window.location.pathname.match(/\/dp\/([A-Z0-9]{10})/i) || window.location.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/i);
    if (!dpMatch) return;
    
    const asin = dpMatch[1].toUpperCase();

    const buybox = document.getElementById("buybox") || document.getElementById("combinedBuyBox_feature_div") || document.getElementById("rightCol");
    if (!buybox || document.getElementById("rs-calculator-card")) return;

    const auth = await chrome.runtime.sendMessage({ action: "check-session" });
    if (!auth || !auth.loggedIn) return; 

    calculatorWidget = document.createElement("div");
    calculatorWidget.id = "rs-calculator-card";
    calculatorWidget.className = "rs-calc-widget";
    calculatorWidget.innerHTML = `
      <div class="rs-calc-title">
        <img src="${chrome.runtime.getURL("icons/icon16.png")}" style="width: 22px; height: 22px; object-fit: contain;" alt="logo">
        <span>FBA Profit Calculator</span>
      </div>
      <div style="text-align:center; padding: 10px;">
        <div style="border: 2px solid rgba(6,182,212,0.1); border-top: 2px solid #06b6d4; border-radius: 50%; width: 20px; height: 20px; animation: rs-spin 1s linear infinite; margin: 0 auto;"></div>
      </div>
    `;

    buybox.prepend(calculatorWidget);

    const res = await chrome.runtime.sendMessage({ action: "fetch-xray", asins: [asin] });
    if (res && res.listings && res.listings.length > 0) {
      renderCalculatorWidget(res.listings[0]);
    } else {
      calculatorWidget.remove();
    }
  }

  function renderCalculatorWidget(product) {
    if (!calculatorWidget) return;

    const price = product.price || 0;
    const fbaFee = product.fbaFee || 0;
    const referralFee = product.referralFee || 0;
    const gst = product.gst || 0;
    let cogs = Math.round(price * 0.35);

    function updateCalculations() {
      const inputEl = calculatorWidget.querySelector("#rs-calc-cogs-input");
      const parsedCogs = inputEl ? parseFloat(inputEl.value) || 0 : cogs;
      const netProfit = Math.max(0, price - parsedCogs - fbaFee - referralFee - gst);
      const netMargin = price > 0 ? Math.round((netProfit / price) * 100) : 0;

      calculatorWidget.querySelector("#rs-calc-profit").textContent = `₹${netProfit.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
      const marginBox = calculatorWidget.querySelector("#rs-calc-margin-box");
      const marginPct = calculatorWidget.querySelector("#rs-calc-margin-pct");
      marginPct.textContent = `${netMargin}%`;
      
      marginBox.className = "rs-margin-box";
      if (netMargin >= 30) {
        marginBox.classList.add("high");
      } else if (netMargin < 15) {
        marginBox.classList.add("low");
      }
    }

    calculatorWidget.innerHTML = `
      <div class="rs-calc-title">
        <img src="${chrome.runtime.getURL("icons/icon16.png")}" style="width: 22px; height: 22px; object-fit: contain;" alt="logo">
        <span>FBA Profit Calculator</span>
      </div>

      <div class="rs-calc-row">
        <span class="rs-calc-label">Product Retail Price</span>
        <span class="rs-calc-value">₹${price.toLocaleString("en-IN")}</span>
      </div>

      <div class="rs-calc-row">
        <span class="rs-calc-label">Amazon Referral Fee</span>
        <span class="rs-calc-value" style="color: #ef4444;">- ₹${referralFee.toLocaleString("en-IN")} (${product.referralFeePercent}%)</span>
      </div>

      <div class="rs-calc-row">
        <span class="rs-calc-label">FBA Logistics Fees</span>
        <span class="rs-calc-value" style="color: #ef4444;">- ₹${fbaFee.toLocaleString("en-IN")}</span>
      </div>

      <div class="rs-calc-row">
        <span class="rs-calc-label">Est. GST Slab (18%)</span>
        <span class="rs-calc-value" style="color: #ef4444;">- ₹${gst.toLocaleString("en-IN")}</span>
      </div>

      <div class="rs-calc-row" style="margin-top: 8px;">
        <span class="rs-calc-label">Cost of Goods (COGS)</span>
        <span>
          <span style="font-size:12px; color:var(--rs-text-secondary); margin-right:4px;">₹</span>
          <input type="number" id="rs-calc-cogs-input" class="rs-calc-input" value="${cogs}">
        </span>
      </div>

      <div class="rs-calc-divider"></div>

      <div class="rs-calc-row">
        <span class="rs-calc-label">Net Return Profit</span>
        <span id="rs-calc-profit" class="rs-calc-value" style="color: #4ade80; font-size: 15px; font-weight: 700;">₹0</span>
      </div>

      <div id="rs-calc-margin-box" class="rs-margin-box">
        <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Estimated FBA Net Margin</div>
        <div id="rs-calc-margin-pct" class="rs-margin-pct">0%</div>
      </div>
    `;

    calculatorWidget.querySelector("#rs-calc-cogs-input").addEventListener("input", updateCalculations);
    updateCalculations();
  }

  function deduplicateStoreName(name) {
    if (!name) return "";
    name = name.trim();
    const half = Math.floor(name.length / 2);
    const firstHalf = name.slice(0, half).trim();
    const secondHalf = name.slice(half).trim();
    if (firstHalf === secondHalf) {
      return firstHalf;
    }
    const words = name.split(/\s+/);
    if (words.length % 2 === 0) {
      const mid = words.length / 2;
      const w1 = words.slice(0, mid).join(" ");
      const w2 = words.slice(mid).join(" ");
      if (w1 === w2) {
        return w1;
      }
    }
    return name;
  }

  // ─── 11. Seller Storefront Auditor Overlay ──────────────────────────────────
  async function initSellerStorefrontWidget() {
    const searchParams = new URLSearchParams(window.location.search);
    const sellerId = searchParams.get("seller") || searchParams.get("me");
    const isStorefront = window.location.pathname.includes("/sp") || 
                         window.location.pathname.includes("/stores") ||
                         sellerId !== null;

    if (!isStorefront || !sellerId) return;

    if (document.getElementById("rs-storefront-summary-panel")) return;

    const auth = await chrome.runtime.sendMessage({ action: "check-session" });
    if (!auth || !auth.loggedIn) return;

    let storeName = "Amazon Marketplace Seller";
    // Check multiple selectors to find actual seller name, avoiding sidebar menus like "Category"
    const selectors = [
      "#sellerProfileName",
      "#sellerName",
      "#seller-name",
      ".storefront-header-title",
      "h1#storefront-header-title",
      "h1"
    ];
    for (const s of selectors) {
      const elements = document.querySelectorAll(s);
      for (const el of elements) {
        const text = el.textContent.trim();
        if (text && text.toLowerCase() !== "category" && text.toLowerCase() !== "categories" && text.length < 100) {
          storeName = deduplicateStoreName(text);
          break;
        }
      }
      if (storeName !== "Amazon Marketplace Seller") break;
    }

    const summaryBar = document.createElement("div");
    summaryBar.id = "rs-storefront-summary-panel";
    summaryBar.className = "rs-storefront-summary-bar";
    
    const parentContainer = document.getElementById("sp-people-feedback-grid") || 
                            document.getElementById("pageContent") || 
                            document.body.firstChild;

    summaryBar.innerHTML = `
      <div style="display:flex; align-items:center; gap: 14px;">
        <img src="${chrome.runtime.getURL("icons/icon48.png")}" style="width:40px; height:40px; border-radius:8px; object-fit: contain; box-shadow:var(--rs-glow);" alt="logo">
        <div>
          <h2 style="font-size: 18px; font-weight: 800; color: var(--rs-text-primary); margin:0;" id="rs-storefront-name">${storeName}</h2>
          <p style="font-size: 12px; color: var(--rs-text-secondary); margin: 2px 0 0 0;">Seller ID: <code style="color:#06b6d4; font-family:monospace;">${sellerId}</code> · Connected to RetailStacker</p>
        </div>
      </div>
      
      <div class="rs-sh-stats-container" id="rs-storefront-stats-container" style="display:flex; gap: 20px; margin: 0 auto 0 30px; flex-grow: 1;">
        <div class="rs-sh-stat-box">
          <div class="rs-sh-stat-label">Total Products</div>
          <div class="rs-sh-stat-val" id="rs-sf-total-products">⌛ Loading...</div>
        </div>
        <div class="rs-sh-stat-box">
          <div class="rs-sh-stat-label">Avg BSR</div>
          <div class="rs-sh-stat-val" id="rs-sf-avg-bsr">—</div>
        </div>
        <div class="rs-sh-stat-box">
          <div class="rs-sh-stat-label">Est. Revenue (mo)</div>
          <div class="rs-sh-stat-val" id="rs-sf-est-rev">—</div>
        </div>
        <div class="rs-sh-stat-box">
          <div class="rs-sh-stat-label">Store Rating</div>
          <div class="rs-sh-stat-val" id="rs-sf-avg-rating">—</div>
        </div>
      </div>
      
      <div id="rs-storefront-btn-wrapper"></div>
    `;

    const auditBtn = document.createElement("button");
    auditBtn.id = "rs-storefront-audit-btn";
    auditBtn.className = "rs-btn rs-btn-primary";
    auditBtn.style.fontSize = "13px";
    auditBtn.style.fontWeight = "700";
    auditBtn.style.padding = "10px 20px";
    auditBtn.textContent = "⚡ Audit Storefront Catalog via Xray";
    
    let storefrontAsins = [];

    auditBtn.addEventListener("click", async () => {
      if (storefrontAsins.length > 0) {
        launchXray(storefrontAsins);
      } else {
        auditBtn.textContent = "⌛ Extracting store catalog...";
        auditBtn.disabled = true;
        try {
          const initData = await chrome.runtime.sendMessage({ action: "fetch-storefront", sellerId });
          auditBtn.textContent = "⚡ Audit Storefront Catalog via Xray";
          auditBtn.disabled = false;
          
          if (initData && initData.asins && initData.asins.length > 0) {
            storefrontAsins = initData.asins;
            launchXray(storefrontAsins);
          } else {
            const pageAsins = extractPageAsins();
            if (pageAsins.length > 0) {
              storefrontAsins = pageAsins;
              launchXray(storefrontAsins);
            } else {
              alert("Unable to fetch seller catalog items. The storefront may be empty or restricted.");
            }
          }
        } catch (err) {
          console.error("Storefront audit failed:", err);
          auditBtn.textContent = "⚡ Audit Storefront Catalog via Xray";
          auditBtn.disabled = false;
          alert("Server connection failed. Make sure RetailStacker server is running.");
        }
      }
    });

    summaryBar.querySelector("#rs-storefront-btn-wrapper").appendChild(auditBtn);

    if (parentContainer) {
      if (parentContainer === document.body.firstChild) {
        document.body.insertBefore(summaryBar, document.body.firstChild);
      } else {
        parentContainer.parentNode.insertBefore(summaryBar, parentContainer);
      }
    }

    // Auto-fetch storefront statistics in the background
    try {
      chrome.runtime.sendMessage({ action: "fetch-storefront", sellerId }).then(async (initData) => {
        let asinsToAnalyze = [];
        let totalCount = 0;

        if (initData && initData.asins && initData.asins.length > 0) {
          storefrontAsins = initData.asins;
          asinsToAnalyze = initData.asins;
          totalCount = initData.totalProducts || initData.asins.length;
          
          if (initData.brandName && initData.brandName !== sellerId) {
            document.getElementById("rs-storefront-name").textContent = deduplicateStoreName(initData.brandName);
          }
        } else {
          const pageAsins = extractPageAsins();
          if (pageAsins.length > 0) {
            storefrontAsins = pageAsins;
            asinsToAnalyze = pageAsins;
            totalCount = pageAsins.length;
          }
        }

        if (asinsToAnalyze.length > 0) {
          document.getElementById("rs-sf-total-products").textContent = totalCount;

          // Batch fetch analysis details for the first 10 products to compute averages
          const sampleAsins = asinsToAnalyze.slice(0, 10);
          const xrayRes = await chrome.runtime.sendMessage({ action: "fetch-xray", asins: sampleAsins });
          
          if (xrayRes && xrayRes.listings && xrayRes.listings.length > 0) {
            const validListings = xrayRes.listings.filter(l => !l.gated && l.price > 0);
            if (validListings.length > 0) {
              const avgBsr = Math.round(validListings.reduce((sum, l) => sum + (l.bsr || 0), 0) / validListings.length);
              const avgRating = Number((validListings.reduce((sum, l) => sum + (l.rating || 0), 0) / validListings.length).toFixed(1));
              
              // Project total revenue: Average monthly revenue of sample * total products
              const avgRevenue = validListings.reduce((sum, l) => sum + (l.monthlyRevenue || 0), 0) / validListings.length;
              const estimatedTotalRevenue = Math.round(avgRevenue * totalCount);

              document.getElementById("rs-sf-avg-bsr").textContent = "#" + avgBsr.toLocaleString();
              document.getElementById("rs-sf-est-rev").textContent = "₹" + estimatedTotalRevenue.toLocaleString("en-IN");
              document.getElementById("rs-sf-avg-rating").textContent = avgRating + " ⭐";
            } else {
              // Gated / Free preview fallback
              document.getElementById("rs-sf-avg-bsr").textContent = "🔒 Locked";
              document.getElementById("rs-sf-est-rev").textContent = "🔒 Locked";
              document.getElementById("rs-sf-avg-rating").textContent = "🔒 Locked";
            }
          } else {
            document.getElementById("rs-sf-avg-bsr").textContent = "—";
            document.getElementById("rs-sf-est-rev").textContent = "—";
            document.getElementById("rs-sf-avg-rating").textContent = "—";
          }
        } else {
          document.getElementById("rs-sf-total-products").textContent = "0";
          document.getElementById("rs-sf-avg-bsr").textContent = "—";
          document.getElementById("rs-sf-est-rev").textContent = "—";
          document.getElementById("rs-sf-avg-rating").textContent = "—";
        }
      }).catch(err => {
        console.error("Auto-fetch storefront statistics failed:", err);
      });
    } catch (err) {
      console.error("Initiate auto-fetch storefront stats fail:", err);
    }
  }

  // ─── 12. Search Suggestions Volume Decorator (Helium 10 Style) ────────────
  function initSearchSuggestionsDecorator() {
    // Helper to calculate deterministic search volume and competing products
    function getKeywordMetrics(keyword) {
      const clean = keyword.replace(/[^a-zA-Z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
      const hash = clean.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      const lengthFactor = Math.max(1, 22 - clean.length);
      const searchVolume = Math.round(1500 + ((hash * 73) % 45000) * (lengthFactor / 4.5));
      const competing = Math.round(120 + ((hash * 13) % 8000));
      const score = ((6.0 + ((hash % 35) / 10))).toFixed(1);

      return { searchVolume, competing, score };
    }

    function decorateSuggestions() {
      const containers = document.querySelectorAll(".s-suggestion-container");
      containers.forEach(container => {
        if (container.querySelector(".rs-injected-metrics")) return;

        const suggestionEl = container.querySelector(".s-suggestion");
        if (!suggestionEl) return;

        // Get the keyword phrase
        const kw = suggestionEl.getAttribute("aria-label") || suggestionEl.textContent || "";
        if (!kw || kw.trim().length < 1) return;

        const metrics = getKeywordMetrics(kw);

        // Create metrics container
        const metricsContainer = document.createElement("div");
        metricsContainer.className = "rs-injected-metrics";
        metricsContainer.innerHTML = `
          <div class="rs-metric-item">
            <span class="rs-metric-label">Search Volume</span>
            <span class="rs-metric-val">${metrics.searchVolume.toLocaleString("en-IN")}</span>
          </div>
          <div class="rs-metric-item">
            <span class="rs-metric-label">Competing</span>
            <span class="rs-metric-val" style="color: #f87171;">${metrics.competing.toLocaleString()}</span>
          </div>
          <button class="rs-metric-magnet-btn" title="Search in Magnet">
            <img src="${chrome.runtime.getURL("icons/icon16.png")}" style="width: 10px; height: 10px;" alt="magnet"> Magnet
          </button>
        `;

        // Handle button click to search on Magnet
        const btn = metricsContainer.querySelector(".rs-metric-magnet-btn");
        if (btn) {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            window.open(`https://retailstacker.com/tools/magnet?q=${encodeURIComponent(kw)}`, "_blank");
          });
        }

        // Apply display styles to original container
        container.style.setProperty("display", "flex", "important");
        container.style.setProperty("justify-content", "space-between", "important");
        container.style.setProperty("align-items", "center", "important");

        // Insert inside container
        container.appendChild(metricsContainer);
      });
    }

    // Set up MutationObserver to decorate new suggestions when they render
    const observer = new MutationObserver(() => {
      decorateSuggestions();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    
    // Initial run
    decorateSuggestions();
  }

  // ─── 13. Startup Initialization ───────────────────────────────────────────
  function initAllWidgets() {
    initFloatingTrigger();
    initSearchPageOverlays();
    initProductTitleStatsBar();
    initProductPageCalculator();
    initSellerStorefrontWidget();
    initSearchSuggestionsDecorator();
  }

  initAllWidgets();

  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(initAllWidgets, 1500);
    }
  }).observe(document, { subtree: true, childList: true });

})();
