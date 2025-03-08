"use client";

import LogPage from "@/components/logs";
import { title } from "@/components/primitives";
import ReviewPage from "@/components/reviews";
import { Avatar, AvatarGroup } from "@heroui/avatar";
import { Card } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Tab, Tabs } from "@heroui/tabs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CrossIcon, Loader2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect, useParams } from "next/navigation";


export default function RepoDetails() {
    const { data: session } = useSession();
    // if (!session) {
    //     redirect("/");
    // }

    const { repoId } = useParams();

    const { data: repo, error: repoError, isLoading: repoLoading } = useQuery({
        queryKey: ["repo", repoId],
        queryFn: async () => {
            const { data } = await axios.get(`/api/repos/${repoId}`);
            return data;
        },
        enabled: !!repoId,
    });

    const { data: logs, error: logsError, isLoading: logsLoading } = useQuery({
        queryKey: ["logs", repoId],
        queryFn: async () => {
            const { data } = await axios.get(`/api/repos/${repoId}/logs`);
            return data;
        },
        enabled: !!repoId,
    });

    const { data: pr, error: prError, isLoading: prLoading } = useQuery({
        queryKey: ["pr", repoId],
        queryFn: async () => {
            const { data } = await axios.get(`/api/pr/${repoId}`);
            return data;
        },
        enabled: !!repoId,
    });

    const LoggedInUser = repo?.users?.find((user: any) => user?.user?.email === session?.user?.email);


    return (
        <>
            <h1 className={title()}>Details</h1>
            {(repoLoading || logsLoading) && <Loader2 size={16} className="animate-spin" />}
            {(repoError || logsError) && <p className="text-red-500">{repoError?.message || logsError?.message}</p>}

            {repo && (
                <>
                    <Card className="p-4">
                        <h3 className="font-semibold">{repo.name}</h3>
                        <p className="text-sm text-gray-500">{repo.owner}</p>
                        <AvatarGroup max={5}>
                            {repo.users.map((user: any) => (
                                <Avatar key={user?.id} src={user?.user?.image} alt={user?.user?.name} size="sm" />
                            ))}
                        </AvatarGroup>
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col space-y-2">
                                <p className="text-sm">
                                    Action:{" "}
                                    <span className={repo.workflowEnabled ? "text-green-600" : "text-red-600"}>
                                        {repo.workflowEnabled ? "Enabled" : "Disabled"}
                                    </span>
                                </p>
                                <Link href={`/repos/${repoId}/users`} className="text-blue-600 hover:underline">
                                    Manage Users
                                </Link>
                            </div>
                            {repo.workflowEnabled ? <Spinner classNames={{ label: "text-foreground mt-4" }} variant="dots" color="success" /> : <X className="text-red-600" size={24} />}

                        </div>
                    </Card>

                    <Tabs aria-label="Options">
                        <Tab key="review" title="AI Reviews" className="py-0">
                            <ReviewPage pullRequests={pr} />
                        </Tab>
                        {LoggedInUser?.permissions?.view_logs ? <Tab key="logs" title="Logs" className="py-0">
                            <LogPage logs={logs} />
                        </Tab> : null}
                    </Tabs>


                </>
            )}
        </>
    );
}
