import { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const toCalendarDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fromDateKey = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

const addDays = (date: Date, days: number) => {
  const next = toCalendarDate(date);
  next.setDate(next.getDate() + days);
  return toCalendarDate(next);
};

const diffDays = (start: Date, end: Date) => Math.floor((end.getTime() - start.getTime()) / DAY_IN_MS);

export const RoomBoardPage = () => {
  const [startDate, setStartDate] = useState(() => toCalendarDate(new Date()));
  const [visibleDays, setVisibleDays] = useState(14);
  const [searchTerm, setSearchTerm] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const { rooms, bookings } = useHotel();
  const { t, i18n } = useTranslation();

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const days = Array.from({ length: visibleDays }, (_, index) => addDays(startDate, index));
  const rangeEnd = addDays(startDate, visibleDays);
  const today = toCalendarDate(new Date());
  const todayKey = toDateKey(today);
  const roomTypes = Array.from(new Set(rooms.map((room) => room.type))).sort();
  const floors = Array.from(new Set(rooms.map((room) => room.floor))).sort((left, right) => left - right);

  const visibleRooms = rooms.filter((room) => {
    const matchesSearch = !normalizedSearch
      || room.number.toLowerCase().includes(normalizedSearch)
      || t(`roomType.${room.type}`).toLowerCase().includes(normalizedSearch);

    const matchesType = roomTypeFilter === 'all' || room.type === roomTypeFilter;
    const matchesFloor = floorFilter === 'all' || String(room.floor) === floorFilter;

    return matchesSearch && matchesType && matchesFloor;
  });

  const visibleReservations = bookings.filter((booking) => {
    if (booking.status === 'cancelled' || booking.status === 'no-show') return false;

    const bookingStart = fromDateKey(booking.checkIn);
    const bookingEnd = fromDateKey(booking.checkOut);
    return bookingStart < rangeEnd && bookingEnd > startDate;
  });

  const arrivalsInRange = bookings.filter((booking) => booking.status === 'confirmed' && booking.checkIn >= toDateKey(startDate) && booking.checkIn < toDateKey(rangeEnd)).length;
  const departuresInRange = bookings.filter((booking) => booking.status === 'checked-in' && booking.checkOut >= toDateKey(startDate) && booking.checkOut < toDateKey(rangeEnd)).length;
  const readyRooms = visibleRooms.filter((room) => room.status === 'ready' || room.status === 'available').length;

  const navigate = (direction: 'prev' | 'next') => {
    setStartDate((current) => addDays(current, direction === 'next' ? 7 : -7));
  };

  const getSegment = (booking: typeof bookings[number]) => {
    if (booking.status === 'cancelled' || booking.status === 'no-show') return null;

    const bookingStart = fromDateKey(booking.checkIn);
    const bookingEnd = fromDateKey(booking.checkOut);

    if (bookingStart >= rangeEnd || bookingEnd <= startDate) return null;

    const visibleStart = bookingStart > startDate ? bookingStart : startDate;
    const visibleEnd = bookingEnd < rangeEnd ? bookingEnd : rangeEnd;
    const startIndex = diffDays(startDate, visibleStart);
    const span = Math.max(1, diffDays(visibleStart, visibleEnd));

    return { startIndex, span };
  };

  return (
    <div className="min-h-full bg-background p-4">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-gray-800 dark:text-slate-100">{t('roomBoardTitle')}</h1>
        <p className="text-gray-600 dark:text-slate-300">{t('roomBoardSubtitle')}</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-gray-600 dark:text-slate-300">{t('visibleReservations')}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-slate-100">{visibleReservations.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-gray-600 dark:text-slate-300">{t('arrivalsInRange')}</p>
          <p className="text-3xl font-bold text-emerald-600">{arrivalsInRange}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-gray-600 dark:text-slate-300">{t('departuresInRange')}</p>
          <p className="text-3xl font-bold text-orange-600">{departuresInRange}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-gray-600 dark:text-slate-300">{t('readyRooms')}</p>
          <p className="text-3xl font-bold text-amber-600">{readyRooms}</p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_180px_180px_160px_260px]">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">{t('search')}</label>
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t('searchRoomsBoardPlaceholder')}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">{t('roomType')}</label>
            <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTypes')}</SelectItem>
                {roomTypes.map((type) => (
                  <SelectItem key={type} value={type}>{t(`roomType.${type}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">{t('floor')}</label>
            <Select value={floorFilter} onValueChange={setFloorFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allFloors')}</SelectItem>
                {floors.map((floor) => (
                  <SelectItem key={floor} value={String(floor)}>{t('floorNumber', { floor })}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">{t('calendarStart')}</label>
            <Input
              type="date"
              value={toDateKey(startDate)}
              onChange={(event) => setStartDate(toCalendarDate(fromDateKey(event.target.value)))}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">{t('calendarWindow')}</label>
            <div className="flex gap-2">
              <Button variant={visibleDays === 14 ? 'default' : 'outline'} className="flex-1" onClick={() => setVisibleDays(14)}>
                {t('roomBoardView14')}
              </Button>
              <Button variant={visibleDays === 30 ? 'default' : 'outline'} className="flex-1" onClick={() => setVisibleDays(30)}>
                {t('roomBoardView30')}
              </Button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">{t('today')}</label>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('prev')}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" className="flex-1" onClick={() => setStartDate(today)}>{t('today')}</Button>
              <Button variant="outline" onClick={() => navigate('next')}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-700 dark:text-slate-300">
          <div className="flex items-center gap-2"><div className="h-3.5 w-3.5 rounded bg-amber-500" /><span>{t('calendarLegendCheckedIn')}</span></div>
          <div className="flex items-center gap-2"><div className="h-3.5 w-3.5 rounded bg-emerald-500" /><span>{t('calendarLegendConfirmed')}</span></div>
          <div className="flex items-center gap-2"><div className="h-3.5 w-3.5 rounded bg-slate-500" /><span>{t('calendarLegendHistorical')}</span></div>
          <div className="flex items-center gap-2"><div className="h-3.5 w-3.5 rounded bg-red-500" /><span>{t('outOfOrder')}</span></div>
          <div className="ml-auto text-xs uppercase tracking-[0.16em] text-gray-400 dark:text-slate-500">
            {t('showingRoomsCount', { count: visibleRooms.length })}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white dark:border-slate-700 dark:bg-slate-950">
        <div className="min-w-[1480px]">
          <div className="sticky top-0 z-20 flex border-b bg-gray-50/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
            <div className="sticky left-0 z-30 w-60 border-r bg-gray-50/95 p-4 dark:border-slate-700 dark:bg-slate-900/95">
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">{t('room')}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{t('roomBoardCalendarDescription')}</p>
            </div>
            <div className="flex-1">
              <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${visibleDays}, minmax(72px, 1fr))` }}>
                {days.map((date) => {
                  const dateKey = toDateKey(date);
                  const isTodayCell = dateKey === todayKey;
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                  return (
                    <div
                      key={dateKey}
                      className={`px-2 py-3 text-center ${isTodayCell ? 'bg-amber-50 dark:bg-amber-950/30' : isWeekend ? 'bg-slate-50 dark:bg-slate-900/80' : 'bg-transparent'}`}
                    >
                      <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500 dark:text-slate-400">
                        {date.toLocaleDateString(i18n.language, { weekday: 'short' })}
                      </p>
                      <p className={`mt-1 text-sm font-semibold ${isTodayCell ? 'text-amber-600 dark:text-amber-300' : 'text-gray-700 dark:text-slate-200'}`}>
                        {date.toLocaleDateString(i18n.language, { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {visibleRooms.map((room) => {
            const roomReservations = bookings
              .filter((booking) => String(booking.roomId) === String(room.id))
              .map((booking) => ({ booking, segment: getSegment(booking) }))
              .filter((item) => item.segment !== null)
              .sort((left, right) => {
                if (left.segment!.startIndex !== right.segment!.startIndex) {
                  return left.segment!.startIndex - right.segment!.startIndex;
                }

                return right.segment!.span - left.segment!.span;
              });

            const rowHeight = Math.max(88, roomReservations.length * 54 + 18);
            const isOutOfOrder = room.status === 'out-of-order' || room.status === 'out-of-service';

            return (
              <div key={room.id} className="flex border-b last:border-b-0 dark:border-slate-800">
                <div className="sticky left-0 z-10 w-60 border-r bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-gray-900 dark:text-slate-100">{t('room')} {room.number}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{t(`roomType.${room.type}`)} • {t('floor')} {room.floor}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {t(`status.${String(room.status).toLowerCase()}`, { defaultValue: room.status })}
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-2">
                  <div className="relative" style={{ minHeight: rowHeight }}>
                    <div
                      className="grid gap-1"
                      style={{ gridTemplateColumns: `repeat(${visibleDays}, minmax(72px, 1fr))`, minHeight: rowHeight }}
                    >
                      {days.map((date) => {
                        const dateKey = toDateKey(date);
                        const isTodayCell = dateKey === todayKey;
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                        return (
                          <div
                            key={dateKey}
                            className={`rounded-md border ${isTodayCell
                              ? 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20'
                              : isWeekend
                                ? 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50'
                                : 'border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-950'
                              }`}
                          />
                        );
                      })}
                    </div>

                    {isOutOfOrder ? (
                      <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg bg-red-500/12">
                        <div className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                          {t('outOfOrder')}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="pointer-events-none absolute inset-0 grid gap-1"
                        style={{
                          gridTemplateColumns: `repeat(${visibleDays}, minmax(72px, 1fr))`,
                          gridTemplateRows: `repeat(${Math.max(roomReservations.length, 1)}, minmax(0, 1fr))`,
                          height: rowHeight,
                        }}
                      >
                      {roomReservations.map(({ booking, segment }, index) => {
                          const isCompactSegment = segment!.span === 1;
                          const tone = booking.status === 'checked-in'
                            ? 'bg-amber-500 text-white'
                            : booking.status === 'checked-out'
                              ? 'bg-slate-500 text-white'
                              : 'bg-emerald-500 text-white';

                          return (
                            <div
                              key={`${booking.id}-${index}`}
                              className={`flex min-w-0 h-full items-center overflow-hidden ${tone} ${isCompactSegment ? 'rounded-sm px-2 py-1.5' : 'rounded-md px-2.5 py-2'}`}
                              style={{
                                gridColumn: `${segment!.startIndex + 1} / span ${segment!.span}`,
                                gridRow: `${index + 1}`,
                              }}
                            >
                              <div className="min-w-0 w-full text-center">
                                <div className={`truncate ${isCompactSegment ? 'text-[9px]' : 'text-[10px]'} font-semibold leading-tight`}>
                                  {booking.guestName}
                                </div>
                                <div className={`mt-1 truncate ${isCompactSegment ? 'text-[7px]' : 'text-[8px]'} font-medium uppercase tracking-[0.06em] text-white/85`}>
                                  {t(`status.${booking.status}`, { defaultValue: booking.status })}
                                </div>
                                {segment!.span > 2 && (
                                  <div className="mt-1 truncate text-[8px] font-medium uppercase tracking-[0.06em] text-white/85">
                                    #{booking.id}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {visibleRooms.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500 dark:text-slate-400">{t('noRoomsMatch')}</p>
        </div>
      )}
    </div>
  );
};
