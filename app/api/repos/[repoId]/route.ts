import { getServerSession } from "next-auth";
import { authOptions } from "@/config/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ repoId: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session?.user?.email) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { repoId } = await params;

        const repo = await prisma.repository.findUnique({
            where: { id: repoId },
            include: {
                users: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!repo) {
            return new Response(JSON.stringify({ error: "Repository not found" }), { status: 404 });
        }

        return Response.json(repo);
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
