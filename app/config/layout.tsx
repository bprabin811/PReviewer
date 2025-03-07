import { title } from "@/components/primitives";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex items-start flex-col space-y-4 ">
      <h1 className={title()}>Select a <span className="text-primary">Repository</span></h1>
      <div className="w-full">
        {children}
      </div>
    </section>
  );
}
