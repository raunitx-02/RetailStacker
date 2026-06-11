import fs from "fs";
import path from "path";
import crypto from "crypto";

// For persistence locally, we use a data.json file at the project root.
const DB_PATH = path.join(process.cwd(), "data.json");

// Define a hashed version of the reseller password ("reseller@2345")
const RESELLER_HASH = crypto.createHash("sha256").update("reseller@2345").digest("hex");
const ADMIN_HASH = crypto.createHash("sha256").update("Admin@0987").digest("hex");

// Default initial state
const DEFAULT_DB = {
  users: [
    {
      id: "reseller-1",
      email: "reseller@retailstacker.com",
      password: RESELLER_HASH,
      plan: "Diamond",
      role: "reseller",
      createdAt: Date.now()
    },
    {
      id: "admin-1",
      email: "admin@retailstacker.com",
      password: ADMIN_HASH,
      plan: "Diamond",
      role: "admin",
      createdAt: Date.now()
    }
  ],
  otps: {},
  plans: [
    {
      name: "Lite",
      price: 500,
      desc: "Perfect for sellers needing Chrome Extension & basic optimize tools.",
      features: ["Chrome Extension Download", "Meesho Image Optimizer", "GST Invoice Builder", "Frankenstein Keywords", "Scribbles Listing Writer", "Logistics Estimator", "URL Shortener & Builder", "QR Generator", "Community Support"]
    },
    {
      name: "Starter",
      price: 2999,
      desc: "Perfect for new sellers starting their Amazon India journey.",
      features: ["Everything in Lite", "Black Box Product Research", "Magnet Keywords", "Listing Builder"]
    },
    {
      name: "Growth",
      price: 5999,
      desc: "For serious sellers scaling across Indian marketplaces.",
      features: ["Everything in Starter", "Cerebro Reverse ASIN", "Xray Market Intelligence", "Meesho Shipping & Image Optimizer", "Keyword Tracker (500 words)", "Priority Email Support"]
    },
    {
      name: "Diamond",
      price: 12999,
      desc: "For agencies and power sellers dominating multiple categories.",
      features: ["Everything in Growth", "Unlimited Search & Tracking", "ONDC Intelligence", "WhatsApp Commerce Analytics", "Multi-storefront AI Scanner", "AI Auto-Fix Listings (Hindi/Eng)", "Dedicated Account Manager", "Full API Access"]
    }
  ]
};

export const getDB = () => {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf8");
      const parsed = JSON.parse(data);
      let updated = false;
      if (!parsed.plans || !parsed.plans.some((p: any) => p.name === "Lite")) {
        parsed.plans = DEFAULT_DB.plans;
        updated = true;
      }
      // Ensure admin exists
      if (!parsed.users.some((u: any) => u.email === "admin@retailstacker.com")) {
        parsed.users.push(DEFAULT_DB.users[1]);
        updated = true;
      }
      if (updated) {
        saveDB(parsed);
      }
      return parsed;
    }
  } catch (e) {
    console.error("Failed to read DB:", e);
  }
  return DEFAULT_DB;
};

export const saveDB = (data: any) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to write DB:", e);
  }
};

export const getPlans = () => {
  const db = getDB();
  return db.plans || DEFAULT_DB.plans;
};

export const savePlans = (plans: any[]) => {
  const db = getDB();
  db.plans = plans;
  saveDB(db);
};

export const findUser = (email: string) => {
  const db = getDB();
  const user = db.users.find((u: any) => u.email === email);
  if (user && user.plan && user.plan !== "Free" && user.planExpiresAt && Date.now() > user.planExpiresAt) {
    user.plan = "Free";
    user.planExpiresAt = null;
    const idx = db.users.findIndex((u: any) => u.email === email);
    db.users[idx] = user;
    saveDB(db);
  }
  return user;
};

export const saveUser = (user: any) => {
  const db = getDB();
  const idx = db.users.findIndex((u: any) => u.email === user.email);
  if (idx >= 0) {
    db.users[idx] = { ...db.users[idx], ...user };
  } else {
    // Generate an ID if missing
    if (!user.id) user.id = "user-" + Math.random().toString(36).substring(2, 9);
    db.users.push(user);
  }
  saveDB(db);
};

export const deleteUser = (email: string) => {
  const db = getDB();
  db.users = db.users.filter((u: any) => u.email !== email);
  saveDB(db);
};

export const getAllUsers = () => {
  const db = getDB();
  // Don't return the reseller or admin accounts in the general users list
  return db.users.filter((u: any) => u.role !== "reseller" && u.role !== "admin");
};

export const getAllResellers = () => {
  const db = getDB();
  return db.users.filter((u: any) => u.role === "reseller");
};

export const setOtp = (email: string, otp: string) => {
  const db = getDB();
  db.otps[email] = { otp, expires: Date.now() + 10 * 60 * 1000 }; // 10 min
  saveDB(db);
};

export const verifyOtp = (email: string, otp: string) => {
  const db = getDB();
  const record = db.otps[email];
  if (!record) return false;
  if (record.otp === otp && Date.now() < record.expires) {
    delete db.otps[email];
    saveDB(db);
    return true;
  }
  return false;
};
