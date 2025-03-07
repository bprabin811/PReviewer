import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logWebhook } from "./logWebhook";



class Utils {
    private user: any;
    private account: any;
    private initialized: boolean = false;
    private email: string;

    constructor(email: string) {
        this.email = email;
    }

    private async ensureInitialized() {
        if (!this.initialized) {
            await this.init();
            this.initialized = true;
        }
    }

    async init() {
        try {
            console.log(`Initializing Utils for: ${this.email}`);

            this.user = await prisma.user.findUnique({
                where: { email: this.email },
                select: { id: true },
            });

            if (!this.user) throw new Error("User not found");

            this.account = await prisma.account.findFirst({
                where: { userId: this.user.id },
                select: { access_token: true },
            });

            if (!this.account) throw new Error("Account not found");

            this.initialized = true;
        } catch (error) {
            console.error("Initialization error:", error);
            throw error;
        }
    }


    async getDiff(prData: any) {
        await this.ensureInitialized();

        const diff = await fetch(`https://api.github.com/repos/${prData.owner}/${prData.repository}/pulls/${prData.pullId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${this.account.access_token}`,
                "Accept": "application/vnd.github.v3.diff",
                "X-GitHub-Api-Version": "2022-11-28",
            },
        });

        const diffText = await diff.text();
        return diffText;
    }

    async AIReview(prompt:any, repositoryId: any, pullRequestId: any) {
        await this.ensureInitialized();
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey || "");
        const model = await genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: `You are an experienced code reviewer. Your task is to analyze a pull request (PR) diff and provide feedback. 
            The diff represents changes to a repository's code. Please provide very summarized feedback not more than 100 words on the following aspects:
                - Code quality
                - Clarity and readability
                - Best practices
                - Potential issues or bugs
                - Suggestions for improvement
          
                The following is the PR diff:`
          });
          const generationConfig = {
            temperature: 0.7,
            maxOutputTokens: 500,
            responseMimeType: "text/plain",
          };
      
          const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
          });

          await logWebhook({
            action: 'create',
            details: { comment: result.response.text() },
            repositoryId: repositoryId,
            userId: this.user.id,
          });

          console.log('Review submitted');

          await prisma.review.create({
            data: {
              comments: result.response.text(),
              userId: this.user.id,
              pullRequestId: pullRequestId,
              status: 'PENDING',
            }
          })

          console.log('Saved to DB');

    return result.response.text();
    }

    async commentOnPR(prData: any, commentText: string) {
        await this.ensureInitialized();
        
        const response = await fetch(`https://api.github.com/repos/${prData.owner}/${prData.repository}/issues/${prData.pullId}/comments`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.account.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                body: `**AI Review:**\n\n${commentText}`,
            }),
        });
    
        const data = await response.json();
        if (!response.ok) {
            throw new Error(`Error commenting on PR: ${data.message}`);
        }
    
        console.log(`Comment successfully added to PR #${prData.pullId}:`, data);
        return data;
    }
    
}

export default Utils;