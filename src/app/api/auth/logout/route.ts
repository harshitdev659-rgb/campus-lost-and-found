import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Successfully signed out" });
  response.cookies.delete("campus_auth_token");
  return response;
}
