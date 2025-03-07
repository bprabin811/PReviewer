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

        // Get current user
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return new Response("User not found", { status: 404 });

        // Check if the user has access to this repository
        const access = await prisma.userRepositoryAccess.findFirst({
            where: { userId: user.id, repositoryId: repoId },
        });

        if (!access) {
            return new Response(JSON.stringify({ error: "Permission denied" }), { status: 403 });
        }

        // Get users of the repository
        const users = await prisma.userRepositoryAccess.findMany({
            where: { repositoryId: repoId },
            include: { user: true },
        });

        return Response.json(users);
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}