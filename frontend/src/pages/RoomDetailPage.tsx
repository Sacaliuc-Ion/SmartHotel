import { rooms } from '../data/mockData';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/imageError/ImageWithFallback';
import { Users, Wifi, Tv, Wind, Coffee, Bath, Armchair, MapPin } from 'lucide-react';

const roomImages = {
  single: 'https://images.unsplash.com/photo-1657639754502-3c138cb24b4c?w=800',
  double: 'https://images.unsplash.com/photo-1657639754502-3c138cb24b4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
  suite: 'https://images.unsplash.com/photo-1759223198981-661cadbbff36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
  deluxe: 'https://images.unsplash.com/photo-1520056107387-2cb5354436ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
};

const amenityIcons: Record<string, React.ElementType> = {
  'WiFi': Wifi, 'TV': Tv, 'AC': Wind, 'Mini Bar': Coffee, 'Jacuzzi': Bath, 'Balcony': Armchair,
};

// Temporarily using first room as placeholder — routing not yet set up
const room = rooms[0];

export const RoomDetailPage = () => {
  return (
    <div className="p-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="relative h-96 rounded-lg overflow-hidden">
            <ImageWithFallback src={roomImages[room.type]} alt={`Room ${room.number}`} className="w-full h-full object-cover" />
          </div>
        </div>
        <div>
          <Badge variant={room.status === 'available' ? 'default' : 'secondary'} className="mb-3">
            {room.status === 'available' ? 'Available' : 'Not Available'}
          </Badge>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Room {room.number}</h1>
          <p className="text-lg text-gray-600 capitalize mb-4">{room.type} Room</p>
          <div className="flex items-center gap-4 mb-6 text-gray-600">
            <div className="flex items-center gap-2"><MapPin className="h-5 w-5" /><span>Floor {room.floor}</span></div>
            <div className="flex items-center gap-2"><Users className="h-5 w-5" /><span>{room.capacity} Guest{room.capacity > 1 ? 's' : ''}</span></div>
          </div>
          <p className="text-gray-700 leading-relaxed mb-6">{room.description}</p>
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <p className="text-sm text-gray-600 mb-1">Price per night</p>
            <p className="text-4xl font-bold text-blue-600">${room.pricePerNight}</p>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              {room.amenities.map((amenity) => {
                const Icon = amenityIcons[amenity] || Wifi;
                return (
                  <div key={amenity} className="flex items-center gap-2 text-gray-700">
                    <div className="p-2 bg-gray-100 rounded"><Icon className="h-5 w-5 text-blue-600" /></div>
                    <span>{amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <Button size="lg" className="w-full" disabled={room.status !== 'available'}>
            {room.status === 'available' ? 'Book Now' : 'Currently Unavailable'}
          </Button>
        </div>
      </div>
    </div>
  );
};
