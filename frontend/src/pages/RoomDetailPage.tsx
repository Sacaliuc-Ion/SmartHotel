import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useHotel } from '../context/HotelContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { ArrowLeft, Users, Wifi, Tv, Wind, Coffee, Bath, Armchair, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import Single from '../assets/rooms/Single.jpg';
import Double from '../assets/rooms/Double.jpg';
import Suite from '../assets/rooms/Suite.jpg';
import Deluxe from '../assets/rooms/Deluxe.jpg';
import { formatCurrency } from '../utils/hotelFormatting';
import { useTranslation } from 'react-i18next';
import { getRoomDescriptionLines } from '../utils/roomDescriptions';

const roomImages: Record<string, string> = {
  single: Single,
  double: Double,
  suite: Suite,
  deluxe: Deluxe,
};

const amenityIcons: Record<string, React.ElementType> = {
  'WiFi': Wifi, 'TV': Tv, 'AC': Wind, 'Mini Bar': Coffee, 'Jacuzzi': Bath, 'Balcony': Armchair,
};


export const RoomDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { rooms, addBooking } = useHotel();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const room = rooms.find((r) => r.id.toString() === id);
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrow = useMemo(() => {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  }, []);
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBookNow = async () => {
    if (!room) return;

    if (!isAuthenticated) {
      toast.error(t('bookingAuthRequired'));
      navigate('/login');
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error(t('bookingDatesRequired'));
      return;
    }

    if (checkOut <= checkIn) {
      toast.error(t('bookingInvalidDates'));
      return;
    }

    const guestCount = Number(guests);
    if (!Number.isInteger(guestCount) || guestCount < 1) {
      toast.error(t('bookingInvalidGuests'));
      return;
    }

    if (guestCount > room.capacity) {
      toast.error(t('bookingTooManyGuests', { count: room.capacity }));
      return;
    }

    try {
      setIsSubmitting(true);
      await addBooking({
        roomId: Number(room.id),
        checkIn,
        checkOut,
        guests: guestCount,
      });
      navigate('/');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!room) return (
    <div className="text-center py-12">
      <p className="text-gray-500 text-lg mb-4">{t('roomNotFound')}</p>
      <Button onClick={() => navigate('/rooms')}>{t('backToRooms')}</Button>
    </div>
  );

  return (
    <div className="px-4 pb-4">
      <Button variant="ghost" onClick={() => navigate('/rooms')} className="mb-3">
        <ArrowLeft className="h-4 w-4 mr-2" />{t('backToRooms')}
      </Button>
      <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col gap-3">
          <div className="relative h-56 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:h-64">
            <img src={roomImages[room.type]} alt={`Room ${room.number}`} className="w-full h-full object-cover" />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="space-y-1.5 text-left">
              {getRoomDescriptionLines(room, t).map((line, index) => (
                <p key={`${room.id}-detail-description-${index}`} className="text-xs leading-5 text-gray-700 dark:text-slate-300 lg:text-sm">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Badge variant={room.status === 'available' ? 'default' : 'secondary'} className="w-fit">
            {room.status === 'available' ? t('available') : t('notAvailable')}
          </Badge>
          <div>
            <h1 className="mb-1 text-2xl font-bold text-gray-800 dark:text-slate-100 lg:text-3xl">{t('room')} {room.number}</h1>
            <p className="text-sm text-gray-600 dark:text-slate-300 capitalize lg:text-base">{t(`roomType.${room.type}`)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-slate-300">
            <div className="flex items-center gap-2"><MapPin className="h-5 w-5" /><span>{t('floor')} {room.floor}</span></div>
            <div className="flex items-center gap-2"><Users className="h-5 w-5" /><span>{room.capacity} {room.capacity > 1 ? t('guests') : t('guest')}</span></div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-1 text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">{t('pricePerNight')}</p>
            <p className="text-2xl font-bold text-amber-600 lg:text-3xl">{formatCurrency(room.pricePerNight)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-slate-100">{t('reserveRoom')}</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-gray-600 dark:text-slate-300">{t('checkIn')}</label>
                <Input type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600 dark:text-slate-300">{t('checkOut')}</label>
                <Input type="date" value={checkOut} min={checkIn || today} onChange={(e) => setCheckOut(e.target.value)} />
              </div>
            </div>
            <div className="mt-2">
              <label className="mb-1 block text-xs text-gray-600 dark:text-slate-300">{t('guests')}</label>
              <Input
                type="number"
                min="1"
                max={room.capacity}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
              <p className="mt-1 text-[11px] text-gray-500 dark:text-slate-400">{t('maxGuests', { count: room.capacity })}</p>
            </div>
            <Button
              size="lg"
              className="mt-3 w-full"
              disabled={room.status !== 'available' || isSubmitting}
              onClick={handleBookNow}
            >
              {room.status !== 'available'
                ? t('currentlyUnavailable')
                : isSubmitting
                  ? t('booking')
                  : t('bookNow')}
            </Button>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-slate-100">{t('amenities')}</h3>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
              {room.amenities.map((amenity) => {
                const Icon = amenityIcons[amenity] || Wifi;
                return (
                  <div key={amenity} className="flex items-center gap-2 rounded-md border border-gray-100 bg-white px-2 py-1.5 text-xs text-gray-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <div className="rounded bg-gray-100 p-1.5 dark:bg-slate-800"><Icon className="h-4 w-4 text-amber-600" /></div>
                    <span>{t(`amenity.${amenity}`, { defaultValue: amenity })}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
