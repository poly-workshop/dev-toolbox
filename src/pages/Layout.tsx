import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppRoutes } from "@/components/AppRoutes";
import { SiteHeader } from "@/components/site-header";

export default function Layout() {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": isMobile ? "100%" : "calc(var(--spacing) * 72)",
          "--sidebar-width-mobile": "100%",
          "--header-height": "3rem",
        } as React.CSSProperties
      }
      defaultOpen={!isMobile}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 overflow-auto">
          <div className="@container/main h-full">
            <div className="p-4 sm:p-6">
              <AppRoutes />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
