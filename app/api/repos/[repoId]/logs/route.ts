import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/config/authOptions";

export async function GET(req: Request, { params }: { params: Promise<{ repoId: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session?.user?.email) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { repoId } = await params;

        const logs = await prisma.log.findMany({
            where: { repositoryId: repoId },
            include: { user: true },
            orderBy: { createdAt: "desc" },
        });

        return Response.json(logs);
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
