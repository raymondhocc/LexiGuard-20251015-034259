import { Outlet } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "@/components/ui/sonner";
export function App() {
  return (
    <AppLayout>
      <Outlet />
      <Toaster richColors closeButton />
    </AppLayout>
  );
}