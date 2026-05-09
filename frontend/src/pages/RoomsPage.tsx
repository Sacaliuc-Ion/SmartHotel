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

  return (
    <div className="min-h-full bg-background">
      <div className="mb-4 px-4 py-2 lb-sidebar">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-2">Our rooms</h1>
        <p className="text-gray-600 dark:text-slate-300">Discover your perfect stay from our selection of rooms</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 mx-4 p-6 rounded-lg border dark:border-slate-700 mb-6 grid md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by room number or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Room type</label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="double">Double</SelectItem>
              <SelectItem value="suite">Suite</SelectItem>
              <SelectItem value="deluxe">Deluxe</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Price range</label>
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All prices</SelectItem>
              <SelectItem value="budget">Sub 100 MDL</SelectItem>
              <SelectItem value="mid">100 - 200 MDL</SelectItem>
              <SelectItem value="luxury">Peste 200 MDL</SelectItem>
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
                  {room.status === 'available' ? 'Available' : 'Not available'}
                </Badge>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Room {room.number}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 capitalize">{room.type} Room • Floor {room.floor}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(room.pricePerNight)}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">per night</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3 text-gray-600 dark:text-slate-300">
                <Users className="h-4 w-4" />
                <span className="text-sm">{room.capacity} Guest{room.capacity > 1 ? 's' : ''}</span>
              </div>

              <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">{room.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {room.amenities.slice(0, 4).map((amenity) => {
                  const Icon = amenityIcons[amenity] || Wifi;
                  return (
                    <div key={amenity} className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded">
                      <Icon className="h-3 w-3" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>

              <Button
                className="w-full"
                onClick={() => navigate(`/rooms/${room.id}`)}
                disabled={room.status !== 'available'}
              >
                {room.status === 'available' ? 'View details' : 'Not available'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-slate-400 text-lg">No rooms found matching your criteria</p>
        </div>
      )}
    </div>
  );
};
