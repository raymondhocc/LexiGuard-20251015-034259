import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { AuthPage } from '@/pages/AuthPage';
import { DocumentDraftingPage } from '@/pages/DocumentDraftingPage';
import { CompliancePage } from '@/pages/CompliancePage';
import { AuditPage } from '@/pages/AuditPage';
import { CaseManagementPage } from '@/pages/CaseManagementPage';
import { ReportingPage } from '@/pages/ReportingPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { App } from './App';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/",
    element: <ProtectedRoute><App /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <HomePage />,
      },
      {
        path: "documents",
        element: <DocumentDraftingPage />,
      },
      {
        path: "compliance",
        element: <CompliancePage />,
      },
      {
        path: "audit",
        element: <AuditPage />,
      },
      {
        path: "cases",
        element: <CaseManagementPage />,
      },
      {
        path: "reporting",
        element: <ReportingPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ]
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)