import { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RoomStatus } from '../data/mockData';
import { AlertTriangle, Sparkles } from 'lucide-react';

const statusColors: Record<RoomStatus, string> = {
  'dirty': 'bg-red-100 text-red-800 border-red-200',
  'cleaning': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'clean': 'bg-blue-100 text-blue-800 border-blue-200',
  'ready': 'bg-green-100 text-green-800 border-green-200',
  'available': 'bg-gray-100 text-gray-800 border-gray-200',
  'occupied': 'bg-purple-100 text-purple-800 border-purple-200',
  'out-of-order': 'bg-gray-400 text-white border-gray-400',
};

const statusFlow: Record<RoomStatus, RoomStatus | null> = {
  'dirty': 'cleaning','cleaning': 'clean','clean': 'ready','ready': 'available',
  'available': null,'occupied': null,'out-of-order': null,
};

export const HousekeepingPage = () => {
  const { rooms, updateRoomStatus, bookings } = useHotel();
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const todaysArrivals = bookings.filter((b) => b.checkIn === today && b.status === 'confirmed');
  const filteredRooms = rooms.filter((r) => filterStatus === 'all' || r.status === filterStatus);

  const handleStatusChange = (roomId: string, current: RoomStatus) => {
    const next = statusFlow[current];
    if (next) updateRoomStatus(roomId, next);
  };

  const priorityRooms = filteredRooms.filter((room) =>
    todaysArrivals.some((b) => b.roomId === room.id) &&
    room.status !== 'ready' && room.status !== 'available'
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Housekeeping</h1>
        <p className="text-gray-600">Manage room cleaning status and maintenance</p>
      </div>

      <div className="bg-white p-4 rounded-lg border mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rooms</SelectItem>
            <SelectItem value="dirty">Dirty</SelectItem>
            <SelectItem value="cleaning">Cleaning</SelectItem>
            <SelectItem value="clean">Clean</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
          <Sparkles className="h-4 w-4" /><span>{filteredRooms.length} rooms</span>
        </div>
      </div>

      {priorityRooms.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-orange-900 mb-1">Priority Rooms</h3>
            <p className="text-sm text-orange-800">{priorityRooms.length} room{priorityRooms.length > 1 ? 's' : ''} need to be ready for today's check-ins</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => {
          const isPriority = priorityRooms.some((r) => r.id === room.id);
          const nextStatus = statusFlow[room.status];
          return (
            <div key={room.id} className={`bg-white rounded-lg border p-5 ${isPriority ? 'border-orange-400 shadow-md' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Room {room.number}</h3>
                  <p className="text-sm text-gray-500 capitalize">{room.type} · Floor {room.floor}</p>
                </div>
                {isPriority && (
                  <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs font-medium">
                    <AlertTriangle className="h-3 w-3" />Priority
                  </div>
                )}
              </div>
              <div className="mb-4">
                <Badge className={`${statusColors[room.status]} border`}>{room.status.replace('-', ' ')}</Badge>
              </div>
              <div className="flex gap-2">
                {nextStatus && (
                  <Button size="sm" className="flex-1" onClick={() => handleStatusChange(room.id, room.status)}>
                    Mark as {nextStatus.replace('-', ' ')}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setSelectedRoom(room.id)}>Report Issue</Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12"><p className="text-gray-500">No rooms match the selected filter</p></div>
      )}

      {/* Defect report modal added in next commit */}
      {selectedRoom && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h3 className="font-semibold mb-4">Report Issue — Room {selectedRoom}</h3>
            <p className="text-sm text-gray-500 mb-4">Full modal coming soon</p>
            <Button onClick={() => setSelectedRoom(null)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};
