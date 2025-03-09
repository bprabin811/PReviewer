'use client';
import { siteConfig } from "@/config/site";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { GithubIcon, Logo } from "./icons";

export const  Footer =() => {
    const socialLinks = [
        {
            label: "GitHub",
            href: siteConfig.social_urls.github,
            icon: <GithubIcon className="h-5 w-5" />,
        }
    ];
    return (
        <footer className="border-t mt-4 border-default">
            <div className="container mx-auto px-4 py-4 max-w-7xl">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <div className="flex flex-col items-start">
                        <div className="flex items-center gap-4 mb-4">
                            <Logo />
                            <h2 className="text-2xl font-bold">
                                {siteConfig.name}
                            </h2>
                        </div>
                        <p className="text-sm mb-2">
                            {siteConfig.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} All rights reserved.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Connect</h3>
                        <div className="flex space-x-2">
                            {socialLinks.map((link:any, index:number) => (
                                <Button variant="flat" size="sm" key={index}>
                                <Link
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {link.icon}
                                    <span className="sr-only">{link.label}</span>
                                </Link>
                            </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}