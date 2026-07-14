// Popup controller for English Language Converter

document.addEventListener("DOMContentLoaded", async () => {
  const authSection = document.getElementById("auth-section");
  const dashboardSection = document.getElementById("dashboard-section");
  const upgradeSection = document.getElementById("upgrade-section");
  const translatorControls = document.getElementById("translator-controls");
  
  // Auth Form elements
  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");
  const signupFields = document.getElementById("signup-fields");
  const submitBtn = document.getElementById("auth-submit-btn");
  const authForm = document.getElementById("auth-form");
  const emailInput = document.getElementById("auth-email");
  const passwordInput = document.getElementById("auth-password");
  const firstNameInput = document.getElementById("reg-firstname");
  const lastNameInput = document.getElementById("reg-lastname");
  const mobileInput = document.getElementById("reg-mobile");
  const errorMsg = document.getElementById("auth-error");

  // Dashboard elements
  const userEmail = document.getElementById("user-email");
  const userPlan = document.getElementById("user-plan");
  const logoutBtn = document.getElementById("logout-action-btn");
  
  // Translator Switchers
  const translationToggle = document.getElementById("translation-toggle");
  const localeButtons = document.querySelectorAll(".locale-btn");
  const expiryBanner = document.getElementById("expiry-banner");

  let isSignupMode = false;

  // Initialize and check active session
  await checkSessionState();

  // Tab switching
  tabLogin.addEventListener("click", () => {
    isSignupMode = false;
    tabLogin.classList.add("active");
    tabSignup.classList.remove("active");
    signupFields.style.display = "none";
    submitBtn.textContent = "Log In Workspace";
    errorMsg.style.display = "none";
    firstNameInput.removeAttribute("required");
    lastNameInput.removeAttribute("required");
  });

  tabSignup.addEventListener("click", () => {
    isSignupMode = true;
    tabSignup.classList.add("active");
    tabLogin.classList.remove("active");
    signupFields.style.display = "flex";
    submitBtn.textContent = "Create Account";
    errorMsg.style.display = "none";
    firstNameInput.setAttribute("required", "true");
    lastNameInput.setAttribute("required", "true");
  });

  // Handle Form Submission
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.style.display = "none";
    submitBtn.textContent = isSignupMode ? "Creating Account..." : "Logging In...";
    submitBtn.disabled = true;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (isSignupMode) {
      const firstName = firstNameInput.value.trim();
      const lastName = lastNameInput.value.trim();
      const mobile = mobileInput.value.trim();

      const res = await chrome.runtime.sendMessage({
        action: "register",
        data: { email, password, firstName, lastName, mobile }
      });

      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";

      if (res && res.success) {
        await checkSessionState();
      } else {
        showError(res?.error || "Registration failed. Try again.");
      }
    } else {
      const res = await chrome.runtime.sendMessage({
        action: "login",
        email,
        password
      });

      submitBtn.disabled = false;
      submitBtn.textContent = "Log In Workspace";

      if (res && res.success) {
        await checkSessionState();
      } else {
        showError(res?.error || "Invalid username or password.");
      }
    }
  });

  // Disconnect session
  logoutBtn.addEventListener("click", async () => {
    const webBase = await getWebUrl();
    chrome.tabs.create({ url: `${webBase}/pricing` });
  });

  // Toggle Translation
  translationToggle.addEventListener("change", async () => {
    const enabled = translationToggle.checked;
    const activeLocale = document.querySelector(".locale-btn.active")?.getAttribute("data-locale") || "us";
    
    // Save state
    await chrome.storage.local.set({ translationEnabled: enabled });

    // Send translation signal to active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { 
        action: "toggle-translation", 
        enabled: enabled,
        region: activeLocale 
      });
    }
  });

  // Change Localized Region
  localeButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      localeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const region = btn.getAttribute("data-locale");
      await chrome.storage.local.set({ translationRegion: region });

      // If translation is currently ON, trigger immediate updates to the content script
      if (translationToggle.checked) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
          chrome.tabs.sendMessage(tab.id, { 
            action: "toggle-translation", 
            enabled: true,
            region: region
          });
        }
      }
    });
  });

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
  }

  // Check user subscription status and render appropriate view
  async function checkSessionState() {
    const res = await chrome.runtime.sendMessage({ action: "check-session" });
    if (res && res.loggedIn) {
      showDashboard(res.user);
    } else {
      showAuth();
    }
  }

  async function showDashboard(user) {
    authSection.classList.remove("active");
    dashboardSection.classList.add("active");
    
    userEmail.textContent = user.email;
    userPlan.textContent = `${user.plan} Plan`;

    // Apply design tokens based on plan tier
    userPlan.className = "plan-badge";
    if (user.plan.toLowerCase() === "diamond") {
      userPlan.classList.add("diamond");
    } else if (user.plan.toLowerCase() === "growth" || user.plan.toLowerCase() === "starter") {
      userPlan.classList.add("growth");
    }

    // Check if user has active Translator subscription
    const hasTranslator = !!user.hasTranslatorSubscription;
    
    if (hasTranslator) {
      translatorControls.style.display = "block";
      upgradeSection.classList.remove("active");
      
      // Load current translation options from storage
      const store = await chrome.storage.local.get(["translationEnabled", "translationRegion"]);
      translationToggle.checked = !!store.translationEnabled;

      const region = store.translationRegion || "us";
      localeButtons.forEach(btn => {
        if (btn.getAttribute("data-locale") === region) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });

      // Show expiry warning starting 7 days prior
      if (user.translatorExpiresAt) {
        const msLeft = user.translatorExpiresAt - Date.now();
        const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
        if (daysLeft > 0 && daysLeft <= 7) {
          expiryBanner.textContent = `⚠️ Your Translator subscription expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Please renew to prevent interruption.`;
          expiryBanner.style.display = "block";
        } else {
          expiryBanner.style.display = "none";
        }
      } else {
        expiryBanner.style.display = "none";
      }
    } else {
      // User is not subscribed to the translator or subscription expired
      translatorControls.style.display = "none";
      upgradeSection.classList.add("active");
      expiryBanner.style.display = "none";
    }

    const webBase = await getWebUrl();
    document.getElementById("upgrade-link").href = `${webBase}/tools/translator`;
  }

  function showAuth() {
    dashboardSection.classList.remove("active");
    authSection.classList.add("active");
  }

  async function getWebUrl() {
    try {
      const devRes = await fetch("http://localhost:3000/api/extension/auth/me", { method: "HEAD" });
      if (devRes.ok || devRes.status === 401) {
        return "http://localhost:3000";
      }
    } catch (e) {}
    return "https://retailstacker.com";
  }
});
