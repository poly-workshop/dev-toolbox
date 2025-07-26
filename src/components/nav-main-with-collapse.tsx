import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { IconChevronRight, type Icon } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"

interface NavItem {
  title: string
  url: string
  icon?: Icon
  items?: {
    title: string
    url: string
  }[]
}

export function NavMainWithCollapse({
  items,
  title,
}: {
  items: NavItem[]
  title?: string
}) {
  const location = useLocation()
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (itemTitle: string) => {
    setOpenItems(prev => 
      prev.includes(itemTitle) 
        ? prev.filter(item => item !== itemTitle)
        : [...prev, itemTitle]
    )
  }

  const isItemOpen = (itemTitle: string) => openItems.includes(itemTitle)
  const isActive = (url: string) => location.pathname === url

  return (
    <SidebarGroup>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.items && item.items.length > 0 ? (
                <>
                  <SidebarMenuButton
                    onClick={() => toggleItem(item.title)}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.title}</span>
                    </div>
                    <IconChevronRight 
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isItemOpen(item.title) && "rotate-90"
                      )}
                    />
                  </SidebarMenuButton>
                  {isItemOpen(item.title) && (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton 
                            asChild
                            className={cn(
                              isActive(subItem.url) && "bg-sidebar-accent text-sidebar-accent-foreground"
                            )}
                          >
                            <Link to={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </>
              ) : (
                <SidebarMenuButton 
                  asChild
                  className={cn(
                    isActive(item.url) && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <Link to={item.url}>
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
