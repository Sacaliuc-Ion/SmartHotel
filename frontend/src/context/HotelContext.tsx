import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export type RoomStatus = 'available' | 'occupied' | 'dirty' | 'cleaning' | 'clean' | 'ready' | 'outoforder' | 'inspected' | 'outofservice';
export type BookingStatus = 'confirmed' | 'checkedIn' | 'checkedOut' | 'cancelled' | 'noShow';

export interface Room {
  id: string | number;
  number: string;
  type: string;
  floor: number;
  capacity: number;
  pricePerNight: number;
  status: RoomStatus | string;
  amenities: string[];
  description?: string;
}

export interface Booking {
  id: string | number;
  guestName: string;
  roomId: string | number;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus | string;
  guests: number;
  totalAmount: number;
}

export interface MaintenanceTicket {
  id: string | number;
  roomId: string | number;
  roomNumber: string;
  issue: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | string;
  status: 'new' | 'in-progress' | 'waiting-parts' | 'resolved' | 'closed' | string;
  assignee?: string;
  createdAt: string;
  resolvedAt?: string;
}

interface HotelContextType {
  rooms: Room[];
  bookings: Booking[];
  tickets: MaintenanceTicket[];
  refreshData: () => Promise<void>;
  updateRoomStatus: (roomId: string | number, status: string) => Promise<void>;
  updateBookingStatus: (bookingId: string | number, status: string) => Promise<void>;
  addBooking: (booking: any) => Promise<void>;
  updateBooking: (bookingId: string | number, booking: any) => Promise<void>;
  addTicket: (ticket: any) => Promise<void>;
  updateTicket: (ticketId: string | number, ticket: any) => Promise<void>;
  deleteBooking: (bookingId: string | number) => Promise<void>;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);

  const refreshData = async () => {
    if (!isAuthenticated) return;
    try {
      const [roomsRes, bookingsRes, ticketsRes] = await Promise.all([
        api.get<Room[]>('/rooms').catch(() => []),
        api.get<Booking[]>('/reservations').catch(() => []),
        api.get<MaintenanceTicket[]>('/maintenance/tickets').catch(() => [])
      ]);
      setRooms(roomsRes || []);
      setBookings(bookingsRes || []);
      setTickets(ticketsRes || []);
    } catch (err) {
      console.error('Error fetching global hotel data:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [isAuthenticated]);

  const updateRoomStatus = async (roomId: string | number, status: string) => {
    try {
      const payloadStatus = status.replace(/-/g, ''); // Ensure mapping matches C# enum
      await api.patch(`/rooms/${roomId}/status`, { status: payloadStatus });
      setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, status } : r)));
    } catch (e: any) {
      toast.error(e.message || 'Eroare la actualizarea statusului camerei');
    }
  };

  const updateBookingStatus = async (bookingId: string | number, status: string) => {
    try {
      // For check in / out, we usually go through the specialized endpoint in Reception
      // If we just casually change status here, we might need a generic PATCH. 
      toast.info('Foloseste pagina receptiei pentru check-in si check-out pentru a reflecta corect in sistem.');
    } catch (e: any) {
      toast.error('Gresit status booking');
    }
  };

  const addBooking = async (booking: any) => {
    try {
      await api.post('/reservations', {
        roomId: booking.roomId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests || 1
      });
      await refreshData();
      toast.success('Rezervare adaugata cu succes');
    } catch (e: any) {
      toast.error(e.message || 'Eroare la adaugare rezervare');
    }
  };

  const updateBooking = async (bookingId: string | number, updated: any) => {
    toast.info('Actualizarea partiala a rezervarilor nu este implementata in API momentan.');
  };

  const deleteBooking = async (bookingId: string | number) => {
    try {
      await api.patch(`/reservations/${bookingId}/cancel`);
      await refreshData();
      toast.success('Rezervare anulata');
    } catch (e: any) {
      toast.error(e.message || 'Eroare la stergere rezervare');
    }
  };

  const addTicket = async (ticket: any) => {
    try {
      await api.post('/maintenance/tickets', {
        roomId: ticket.roomId,
        issue: ticket.issue,
        description: ticket.description,
        priority: ticket.priority
      });
      await refreshData();
    } catch (e: any) {
      toast.error(e.message || 'Eroare mentenanta');
    }
  };

  const updateTicket = async (ticketId: string | number, updated: Partial<MaintenanceTicket>) => {
    try {
      if (updated.status === 'resolved') {
        await api.patch(`/maintenance/tickets/${ticketId}/resolve`);
      } else if (updated.status === 'in-progress') {
        await api.patch(`/maintenance/tickets/${ticketId}/accept`);
      } else {
        toast.info('API curent suporta schimbarile de tip In-progress si Resolve direct.');
        return;
      }
      await refreshData();
    } catch (e: any) {
      toast.error(e.message || 'Eroare mentenanta');
    }
  };

  return (
    <HotelContext.Provider value={{ 
      rooms, bookings, tickets, refreshData, 
      updateRoomStatus, updateBookingStatus, 
      addBooking, updateBooking, deleteBooking, 
      addTicket, updateTicket 
    }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) throw new Error('useHotel must be used within a HotelProvider');
  return context;
};