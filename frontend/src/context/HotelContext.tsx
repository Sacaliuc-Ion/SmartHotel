import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  rooms as initialRooms, bookings as initialBookings,
  maintenanceTickets as initialTickets,
  Room, Booking, MaintenanceTicket, RoomStatus, BookingStatus,
} from '../data/mockData';

interface HotelContextType {
  rooms: Room[]; bookings: Booking[]; tickets: MaintenanceTicket[];
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (bookingId: string, booking: Partial<Booking>) => void;
  addTicket: (ticket: MaintenanceTicket) => void;
  updateTicket: (ticketId: string, ticket: Partial<MaintenanceTicket>) => void;
  deleteBooking: (bookingId: string) => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(initialTickets);

  const updateRoomStatus = (roomId: string, status: RoomStatus) =>
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, status } : r)));

  const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
    if (status === 'checked-out') {
      const booking = bookings.find((b) => b.id === bookingId);
      if (booking) updateRoomStatus(booking.roomId, 'dirty');
    }
  };

  const addBooking = (booking: Booking) => setBookings((prev) => [...prev, booking]);
  const updateBooking = (bookingId: string, updated: Partial<Booking>) =>
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, ...updated } : b)));
  const deleteBooking = (bookingId: string) =>
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  const addTicket = (ticket: MaintenanceTicket) => setTickets((prev) => [...prev, ticket]);
  const updateTicket = (ticketId: string, updated: Partial<MaintenanceTicket>) =>
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, ...updated } : t)));

  return (
    <HotelContext.Provider value={{ rooms, bookings, tickets, updateRoomStatus, updateBookingStatus, addBooking, updateBooking, addTicket, updateTicket, deleteBooking }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) throw new Error('useHotel must be used within a HotelProvider');
  return context;
};