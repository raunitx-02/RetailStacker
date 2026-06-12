// Popup controller for RetailStacker Chrome Extension

document.addEventListener("DOMContentLoaded", async () => {
  const authSection = document.getElementById("auth-section");
  const dashboardSection = document.getElementById("dashboard-section");
  
  // Auth Form elements
  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");
  const signupFields = document.getElementById("signup-fields");
  const signupMobileGroup = document.getElementById("signup-mobile-group");
  const submitBtn = document.getElementById("auth-submit-btn");
  const authForm = document.getElementById("auth-form");
  const emailInput = document.getElementById("auth-email");
  const passwordInput = document.getElementById("auth-password");
  const firstNameInput = document.getElementById("reg-firstname");
  const lastNameInput = document.getElementById("reg-lastname");
  const mobileInput = document.getElementById("reg-mobile");
  const errorMsg = document.getElementById("auth-error");
  const googleBtn = document.getElementById("google-login-btn");

  // Dashboard elements
  const userEmail = document.getElementById("user-email");
  const userPlan = document.getElementById("user-plan");
  const logoutBtn = document.getElementById("logout-action-btn");
  
  // Tab Mode
  let isSignupMode = false;

  // Initialize and check active session
  await checkSessionState();

  // Tab switching
  tabLogin.addEventListener("click", () => {
    isSignupMode = false;
    tabLogin.classList.add("active");
    tabSignup.classList.remove("active");
    signupFields.style.display = "none";
    signupMobileGroup.style.display = "none";
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
    signupMobileGroup.style.display = "block";
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
      // Handle Registration
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
      // Handle Login
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

  // Google Login redirect helper
  googleBtn.addEventListener("click", async () => {
    // Open main login page in new tab where they can continue with Google OAuth
    const siteUrl = await getWebUrl();
    chrome.tabs.create({ url: `${siteUrl}/login` });
  });

  // Disconnect session
  logoutBtn.addEventListener("click", async () => {
    const siteUrl = await getWebUrl();
    // Open logout URL or prompt disconnect
    chrome.tabs.create({ url: `${siteUrl}/pricing` });
  });

  // Helper to show errors
  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
  }

  // Fetch current session state from background
  async function checkSessionState() {
    const res = await chrome.runtime.sendMessage({ action: "check-session" });
    if (res && res.loggedIn) {
      showDashboard(res.user);
    } else {
      showAuth();
    }
  }

  // Show Dashboard layout
  async function showDashboard(user) {
    authSection.classList.remove("active");
    dashboardSection.classList.add("active");
    
    userEmail.textContent = user.email;
    userPlan.textContent = `${user.plan} Plan`;

    // Apply color styling to badges
    userPlan.className = "plan-badge";
    if (user.plan.toLowerCase() === "diamond") {
      userPlan.classList.add("diamond");
    } else if (user.plan.toLowerCase() === "growth" || user.plan.toLowerCase() === "starter") {
      userPlan.classList.add("growth");
    }

    // Configure Quick Links URL dynamically
    const webBase = await getWebUrl();
    document.getElementById("link-dashboard").href = `${webBase}/dashboard`;
    document.getElementById("link-blackbox").href = `${webBase}/product-research/black-box`;
    document.getElementById("link-cerebro").href = `${webBase}/tools/cerebro`;
    document.getElementById("link-magnet").href = `${webBase}/tools/magnet`;
  }

  // Show login form
  function showAuth() {
    dashboardSection.classList.remove("active");
    authSection.classList.add("active");
  }

  // Resolve Web Application base URL
  async function getWebUrl() {
    try {
      const devRes = await fetch("http://localhost:3000/api/extension/auth/me", { method: "HEAD" });
      if (devRes.ok || devRes.status === 401) {
        return "http://localhost:3000";
      }
    } catch (e) {
      // Local server offline
    }
    return "https://retailstacker.com";
  }
});
