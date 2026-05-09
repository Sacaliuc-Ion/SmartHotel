import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useHotel } from '../context/HotelContext'; // Only for total rooms count fallback if needed
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckInOutModal } from '../components/reception/CheckInOutModal';
import { ArrowDownToLine, ArrowUpFromLine, Bed, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/hotelFormatting';
import { useTranslation } from 'react-i18next';

export const FrontDeskPage = () => {
  const { refreshData } = useHotel(); // Refresh global stat later
  const { t } = useTranslation();
  const [arrivals, setArrivals] = useState<any[]>([]);
  const [departures, setDepartures] = useState<any[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<any>({});
  
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [modalType, setModalType] = useState<'checkin' | 'checkout' | null>(null);

  const fetchDeskData = async () => {
    try {
      const [arr, dep, dash] = await Promise.all([
        api.get<any[]>('/reception/arrivals-today'),
        api.get<any[]>('/reception/departures-today'),
        api.get<any>('/dashboard')
      ]);
      setArrivals(arr || []);
      setDepartures(dep || []);
      setDashboardSummary(dash || {});
      // Refresh global context asynchronously
      refreshData();
    } catch (e: any) {
      toast.error(e.message || t('frontDeskFetchError'));
    }
  };

  useEffect(() => {
    fetchDeskData();
  }, []);

  const handleCheckIn = (booking: any) => {
    setSelectedBooking(booking);
    setModalType('checkin');
  };

  const handleCheckOut = (booking: any) => {
    setSelectedBooking(booking);
    setModalType('checkout');
  };

  const handleModalSuccess = () => {
    fetchDeskData();
  };

  return (
    <div className="pb-8">
      <div className="mb-6 px-4 py-2">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('frontDeskTitle')}</h1>
        <p className="text-gray-600">{t('frontDeskSubtitle')}</p>
      </div>

      {/* KPIs */}
      <div className="grid mx-4 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3"><CardDescription>{t('occupancyRate')}</CardDescription></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800">{dashboardSummary?.occupancyRate || 0}%</p>
                <p className="text-sm text-gray-500">{t('roomsRatio', { occupied: dashboardSummary?.occupiedRooms || 0, total: dashboardSummary?.totalRooms || 0 })}</p>
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
                <p className="text-3xl font-bold text-gray-800">{arrivals.length}</p>
                <p className="text-sm text-gray-500">{t('expectedCheckIns')}</p>
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
                <p className="text-3xl font-bold text-gray-800">{departures.length}</p>
                <p className="text-sm text-gray-500">{t('expectedCheckOuts')}</p>
              </div>
              <ArrowUpFromLine className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid mx-4 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownToLine className="h-5 w-5 text-green-600" /> {t('arrivalsToday')}
            </CardTitle>
            <CardDescription>{t('guestsCheckingIn')}</CardDescription>
          </CardHeader>
          <CardContent>
            {arrivals.length === 0 ? <p className="text-gray-500 text-center py-6">{t('noArrivalsToday')}</p> : (
              <div className="space-y-3">
                {arrivals.map((booking) => (
                  <div key={booking.id} className="p-4 border rounded-lg hover:border-green-400 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{booking.guestName}</h4>
                        <p className="text-sm text-gray-600">{t('room')} {booking.roomNumber} • {booking.guests} {booking.guests > 1 ? t('guests') : t('guest')}</p>
                      </div>
                      <Badge variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}>{t(`status.${booking.paymentStatus}`, { defaultValue: booking.paymentStatus })}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">{t('stayUntil', { date: booking.checkOut })}</p>
                      <Button size="sm" onClick={() => handleCheckIn(booking)}>{t('checkInAction')}</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpFromLine className="h-5 w-5 text-orange-600" /> {t('departuresToday')}
            </CardTitle>
            <CardDescription>{t('guestsCheckingOut')}</CardDescription>
          </CardHeader>
          <CardContent>
            {departures.length === 0 ? <p className="text-gray-500 text-center py-6">{t('noDeparturesToday')}</p> : (
              <div className="space-y-3">
                {departures.map((booking) => (
                  <div key={booking.id} className="p-4 border rounded-lg hover:border-orange-400 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{booking.guestName}</h4>
                        <p className="text-sm text-gray-600">{t('room')} {booking.roomNumber} • {booking.guests} {t('guests')}</p>
                      </div>
                      <div className="flex items-center gap-1 text-gray-700">
                        <Coins className="h-4 w-4 text-amber-600" />
                        <span className="font-semibold">{formatCurrency(booking.totalAmount)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={booking.paymentStatus === 'paid' ? 'default' : 'destructive'}>{t(`status.${booking.paymentStatus}`, { defaultValue: booking.paymentStatus })}</Badge>
                      <Button size="sm" variant="outline" onClick={() => handleCheckOut(booking)}>{t('checkOutAction')}</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedBooking && modalType && (
        <CheckInOutModal booking={selectedBooking} type={modalType} onClose={() => { setSelectedBooking(null); setModalType(null); }} onSuccess={handleModalSuccess} />
      )}
    </div>
  );
};
