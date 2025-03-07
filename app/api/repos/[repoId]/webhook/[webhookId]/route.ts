import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/authOptions";


export async function DELETE(req: Request, { params }: { params: Promise<{ repoId: string, webhookId: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { repoId, webhookId } = await params;

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
            return new Response("Repository not found", { status: 404 });
        }

        const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/hooks/${webhookId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${account.access_token}`,
                "Accept": "application/vnd.github.v3+json",
            },
        });

        if (!response.ok) {
            return new Response("Failed to delete webhook", { status: response.status });
        }

        // Update the database
        await prisma.repository.update({
            where: { id: repoId },
            data: { webhookId: null, workflowEnabled: false },
        });

        return new Response("Webhook deleted", { status: 200 });
    } catch (error) {
        console.error("Delete Webhook Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
