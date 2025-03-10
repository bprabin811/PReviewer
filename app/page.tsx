"use client";

import { subtitle, title } from "@/components/primitives";
import { Button } from "@heroui/button";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Code } from "@heroui/code";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  if (session) {
    redirect("/dashboard");
  }

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("npx previewer-cli@latest init");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 bg-[url('/background_light.svg')] dark:bg-[url('/background_dark.svg')] bg-cover bg-center">
      <div className="max-w-xl flex flex-col items-center gap-4 text-center py-16">
        <span className={title()}>Automate&nbsp;</span>
        <span className={title({ color: "blue" })}>Pull Request Reviews&nbsp;</span>
        <br />

        <span className={title()}>with AI-powered insights.</span>
        <div className={subtitle({ class: "mt-4" })}>
          PReviewer streamlines your code review process by leveraging AI to analyze pull requests, provide feedback, and ensure high-quality contributions—effortlessly.
        </div>

        <div className="flex gap-4">
          <Button color="primary" variant="flat" onPress={() => signIn()}>
            Get Started
          </Button>
          <Button color="default" variant="ghost" onPress={() => { }}>
            Watch Demo
          </Button>
        </div>


        <Code size="md" className="px-4 py-2 rounded-full flex items-center gap-4 mt-8">
      $ npx previewer-cli@latest init
      {copied ? (
        <Check size={16} className="text-green-500" />
      ) : (
        <Copy size={16} className="cursor-pointer" onClick={handleCopy} />
      )}
    </Code>
      </div>
    </section>
  );
}
