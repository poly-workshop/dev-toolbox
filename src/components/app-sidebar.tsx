import * as React from "react";
import {
  IconCode,
  // IconFileText, // Commented out - not used when text tools are hidden
  IconHash,
  // IconHelp, // Commented out - not used when help is hidden
  IconInnerShadowTop,
  IconKey,
  IconLock,
  // IconPalette, // Commented out - not used when color tools are hidden
  // IconSettings, // Commented out - not used when settings is hidden
  IconTransform,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { getRoutesByCategory } from "@/lib/routes";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMainWithCollapse } from "@/components/nav-main-with-collapse";
import { NavSimple } from "@/components/nav-simple";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();

  const data = {
    navMain: [
      {
        title: t("categories.encodingTools"),
        url: "#",
        icon: IconCode,
        items: getRoutesByCategory("categories.encodingTools").map((route) => ({
          title: t(route.titleKey),
          url: route.path,
        })),
      },
      {
        title: t("categories.hashTools"),
        url: "#",
        icon: IconHash,
        items: getRoutesByCategory("categories.hashTools").map((route) => ({
          title: t(route.titleKey),
          url: route.path,
        })),
      },
      {
        title: t("categories.cryptoTools"),
        url: "#",
        icon: IconLock,
        items: getRoutesByCategory("categories.cryptoTools").map((route) => ({
          title: t(route.titleKey),
          url: route.path,
        })),
      },
      {
        title: t("categories.generatorTools"),
        url: "#",
        icon: IconKey,
        items: getRoutesByCategory("categories.generatorTools").map(
          (route) => ({
            title: t(route.titleKey),
            url: route.path,
          }),
        ),
      },
      {
        title: t("categories.converterTools"),
        url: "#",
        icon: IconTransform,
        items: getRoutesByCategory("categories.converterTools").map(
          (route) => ({
            title: t(route.titleKey),
            url: route.path,
          }),
        ),
      },
    ],
    navSecondary: [
      // TODO: Implement settings and help pages
      // {
      //   title: t("common.settings"),
      //   url: "/settings",
      //   icon: IconSettings,
      // },
      // {
      //   title: t("common.help"),
      //   url: "/help",
      //   icon: IconHelp,
      // },
    ],
    documents: [
      // TODO: Implement text and color tools
      // {
      //   name: t("categories.textTools"),
      //   url: "/text",
      //   icon: IconFileText,
      // },
      // {
      //   name: t("categories.colorTools"),
      //   url: "/color",
      //   icon: IconPalette,
      // },
    ],
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#" className="flex items-center gap-2">
                <IconInnerShadowTop className="!size-4 sm:!size-5 flex-shrink-0" />
                <span className="text-sm sm:text-base font-semibold truncate">
                  {t("header.title")}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2 sm:px-0">
        <NavMainWithCollapse
          items={data.navMain}
          title={t("sidebar.encodingTools")}
        />
        {data.documents.length > 0 && (
          <NavSimple items={data.documents} title={t("sidebar.documents")} />
        )}
        {data.navSecondary.length > 0 && (
          <NavSimple items={data.navSecondary} className="mt-auto" />
        )}
      </SidebarContent>
    </Sidebar>
  );
}
