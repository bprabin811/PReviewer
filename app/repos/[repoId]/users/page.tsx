"use client";

import { useState } from "react";
import { redirect, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { title } from "@/components/primitives";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Avatar } from "@heroui/avatar";
import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { addToast } from "@heroui/toast";
import { PERMISSIONS } from "@/config/constants";

export default function ManageUsers() {
    const { data: session } = useSession();
    // if (!session) {
    //     redirect("/");
    // }

    const { repoId } = useParams();
    const queryClient = useQueryClient();
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("VIEWER");
    const [permissions, setPermissions] = useState({
        view_logs: false,
        view_ai_reviews: true,
        user_management: false,
    });

    const { data: users, isLoading: loadingUsers, error } = useQuery({
        queryKey: ["repoUsers", repoId],
        queryFn: async () => {
            const { data } = await axios.get(`/api/repos/${repoId}/users`);
            return data;
        },
        enabled: !!repoId,
    });

    const inviteUserMutation = useMutation({
        mutationFn: async () => {
            await axios.post(`/api/repos/${repoId}/invite`, { email, role, permissions });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["repoUsers", repoId] });
            setEmail("");
            addToast({
                title: "Invited",
                description: "User invited successfully.",
                color: 'success',
            });
        },
        onError: (error:any) => {
            addToast({
                title: "Failed",
                description: error.response.data.error || "Failed to invite user.",
                color: 'danger',
            });
        }
    });

    const removeUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            await axios.delete(`/api/repos/${repoId}/users/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["repoUsers", repoId] });
            addToast({
                title:"Success",
                description:"User removed successfully.",
                color: 'success',
            })
        },
        onError:(error:any) =>{
            addToast({
                title: "Failed",
                description: error.response.data.error || "Failed to remove user.",
                color: 'danger',
            });
        }
    });

    const roles = [
        { key: "VIEWER", label: "Viewer" },
        { key: "CONTRIBUTOR", label: "Contributor" },
    ]

    const LoggedInUser = users?.find((user: any) => user.user.email === session?.user?.email);


    return (
        <>
            <h1 className={title()}>Manage Users</h1>
            {error && <p className="text-red-500">{error.message}</p>}
            {/* Invite User */}
            {LoggedInUser?.permissions?.user_management ? <div className="space-y-4 border border-default rounded-lg p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Input
                        type="email"
                        label="User email"
                        placeholder="User email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="max-w-xs"
                    />

                    <Select
                        className="max-w-xs"
                        defaultSelectedKeys={["VIEWER"]}
                        label="Select role"
                        placeholder="Select a role"
                        onChange={(e) => setRole(e.target.value)}
                    >
                        {roles.map((role) => (
                            <SelectItem key={role.key}>{role.label}</SelectItem>
                        ))}
                    </Select>
                </div>

                {/* permissions */}
                <h3>Permissions</h3>
                <div className="flex items-start gap-4 flex-col">
                    <Checkbox isSelected={permissions.user_management} onChange={() => {
                        setPermissions({ ...permissions, user_management: !permissions.user_management })
                    }}>User Management</Checkbox>
                    <Checkbox isSelected={permissions.view_ai_reviews} isDisabled>View AI Reviews</Checkbox>
                    <Checkbox isSelected={permissions.view_logs} onChange={() => {
                        setPermissions({ ...permissions, view_logs: !permissions.view_logs })
                    }}>View Logs</Checkbox>
                </div>


                <Button
                    onClick={() => inviteUserMutation.mutate()}
                    variant="solid"
                    color="primary"
                    disabled={inviteUserMutation.isPending}
                >
                    {inviteUserMutation.isPending ? "Inviting..." : "Invite"}
                </Button>
            </div> : null}

            {/* Users List */}
            {loadingUsers ? <Loader2 size={16} className="animate-spin" /> : <ul className="border border-default rounded-lg divide-y divide-default">
                {users?.map((u: any) => (
                    <li key={u?.id} className="p-4 flex justify-between items-center">
                        <div className="flex items-center justify-start gap-4">
                            <Avatar src={u?.user?.image} size="md" title={u?.user?.name}></Avatar>
                            <div>
                                <p className="font-medium">{u?.user?.name || u?.user?.email}</p>
                                <p className="text-sm text-gray-500">{u?.role}</p>
                                {/* {"view_logs":true,"user_management":false,"view_ai_reviews":true} */}

                                {u?.role === "ADMIN" ? null : <div className="mt-2 space-y-2">
                                    {Object.keys(PERMISSIONS).map((key) => (
                                        <label key={key} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={u?.permissions?.[key as keyof typeof PERMISSIONS] || false}
                                                className="form-checkbox text-primary"
                                                onChange={() => { }}
                                                disabled
                                            />
                                            <span>{PERMISSIONS[key as keyof typeof PERMISSIONS]}</span>
                                        </label>
                                    ))}
                                </div>}
                            </div>
                        </div>
                        {u?.role !== "ADMIN" && LoggedInUser?.permissions?.user_management && (
                            <button
                                onClick={() => removeUserMutation.mutate(u?.user?.id)}
                                className="text-red-500 hover:underline"
                                disabled={removeUserMutation.isPending}
                            >
                                Remove
                            </button>
                        )}
                    </li>
                ))}
            </ul>}
        </>
    );
}
