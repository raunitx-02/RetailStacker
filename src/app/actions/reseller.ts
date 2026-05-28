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

export async function fetchUsersAction() {
  await verifyReseller();
  return getAllUsers().map((u: any) => ({
    id: u.id,
    email: u.email,
    plan: u.plan || "Free",
    createdAt: u.createdAt
  }));
}

export async function activatePlanAction(email: string, plan: string) {
  await verifyReseller();
  const user = findUser(email);
  if (!user) throw new Error("User not found");
  user.plan = plan;
  saveUser(user);
  return { success: true };
}

export async function deleteUserAction(email: string) {
  await verifyReseller();
  deleteUser(email);
  return { success: true };
}

export async function createUserAction(email: string, password: string, plan: string) {
  await verifyReseller();
  if (findUser(email)) throw new Error("Email already exists");
  
  const newUser = {
    email,
    password: hashPassword(password),
    plan: plan,
    createdAt: Date.now(),
  };
  saveUser(newUser);
  return { success: true };
}
