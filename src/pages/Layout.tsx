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
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
      defaultOpen={!isMobile}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen">
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col">
            <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6">
              <AppRoutes />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
