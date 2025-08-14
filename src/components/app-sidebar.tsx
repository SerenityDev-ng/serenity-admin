"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Users,
  UserCheck,
  Calendar,
  Settings,
  BarChart3,
  Briefcase,
  CreditCard,
  Home,
  Shield,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Admin Management",
    items: [
      {
        title: "Users",
        url: "/users",
        icon: Users,
      },
      {
        title: "Workers",
        url: "/workers",
        icon: UserCheck,
      },
      {
        title: "Bookings",
        url: "/bookings",
        icon: Calendar,
      },
      {
        title: "Cleaning Subscriptions",
        url: "/cleaning-subscriptions",
        icon: Shield,
      },
      {
        title: "Withdrawal Requests",
        url: "/withdrawal-requests",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "Services",
    items: [
      {
        title: "Ads Banners",
        url: "/ads-banners",
        icon: Settings,
      },
      {
        title: "House Types",
        url: "/house-types",
        icon: Home,
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        title: "Worker Tasks",
        url: "/analytics/worker-tasks",
        icon: BarChart3,
      },
      {
        title: "Monthly Tasks",
        url: "/analytics/monthly-tasks",
        icon: TrendingUp,
      },
      {
        title: "Periodic Tasks",
        url: "/analytics/periodic-tasks",
        icon: Clock,
      },
    ],
  },
  {
    title: "Worker Jobs",
    items: [
      {
        title: "Assigned Jobs",
        url: "/worker-jobs/assigned",
        icon: Briefcase,
      },
      {
        title: "Current Job",
        url: "/worker-jobs/current",
        icon: Clock,
      },
      {
        title: "Job History",
        url: "/worker-jobs/history",
        icon: BarChart3,
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-4 w-4" />
          </div>
          <span className="font-semibold">Serenity Admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((section, index) => {
          if (section.items) {
            return (
              <SidebarGroup key={index}>
                <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                        >
                          <Link href={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          } else {
            return (
              <SidebarGroup key={index}>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === section.url}
                      >
                        <Link href={section.url}>
                          <section.icon className="h-4 w-4" />
                          <span>{section.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }
        })}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-2 text-xs text-muted-foreground">
          © 2024 Serenity Platform
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
