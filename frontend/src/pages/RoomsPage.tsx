import { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Search, Users, Wifi, Tv, Wind, Coffee, Armchair, Bath } from 'lucide-react';
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
  'WiFi': Wifi,
  'TV': Tv,
  'AC': Wind,
  'Mini Bar': Coffee,
  'Jacuzzi': Bath,
  'Balcony': Armchair,
};

export const RoomsPage = () => {
  const { rooms } = useHotel();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || room.type === typeFilter;
    const matchesPrice =
      priceFilter === 'all' ||
      (priceFilter === 'budget' && room.pricePerNight < 100) ||
      (priceFilter === 'mid' && room.pricePerNight >= 100 && room.pricePerNight < 200) ||
      (priceFilter === 'luxury' && room.pricePerNight >= 200);

    return matchesSearch && matchesType && matchesPrice && room.status !== 'out-of-order';
  });

  const formatAvailabilityDate = (value?: string | null) => {
    if (!value) return null;
    return new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(new Date(value));
  };

  return (
    <div className="min-h-full bg-background">
      <div className="mb-4 px-4 py-2 lb-sidebar">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-2">{t('roomsTitle')}</h1>
        <p className="text-gray-600 dark:text-slate-300">{t('roomsSubtitle')}</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 mx-4 p-6 rounded-lg border dark:border-slate-700 mb-6 grid md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">{t('search')}</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('searchRoomsPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">{t('roomType')}</label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allTypes')}</SelectItem>
              <SelectItem value="single">{t('roomType.single')}</SelectItem>
              <SelectItem value="double">{t('roomType.double')}</SelectItem>
              <SelectItem value="suite">{t('roomType.suite')}</SelectItem>
              <SelectItem value="deluxe">{t('roomType.deluxe')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">{t('priceRange')}</label>
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allPrices')}</SelectItem>
              <SelectItem value="budget">{t('budgetPrice')}</SelectItem>
              <SelectItem value="mid">{t('midPrice')}</SelectItem>
              <SelectItem value="luxury">{t('luxuryPrice')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mx-4">
        {filteredRooms.map((room) => (
          <div key={room.id} className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700 overflow-hidden hover:shadow-lg dark:hover:shadow-black/30 transition-shadow">
            <div className="relative h-48">
              <img
                src={roomImages[room.type]}
                alt={`Room ${room.number}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <Badge variant={room.status === 'available' ? 'default' : 'secondary'} className="bg-white/90 text-gray-800 dark:bg-slate-950/90 dark:text-slate-100">
                  {room.nextAvailableDate ? t('availableFromLabel') : room.status === 'available' ? t('available') : t('notAvailable')}
                </Badge>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100">{t('room')} {room.number}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 capitalize">{t(`roomType.${room.type}`)} • {t('floor')} {room.floor}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(room.pricePerNight)}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{t('perNight')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3 text-gray-600 dark:text-slate-300">
                <Users className="h-4 w-4" />
                <span className="text-sm">{room.capacity} {room.capacity > 1 ? t('guests') : t('guest')}</span>
              </div>

              {room.nextAvailableDate && (
                <p className="mb-3 text-sm font-medium text-amber-700 dark:text-amber-300">
                  {t('availableFromText', { date: formatAvailabilityDate(room.nextAvailableDate) })}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {room.amenities.slice(0, 4).map((amenity) => {
                  const Icon = amenityIcons[amenity] || Wifi;
                  return (
                    <div key={amenity} className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded">
                      <Icon className="h-3 w-3" />
                      <span>{t(`amenity.${amenity}`, { defaultValue: amenity })}</span>
                    </div>
                  );
                })}
              </div>

              <Button
                className="w-full"
                onClick={() => navigate(`/rooms/${room.id}`)}
              >
                {t('viewDetails')}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-slate-400 text-lg">{t('noRoomsFound')}</p>
        </div>
      )}
    </div>
  );
};
