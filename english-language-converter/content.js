// Content script for English Language Converter
// Traverses DOM, batches texts for API translation, manages revert cache, and monitors mutations

(function () {
  let isTranslating = false;
  let currentRegion = "us";
  
  // WeakMap to map DOM text nodes to their original values
  const originalTextCache = new WeakMap();
  
  // Set to keep track of nodes currently being translated to prevent duplicate requests
  const translatingNodes = new WeakSet();

  // Create loading overlay elements
  let statusIndicator = null;

  function createStatusIndicator() {
    if (statusIndicator) return;

    statusIndicator = document.createElement("div");
    statusIndicator.style.position = "fixed";
    statusIndicator.style.bottom = "20px";
    statusIndicator.style.right = "20px";
    statusIndicator.style.padding = "10px 18px";
    statusIndicator.style.borderRadius = "12px";
    statusIndicator.style.background = "rgba(13, 15, 20, 0.9)";
    statusIndicator.style.color = "#ffffff";
    statusIndicator.style.border = "1px solid rgba(255, 107, 53, 0.3)";
    statusIndicator.style.boxShadow = "0 8px 32px rgba(0,0,0,0.5)";
    statusIndicator.style.fontFamily = "-apple-system, BlinkMacSystemFont, sans-serif";
    statusIndicator.style.fontSize = "12px";
    statusIndicator.style.fontWeight = "600";
    statusIndicator.style.zIndex = "999999";
    statusIndicator.style.display = "none";
    statusIndicator.style.alignItems = "center";
    statusIndicator.style.gap = "8px";
    statusIndicator.style.transition = "all 0.3s ease";
    statusIndicator.style.backdropFilter = "blur(10px)";
    statusIndicator.style.pointerEvents = "none";

    const spinner = document.createElement("div");
    spinner.className = "rs-translate-spinner";
    spinner.style.width = "14px";
    spinner.style.height = "14px";
    spinner.style.border = "2px solid rgba(255,255,255,0.2)";
    spinner.style.borderTopColor = "#ff6b35";
    spinner.style.borderRadius = "50%";
    spinner.style.animation = "rs-spin 0.8s linear infinite";

    const text = document.createElement("span");
    text.id = "rs-translate-status-text";
    text.innerText = "Translating page...";

    statusIndicator.appendChild(spinner);
    statusIndicator.appendChild(text);
    document.body.appendChild(statusIndicator);

    // Add spinner keyframes inline
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes rs-spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  function showStatus(text, isLoading = true) {
    createStatusIndicator();
    if (!statusIndicator) return;
    
    const textNode = document.getElementById("rs-translate-status-text");
    const spinner = statusIndicator.querySelector(".rs-translate-spinner");

    if (textNode) textNode.innerText = text;
    if (spinner) spinner.style.display = isLoading ? "block" : "none";
    
    statusIndicator.style.display = "flex";
    statusIndicator.style.opacity = "1";

    if (!isLoading) {
      setTimeout(() => {
        if (statusIndicator && !isTranslating) {
          statusIndicator.style.opacity = "0";
          setTimeout(() => {
            if (statusIndicator && !isTranslating) statusIndicator.style.display = "none";
          }, 300);
        }
      }, 3000);
    }
  }

  function hideStatus() {
    if (statusIndicator) {
      statusIndicator.style.opacity = "0";
      setTimeout(() => {
        statusIndicator.style.display = "none";
      }, 300);
    }
  }

  // Get all text nodes within an element
  function isTranslatableNode(node) {
    const parent = node.parentNode;
    if (!parent) return false;

    const tag = parent.tagName ? parent.tagName.toLowerCase() : "";
    const ignoredTags = ["script", "style", "code", "noscript", "iframe", "textarea", "input"];
    if (ignoredTags.includes(tag)) return false;

    // Ignore elements that are hidden or helper items
    if (parent.classList && parent.classList.contains("rs-translate-spinner")) return false;

    // Check if node contains actual text letters (Chinese, Kanji, Cyrillic, or English)
    const val = node.nodeValue;
    return val && val.trim().length > 0 && /[^\d\s\p{P}]/u.test(val);
  }

  function getTextNodes(root) {
    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      if (isTranslatableNode(node)) {
        nodes.push(node);
      }
    }
    return nodes;
  }

  // Translate a list of text nodes in batch
  async function translateNodes(nodes) {
    if (nodes.length === 0) return;

    // Filter nodes that are already currently translating
    const targets = nodes.filter(n => !translatingNodes.has(n));
    if (targets.length === 0) return;

    // Mark as translating
    targets.forEach(n => translatingNodes.add(n));

    // Cache original values if not cached yet
    targets.forEach(node => {
      if (!originalTextCache.has(node)) {
        originalTextCache.set(node, node.nodeValue);
      }
    });

    const originalTexts = targets.map(node => node.nodeValue);

    // Call background service worker to perform batch translation
    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({
          action: "translate",
          texts: originalTexts,
          region: currentRegion
        }, resolve);
      });

      if (response && response.success && response.texts) {
        for (let i = 0; i < targets.length; i++) {
          const node = targets[i];
          const translated = response.texts[i];
          if (translated) {
            node.nodeValue = translated;
          }
          translatingNodes.delete(node);
        }
      } else {
        console.warn("Translation returned unsuccessful response:", response?.error);
        targets.forEach(n => translatingNodes.delete(n));
      }
    } catch (e) {
      console.error("Translation message failed:", e);
      targets.forEach(n => translatingNodes.delete(n));
    }
  }

  // Revert translated text back to original values
  function revertAllText() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      if (originalTextCache.has(node)) {
        node.nodeValue = originalTextCache.get(node);
      }
    }
  }

  // Live Mutation Observer to handle dynamic content
  let observer = null;
  let mutationQueue = [];
  let mutationTimeout = null;

  function processMutationQueue() {
    if (mutationQueue.length === 0) return;
    const nodes = [...mutationQueue];
    mutationQueue = [];
    translateNodes(nodes);
  }

  function startObserving() {
    if (observer) return;

    observer = new MutationObserver((mutations) => {
      if (!isTranslating) return;

      let newTextNodes = [];
      for (const mutation of mutations) {
        if (mutation.addedNodes) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
              if (isTranslatableNode(node)) {
                newTextNodes.push(node);
              }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              newTextNodes = [...newTextNodes, ...getTextNodes(node)];
            }
          });
        }
        if (mutation.type === "characterData" && isTranslating) {
          // Re-translate updated text values if it changed from user/page interactions
          const node = mutation.target;
          if (isTranslatableNode(node) && !translatingNodes.has(node)) {
            const currentVal = node.nodeValue;
            const originalVal = originalTextCache.get(node);
            
            // Only translate if the text actually changed and is not the translated value itself
            if (originalVal !== currentVal) {
              originalTextCache.set(node, currentVal); // update original cache with new value
              newTextNodes.push(node);
            }
          }
        }
      }

      if (newTextNodes.length > 0) {
        mutationQueue = [...mutationQueue, ...newTextNodes];
        clearTimeout(mutationTimeout);
        mutationTimeout = setTimeout(processMutationQueue, 500); // Batch mutate every 500ms
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: true
    });
  }

  function stopObserving() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  // Primary switch trigger
  async function enableTranslation(region) {
    currentRegion = region;
    isTranslating = true;
    
    showStatus("Translating page...", true);
    
    const allNodes = getTextNodes(document.body);
    await translateNodes(allNodes);
    
    showStatus(`Page converted to English (${region.toUpperCase()})`, false);
    startObserving();
  }

  function disableTranslation() {
    isTranslating = false;
    stopObserving();
    revertAllText();
    showStatus("Restored original language", false);
  }

  // Listen to messages from extension popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggle-translation") {
      if (request.enabled) {
        enableTranslation(request.region);
      } else {
        disableTranslation();
      }
      sendResponse({ success: true });
    }
  });

  // Check state on load (supports retention when navigating tabs)
  chrome.storage.local.get(["translationEnabled", "translationRegion"], (store) => {
    if (store.translationEnabled) {
      // Small timeout to let initial page render complete
      setTimeout(() => {
        enableTranslation(store.translationRegion || "us");
      }, 800);
    }
  });
})();
