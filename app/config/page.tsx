"use client";

import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { addToast } from "@heroui/toast";

export default function ReposPage() {
  const { data: session } = useSession();
  if (!session) {
    redirect("/");
  }

  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);

  const { data: repos, isLoading } = useQuery({
    queryKey: ["repos"],
    queryFn: async () => {
      const { data } = await axios.get("/api/repos");
      return data;
    },
  });

  const selectRepoMutation = useMutation({
    mutationFn: async (repo: any) => {
      return axios.post("/api/repos/select", {
        githubRepoId: repo.id,
        name: repo.name,
        owner: repo.owner.login,
        privateRepo: repo.private,
        url: repo.html_url,
      });
    },
    onSuccess: () => {
      addToast({
        title: "Success",
        description: "Repository has been selected successfully.",
        color:'primary',
      });
    },
    onError: () => {
      addToast({
        title: "Failed",
        description: "Failed to select repository.",
        color:'danger',
      });
      setSelectedRepo(null);
    },
  });

  const handleSelectRepo = async (repo: any) => {
    if (!window.confirm("Are you sure you want to select this repository?")) {
      return;
    }
    setSelectedRepo(repo.id);
    selectRepoMutation.mutate(repo);
  };

  return (
    <>
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <div>
          <ul className="border rounded-lg divide-y border-default divide-default">
            {repos?.length > 0 ? (
              repos.map((repo: any) => (
                <li key={repo.id} className="p-4 text-sm flex items-center justify-between">
                  <div className="flex flex-col gap-2 items-start">
                    <h2 className="text-lg font-bold">
                      {repo.name}{" "}
                      <Chip color={repo.private ? "danger" : "success"} size="sm">
                        {repo.private ? "Private" : "Public"}
                      </Chip>
                    </h2>
                    <span className="text-primary">{repo.language}</span>
                  </div>
                  <Button
                    onClick={() => handleSelectRepo(repo)}
                    variant="flat"
                    disabled={selectedRepo === repo.id || selectRepoMutation.isPending}
                  >
                    {selectedRepo === repo.id ? "Selected" : "Select"}
                  </Button>
                </li>
              ))
            ) : (
              <p className="p-4 text-gray-500">No repositories found</p>
            )}
          </ul>
        </div>
      )}
    </>
  );
}
