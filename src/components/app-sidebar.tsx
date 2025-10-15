import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, ShieldCheck, GitBranch, Briefcase, BarChart2, Settings, Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/documents", icon: FileText, label: "Documents" },
  { href: "/compliance", icon: ShieldCheck, label: "Compliance" },
  { href: "/audit", icon: GitBranch, label: "Audit Trail" },
  { href: "/cases", icon: Briefcase, label: "Case Management" },
  { href: "/reporting", icon: BarChart2, label: "Reporting" },
  { href: "/settings", icon: Settings, label: "Settings" },
];
export function AppSidebar(): JSX.Element {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold font-display">LexiGuard</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "w-full",
                    isActive && "is-active"
                  )
                }
              >
                {({ isActive }) => (
                  <SidebarMenuButton variant={isActive ? "primary" : "ghost"} className="w-full justify-start">
                    <item.icon className="size-4 mr-2" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                )}
              </NavLink>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}