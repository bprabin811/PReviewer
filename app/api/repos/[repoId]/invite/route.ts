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
        const { email, role, permissions } = await req.json();

        if (!email || !role) {
            return new Response(JSON.stringify({ error: "Email and role are required" }), { status: 400 });
        }

        //find user id from users
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return new Response("User not found", { status: 404 });

        // Get admin user
        const access = await prisma.userRepositoryAccess.findFirst({
            where: {
                userId: user.id,
                repositoryId: repoId,
            },
        });

        if(access?.role === "VIEWER" || (access?.permissions as any)?.user_management === false){
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        // Get repository
        const repo = await prisma.repository.findUnique({ where: { id: repoId } });
        if (!repo) return new Response("Repository not found", { status: 404 });

        // Check if invited user exists
        let invitedUser = await prisma.user.findUnique({ where: { email },include: { accounts: true } });
        if (!invitedUser) {
            return new Response(JSON.stringify({ error: "User not found in this system. Ensure that user has signed up." }), { status: 404 });
        }

        //check invitedUser.accounts.providerAccountId is in repo.contributors
        const isContributor = (repo?.contributors as any)?.some((contributor:any) => invitedUser.accounts.some(account => account.providerAccountId === contributor.id));

        if (!isContributor) {
            return new Response(JSON.stringify({ error: "Invited User is not a contributor for this repository." }), { status: 404 });
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
                invitedBy: user.id,
                permissions,
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
