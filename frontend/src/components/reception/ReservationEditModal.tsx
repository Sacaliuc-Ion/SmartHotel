import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useHotel, Booking } from '../../context/HotelContext';
import { api } from '../../services/api';
import { useTranslation } from 'react-i18next';

interface ReservationEditModalProps {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}

const editableStatuses = ['confirmed', 'no-show', 'cancelled'] as const;

export const ReservationEditModal = ({ booking, onClose, onSuccess }: ReservationEditModalProps) => {
  const { rooms } = useHotel();
  const { t } = useTranslation();
  const [roomId, setRoomId] = useState(String(booking.roomId));
  const [checkIn, setCheckIn] = useState(booking.checkIn);
  const [checkOut, setCheckOut] = useState(booking.checkOut);
  const [guests, setGuests] = useState(String(booking.guests));
  const [status, setStatus] = useState(booking.status);
  const [notes, setNotes] = useState(booking.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCheckedIn = booking.status === 'checked-in';
  const currentRoom = rooms.find((room) => String(room.id) === roomId);

  useEffect(() => {
    if (isCheckedIn) {
      setStatus('checked-in');
      setCheckIn(booking.checkIn);
    }
  }, [booking.checkIn, isCheckedIn]);

  const handleSubmit = async () => {
    if (!roomId || !checkIn || !checkOut || !guests) {
      toast.error(t('reservationFormRequired'));
      return;
    }

    try {
      setIsSubmitting(true);
      await api.put(`/reservations/${booking.id}`, {
        roomId: Number(roomId),
        checkIn,
        checkOut,
        guests: Number(guests),
        status,
        notes: notes.trim() || null,
      });
      toast.success(t('reservationUpdatedFrontDesk'));
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || t('reservationUpdateError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl dark:border-slate-700 dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>{t('editReservation')}</DialogTitle>
          <DialogDescription>{t('reservationEditDescription')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            <p className="font-medium">{t('reservationNumber', { id: booking.id })}</p>
            <p className="mt-1">{booking.guestName}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">{t('room')}</label>
              <Select value={roomId} onValueChange={setRoomId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={String(room.id)}>
                      {t('room')} {room.number} - {t(`roomType.${room.type}`)} - {t('floor')} {room.floor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentRoom && (
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  {t('capacity')}: {currentRoom.capacity} • {t('status')}: {t(`status.${String(currentRoom.status).toLowerCase()}`, { defaultValue: currentRoom.status })}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">{t('guests')}</label>
              <Input
                type="number"
                min="1"
                value={guests}
                onChange={(event) => setGuests(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">{t('checkIn')}</label>
              <Input
                type="date"
                value={checkIn}
                onChange={(event) => setCheckIn(event.target.value)}
                disabled={isCheckedIn}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">{t('checkOut')}</label>
              <Input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(event) => setCheckOut(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">{t('status')}</label>
              <Select value={status} onValueChange={setStatus} disabled={isCheckedIn}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {isCheckedIn ? (
                    <SelectItem value="checked-in">{t('status.checked-in')}</SelectItem>
                  ) : (
                    editableStatuses.map((item) => (
                      <SelectItem key={item} value={item}>
                        {t(`status.${item}`)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border bg-slate-50 p-3 text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
              <p className="font-medium text-gray-800 dark:text-slate-100">{t('reservationStatusOperational')}</p>
              <p className="mt-1">{isCheckedIn ? t('arrivalDateLockedNotice') : t('reservationEditHelp')}</p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">{t('reservationInternalNotes')}</label>
            <Textarea
              rows={4}
              placeholder={t('reservationNotesPlaceholder')}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>{t('cancel')}</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t('saving') : t('saveReservationChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
