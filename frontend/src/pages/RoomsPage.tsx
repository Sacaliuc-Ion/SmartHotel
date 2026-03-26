import { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/imageError/ImageWithFallback';
import { Search, Users, Wifi, Tv, Wind, Coffee, Bath, Armchair } from 'lucide-react';

const roomImages: Record<string, string> = {
  single: 'https://images.unsplash.com/photo-1657639754502-3c138cb24b4c?w=800',
  double: 'https://images.unsplash.com/photo-1657639754502-3c138cb24b4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
  suite: 'https://images.unsplash.com/photo-1759223198981-661cadbbff36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
  deluxe: 'https://images.unsplash.com/photo-1520056107387-2cb5354436ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
};

const amenityIcons: Record<string, React.ElementType> = {
  'WiFi': Wifi, 'TV': Tv, 'AC': Wind, 'Mini Bar': Coffee, 'Jacuzzi': Bath, 'Balcony': Armchair,
};

export const RoomsPage = () => {
  const { rooms } = useHotel();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Rooms</h1>
        <p className="text-gray-600">Discover your perfect stay from our selection of rooms</p>
      </div>

      <div className="bg-white p-6 rounded-lg border mb-6 grid md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search by room number or type..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="double">Double</SelectItem>
              <SelectItem value="suite">Suite</SelectItem>
              <SelectItem value="deluxe">Deluxe</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="budget">Under $100</SelectItem>
              <SelectItem value="mid">$100 – $200</SelectItem>
              <SelectItem value="luxury">$200+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <div key={room.id} className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <ImageWithFallback src={roomImages[room.type]} alt={`Room ${room.number}`} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3">
                <Badge variant={room.status === 'available' ? 'default' : 'secondary'} className="bg-white/90 text-gray-800">
                  {room.status === 'available' ? 'Available' : 'Not Available'}
                </Badge>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Room {room.number}</h3>
                  <p className="text-sm text-gray-500 capitalize">{room.type} Room · Floor {room.floor}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">${room.pricePerNight}</p>
                  <p className="text-xs text-gray-500">per night</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3 text-gray-600">
                <Users className="h-4 w-4" />
                <span className="text-sm">{room.capacity} Guest{room.capacity > 1 ? 's' : ''}</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{room.description}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {room.amenities.slice(0, 4).map((amenity) => {
                  const Icon = amenityIcons[amenity] || Wifi;
                  return (
                    <div key={amenity} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                      <Icon className="h-3 w-3" /><span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
              <Button className="w-full">View Details</Button>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No rooms found matching your criteria</p>
        </div>
      )}
    </div>
  );
};
