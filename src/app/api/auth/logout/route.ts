import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("retailstacker_plan");
  response.cookies.delete("retailstacker_user");
  return response;
}
