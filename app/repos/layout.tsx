import { title } from "@/components/primitives";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
        {children}
    </section>
  );
}
