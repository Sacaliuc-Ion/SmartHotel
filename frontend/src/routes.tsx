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

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/', element: <Layout><HomePage /></Layout> },
  { path: '/rooms', element: <Layout><RoomsPage /></Layout> },
  { path: '/rooms/:id', element: <Layout><RoomDetailPage /></Layout> },
  { path: '/front-desk', element: <Layout><FrontDeskPage /></Layout> },
  { path: '/room-board', element: <Layout><RoomBoardPage /></Layout> },
  { path: '/housekeeping', element: <Layout><HousekeepingPage /></Layout> },
  { path: '/maintenance', element: <Layout><MaintenancePage /></Layout> },
  { path: '/dashboard', element: <Layout><DashboardPage /></Layout> },
  { path: '/admin', element: <Layout><AdminPage /></Layout> },
  { path: '*', element: <Navigate to="/" replace /> },
]);