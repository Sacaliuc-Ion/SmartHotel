import { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { Input } from '../ui/input';
import { formatCurrency } from '../../utils/hotelFormatting';
import { useTranslation } from 'react-i18next';
import { useHotel } from '../../context/HotelContext';

interface CheckInOutModalProps {
  booking: any;
  type: 'checkin' | 'checkout';
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckInOutModal = ({ booking, type, onClose, onSuccess }: CheckInOutModalProps) => {
  const { t } = useTranslation();
  const { syncBooking } = useHotel();
  const [notes, setNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(booking.paymentStatus || 'unpaid');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const checkoutRequiresPaid = type === 'checkout' && paymentStatus !== 'paid';

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      let updatedBooking =
        type === 'checkin'
          ? await api.post<any>(`/reception/check-in/${booking.id}`, { Notes: notes, PaymentStatus: paymentStatus })
          : await api.post<any>(`/reception/check-out/${booking.id}`, { Notes: notes, PaymentStatus: paymentStatus });

      if (type === 'checkin') {
        updatedBooking = await api.patch<any>(`/reservations/${booking.id}/payment-status`, {
          paymentStatus,
        });
      }

      if (updatedBooking) {
        syncBooking(updatedBooking);
      }

      if (type === 'checkin') {
        toast.success(t('checkInSuccess', { guest: booking.guestName, room: booking.roomNumber }));
      } else {
        toast.success(t('checkOutSuccess', { guest: booking.guestName, room: booking.roomNumber }));
      }
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || t('operationError', { type }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === 'checkin' ? t('checkInGuest') : t('checkOutGuest')}</DialogTitle>
          <DialogDescription>{t('confirmCheckOperation', { type: type === 'checkin' ? 'check-in' : 'check-out' })}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-gray-500 dark:text-slate-400">{t('guestName')}</p><p className="font-semibold text-gray-900 dark:text-slate-100">{booking.guestName}</p></div>
            <div><p className="text-sm text-gray-500 dark:text-slate-400">{t('room')}</p><p className="font-semibold text-gray-900 dark:text-slate-100">{t('room')} {booking.roomNumber}</p></div>
            <div><p className="text-sm text-gray-500 dark:text-slate-400">{t('checkIn')}</p><p className="font-semibold text-gray-900 dark:text-slate-100">{booking.checkIn}</p></div>
            <div><p className="text-sm text-gray-500 dark:text-slate-400">{t('checkOut')}</p><p className="font-semibold text-gray-900 dark:text-slate-100">{booking.checkOut}</p></div>
            <div><p className="text-sm text-gray-500 dark:text-slate-400">{t('guests')}</p><p className="font-semibold text-gray-900 dark:text-slate-100">{booking.guests ?? 1}</p></div>
            <div><p className="text-sm text-gray-500 dark:text-slate-400">{t('totalAmount')}</p><p className="font-semibold text-gray-900 dark:text-slate-100">{formatCurrency(booking.totalAmount)}</p></div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('payment')}</p>
              <select
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background"
                value={paymentStatus}
                onChange={(event) => setPaymentStatus(event.target.value)}
              >
                <option value="unpaid">{t('status.unpaid')}</option>
                <option value="partial">{t('status.partial')}</option>
                <option value="paid">{t('status.paid')}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-500 dark:text-slate-400">{t('notes')}</label>
            <Input placeholder={t('optionalNotes')} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          {checkoutRequiresPaid && (
            <p className="text-sm text-amber-600 dark:text-amber-300">
              {t('checkoutRequiresPaid')}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>{t('cancel')}</Button>
          <Button onClick={handleConfirm} disabled={isSubmitting || checkoutRequiresPaid}>
            {isSubmitting ? t('processing') : t('confirmOperation', { type: type === 'checkin' ? 'check-in' : 'check-out' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
