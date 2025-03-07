import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/authOptions";

export async function POST(req: Request, { params }: { params: Promise<{ repoId: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const { repoId } = await params;

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

        // Get the repository
        const repo = await prisma.repository.findUnique({
            where: { id: repoId },
        });

        if (!repo) {
            return new Response(JSON.stringify({ error: "Repository not found" }), { status: 404 });
        }

        // Create webhook
        const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/hooks`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${account.access_token}`,
                "Accept": "application/vnd.github.v3+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
            body: JSON.stringify({
                name: "web",
                active: true,
                events: ["pull_request"],
                config: {
                    url: `${process.env.NEXT_PUBLIC_API_URL}/api/webhook/github`,
                    content_type: "json",
                },
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("GitHub Webhook Error:", data);
            return new Response(JSON.stringify(data), { status: response.status });
        }

        // Save webhook info in database
        await prisma.repository.update({
            where: { id: repoId },
            data: { webhookId: `${data.id}`, workflowEnabled: true },
        });

        return new Response(JSON.stringify({ message: "Webhook registered", webhookId: data.id }), { status: 201 });
    } catch (error) {
        console.error("Webhook Setup Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ repoId: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const { repoId } = await params;

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

        const repo = await prisma.repository.findUnique({
            where: { id: repoId },
        });

        if (!repo) {
            return new Response(JSON.stringify({ error: "Repository not found" }), { status: 404 });
        }

        // Fetch existing webhooks
        const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/hooks`, {
            headers: {
                "Authorization": `Bearer ${account.access_token}`,
                "Accept": "application/vnd.github.v3+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("Fetch Webhooks Error:", data);
            return new Response(JSON.stringify(data), { status: response.status });
        }

        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
        console.error("Fetch Webhooks Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
