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
import { Select, SelectSection, SelectItem } from "@heroui/select";

export default function ReposPage() {
  const { data: session } = useSession();
  // if (!session) {
  //   redirect("/");
  // }

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
      return axios.post("/api/repos/pick", {
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
        color: 'primary',
      });
      redirect("/dashboard");
    },
    onError: () => {
      addToast({
        title: "Failed",
        description: "Failed to select repository.",
        color: 'danger',
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

          <Select
            isLoading={isLoading}
            classNames={{
              base: "max-w-xs",
              trigger: "h-12",
            }}
            items={repos}
            placeholder="Select a repository"
            labelPlacement="outside"
            onChange={(repo) => handleSelectRepo(repo)}
            renderValue={(items) => {
              return items.map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="font-semibold">{item.data.name}</span>
                  <Chip color={item.data.private ? "danger" : "success"} size="sm">
                    {item.data.private ? "Private" : "Public"}
                  </Chip>
                </div>
              ));
            }}
          >
            {(repo: any) => (
              <SelectItem key={repo.id} textValue={repo.name}>
                <div className="flex gap-2 items-center">
                  <div className="flex justify-between w-full items-center">
                    <div className="flex flex-col">
                      <span className="text-small font-semibold">{repo.name}</span>
                      <span className="text-primary">{repo.language}</span>
                    </div>
                    <Chip color={repo.private ? "danger" : "success"} size="sm">
                      {repo.private ? "Private" : "Public"}
                    </Chip>
                  </div>
                </div>
              </SelectItem>
            )}
          </Select>
        </div>
      )}
    </>
  );
}
