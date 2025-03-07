import { prisma } from "@/lib/prisma";

export async function checkPermissions(userId: string, repoId: string, requiredRole: "ADMIN" | "CONTRIBUTOR" | "VIEWER") {
    const access = await prisma.userRepositoryAccess.findFirst({
        where: { userId, repositoryId: repoId },
    });

    console.log(access);

    if (!access) return false;
    
    const roleHierarchy = ["VIEWER", "CONTRIBUTOR", "ADMIN"];
    return roleHierarchy.indexOf(access.role) >= roleHierarchy.indexOf(requiredRole);
}
