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
import { formatCurrency, getRoomAvailabilityState } from '../utils/hotelFormatting';
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

const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

const parseLocalDateTime = (value: string) => {
  const [datePart, timePart = '00:00:00'] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes, seconds] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, seconds || 0, 0);
};

export const RoomsPage = () => {
  const { rooms } = useHotel();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [capacityFilter, setCapacityFilter] = useState<string>('all');
  const [amenityFilter, setAmenityFilter] = useState<string>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');

  const availableFloors = Array.from(new Set(rooms.map((room) => room.floor))).sort((a, b) => a - b);
  const availableAmenities = Array.from(new Set(rooms.flatMap((room) => room.amenities))).sort((a, b) => a.localeCompare(b));
  const uniquePrices = Array.from(new Set(rooms.map((room) => room.pricePerNight))).sort((a, b) => a - b);
  const priceStep = uniquePrices.length > 0 ? Math.ceil(uniquePrices.length / 3) : 0;
  const priceOptions = Array.from({ length: 3 }, (_, index) => {
    const slice = uniquePrices.slice(index * priceStep, (index + 1) * priceStep);

    if (slice.length === 0) {
      return null;
    }

    const min = slice[0];
    const max = slice[slice.length - 1];

    return {
      value: `range-${index}`,
      min,
      max,
      label: min === max
        ? formatCurrency(min)
        : `${formatCurrency(min)} - ${formatCurrency(max)}`,
    };
  }).filter((option): option is { value: string; min: number; max: number; label: string } => option !== null);

  const filteredRooms = rooms.filter((room) => {
    const availabilityState = getRoomAvailabilityState(room);
    const matchesSearch = room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || room.type === typeFilter;
    const selectedPriceOption = priceOptions.find((option) => option.value === priceFilter);
    const matchesPrice =
      priceFilter === 'all' ||
      (selectedPriceOption !== undefined &&
        room.pricePerNight >= selectedPriceOption.min &&
        room.pricePerNight <= selectedPriceOption.max);
    const matchesCapacity =
      capacityFilter === 'all' ||
      room.capacity >= Number(capacityFilter);
    const matchesAmenity =
      amenityFilter === 'all' ||
      room.amenities.includes(amenityFilter);
    const matchesFloor =
      floorFilter === 'all' ||
      room.floor === Number(floorFilter);
    const matchesAvailability =
      availabilityFilter === 'all' ||
      availabilityState === availabilityFilter;

    return matchesSearch &&
      matchesType &&
      matchesPrice &&
      matchesCapacity &&
      matchesAmenity &&
      matchesFloor &&
      matchesAvailability;
  });

  const formatAvailabilityMoment = (room: { nextAvailableAt?: string | null; nextAvailableDate?: string | null }) => {
    if (room.nextAvailableAt) {
      return new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(parseLocalDateTime(room.nextAvailableAt));
    }

    if (!room.nextAvailableDate) {
      return null;
    }

    return new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(parseLocalDate(room.nextAvailableDate));
  };

  const formatAvailabilityDate = (value?: string | null) => {
    if (!value) return null;
    return new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(parseLocalDate(value));
  };

  return (
    <div className="min-h-full bg-background">
      <div className="mb-4 px-4 py-2 lb-sidebar">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-2">{t('roomsTitle')}</h1>
        <p className="text-gray-600 dark:text-slate-300">{t('roomsSubtitle')}</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 mx-4 p-6 rounded-lg border dark:border-slate-700 mb-6 grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="md:col-span-2 xl:col-span-2">
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
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">{t('capacity')}</label>
          <Select value={capacityFilter} onValueChange={setCapacityFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allCapacities')}</SelectItem>
              <SelectItem value="1">{t('capacityAtLeast', { count: 1 })}</SelectItem>
              <SelectItem value="2">{t('capacityAtLeast', { count: 2 })}</SelectItem>
              <SelectItem value="3">{t('capacityAtLeast', { count: 3 })}</SelectItem>
              <SelectItem value="4">{t('capacityAtLeast', { count: 4 })}</SelectItem>
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
              {priceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">{t('amenities')}</label>
          <Select value={amenityFilter} onValueChange={setAmenityFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allAmenities')}</SelectItem>
              {availableAmenities.map((amenity) => (
                <SelectItem key={amenity} value={amenity}>
                  {t(`amenity.${amenity}`, { defaultValue: amenity })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">{t('floor')}</label>
          <Select value={floorFilter} onValueChange={setFloorFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allFloors')}</SelectItem>
              {availableFloors.map((floor) => (
                <SelectItem key={floor} value={String(floor)}>
                  {t('floorNumber', { floor })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">{t('availability')}</label>
          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allAvailability')}</SelectItem>
              <SelectItem value="available">{t('availableNow')}</SelectItem>
              <SelectItem value="available-soon">{t('availableSoon')}</SelectItem>
              <SelectItem value="unavailable">{t('currentlyUnavailable')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mx-4">
        {filteredRooms.map((room) => {
          const availabilityState = getRoomAvailabilityState(room);
          const availabilityLabel =
            availabilityState === 'available-soon'
              ? t('availableFromLabel')
              : availabilityState === 'available'
                ? t('available')
                : t('notAvailable');

          return (
          <div key={room.id} className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700 overflow-hidden hover:shadow-lg dark:hover:shadow-black/30 transition-shadow">
            <div className="relative h-48">
              <img
                src={roomImages[room.type]}
                alt={`Room ${room.number}`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <Badge variant={availabilityState === 'available' ? 'default' : 'secondary'} className="bg-white/90 text-gray-800 dark:bg-slate-950/90 dark:text-slate-100">
                  {availabilityLabel}
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

              {(room.nextAvailableAt || room.nextAvailableDate) && (
                <p className="mb-3 text-sm font-medium text-amber-700 dark:text-amber-300">
                  {t('availableFromText', {
                    date: formatAvailabilityMoment(room) ?? formatAvailabilityDate(room.nextAvailableDate),
                  })}
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
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-slate-400 text-lg">{t('noRoomsFound')}</p>
        </div>
      )}
    </div>
  );
};
