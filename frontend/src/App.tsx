import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { HotelProvider } from './context/HotelContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <NotificationsProvider>
          <HotelProvider>
            <RouterProvider router={router} />
            <Toaster />
          </HotelProvider>
        </NotificationsProvider>
      </AuthProvider>
    </PreferencesProvider>
  );
}
