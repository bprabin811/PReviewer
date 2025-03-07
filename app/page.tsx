"use client";

import { subtitle, title } from "@/components/primitives";
import { GitPullRequest } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Home() {
  const { data: session } = useSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="max-w-xl flex flex-col items-center gap-4 text-center">
        <GitPullRequest size={80} className="text-default"/>
        <span className={title()}>Automate&nbsp;</span>
        <span className={title({ color: "violet" })}>Pull Request Reviews&nbsp;</span>
        <br />

        <span className={title()}>with AI-powered insights.</span>
        <div className={subtitle({ class: "mt-4" })}>
          PReviewer streamlines your code review process by leveraging AI to analyze pull requests, provide feedback, and ensure high-quality contributions—effortlessly.
        </div>
        {/* <div className="mt-6 flex justify-center gap-4">
      <Link href="/dashboard" className={buttonStyles({ color: "violet" })}>
        Get Started
      </Link>
      <Link
        href={siteConfig.links.github}
        target="_blank"
        className={buttonStyles({ variant: "outline" })}
      >
        <GithubIcon className="mr-2 h-5 w-5" />
        Star on GitHub
      </Link>
    </div> */}

      </div>
    </section>
  );
}
