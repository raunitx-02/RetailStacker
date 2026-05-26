import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, credentials } = body;

    if (action === "verify") {
      const { refreshToken, clientId, clientSecret } = credentials || {};
      
      if (!refreshToken || !clientId || !clientSecret) {
        return NextResponse.json({ error: "Missing required SP-API credentials" }, { status: 400 });
      }

      // If the user provides demo credentials, bypass for demonstration
      if (refreshToken.startsWith("demo_") || refreshToken === "Atzr|IwEBIxxxxxxxxxxxxxxxxxxxxxxxx") {
        return NextResponse.json({ success: true, message: "Demo SP-API verified" });
      }

      // Actual SP-API Token generation request to LWA (Login with Amazon)
      const tokenUrl = "https://api.amazon.com/auth/o2/token";
      const params = new URLSearchParams();
      params.append("grant_type", "refresh_token");
      params.append("refresh_token", refreshToken);
      params.append("client_id", clientId);
      params.append("client_secret", clientSecret);

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: "Invalid SP-API credentials", details: errorData },
          { status: 401 }
        );
      }

      const data = await response.json();
      return NextResponse.json({ success: true, accessToken: data.access_token });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  } catch (error: any) {
    console.error("[Amazon Proxy Error]", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
