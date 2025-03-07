import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/config/authOptions";

export async function GET(req: Request, { params }: { params: Promise<{ repoId: string, prId:string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session?.user?.email) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { repoId , prId } = await params;

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

        // Validate repository ID
        if (!repoId) {
            return new Response(JSON.stringify({ error: "Repository ID is required" }), { status: 400 });
        }

        const prData = await prisma.pullRequest.findUnique({
            where: { githubPRId: prId , status: "OPEN" },
            include: { repository:true },
        });

        if (!prData) {
            return new Response("PR not found", { status: 404 });
        }

        //get all the details of the PR from github api
        const diff = await fetch(`https://api.github.com/repos/${prData.repository.owner}/${prData.repository.name}/pulls/${prData.pullId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${account.access_token}`,
                "Accept": "application/vnd.github.v3.diff",
                "X-GitHub-Api-Version": "2022-11-28",
            },
        });
        
        const diffText = await diff.text();
        return new Response(diffText, { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
