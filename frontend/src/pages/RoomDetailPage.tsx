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
    <div>
      <Button variant="ghost" onClick={() => navigate('/rooms')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />{t('backToRooms')}
      </Button>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative h-96 rounded-lg overflow-hidden">
            <img src={roomImages[room.type]} alt={`Room ${room.number}`} className="w-full h-full object-cover" />
          </div>
        </div>
        <div>
          <Badge variant={room.status === 'available' ? 'default' : 'secondary'} className="mb-3">
            {room.status === 'available' ? t('available') : t('notAvailable')}
          </Badge>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('room')} {room.number}</h1>
          <p className="text-lg text-gray-600 capitalize mb-4">{t(`roomType.${room.type}`)}</p>
          <div className="flex items-center gap-3 mb-6 text-gray-600">
            <div className="flex items-center gap-2"><MapPin className="h-5 w-5" /><span>{t('floor')} {room.floor}</span></div>
            <div className="flex items-center gap-2"><Users className="h-5 w-5" /><span>{room.capacity} {room.capacity > 1 ? t('guests') : t('guest')}</span></div>
          </div>
          <p className="text-gray-700 leading-relaxed mb-6">{room.description}</p>
          <div className="bg-amber-50 p-6 rounded-lg mb-6">
            <p className="text-sm text-gray-600 mb-1">{t('pricePerNight')}</p>
            <p className="text-4xl font-bold text-amber-600">{formatCurrency(room.pricePerNight)}</p>
          </div>
          <div className="mb-6 rounded-lg border border-gray-200 p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">{t('reserveRoom')}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-gray-600">{t('checkIn')}</label>
                <Input type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">{t('checkOut')}</label>
                <Input type="date" value={checkOut} min={checkIn || today} onChange={(e) => setCheckOut(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">{t('guests')}</label>
              <Input
                type="number"
                min="1"
                max={room.capacity}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">{t('maxGuests', { count: room.capacity })}</p>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('amenities')}</h3>
            <div className="grid grid-cols-2 gap-3">
              {room.amenities.map((amenity) => {
                const Icon = amenityIcons[amenity] || Wifi;
                return (
                  <div key={amenity} className="flex items-center gap-2 text-gray-700">
                    <div className="p-2 bg-gray-100 rounded"><Icon className="h-5 w-5 text-amber-600" /></div>
                    <span>{t(`amenity.${amenity}`, { defaultValue: amenity })}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <Button
            size="lg"
            className="w-full"
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
      </div>
    </div>
  );
};
