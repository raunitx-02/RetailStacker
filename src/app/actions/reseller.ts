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
  return getAllUsers().map((u: any) => ({
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
  const user = findUser(email);
  if (!user) throw new Error("User not found");
  user.plan = plan;
  user.planValidity = validity;
  user.planExpiresAt = calculateExpiry(validity);
  saveUser(user);
  return { success: true };
}

export async function deleteUserAction(email: string) {
  await verifyReseller();
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
    createdAt: Date.now(),
  };
  saveUser(newUser);
  return { success: true };
}
