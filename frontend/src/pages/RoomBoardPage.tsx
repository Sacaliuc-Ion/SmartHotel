import { useState } from 'react';
import { rooms, bookings } from '../data/mockData';
import { Button } from '../components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const RoomBoardPage = () => {
  const [startDate, setStartDate] = useState(new Date());

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  const navigate = (dir: 'prev' | 'next') => {
    const nd = new Date(startDate);
    nd.setDate(nd.getDate() + (dir === 'next' ? 7 : -7));
    setStartDate(nd);
  };

  const getBooking = (roomId: string, date: Date) => {
    const ds = date.toISOString().split('T')[0];
    return bookings.find((b) =>
      b.roomId === roomId &&
      b.status !== 'cancelled' &&
      b.status !== 'checked-out' &&
      ds >= b.checkIn && ds < b.checkOut
    );
  };

  const fmtHeader = (date: Date) => ({
    day: date.getDate(),
    month: date.toLocaleDateString('en-US', { month: 'short' }),
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
  });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Room Board</h1>
          <p className="text-gray-600">Visual overview of room occupancy</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('prev')}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={() => setStartDate(new Date())}>Today</Button>
          <Button variant="outline" onClick={() => navigate('next')}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="mb-4 flex gap-6 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500 rounded" /><span>Occupied</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded" /><span>Confirmed</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded" /><span>Out of Order</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded" /><span>Available</span></div>
      </div>

      <div className="bg-white rounded-lg border overflow-x-auto">
        <div className="min-w-max">
          <div className="flex border-b bg-gray-50">
            <div className="w-32 p-3 font-semibold text-gray-700 border-r">Room</div>
            {days.map((date, i) => {
              const { day, month, weekday } = fmtHeader(date);
              const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
              return (
                <div key={i} className={`w-24 p-2 text-center border-r ${isToday ? 'bg-blue-50' : ''}`}>
                  <div className="text-xs text-gray-500">{weekday}</div>
                  <div className={`font-semibold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>{day}</div>
                  <div className="text-xs text-gray-500">{month}</div>
                </div>
              );
            })}
          </div>
          {rooms.map((room) => (
            <div key={room.id} className="flex border-b hover:bg-gray-50">
              <div className="w-32 p-3 border-r">
                <div className="font-semibold text-gray-800">Room {room.number}</div>
                <div className="text-xs text-gray-500 capitalize">{room.type}</div>
                <div className="text-xs text-gray-500">Floor {room.floor}</div>
              </div>
              {days.map((date, i) => {
                const booking = getBooking(room.id, date);
                const isOOO = room.status === 'out-of-order';
                const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                return (
                  <div key={i} className={`w-24 p-1 border-r ${isToday ? 'bg-blue-50/50' : ''}`}>
                    {isOOO ? (
                      <div className="h-12 bg-red-500 rounded text-white text-xs flex items-center justify-center">OOO</div>
                    ) : booking ? (
                      <div className={`h-12 rounded text-white text-xs flex flex-col items-center justify-center p-1 ${booking.status === 'checked-in' ? 'bg-blue-500' : 'bg-green-500'}`}>
                        <span className="font-semibold truncate w-full text-center">{booking.guestName.split(' ')[0]}</span>
                        <span className="text-[10px] opacity-90">{booking.status === 'checked-in' ? 'In' : 'Conf'}</span>
                      </div>
                    ) : (
                      <div className="h-12 bg-gray-100 rounded border border-gray-200" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg border"><p className="text-sm text-gray-600">Total Rooms</p><p className="text-2xl font-bold text-gray-800">{rooms.length}</p></div>
        <div className="p-4 bg-white rounded-lg border"><p className="text-sm text-gray-600">Occupied</p><p className="text-2xl font-bold text-blue-600">{bookings.filter(b => b.status === 'checked-in').length}</p></div>
        <div className="p-4 bg-white rounded-lg border"><p className="text-sm text-gray-600">Confirmed</p><p className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === 'confirmed').length}</p></div>
        <div className="p-4 bg-white rounded-lg border"><p className="text-sm text-gray-600">Out of Order</p><p className="text-2xl font-bold text-red-600">{rooms.filter(r => r.status === 'out-of-order').length}</p></div>
      </div>
    </div>
  );
};