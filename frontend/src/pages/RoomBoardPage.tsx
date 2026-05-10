import { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Button } from '../components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const RoomBoardPage = () => {
  const [startDate, setStartDate] = useState(new Date());
  const { rooms, bookings } = useHotel();
  const { t } = useTranslation();

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

  const getBooking = (roomId: string | number, date: Date) => {
    const ds = date.toISOString().split('T')[0];
    const normalizedRoomId = String(roomId);
    return bookings.find((b) =>
      String(b.roomId) === normalizedRoomId &&
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
    <div className="min-h-full bg-background p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-2">{t('roomBoardTitle')}</h1>
          <p className="text-gray-600 dark:text-slate-300">{t('roomBoardSubtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('prev')}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={() => setStartDate(new Date())}>{t('today')}</Button>
          <Button variant="outline" onClick={() => navigate('next')}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="mb-4 flex gap-6 text-sm text-gray-700 dark:text-slate-300">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-amber-500 rounded" /><span>{t('occupied')}</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded" /><span>{t('confirmed')}</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded" /><span>{t('outOfOrder')}</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-200 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded" /><span>{t('available')}</span></div>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-lg border dark:border-slate-700 overflow-x-auto">
        <div className="min-w-max">
          <div className="flex border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
            <div className="w-32 p-3 font-semibold text-gray-700 dark:text-slate-200 border-r dark:border-slate-700">{t('room')}</div>
            {days.map((date, i) => {
              const { day, month, weekday } = fmtHeader(date);
              const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
              return (
                <div key={i} className={`w-24 p-2 text-center border-r dark:border-slate-700 ${isToday ? 'bg-amber-50 dark:bg-amber-950/30' : ''}`}>
                  <div className="text-xs text-gray-500 dark:text-slate-400">{weekday}</div>
                  <div className={`font-semibold ${isToday ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-slate-200'}`}>{day}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">{month}</div>
                </div>
              );
            })}
          </div>
          {rooms.map((room) => (
            <div key={room.id} className="flex border-b dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900/70">
              <div className="w-32 p-3 border-r dark:border-slate-800">
                <div className="font-semibold text-gray-800 dark:text-slate-100">{t('room')} {room.number}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400 capitalize">{t(`roomType.${room.type}`)}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">{t('floor')} {room.floor}</div>
              </div>
              {days.map((date, i) => {
                const booking = getBooking(room.id, date);
                const isOOO = room.status === 'out-of-order' || room.status === 'out-of-service';
                const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                return (
                  <div key={i} className={`w-24 p-1 border-r dark:border-slate-800 ${isToday ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}`}>
                    {isOOO ? (
                      <div className="h-12 bg-red-500 rounded text-white text-xs flex items-center justify-center">{t('outOfOrderShort')}</div>
                    ) : booking ? (
                      <div className={`h-12 rounded text-white text-xs flex flex-col items-center justify-center p-1 ${booking.status === 'checked-in' ? 'bg-amber-500' : 'bg-green-500'}`}>
                        <span className="font-semibold truncate w-full text-center">{booking.guestName.split(' ')[0]}</span>
                        <span className="text-[10px] opacity-90">{booking.status === 'checked-in' ? 'In' : 'Rez'}</span>
                      </div>
                    ) : (
                      <div className="h-12 bg-gray-100 dark:bg-slate-900 rounded border border-gray-200 dark:border-slate-700" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700"><p className="text-sm text-gray-600 dark:text-slate-300">{t('totalRooms')}</p><p className="text-2xl font-bold text-gray-800 dark:text-slate-100">{rooms.length}</p></div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700"><p className="text-sm text-gray-600 dark:text-slate-300">{t('occupied')}</p><p className="text-2xl font-bold text-amber-600">{bookings.filter(b => b.status === 'checked-in').length}</p></div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700"><p className="text-sm text-gray-600 dark:text-slate-300">{t('confirmed')}</p><p className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === 'confirmed').length}</p></div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700"><p className="text-sm text-gray-600 dark:text-slate-300">{t('outOfOrder')}</p><p className="text-2xl font-bold text-red-600">{rooms.filter(r => r.status === 'out-of-order' || r.status === 'out-of-service').length}</p></div>
      </div>
    </div>
  );
};
