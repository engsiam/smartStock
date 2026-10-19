import { createBrowserRouter, Navigate } from 'react-router';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardOverviewPage } from './pages/DashboardOverviewPage';
import { InventoryPage } from './pages/InventoryPage';
import { SalesPosPage } from './pages/SalesPosPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { AiAdvisorPage } from './pages/AiAdvisorPage';
import { SettingsPage } from './pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/app',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardOverviewPage />,
      },
      {
        path: 'inventory',
        element: <InventoryPage />,
      },
      {
        path: 'sales',
        element: <SalesPosPage />,
      },
      {
        path: 'purchases',
        element: <PurchasesPage />,
      },
      {
        path: 'ai-advisor',
        element: <AiAdvisorPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/app" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
