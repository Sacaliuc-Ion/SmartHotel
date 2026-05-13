import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { RoomsPage } from './pages/RoomsPage';
import { RoomDetailPage } from './pages/RoomDetailPage';
import { LoginPage } from './pages/LoginPage';
import { FrontDeskPage } from './pages/FrontDeskPage';
import { RoomBoardPage } from './pages/RoomBoardPage';
import { HousekeepingPage } from './pages/HousekeepingPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/', element: <Layout><HomePage /></Layout> },
  { path: '/rooms', element: <Layout><RoomsPage /></Layout> },
  { path: '/rooms/:id', element: <Layout><RoomDetailPage /></Layout> },
  {
    path: '/front-desk',
    element: (
      <ProtectedRoute allowedRoles={['reception', 'admin', 'manager']}>
        <Layout><FrontDeskPage /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/room-board',
    element: (
      <ProtectedRoute allowedRoles={['reception', 'admin', 'manager']}>
        <Layout><RoomBoardPage /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/housekeeping',
    element: (
      <ProtectedRoute allowedRoles={['housekeeping', 'admin', 'manager']}>
        <Layout><HousekeepingPage /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/maintenance',
    element: (
      <ProtectedRoute allowedRoles={['maintenance', 'admin', 'manager']}>
        <Layout><MaintenancePage /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'manager']}>
        <Layout><DashboardPage /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'manager']}>
        <Layout><AdminPage /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Layout><ProfilePage /></Layout>
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
