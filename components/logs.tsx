import { Avatar } from "@heroui/avatar";
import { subtitle } from "./primitives";
import { constants } from "@/config/constants";
import Link from "next/link";


export default function LogPage({ logs }: { logs: any }) {
    return (
        <>
            <h3 className={subtitle()}>Logs</h3>
            <ul className="border rounded-lg divide-y border-default divide-default">
                {logs?.length > 0 ? (
                    logs.map((log: { id: string; user: { image: string; name: string }; details: any; action: keyof typeof constants; createdAt: string }) => (
                        <li key={log.id} className="p-4 flex justify-between items-center">
                            <div className="flex items-center justify-start gap-4">
                                <Avatar src={log.user.image} size="md" title={log.user.name}></Avatar>
                                <div>
                                    <p className="font-medium">
                                        {constants[log.action] || log.action}
                                        {log?.details?.prId ? (
                                            <> by <Link href={`https://github.com/${log.details.user}`} target="_blank" className="font-bold text-primary">{log.details.user}</Link>.</>
                                        ) : (
                                            "."
                                        )}
                                    </p>
                                    <p className="text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </li>
                    ))
                ) : (
                    <p className="p-4 text-gray-500">No logs found</p>
                )}
            </ul>
        </>
    )
}