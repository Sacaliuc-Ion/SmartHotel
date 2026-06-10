export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const fromDateKey = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

export const combineDateKeyAndTime = (dateKey: string, timeValue = '00:00'): Date => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const [hours, minutes] = timeValue.split(':').map(Number);
  return new Date(year, month - 1, day, Number.isNaN(hours) ? 0 : hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0);
};

export const getCurrentDateKey = (): string => toDateKey(new Date());

type BookingLike = {
  status?: string | null;
  checkIn: string;
  checkOut: string;
  checkInTime?: string | null;
  roomId?: string | number;
};

type RoomLike = {
  id: string | number;
  standardCheckInTime?: string | null;
  standardCheckOutTime?: string | null;
};

export const getOperationalDueAt = (
  booking: BookingLike,
  roomsById: Map<string, RoomLike>,
): Date | null => {
  const room = booking.roomId != null ? roomsById.get(String(booking.roomId)) : undefined;

  if (booking.status === 'confirmed') {
    return combineDateKeyAndTime(
      booking.checkIn,
      booking.checkInTime || room?.standardCheckInTime || '14:00',
    );
  }

  if (booking.status === 'checked-in') {
    return combineDateKeyAndTime(
      booking.checkOut,
      room?.standardCheckOutTime || '11:00',
    );
  }

  return null;
};

export const isOperationallyOverdue = (
  booking: BookingLike,
  roomsById: Map<string, RoomLike>,
  now = new Date(),
): boolean => {
  const dueAt = getOperationalDueAt(booking, roomsById);
  return dueAt != null && dueAt.getTime() < now.getTime();
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const getDaysBetween = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};
