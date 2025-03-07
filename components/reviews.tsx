import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { subtitle, title } from "./primitives";
import Link from "next/link";

export default function ReviewPage({ pullRequests }: { pullRequests: any[] }) {
    return (
        <>
            <h3 className={subtitle()}>AI Reviews</h3>
            <ul className="border rounded-lg divide-y border-default divide-default">
                {pullRequests?.length > 0 ? (
                    pullRequests?.map((pr) => (
                        <li key={pr.id} className="p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-4">
                                <Avatar src={pr.user.image} size="md" title={pr.user.name} />
                                <div>
                                    <p className="font-medium">{pr.user.name}</p>
                                    <p className="font-medium">{pr.title}</p>
                                    <p className="text-gray-500">{pr.description}</p>
                                    <p className="text-gray-500">{new Date(pr.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Link href={`https://github.com/${pr?.repository?.owner}/${pr?.repository?.name}/pull/${pr?.pullId}`}><h1 className={`${title()} text-primary`}>{`#${pr.pullId}`}</h1></Link>
                                <Chip color={pr.status === "CLOSED" ? "danger" : "primary"} size="sm">{pr.status}</Chip>
                            </div>

                            {pr.reviews?.length > 0 && (
                                <div className="mt-2 border-t pt-2 border-default">
                                    <h4 className="text-sm font-semibold">Comments</h4>
                                    <ul className="mt-2 space-y-2">
                                        {pr.reviews.map((rev: any, index: number) => (
                                            <li key={index} className="ml-6 border-l-2 border-default pl-2">
                                                <p className="text-default-400"><strong>{rev.reviewer}</strong>{rev.comments}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))
                ) : (
                    <p className="p-4 text-gray-500">No pull requests found</p>
                )}
            </ul>
        </>
    );
}
