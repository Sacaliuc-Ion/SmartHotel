import { useParams, useNavigate } from 'react-router';
import { useHotel } from '../context/HotelContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Users, Wifi, Tv, Wind, Coffee, Bath, Armchair, MapPin } from 'lucide-react';
import Single from '../assets/rooms/Single.jpg';
import Double from '../assets/rooms/Double.jpg';
import Suite from '../assets/rooms/Suite.jpg';
import Deluxe from '../assets/rooms/Deluxe.jpg';

const roomImages = {
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
  const { rooms } = useHotel();
  const navigate = useNavigate();
  const room = rooms.find((r) => r.id === id);

  if (!room) return (
    <div className="text-center py-12">
      <p className="text-gray-500 text-lg mb-4">Room not found</p>
      <Button onClick={() => navigate('/rooms')}>Back to Rooms</Button>
    </div>
  );

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate('/rooms')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />Back to Rooms
      </Button>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative h-96 rounded-lg overflow-hidden">
            <img src={roomImages[room.type]} alt={`Room ${room.number}`} className="w-full h-full object-cover" />
          </div>
        </div>
        <div>
          <Badge variant={room.status === 'available' ? 'default' : 'secondary'} className="mb-3">
            {room.status === 'available' ? 'Available' : 'Not Available'}
          </Badge>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Room {room.number}</h1>
          <p className="text-lg text-gray-600 capitalize mb-4">{room.type} Room</p>
          <div className="flex items-center gap-3 mb-6 text-gray-600">
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
