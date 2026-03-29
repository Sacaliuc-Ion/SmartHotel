import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { HotelProvider } from './context/HotelContext';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <HotelProvider>
        <RouterProvider router={router} />
        <Toaster />
      </HotelProvider>
    </AuthProvider>
  );
}