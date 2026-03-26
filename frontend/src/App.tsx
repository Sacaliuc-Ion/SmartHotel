import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HotelProvider } from './context/HotelContext';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <HotelProvider>
        <RouterProvider router={router} />
      </HotelProvider>
    </AuthProvider>
  );
}
