import { BASE_URL } from "@/common/baseurl";
import axios from "axios";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const {
      endpoint,
      payload,
      token: bodyToken,
      method = "POST",
    } = await req.json();

    console.log("API Proxy called:", { endpoint, payload, method });

    if (!endpoint) {
      return NextResponse.json(
        { message: "An Error Occured: Missing endpoint" },
        { status: 400 },
      );
    }

    const url = `${BASE_URL}/${endpoint}`;

    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("sitetoken")?.value;

    if(endpoint == 'logout'){
      cookieStore.delete("sitetoken");
    }

    const finalToken = cookieToken || bodyToken || "xxx";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Only add Authorization header for endpoints that require authentication
    if (endpoint !== 'login' && endpoint !== 'register') {
      headers.Authorization = `Bearer ${finalToken}`;
    }

    const response = await axios({
      url,
      method,
      data: payload ?? null,
      headers,
      validateStatus: () => true,
    });

    const nextResponse = NextResponse.json(response.data, { status: response.status });
    
    // Add CORS headers
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return nextResponse;
  } catch (error) {
    console.error("API proxy error:", error);

    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 },
    );
  }
}
