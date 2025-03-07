import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/config/authOptions";

export async function POST(req: Request, { params }: { params: Promise<{ repoId: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session?.user?.email) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { repoId } = await params;
        const { email, role } = await req.json();

        if (!email || !role) {
            return new Response(JSON.stringify({ error: "Email and role are required" }), { status: 400 });
        }

        // Get admin user
        const admin = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!admin) return new Response("Admin not found", { status: 404 });

        // Get repository
        const repo = await prisma.repository.findUnique({ where: { id: repoId } });
        if (!repo) return new Response("Repository not found", { status: 404 });

        // Check if the current user is an ADMIN of this repo
        const adminAccess = await prisma.userRepositoryAccess.findFirst({
            where: { userId: admin.id, repositoryId: repoId, role: "ADMIN" },
        });

        if (!adminAccess) {
            return new Response(JSON.stringify({ error: "Permission denied" }), { status: 403 });
        }

        // Check if invited user exists
        let invitedUser = await prisma.user.findUnique({ where: { email } });
        if (!invitedUser) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        // Check if user is already added
        const existingAccess = await prisma.userRepositoryAccess.findFirst({
            where: { userId: invitedUser.id, repositoryId: repoId },
        });

        if (existingAccess) {
            return new Response(JSON.stringify({ error: "User already added" }), { status: 400 });
        }

        // Assign role to invited user
        await prisma.userRepositoryAccess.create({
            data: {
                userId: invitedUser.id,
                repositoryId: repoId,
                role,
                invitedBy: admin.id,
                permissions: { viewLogs: true }, // Default permissions
            },
        });

        await prisma.log.create({
            data: {
              action: "USER_INVITED",
              userId: invitedUser.id,
              repositoryId: repo.id,
              details: { repoName: repo.name },
            },
          });

        return new Response(JSON.stringify({ message: "User invited successfully" }), { status: 200 });

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
