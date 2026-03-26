import { useHotel } from '../../context/HotelContext';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';

interface CheckInOutModalProps {
  bookingId: string;
  type: 'checkin' | 'checkout';
  onClose: () => void;
}

export const CheckInOutModal = ({ bookingId, type, onClose }: CheckInOutModalProps) => {
  const { bookings, rooms, updateBookingStatus, updateRoomStatus } = useHotel();
  const booking = bookings.find((b) => b.id === bookingId);
  const room = rooms.find((r) => r.id === booking?.roomId);
  if (!booking || !room) return null;

  const handleConfirm = () => {
    if (type === 'checkin') {
      updateBookingStatus(bookingId, 'checked-in');
      updateRoomStatus(booking.roomId, 'occupied');
      toast.success(`${booking.guestName} checked in to Room ${room.number}`);
    } else {
      updateBookingStatus(bookingId, 'checked-out');
      updateRoomStatus(booking.roomId, 'dirty');
      toast.success(`${booking.guestName} checked out from Room ${room.number}`);
    }
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === 'checkin' ? 'Check In Guest' : 'Check Out Guest'}</DialogTitle>
          <DialogDescription>Confirm {type === 'checkin' ? 'check-in' : 'check-out'} details below</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-gray-500">Guest Name</p><p className="font-semibold">{booking.guestName}</p></div>
            <div><p className="text-sm text-gray-500">Room</p><p className="font-semibold">Room {room.number}</p></div>
            <div><p className="text-sm text-gray-500">Check-In</p><p className="font-semibold">{new Date(booking.checkIn).toLocaleDateString()}</p></div>
            <div><p className="text-sm text-gray-500">Check-Out</p><p className="font-semibold">{new Date(booking.checkOut).toLocaleDateString()}</p></div>
            <div><p className="text-sm text-gray-500">Guests</p><p className="font-semibold">{booking.guests}</p></div>
            <div><p className="text-sm text-gray-500">Total Amount</p><p className="font-semibold">${booking.totalAmount}</p></div>
            <div><p className="text-sm text-gray-500">Payment</p><p className="font-semibold capitalize">{booking.paymentStatus}</p></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm {type === 'checkin' ? 'Check-In' : 'Check-Out'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
