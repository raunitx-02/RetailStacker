"use server";

import { cookies } from "next/headers";
import { getAllUsers, deleteUser, saveUser, findUser } from "@/lib/db";
import crypto from "crypto";

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function verifyReseller() {
  const cookieStore = await cookies();
  const role = cookieStore.get("retailstacker_role")?.value;
  if (role !== "reseller") {
    throw new Error("Unauthorized. Only resellers can perform this action.");
  }
}

function calculateExpiry(validity: string) {
  if (!validity || validity === "Lifetime" || validity === "lifetime") {
    return null;
  }
  const now = Date.now();
  switch (validity) {
    case "1 Month":
      return now + 30 * 24 * 60 * 60 * 1000;
    case "3 Months":
      return now + 90 * 24 * 60 * 60 * 1000;
    case "6 Months":
      return now + 180 * 24 * 60 * 60 * 1000;
    case "1 Year":
      return now + 365 * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}

export async function fetchUsersAction() {
  await verifyReseller();
  const cookieStore = await cookies();
  const resellerEmail = cookieStore.get("retailstacker_user")?.value;
  
  return getAllUsers()
    .filter((u: any) => u.createdBy === resellerEmail)
    .map((u: any) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      mobile: u.mobile || "",
      plan: u.plan || "Free",
      planValidity: u.planValidity || "Lifetime",
      planExpiresAt: u.planExpiresAt || null,
      createdAt: u.createdAt
    }));
}

export async function activatePlanAction(email: string, plan: string, validity: string = "Lifetime") {
  await verifyReseller();
  const cookieStore = await cookies();
  const resellerEmail = cookieStore.get("retailstacker_user")?.value;
  
  const user = findUser(email);
  if (!user) throw new Error("User not found");
  if (user.createdBy !== resellerEmail) {
    throw new Error("Access denied. You do not own this customer profile.");
  }

  user.plan = plan;
  user.planValidity = validity;
  user.planExpiresAt = calculateExpiry(validity);
  saveUser(user);
  return { success: true };
}

export async function deleteUserAction(email: string) {
  await verifyReseller();
  const cookieStore = await cookies();
  const resellerEmail = cookieStore.get("retailstacker_user")?.value;

  const user = findUser(email);
  if (!user) throw new Error("User not found");
  if (user.createdBy !== resellerEmail) {
    throw new Error("Access denied. You do not own this customer profile.");
  }

  deleteUser(email);
  return { success: true };
}

export async function createUserAction(
  email: string, 
  password: string, 
  plan: string, 
  firstName: string = "", 
  lastName: string = "", 
  mobile: string = "", 
  validity: string = "Lifetime"
) {
  await verifyReseller();
  const cookieStore = await cookies();
  const resellerEmail = cookieStore.get("retailstacker_user")?.value;

  if (findUser(email)) throw new Error("Email already exists");
  
  const newUser = {
    email,
    password: hashPassword(password),
    firstName,
    lastName,
    mobile,
    plan: plan,
    planValidity: validity,
    planExpiresAt: calculateExpiry(validity),
    createdBy: resellerEmail,
    createdAt: Date.now(),
  };
  saveUser(newUser);
  return { success: true };
}

export async function fetchResellerInfoAction() {
  await verifyReseller();
  const cookieStore = await cookies();
  const email = cookieStore.get("retailstacker_user")?.value;
  if (!email) throw new Error("No session found");
  const user = findUser(email);
  if (!user) throw new Error("Reseller not found");
  return {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email,
    mobile: user.mobile || "",
  };
}

export async function updateResellerSettingsAction(data: {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password?: string;
}) {
  await verifyReseller();
  const cookieStore = await cookies();
  const currentEmail = cookieStore.get("retailstacker_user")?.value;
  if (!currentEmail) throw new Error("No session found");
  const reseller = findUser(currentEmail);
  if (!reseller) throw new Error("Reseller not found");

  if (data.email !== currentEmail) {
    if (findUser(data.email)) {
      throw new Error("Email already in use by another user");
    }
  }

  reseller.firstName = data.firstName;
  reseller.lastName = data.lastName;
  reseller.mobile = data.mobile;
  
  const oldEmail = reseller.email;
  reseller.email = data.email;

  if (data.password) {
    reseller.password = hashPassword(data.password);
  }

  if (data.email !== oldEmail) {
    saveUser(reseller);
    deleteUser(oldEmail);
    // Also update createdBy for users that this reseller owned
    const allUsers = getAllUsers();
    allUsers.forEach((u: any) => {
      if (u.createdBy === oldEmail) {
        u.createdBy = data.email;
        saveUser(u);
      }
    });
    
    cookieStore.set("retailstacker_user", data.email, { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 30 * 24 * 60 * 60 });
  } else {
    saveUser(reseller);
  }

  return { success: true };
}

export async function fetchResellerStatsAction() {
  await verifyReseller();
  const cookieStore = await cookies();
  const resellerEmail = cookieStore.get("retailstacker_user")?.value;
  if (!resellerEmail) throw new Error("No session found");

  const myUsers = getAllUsers().filter((u: any) => u.createdBy === resellerEmail);
  
  const totalUsers = myUsers.length;
  
  const activeUsers = myUsers.filter((u: any) => {
    if (u.plan === "Free") return false;
    if (u.planExpiresAt && Date.now() > u.planExpiresAt) return false;
    return true;
  }).length;

  const planCounts: Record<string, number> = {
    Free: 0,
    Lite: 0,
    Starter: 0,
    Growth: 0,
    Diamond: 0,
  };

  myUsers.forEach((u: any) => {
    let p = u.plan || "Free";
    if (u.planExpiresAt && Date.now() > u.planExpiresAt) {
      p = "Free";
    }
    planCounts[p] = (planCounts[p] || 0) + 1;
  });

  const soonExpiring = myUsers.filter((u: any) => {
    if (u.plan === "Free" || !u.planExpiresAt) return false;
    const diff = u.planExpiresAt - Date.now();
    return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  }).map((u: any) => ({
    email: u.email,
    firstName: u.firstName || "",
    lastName: u.lastName || "",
    plan: u.plan,
    expiresAt: u.planExpiresAt,
  }));

  return {
    totalUsers,
    activeUsers,
    planCounts,
    soonExpiring,
  };
}
