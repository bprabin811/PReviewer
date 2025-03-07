"use client";

import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { addToast } from "@heroui/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function Dashboard() {
    const { data: session } = useSession();
    if (!session) {
        redirect("/");
    }

    const queryClient = useQueryClient();

    const { data: repos, isLoading, error } = useQuery({
        queryKey: ["selectedRepos"],
        queryFn: async () => {
            const { data } = await axios.get("/api/repos/selected");
            return data;
        },
    });

    const webhookMutation = useMutation({
        mutationFn: async ({ repoId, workflowEnabled, webhookId }: {
            repoId: string;
            workflowEnabled: boolean;
            webhookId: string | null;
        }) => {
            if (workflowEnabled) {
                return axios.delete(`/api/repos/${repoId}/webhook/${webhookId}`);
            } else {
                return axios.post(`/api/repos/${repoId}/webhook`);
            }
        },
        onSuccess: () => {
            addToast({
                title: "Success",
                description: "Action completed successfully.",
                color: 'primary',
            });
            queryClient.invalidateQueries({ queryKey: ["selectedRepos"] });
        },
        onError: () => {
            addToast({
                title: "Failed",
                description: "Failed to connect repository.",
                color: 'danger',
            });
        }
    });

    const handleConnectWebhook = async (repoId: string, workflowEnabled: boolean, webhookId: string | null) => {
        if (!window.confirm(!workflowEnabled ? "Are you sure you want to connect this repository?" : "Are you sure you want to disconnect this repository?")) {
            return;
        }
        webhookMutation.mutate({ repoId, workflowEnabled, webhookId });
    }


    return (
        <>
            {error && <p className="text-red-500">{error.message}</p>}
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}

            {/* Repository List */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {!isLoading && repos?.length > 0 ? (repos?.map((repo: any) => (
                    <Card className="p-4" key={repo.id}>
                        <Link key={repo.id} href={`/repos/${repo.id}`} className="block underline underline-offset-4">
                            <h3 className="font-semibold text-primary">{repo.name}</h3>
                        </Link>
                        <p className="text-sm text-gray-500">{repo.owner}</p>
                        <Button
                            onClick={() => handleConnectWebhook(repo.id, repo.workflowEnabled, repo.webhookId)}
                            className="mt-2"
                            variant={repo.workflowEnabled ? "flat" : "bordered"}
                            disabled={webhookMutation.isPending}
                        >
                            {repo.workflowEnabled ? "Connected" : "Connect"}
                        </Button>
                    </Card>
                ))) : <p className="text-gray-500">No repositories found, get started by selecting repository from config.</p>}
            </div>
        </>
    );
}
