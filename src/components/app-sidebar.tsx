import * as React from "react"
import {
  IconCode,
  IconHash,
  IconKey,
  IconLock,
  IconPalette,
  IconSettings,
  IconHelp,
  IconTransform,
  IconFileText,
  IconInnerShadowTop,
} from "@tabler/icons-react"
import { getRoutesByCategory } from "@/lib/routes"
import { useTranslation } from 'react-i18next'

import { NavMainWithCollapse } from "@/components/nav-main-with-collapse"
import { NavSimple } from "@/components/nav-simple"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()

  const getRouteTranslationKey = (path: string) => {
    const routeMap: Record<string, string> = {
      '/encoders/json': 'jsonFormatter',
      '/encoders/base64': 'base64',
      '/encoders/url': 'urlEncode',
      '/hash/md5': 'md5',
      '/hash/sha256': 'sha256',
      '/hash/sha512': 'sha512',
      '/crypto/aes': 'aes',
      '/crypto/rsa': 'rsa',
      '/generators/uuid': 'uuidGenerator',
      '/generators/password': 'passwordGenerator',
      '/generators/qrcode': 'qrcodeGenerator',
      '/text/formatter': 'textFormatter',
      '/text/counter': 'characterCounter',
      '/converters/timestamp': 'timestampConverter',
      '/converters/number': 'numberConverter',
      '/color/picker': 'colorPicker',
      '/color/converter': 'colorConverter'
    }
    return routeMap[path] || path.split('/').slice(-1)[0]
  }

  const data = {
    navMain: [
      {
        title: t('categories.encodingTools'),
        url: "#",
        icon: IconCode,
        items: getRoutesByCategory("编码工具").map(route => ({
          title: t(`routes.${getRouteTranslationKey(route.path)}`),
          url: route.path,
        })),
      },
      {
        title: t('categories.hashTools'),
        url: "#",
        icon: IconHash,
        items: getRoutesByCategory("哈希工具").map(route => ({
          title: t(`routes.${getRouteTranslationKey(route.path)}`),
          url: route.path,
        })),
      },
      {
        title: t('categories.cryptoTools'),
        url: "#",
        icon: IconLock,
        items: getRoutesByCategory("加密工具").map(route => ({
          title: t(`routes.${getRouteTranslationKey(route.path)}`),
          url: route.path,
        })),
      },
      {
        title: t('categories.generatorTools'),
        url: "#",
        icon: IconKey,
        items: getRoutesByCategory("生成工具").map(route => ({
          title: t(`routes.${getRouteTranslationKey(route.path)}`),
          url: route.path,
        })),
      },
    ],
    navSecondary: [
      {
        title: t('common.settings'),
        url: "/settings",
        icon: IconSettings,
      },
      {
        title: t('common.help'),
        url: "/help",
        icon: IconHelp,
      },
    ],
    documents: [
      {
        name: t('categories.textTools'),
        url: "/text",
        icon: IconFileText,
      },
      {
        name: t('categories.converterTools'),
        url: "/converters",
        icon: IconTransform,
      },
      {
        name: t('categories.colorTools'),
        url: "/color",
        icon: IconPalette,
      },
    ],
  }

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
                <span className="text-sm sm:text-base font-semibold truncate">{t('header.title')}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2 sm:px-0">
        <NavMainWithCollapse items={data.navMain} title={t('sidebar.encodingTools')} />
        <NavSimple items={data.documents} title={t('sidebar.documents')} />
        <NavSimple items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
