import { prisma } from "@/lib/prisma";

interface LogDetails {
  action: string;
  details: object;
  repositoryId: string;
  userId: string;
}

export async function logWebhook({ action, details, repositoryId, userId }: LogDetails) {
  try {
    await prisma.log.create({
      data: {
        action: `${action.toUpperCase()}`, 
        details: details,
        repositoryId: repositoryId,
        userId: userId,
      },
    });
    console.log("Log saved successfully.");
  } catch (error) {
    console.error("Error saving log:", error);
  }
}
