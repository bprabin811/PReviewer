import { getServerSession } from "next-auth";
import { authOptions } from "@/config/authOptions";
import { prisma } from "@/lib/prisma";
import { checkPermissions } from "@/lib/rbac";


export async function DELETE(req: Request, { params }: { params: Promise<{ repoId: string, userId: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session?.user?.email) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { repoId, userId } = await params;



        // Get admin user
        const admin = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!admin) return new Response("Admin not found", { status: 404 });

        const hasPermission = await checkPermissions(admin.id, repoId, "ADMIN");
        if (!hasPermission) return new Response("Permission denied", { status: 403 });

        // Prevent removing the last ADMIN
        const adminCount = await prisma.userRepositoryAccess.count({
            where: { repositoryId: repoId, role: "ADMIN", userId: { not: admin.id } },
        });

        if (adminCount === 1) {
            return new Response(JSON.stringify({ error: "Cannot remove the last ADMIN" }), { status: 400 });
        }

        // Remove user
        await prisma.userRepositoryAccess.deleteMany({
            where: { userId, repositoryId: repoId },
        });

        await prisma.log.create({
            data: {
              action: "USER_DELETED",
              userId: userId,
              repositoryId: repoId,
              details: { deletedBy: admin.id},
            },
          });

        return new Response(JSON.stringify({ message: "User removed successfully" }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
