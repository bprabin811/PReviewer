// app/api/repos/selected/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session?.user?.email) {
            return new Response("Unauthorized", { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const repos = await prisma.repository.findMany({
            where: {
                users: {
                    some: {
                        userId: user.id,
                    },
                },
            },
            include: {
                users: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        return Response.json(repos);
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}