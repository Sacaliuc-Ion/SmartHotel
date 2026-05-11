import { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { Input } from '../ui/input';
import { formatCurrency } from '../../utils/hotelFormatting';
import { useTranslation } from 'react-i18next';

interface CheckInOutModalProps {
  booking: any;
  type: 'checkin' | 'checkout';
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckInOutModal = ({ booking, type, onClose, onSuccess }: CheckInOutModalProps) => {
  const { t } = useTranslation();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      if (type === 'checkin') {
        await api.post(`/reception/check-in/${booking.id}`, { notes });
        toast.success(t('checkInSuccess', { guest: booking.guestName, room: booking.roomNumber }));
      } else {
        await api.post(`/reception/check-out/${booking.id}`, { notes });
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
            <div><p className="text-sm text-gray-500 dark:text-slate-400">{t('payment')}</p><p className="font-semibold capitalize text-gray-900 dark:text-slate-100">{t(`status.${booking.paymentStatus}`, { defaultValue: booking.paymentStatus })}</p></div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-500 dark:text-slate-400">{t('notes')}</label>
            <Input placeholder={t('optionalNotes')} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>{t('cancel')}</Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? t('processing') : t('confirmOperation', { type: type === 'checkin' ? 'check-in' : 'check-out' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
