import { prisma } from "@/lib/prisma";
import Utils from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const event = req.headers.get("X-GitHub-Event");

        if (!event || !payload) {
            return new NextResponse("Invalid event", { status: 400 });
        }

        if (event === "pull_request") {
            const { action, pull_request, repository, sender } = payload;

            if (!pull_request || !repository || !sender) {
                return new NextResponse("Invalid PR data", { status: 400 });
            }

            // Find the user using providerAccountId (GitHub ID)
            const user = await prisma.user.findFirst({
                where: {
                    accounts: {
                        some: {
                            provider: "github",
                            providerAccountId: sender.id.toString(),
                        },
                    },
                },
                select: { id: true, email: true },
            });

            if (!user) {
                return new NextResponse("User not found", { status: 404 });
            }

            // Find the repository in DB
            const repo = await prisma.repository.findUnique({
                where: { githubRepoId: repository.id.toString() },
            });

            if (!repo) {
                return new NextResponse("Repository not found", { status: 404 });
            }

            // Store PR details in the database
            if (["opened", "synchronize", "closed", "reopened"].includes(action)) {
                const pullReqData = await prisma.pullRequest.upsert({
                    where: { githubPRId: pull_request.id.toString() },
                    update: {
                        status: (pull_request.merged && action === "closed") ? "MERGED" : action === "closed" ? "CLOSED" : "OPEN",
                        title: pull_request.title,
                        description: pull_request.body || "",
                        updatedAt: new Date(),
                        pullId: pull_request.number,
                        metadata:{
                            head: pull_request.head.ref,
                            base: pull_request.base.ref,
                            merged_by: pull_request?.merged_by
                        }
                    },
                    create: {
                        githubPRId: pull_request.id.toString(),
                        title: pull_request.title,
                        description: pull_request.body || "",
                        status: (pull_request.merged && action === "closed") ? "MERGED" : action === "closed" ? "CLOSED" : "OPEN",
                        repositoryId: repo.id,
                        userId: user.id,
                        pullId: pull_request.number,
                        metadata:{
                            head: pull_request.head.ref,
                            base: pull_request.base.ref,
                            merged_by: pull_request?.merged_by
                        },
                        createdAt: new Date(),
                    },
                });

                const PRID = pullReqData.id;

                // Log the event
                await prisma.log.create({
                    data: {
                        action: `PR_${action.toUpperCase()}`,
                        details: { prId: pull_request.id, user: sender.login },
                        repositoryId: repo.id,
                        userId: user.id,
                    },
                });

                const prData = {
                    owner: repository.owner.login,
                    repository: repository.name,
                    pullId: pull_request.number,
                }

                if (action === "opened" || action === "synchronize" || action === "reopened") {
                    const utils = new Utils(user.email || "");
                    const diff = await utils.getDiff(prData);
                    const review = await utils.AIReview(diff, repo.id, PRID, (repo?.config as any)?.system_prompt);
                    await utils.commentOnPR(prData, review);
                }

                return new NextResponse("Webhook received", { status: 200 });
            }
        }

        return new NextResponse("Unhandled event", { status: 200 });
    } catch (error) {
        console.error("Webhook Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
