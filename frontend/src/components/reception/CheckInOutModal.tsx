import { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { Input } from '../ui/input';

interface CheckInOutModalProps {
  booking: any;
  type: 'checkin' | 'checkout';
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckInOutModal = ({ booking, type, onClose, onSuccess }: CheckInOutModalProps) => {
  const [notes, setNotes] = useState('');

  const handleConfirm = async () => {
    try {
      if (type === 'checkin') {
        await api.post(`/reception/check-in/${booking.id}`, { notes });
        toast.success(`${booking.guestName} a fost cazat in camera ${booking.roomNumber}.`);
      } else {
        await api.post(`/reception/check-out/${booking.id}`, { notes });
        toast.success(`${booking.guestName} a fost decazat din camera ${booking.roomNumber}.`);
      }
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || `Eroare la operatiunea de ${type}`);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === 'checkin' ? 'Check In Guest' : 'Check Out Guest'}</DialogTitle>
          <DialogDescription>Confirma detaliile de {type === 'checkin' ? 'check-in' : 'check-out'} mai jos</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-gray-500">Guest Name</p><p className="font-semibold">{booking.guestName}</p></div>
            <div><p className="text-sm text-gray-500">Room</p><p className="font-semibold">Room {booking.roomNumber}</p></div>
            <div><p className="text-sm text-gray-500">Check-In</p><p className="font-semibold">{booking.checkIn}</p></div>
            <div><p className="text-sm text-gray-500">Check-Out</p><p className="font-semibold">{booking.checkOut}</p></div>
            <div><p className="text-sm text-gray-500">Guests</p><p className="font-semibold">{booking.guests ?? 1}</p></div>
            <div><p className="text-sm text-gray-500">Total Amount</p><p className="font-semibold">${booking.totalAmount}</p></div>
            <div><p className="text-sm text-gray-500">Payment</p><p className="font-semibold capitalize">{booking.paymentStatus}</p></div>
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">Notes</label>
            <Input placeholder="Optional notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
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
