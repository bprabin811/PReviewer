"use client";

import LogPage from "@/components/logs";
import { subtitle, title } from "@/components/primitives";
import ReviewPage from "@/components/reviews";
import { Avatar, AvatarGroup } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { Spinner } from "@heroui/spinner";
import { Tab, Tabs } from "@heroui/tabs";
import { addToast } from "@heroui/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CrossIcon, Loader2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect, useParams } from "next/navigation";
import { useEffect, useState } from "react";


export default function RepoDetails() {
    const { data: session } = useSession();
    // if (!session) {
    //     redirect("/");
    // }



    const { repoId } = useParams();
    const queryClient = useQueryClient();
    const [enableEdit, setEnableEdit] = useState(false);

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

    const [filePermissions, setFilePermissions] = useState(() => ({
        file_diff: true
    }));

    const [rules, setRules] = useState(() => ({
        "code_quality": true,
        "clarity_readability": true,
        "best_practices": true,
        "potential_issues_or_bugs": true,
        "suggestions_for_improvement": true
    }));

    const [systemPrompt, setSystemPrompt] = useState('');

    useEffect(() => {
        if (repo?.config) {
            setFilePermissions(prev => repo.config.permissions ? { ...repo.config.permissions } : prev);
            setRules(prev => repo.config.rules ? { ...repo.config.rules } : prev);
            setSystemPrompt(repo.config.system_prompt ?? "");
        }
    }, [repo]);



    const editRepoMutation = useMutation({
        mutationFn: async () => {
            await axios.put(`/api/repos/${repoId}`, {
                config: {
                    permissions: filePermissions,
                    rules,
                    system_prompt: systemPrompt
                }
            });
        },
        onSuccess: () => {
            setEnableEdit(false);
            queryClient.invalidateQueries({ queryKey: ["repo", repoId] });
            addToast({
                title: "Updated",
                description: "Repository updated successfully.",
                color: 'success',
            });
        },
        onError: (error: any) => {
            addToast({
                title: "Failed",
                description: error.response.data.error || "Failed to update repository.",
                color: 'danger',
            });
        }
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
                        <h3 className="font-semibold text-xl">{repo.name}</h3>
                        <p className="text-sm text-gray-500">{repo.owner}</p>
                        {/* <AvatarGroup max={5}>
                            {repo.users.map((user: any) => (
                                <Avatar key={user?.id} src={user?.user?.image} alt={user?.user?.name} size="sm" />
                            ))}
                        </AvatarGroup> */}
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

                    <Card className="p-4 flex flex-col gap-4">
                        <div className=" grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <h3 className={subtitle()}>Repository Permissions</h3>
                                <div className="flex items-start gap-4 flex-col">
                                    <Checkbox isSelected={filePermissions?.file_diff} isDisabled>Code Differences</Checkbox>
                                </div>
                            </div>

                            <div>
                                <h3 className={subtitle()}>Review Aspects</h3>
                                <div className="flex items-start gap-4 flex-col">

                                    <Checkbox isSelected={rules?.code_quality} onChange={() => setRules({ ...rules, code_quality: !rules.code_quality })} isDisabled={!enableEdit}>Code Quality</Checkbox>
                                    <Checkbox isSelected={rules?.clarity_readability} onChange={() => setRules({ ...rules, clarity_readability: !rules.clarity_readability })} isDisabled={!enableEdit}>Clarity and Readability</Checkbox>
                                    <Checkbox isSelected={rules?.best_practices} onChange={() => setRules({ ...rules, best_practices: !rules.best_practices })} isDisabled={!enableEdit}>Best Practices</Checkbox>
                                    <Checkbox isSelected={rules?.potential_issues_or_bugs} onChange={() => setRules({ ...rules, potential_issues_or_bugs: !rules.potential_issues_or_bugs })} isDisabled={!enableEdit}>Potential Issues or Bugs</Checkbox>
                                    <Checkbox isSelected={rules?.suggestions_for_improvement} onChange={() => setRules({ ...rules, suggestions_for_improvement: !rules.suggestions_for_improvement })} isDisabled={!enableEdit}>Suggestions for Improvement</Checkbox>

                                </div>
                            </div>

                            <div>
                                <h3 className={subtitle()}>System Prompt</h3>
                                <textarea
                                    className="w-full p-2 border border-default rounded-lg h-44"
                                    value={systemPrompt}
                                    disabled={!enableEdit}
                                    onChange={(e) => setSystemPrompt(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        {
                            enableEdit ?
                                <div className="flex gap-4">
                                    <Button
                                        onClick={() => editRepoMutation.mutate()}
                                        variant="solid"
                                        color="primary"
                                        size="sm"
                                        className="self-start"
                                        disabled={editRepoMutation.isPending}
                                    >
                                        {editRepoMutation.isPending ? "Updating..." : "Update"}
                                    </Button>

                                    <Button
                                        onClick={() => setEnableEdit(false)}
                                        variant="bordered"
                                        color="danger"
                                        size="sm"
                                        className="self-start"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                                :
                                <Button
                                    onClick={() => setEnableEdit(true)}
                                    variant="bordered"
                                    color="default"
                                    size="sm"
                                    className="self-start"
                                >
                                    Edit
                                </Button>
                        }
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
