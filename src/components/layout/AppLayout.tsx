import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
type AppLayoutProps = {
  children: React.ReactNode;
  className?: string;
};
export function AppLayout({ children, className }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <AppSidebar />
        <SidebarInset className={className}>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <div className="absolute left-4 top-20 z-20 lg:hidden">
            <SidebarTrigger />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}