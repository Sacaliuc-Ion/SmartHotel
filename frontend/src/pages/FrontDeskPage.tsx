import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Booking, useHotel } from '../context/HotelContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckInOutModal } from '../components/reception/CheckInOutModal';
import { ReservationEditModal } from '../components/reception/ReservationEditModal';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowDownToLine, ArrowUpFromLine, Bed, PencilLine, Search } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/hotelFormatting';
import { useTranslation } from 'react-i18next';

export const FrontDeskPage = () => {
  const { refreshData, bookings, updateBooking } = useHotel();
  const { t } = useTranslation();
  const [arrivals, setArrivals] = useState<Booking[]>([]);
  const [departures, setDepartures] = useState<Booking[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [modalType, setModalType] = useState<'checkin' | 'checkout' | null>(null);
  const todayKey = `${new Date().getFullYear()}-${`${new Date().getMonth() + 1}`.padStart(2, '0')}-${`${new Date().getDate()}`.padStart(2, '0')}`;

  const fetchDeskData = async () => {
    try {
      const [arr, dep, dash] = await Promise.all([
        api.get<Booking[]>('/reception/arrivals-today'),
        api.get<Booking[]>('/reception/departures-today'),
        api.get<any>('/dashboard'),
        refreshData(),
      ]);

      setArrivals(arr || []);
      setDepartures(dep || []);
      setDashboardSummary(dash || {});
    } catch (e: any) {
      toast.error(e.message || t('frontDeskFetchError'));
    }
  };

  useEffect(() => {
    fetchDeskData();
  }, []);

  const handleCheckIn = (booking: Booking) => {
    setSelectedBooking(booking);
    setModalType('checkin');
  };

  const handleCheckOut = (booking: Booking) => {
    setSelectedBooking(booking);
    setModalType('checkout');
  };

  const handleModalSuccess = () => {
    fetchDeskData();
  };

  const handleRemoveFromFrontDesk = async (booking: Booking) => {
    await updateBooking(booking.id, {
      roomId: Number(booking.roomId),
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      status: 'cancelled',
      notes: booking.notes ?? null,
    });

    await fetchDeskData();
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const operationalBookings = bookings
    .filter((booking) => booking.status !== 'checked-out' && booking.status !== 'cancelled')
    .filter((booking) => statusFilter === 'all' || booking.status === statusFilter)
    .filter((booking) => {
      if (!normalizedSearch) return true;
      return (
        booking.guestName.toLowerCase().includes(normalizedSearch) ||
        booking.roomNumber.toLowerCase().includes(normalizedSearch) ||
        String(booking.id).includes(normalizedSearch)
      );
    })
    .sort((left, right) => {
      const getPriority = (booking: Booking) => {
        if (booking.status === 'confirmed') return 0;
        if (booking.status === 'checked-in') return 1;
        return 2;
      };

      const priorityDiff = getPriority(left) - getPriority(right);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return `${left.checkIn}-${left.roomNumber}`.localeCompare(`${right.checkIn}-${right.roomNumber}`);
    });

  return (
    <div className="pb-8">
      <div className="mb-6 px-4 py-2">
        <h1 className="mb-2 text-3xl font-bold text-gray-800 dark:text-slate-100">{t('frontDeskTitle')}</h1>
        <p className="text-gray-600 dark:text-slate-300">{t('frontDeskSubtitle')}</p>
      </div>

      <div className="mx-4 mb-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3"><CardDescription>{t('occupancyRate')}</CardDescription></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800 dark:text-slate-100">{dashboardSummary?.occupancyRate || 0}%</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">{t('roomsRatio', { occupied: dashboardSummary?.occupiedRooms || 0, total: dashboardSummary?.totalRooms || 0 })}</p>
              </div>
              <Bed className="h-10 w-10 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardDescription>{t('arrivalsToday')}</CardDescription></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800 dark:text-slate-100">{arrivals.length}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">{t('expectedCheckIns')}</p>
              </div>
              <ArrowDownToLine className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardDescription>{t('departuresToday')}</CardDescription></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800 dark:text-slate-100">{departures.length}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">{t('expectedCheckOuts')}</p>
              </div>
              <ArrowUpFromLine className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mx-4 mt-6">
        <CardHeader>
          <CardTitle>{t('reservationManagementTitle')}</CardTitle>
          <CardDescription>{t('reservationManagementDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-5 grid gap-4 lg:grid-cols-[1.4fr_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9"
                placeholder={t('searchReservationPlaceholder')}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allReservationStatuses')}</SelectItem>
                <SelectItem value="confirmed">{t('status.confirmed')}</SelectItem>
                <SelectItem value="checked-in">{t('status.checked-in')}</SelectItem>
                <SelectItem value="no-show">{t('status.no-show')}</SelectItem>
                <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {operationalBookings.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-gray-500 dark:border-slate-700 dark:text-slate-400">
              {t('reservationManagementEmpty')}
            </p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {operationalBookings.map((booking) => {
                const isTodayReservation = booking.checkIn === todayKey || booking.checkOut === todayKey;
                const canEdit = booking.status !== 'cancelled';
                const canCheckIn = booking.status === 'confirmed';
                const canCheckOut = booking.status === 'checked-in';
                const canRemove = booking.status !== 'checked-in' && !isTodayReservation;

                return (
                  <div key={booking.id} className="rounded-xl border p-4 dark:border-slate-700 dark:bg-slate-950/40">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-amber-600 dark:text-amber-300">
                          {t('reservationNumber', { id: booking.id })}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-gray-900 dark:text-slate-100">{booking.guestName}</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          {t('room')} {booking.roomNumber} • {booking.checkIn} - {booking.checkOut}
                        </p>
                      </div>
                      <Badge>{t(`status.${booking.status}`, { defaultValue: booking.status })}</Badge>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-gray-600 dark:text-slate-300 md:grid-cols-3">
                      <div>
                        <span className="block text-xs uppercase text-gray-400 dark:text-slate-500">{t('guests')}</span>
                        {booking.guests}
                      </div>
                      <div>
                        <span className="block text-xs uppercase text-gray-400 dark:text-slate-500">{t('payment')}</span>
                        {t(`status.${booking.paymentStatus}`, { defaultValue: booking.paymentStatus })}
                      </div>
                      <div>
                        <span className="block text-xs uppercase text-gray-400 dark:text-slate-500">{t('totalAmount')}</span>
                        {formatCurrency(booking.totalAmount)}
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-4 rounded-lg border bg-slate-50 p-3 text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                        <span className="mb-1 block text-xs uppercase tracking-[0.12em] text-gray-400 dark:text-slate-500">{t('notes')}</span>
                        {booking.notes}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {canRemove && (
                        <Button size="sm" variant="destructive" onClick={() => handleRemoveFromFrontDesk(booking)}>
                          {t('cancel')}
                        </Button>
                      )}
                      {canEdit && (
                        <Button size="sm" variant="outline" onClick={() => setEditingBooking(booking)}>
                          <PencilLine className="mr-1 h-4 w-4" /> {t('editReservation')}
                        </Button>
                      )}
                      {canCheckIn && (
                        <Button size="sm" onClick={() => handleCheckIn(booking)}>{t('checkInAction')}</Button>
                      )}
                      {canCheckOut && (
                        <Button size="sm" variant="outline" onClick={() => handleCheckOut(booking)}>{t('checkOutAction')}</Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedBooking && modalType && (
        <CheckInOutModal
          booking={selectedBooking}
          type={modalType}
          onClose={() => {
            setSelectedBooking(null);
            setModalType(null);
          }}
          onSuccess={handleModalSuccess}
        />
      )}

      {editingBooking && (
        <ReservationEditModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};
