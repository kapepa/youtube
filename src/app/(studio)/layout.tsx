import { StudioLayout } from "@/modules/studio/ui/layout/studio-layout";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StudioLayout>
      {children}
    </StudioLayout>
  );
}