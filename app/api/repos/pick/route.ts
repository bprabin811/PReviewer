import { getServerSession } from "next-auth";
import { authOptions } from "@/config/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request): Promise<Response> {
  try {
    // Step 1: Get session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Step 2: Find the user ID from the User table using email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    // Step 3: Find the account using the user ID
    const account = await prisma.account.findFirst({
      where: { userId: user.id },
      select: { userId: true, access_token: true },
    });

    if (!account || !account.userId || !account.access_token) {
      return new Response(JSON.stringify({ error: "Account not found" }), { status: 404 });
    }

    const userId = account.userId; // Store userId

    // Step 4: Parse request body
    const { githubRepoId, name, owner, privateRepo, url } = await req.json();

    // find contributos
    const contributors = await fetch(`https://api.github.com/repos/${owner}/${name}/contributors`, {
      headers: {
        Authorization: `token ${account.access_token}`,
        Accept: 'application/vnd.github+json',
        "X-GitHub-Api-Version": "2022-11-28"
      },
    }).then((res) => res.json());

    // Step 5: Save repository in the database
    const repo = await prisma.repository.create({
      data: {
        githubRepoId: `${githubRepoId}`,
        name,
        owner,
        private: privateRepo,
        url,
        users: {
          create: {
            userId: userId, // Correctly assigning userId
            role: "ADMIN", // Assign user as ADMIN
            permissions: { view_logs: true, user_management: true, view_ai_reviews: true }, // Full permissions
          },
        },//want to save id and login of contributors
        contributors: {
          create: contributors.map((contributor: any) => {
            return {
              id: contributor.id,
              login: contributor.login,
            }
          }
          )
        }
      },
    });

    // Step 6: Log the action
    await prisma.log.create({
      data: {
        action: "REPO_ADDED",
        userId: userId,
        repositoryId: repo.id,
        details: { repoName: repo.name },
      },
    });

    return new Response(JSON.stringify(repo), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error adding repository:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
