import { type Icon } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";

import { cn } from "@/lib/utils";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface SimpleNavItem {
  name?: string;
  title?: string;
  url: string;
  icon?: Icon;
}

export function NavSimple({
  items,
  title,
  className,
}: {
  items: SimpleNavItem[];
  title?: string;
  className?: string;
}) {
  const location = useLocation();
  const isActive = (url: string) => location.pathname === url;

  return (
    <SidebarGroup className={className}>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const displayTitle = item.name || item.title || "";
            return (
              <SidebarMenuItem key={displayTitle}>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    isActive(item.url) &&
                      "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                >
                  <Link to={item.url}>
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{displayTitle}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
