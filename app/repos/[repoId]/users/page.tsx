"use client";

import { useState } from "react";
import { redirect, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { title } from "@/components/primitives";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Avatar } from "@heroui/avatar";

export default function ManageUsers() {
    const { data: session } = useSession();
    if (!session) {
        redirect("/");
    }

    const { repoId } = useParams();
    const queryClient = useQueryClient();
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("VIEWER");

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
            await axios.post(`/api/repos/${repoId}/invite`, { email, role });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["repoUsers", repoId] });
            setEmail("");
        },
    });

    const removeUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            await axios.delete(`/api/repos/${repoId}/users/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["repoUsers", repoId] });
        },
    });

    return (
        <>
            <h1 className={title()}>Manage Users</h1>
            {error && <p className="text-red-500">{error.message}</p>}
            {/* Invite User */}
            <div className="mb-4 p-4 border border-default rounded-lg">
                <h3 className="font-semibold mb-2">Invite a User</h3>
                <input
                    type="email"
                    placeholder="User email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-default p-2 rounded w-full mb-2"
                />
                <select value={role} onChange={(e) => setRole(e.target.value)} className="border border-default p-2 rounded w-full mb-2">
                    <option value="VIEWER">Viewer</option>
                    <option value="CONTRIBUTOR">Contributor</option>
                    <option value="ADMIN">Admin</option>
                </select>
                <button
                    onClick={() => inviteUserMutation.mutate()}
                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                    disabled={inviteUserMutation.isPending}
                >
                    {inviteUserMutation.isPending ? "Inviting..." : "Invite"}
                </button>
            </div>

            {/* Users List */}
            <h3 className="font-semibold mt-6 mb-2">Users</h3>
            {loadingUsers ? <Loader2 size={16} className="animate-spin" /> : <ul className="border border-default rounded-lg divide-y divide-default">
                {users?.map((u: any) => (
                    <li key={u?.id} className="p-4 flex justify-between items-center">
                        <div className="flex items-center justify-start gap-4">
                            <Avatar src={u?.user?.image} size="md" title={u?.user?.name}></Avatar>
                            <div>
                                <p className="font-medium">{u?.user?.name || u?.user?.email}</p>
                                <p className="text-sm text-gray-500">{u?.role}</p>
                                </div>
                        </div>
                        {u?.role !== "ADMIN" && (
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
