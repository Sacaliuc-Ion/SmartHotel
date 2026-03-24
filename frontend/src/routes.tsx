import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from './pages/Home';
import { LoginPage } from './pages/Login';
import { RoomsPage } from './pages/RoomsPage';
import { FrontDeskPage } from './pages/FrontDeskPage';
export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/rooms',
    element: <RoomsPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
    {
    path: '/frontdesk',
    element: <FrontDeskPage />,
  },
 
]);