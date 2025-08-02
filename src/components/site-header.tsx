import { useTranslation } from "react-i18next";

import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LanguageToggle } from "@/components/language-toggle";
import { ModeToggle } from "@/components/mode-toggle";

export function SiteHeader() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-40 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-3 sm:gap-2 sm:px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-1 sm:mx-2 data-[orientation=vertical]:h-4"
        />
        <h1
          className={`font-medium ${isMobile ? "text-sm" : "text-base"} truncate`}
        >
          {t("header.title")}
        </h1>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <LanguageToggle />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
