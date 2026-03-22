// Mock data for the hotel management system

export type RoomStatus = 'available' | 'occupied' | 'dirty' | 'cleaning' | 'clean' | 'ready' | 'out-of-order';
export type BookingStatus = 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type TicketStatus = 'new' | 'in-progress' | 'waiting-parts' | 'resolved';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type UserRole = 'client' | 'reception' | 'housekeeping' | 'maintenance' | 'admin' | 'manager';

export interface Room {
  id: string;
  number: string;
  type: 'single' | 'double' | 'suite' | 'deluxe';
  floor: number;
  capacity: number;
  status: RoomStatus;
  pricePerNight: number;
  amenities: string[];
  description: string;
}

export interface Booking {
  id: string;
  guestName: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  guests: number;
}

export interface MaintenanceTicket {
  id: string;
  roomId: string;
  issue: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Rooms data
export const rooms: Room[] = [
  { id: '101', number: '101', type: 'single', floor: 1, capacity: 1, status: 'available', pricePerNight: 89, amenities: ['WiFi', 'TV', 'AC'], description: 'Cozy single room with modern amenities' },
  { id: '102', number: '102', type: 'single', floor: 1, capacity: 1, status: 'occupied', pricePerNight: 89, amenities: ['WiFi', 'TV', 'AC'], description: 'Cozy single room with modern amenities' },
  { id: '103', number: '103', type: 'double', floor: 1, capacity: 2, status: 'dirty', pricePerNight: 129, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'], description: 'Spacious double room with city view' },
  { id: '201', number: '201', type: 'double', floor: 2, capacity: 2, status: 'available', pricePerNight: 129, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'], description: 'Spacious double room with city view' },
  { id: '202', number: '202', type: 'suite', floor: 2, capacity: 4, status: 'occupied', pricePerNight: 249, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Jacuzzi', 'Balcony'], description: 'Luxury suite with separate living area' },
  { id: '203', number: '203', type: 'double', floor: 2, capacity: 2, status: 'cleaning', pricePerNight: 129, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'], description: 'Spacious double room with city view' },
  { id: '301', number: '301', type: 'deluxe', floor: 3, capacity: 3, status: 'available', pricePerNight: 189, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'], description: 'Deluxe room with premium amenities' },
  { id: '302', number: '302', type: 'suite', floor: 3, capacity: 4, status: 'available', pricePerNight: 249, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Jacuzzi', 'Balcony'], description: 'Luxury suite with separate living area' },
  { id: '303', number: '303', type: 'deluxe', floor: 3, capacity: 3, status: 'out-of-order', pricePerNight: 189, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'], description: 'Deluxe room with premium amenities' },
  { id: '304', number: '304', type: 'double', floor: 3, capacity: 2, status: 'available', pricePerNight: 129, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'], description: 'Spacious double room with city view' },
];

// Bookings data
export const bookings: Booking[] = [
  { id: 'B001', guestName: 'John Smith', roomId: '102', checkIn: new Date().toISOString().split('T')[0], checkOut: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], status: 'checked-in', paymentStatus: 'paid', totalAmount: 178, guests: 1 },
  { id: 'B002', guestName: 'Sarah Johnson', roomId: '202', checkIn: new Date(Date.now() - 86400000).toISOString().split('T')[0], checkOut: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], status: 'checked-in', paymentStatus: 'partial', totalAmount: 996, guests: 2 },
  { id: 'B003', guestName: 'Michael Brown', roomId: '103', checkIn: new Date(Date.now() - 86400000).toISOString().split('T')[0], checkOut: new Date().toISOString().split('T')[0], status: 'checked-out', paymentStatus: 'paid', totalAmount: 129, guests: 2 },
  { id: 'B004', guestName: 'Emma Wilson', roomId: '201', checkIn: new Date().toISOString().split('T')[0], checkOut: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0], status: 'confirmed', paymentStatus: 'unpaid', totalAmount: 516, guests: 2 },
  { id: 'B005', guestName: 'David Lee', roomId: '301', checkIn: new Date().toISOString().split('T')[0], checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0], status: 'confirmed', paymentStatus: 'unpaid', totalAmount: 189, guests: 2 },
  { id: 'B006', guestName: 'Lisa Anderson', roomId: '304', checkIn: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], checkOut: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], status: 'confirmed', paymentStatus: 'unpaid', totalAmount: 387, guests: 2 },
];

// Maintenance tickets
export const maintenanceTickets: MaintenanceTicket[] = [
  { id: 'T001', roomId: '303', issue: 'AC Not Working', description: 'Air conditioning unit is not cooling properly', priority: 'urgent', status: 'in-progress', assignee: 'Tom Martinez', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'T002', roomId: '203', issue: 'Leaky Faucet', description: 'Bathroom sink faucet is dripping', priority: 'low', status: 'new', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'T003', roomId: '102', issue: 'TV Remote Not Working', description: 'TV remote needs new batteries', priority: 'low', status: 'resolved', assignee: 'Tom Martinez', createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), resolvedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'T004', roomId: '303', issue: 'Broken Window', description: 'Window latch is broken, needs replacement', priority: 'high', status: 'waiting-parts', assignee: 'James Wilson', createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
];

// Users
export const users: User[] = [
  { id: 'U001', name: 'John Doe', email: 'john@hotel.com', role: 'reception' },
  { id: 'U002', name: 'Jane Smith', email: 'jane@hotel.com', role: 'housekeeping' },
  { id: 'U003', name: 'Tom Martinez', email: 'tom@hotel.com', role: 'maintenance' },
  { id: 'U004', name: 'Emily Davis', email: 'emily@hotel.com', role: 'admin' },
  { id: 'U005', name: 'Robert Johnson', email: 'robert@hotel.com', role: 'manager' },
  { id: 'U006', name: 'Guest User', email: 'guest@example.com', role: 'client' },
];
