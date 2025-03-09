import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { subtitle, title } from "./primitives";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";


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
                            <div className="flex items-start gap-4">
                                <Link href={`https://github.com/${pr?.repository?.owner}/${pr?.repository?.name}/pull/${pr?.pullId}`} target="_blank"><h1 className={`${title()} text-green-600`}>{`#${pr.pullId}`}</h1></Link>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-4"><Chip color='default' size="sm">{pr?.metadata?.base}</Chip><ArrowLeft size={16} /><Chip color='default' size="sm">{pr?.metadata?.head}</Chip></div>
                                    <div className="flex items-center gap-4"><Chip color={pr.status === "CLOSED" ? "danger" : "primary"} size="sm">{pr.status}</Chip> {pr.status === "MERGED" ? `by ${pr?.metadata?.merged_by?.login}` : ''}</div>
                                </div>
                            </div>

                            {pr.reviews?.length > 0 && (
                                <div className="mt-2 border-t pt-2 border-default">
                                    <h4 className="text-sm font-semibold">Comments</h4>
                                    <ul className="mt-2 space-y-6">
                                        {pr.reviews.slice().reverse().map((rev: any, index: number) => (
                                            <li key={index} className=" border-l-8 p-4 rounded-lg border-default border-l-primary-100">
                                                <h3 className={`${subtitle()} text-green-600`}>Comment #{index+1}</h3>
                                                <p className="font-medium underline text-default-400">{new Date(rev.createdAt).toLocaleString()}</p>
                                                <ReactMarkdown>{rev.comments}</ReactMarkdown>
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
