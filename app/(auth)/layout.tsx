import { AppSidebar } from "@/components/app-sidebar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <AppSidebar />
      <main className="pl-64">{children}</main>
    </div>
  );
}
