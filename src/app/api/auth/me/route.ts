import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET() {
  const { userId, orgId, orgRole } = await auth();
  const user = await currentUser();

  if (!userId) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  return NextResponse.json({
    authenticated: true,
    userId,
    email: user?.emailAddresses?.[0]?.emailAddress ?? null,
    name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null,
    orgId: orgId ?? null,
    orgRole: orgRole ?? null,
  });
}
