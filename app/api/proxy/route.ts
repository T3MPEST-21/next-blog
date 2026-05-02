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
      Authorization: `Bearer ${finalToken}`,
    };

    const response = await axios({
      url,
      method,
      data: payload ?? null,
      headers,
      validateStatus: () => true,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error("API proxy error:", error);

    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 },
    );
  }
}
