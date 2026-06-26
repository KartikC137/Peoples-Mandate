import { ElectionFactoryProvider } from "@/contexts/ElectionFactoryContext";

export default async function OrgLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}>) {
  const orgId = (await params).id;

  return (
    <ElectionFactoryProvider key={orgId} orgIdUrl={orgId}>
      {children}
    </ElectionFactoryProvider>
  );
}
