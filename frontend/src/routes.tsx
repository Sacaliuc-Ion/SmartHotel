import { lazy, Suspense, type ReactElement } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
const RoomsPage = lazy(() => import('./pages/RoomsPage').then((module) => ({ default: module.RoomsPage })));
const GymPage = lazy(() => import('./pages/GymPage').then((module) => ({ default: module.GymPage })));
const RoomDetailPage = lazy(() => import('./pages/RoomDetailPage').then((module) => ({ default: module.RoomDetailPage })));
const SpaPage = lazy(() => import('./pages/SpaPage').then((module) => ({ default: module.SpaPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const FrontDeskPage = lazy(() => import('./pages/FrontDeskPage').then((module) => ({ default: module.FrontDeskPage })));
const RoomBoardPage = lazy(() => import('./pages/RoomBoardPage').then((module) => ({ default: module.RoomBoardPage })));
const HousekeepingPage = lazy(() => import('./pages/HousekeepingPage').then((module) => ({ default: module.HousekeepingPage })));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage').then((module) => ({ default: module.MaintenancePage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((module) => ({ default: module.AdminPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })));

const RouteFallback = () => (
  <div className="p-6 text-sm text-gray-500 dark:text-slate-400">Loading...</div>
);

const withSuspense = (element: ReactElement) => (
  <Suspense fallback={<RouteFallback />}>
    {element}
  </Suspense>
);

export const router = createBrowserRouter([
  { path: '/login', element: withSuspense(<LoginPage />) },
  { path: '/', element: withSuspense(<Layout><HomePage /></Layout>) },
  { path: '/rooms', element: withSuspense(<Layout><RoomsPage /></Layout>) },
  { path: '/gym', element: withSuspense(<Layout><GymPage /></Layout>) },
  { path: '/rooms/:id', element: withSuspense(<Layout><RoomDetailPage /></Layout>) },
  { path: '/rooms/:id/spa', element: withSuspense(<Layout><SpaPage /></Layout>) },
  {
    path: '/front-desk',
    element: withSuspense(
      <ProtectedRoute allowedRoles={['reception', 'admin', 'manager']}>
        <Layout><FrontDeskPage /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/room-board',
    element: withSuspense(
      <ProtectedRoute allowedRoles={['reception', 'admin', 'manager']}>
        <Layout><RoomBoardPage /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/housekeeping',
    element: withSuspense(
      <ProtectedRoute allowedRoles={['housekeeping', 'admin', 'manager']}>
        <Layout><HousekeepingPage /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/maintenance',
    element: withSuspense(
      <ProtectedRoute allowedRoles={['maintenance', 'admin', 'manager']}>
        <Layout><MaintenancePage /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: withSuspense(
      <ProtectedRoute allowedRoles={['admin', 'manager']}>
        <Layout><DashboardPage /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: withSuspense(
      <ProtectedRoute allowedRoles={['admin', 'manager']}>
        <Layout><AdminPage /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: withSuspense(
      <ProtectedRoute>
        <Layout><ProfilePage /></Layout>
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
