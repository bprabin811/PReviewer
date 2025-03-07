import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/config/authOptions";

export async function GET(): Promise<Response> {
  try {
    // Step 1: Get session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Step 2: Get the user ID from the User table
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    // Step 3: Get the access token from the Account table
    const account = await prisma.account.findFirst({
      where: { userId: user.id },
      select: { access_token: true },
    });

    if (!account || !account.access_token) {
      return new Response(JSON.stringify({ error: "Access token not found" }), { status: 404 });
    }

    // Step 4: Fetch repositories from GitHub API
    const res = await fetch("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${account.access_token}`,
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch repositories" }), { status: res.status });
    }

    const repos = await res.json();
    return new Response(JSON.stringify(repos), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
