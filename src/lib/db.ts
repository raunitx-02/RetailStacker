import fs from "fs";
import path from "path";
import crypto from "crypto";

// For persistence locally, we use a data.json file at the project root.
const DB_PATH = path.join(process.cwd(), "data.json");

// Define a hashed version of the reseller password ("reseller@2345")
const RESELLER_HASH = crypto.createHash("sha256").update("reseller@2345").digest("hex");

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
    }
  ],
  otps: {}
};

export const getDB = () => {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf8");
      return JSON.parse(data);
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

export const findUser = (email: string) => {
  const db = getDB();
  return db.users.find((u: any) => u.email === email);
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
  // Don't return the reseller account in the general users list
  return db.users.filter((u: any) => u.role !== "reseller");
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
