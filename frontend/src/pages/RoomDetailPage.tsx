import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useHotel } from '../context/HotelContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Users, Wifi, Tv, Wind, Coffee, Bath, Armchair, MapPin, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import Single from '../assets/rooms/Single.jpg';
import Double from '../assets/rooms/Double.jpg';
import Suite from '../assets/rooms/Suite.jpg';
import Deluxe from '../assets/rooms/Deluxe.jpg';
import { formatCurrency, getRoomAvailabilityState } from '../utils/hotelFormatting';
import { useTranslation } from 'react-i18next';
import { getRoomDescriptionLines } from '../utils/roomDescriptions';
import { getSpaExperience } from '../utils/spaExperience';

const roomImages: Record<string, string> = {
  single: Single,
  double: Double,
  suite: Suite,
  deluxe: Deluxe,
};

const amenityIcons: Record<string, React.ElementType> = {
  'WiFi': Wifi, 'TV': Tv, 'AC': Wind, 'Mini Bar': Coffee, 'Jacuzzi': Bath, 'Balcony': Armchair,
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MAX_CHECKOUT_SEARCH_DAYS = 365;

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
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
  next.setDate(next.getDate() + days);
  return next;
};

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);

const isSameDay = (left: Date, right: Date) => toDateKey(left) === toDateKey(right);

const buildCalendarDays = (month: Date) => {
  const first = startOfMonth(month);
  const start = addDays(first, -((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
};

type BookingCalendarProps = {
  label: string;
  value: string;
  onSelect: (value: string) => void;
  month: Date;
  onMonthChange: (month: Date) => void;
  minDate: string;
  isDateDisabled: (dateKey: string) => boolean;
  isDateReserved: (dateKey: string) => boolean;
  formatDisplayDate: (value: string) => string;
  locale: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  highlightedDateKey?: string | null;
};

const BookingCalendar = ({
  label,
  value,
  onSelect,
  month,
  onMonthChange,
  minDate,
  isDateDisabled,
  isDateReserved,
  formatDisplayDate,
  locale,
  isOpen,
  onToggle,
  onClose,
  highlightedDateKey,
}: BookingCalendarProps) => {
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const monthDays = buildCalendarDays(month);
  const selectedDate = fromDateKey(value);
  const minDateValue = fromDateKey(minDate);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!calendarRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen, onClose]);

  return (
    <div ref={calendarRef} className="relative">
      <div>
        <div>
          <label className="mb-1 block text-xs text-gray-600 dark:text-slate-300">{label}</label>
          <button
            type="button"
            onClick={onToggle}
            className="flex w-full items-center justify-between gap-2 rounded-md border bg-white px-3 py-2 text-sm font-medium text-gray-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-amber-600" />
            <span>{formatDisplayDate(value)}</span>
            </span>
            <CalendarDays className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-lg dark:border-slate-700 dark:bg-slate-950">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-800 dark:text-slate-100">
              {month.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="icon" onClick={() => onMonthChange(addDays(startOfMonth(month), -1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={() => onMonthChange(addDays(startOfMonth(month), 32))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">
            {Array.from({ length: 7 }, (_, index) => {
              const day = addDays(new Date(2026, 0, 5, 12, 0, 0, 0), index);
              return <div key={index} className="py-1">{day.toLocaleDateString(locale, { weekday: 'short' })}</div>;
            })}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day) => {
              const dayKey = toDateKey(day);
              const outsideMonth = day.getMonth() !== month.getMonth();
              const isReserved = isDateReserved(dayKey);
              const disabled = day < minDateValue || isDateDisabled(dayKey);
              const selected = isSameDay(day, selectedDate);
              const isHighlighted = highlightedDateKey === dayKey;

              return (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => {
                    if (!disabled) {
                      onSelect(dayKey);
                      onClose();
                    }
                  }}
                  disabled={disabled}
                  className={`h-10 rounded-md border text-sm transition ${
                    selected
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : isReserved
                        ? 'border-red-200 bg-red-100 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200'
                        : isHighlighted
                          ? 'border-amber-400 bg-amber-100 text-amber-800 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-200'
                        : outsideMonth
                          ? 'border-transparent bg-transparent text-gray-400 dark:text-slate-600'
                          : 'border-slate-200 bg-white text-gray-700 hover:border-amber-300 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-amber-700 dark:hover:bg-amber-950/30'
                  } ${disabled && !selected ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const RoomDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { rooms, bookings, addBooking } = useHotel();
  const { isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const room = rooms.find((r) => r.id.toString() === id);
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrow = useMemo(() => {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  }, []);
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkInMonth, setCheckInMonth] = useState(() => fromDateKey(today));
  const [checkOutMonth, setCheckOutMonth] = useState(() => fromDateKey(tomorrow));
  const [openCalendar, setOpenCalendar] = useState<'checkIn' | 'checkOut' | null>(null);
  const availabilityState = room ? getRoomAvailabilityState(room) : 'unavailable';
  const roomReservations = useMemo(
    () => bookings
      .filter((booking) =>
        String(booking.roomId) === String(room?.id)
        && !['cancelled', 'checked-out', 'no-show'].includes(booking.status)
      )
      .sort((left, right) => left.checkIn.localeCompare(right.checkIn)),
    [bookings, room?.id]
  );
  const canBookRoom = availabilityState !== 'unavailable';
  const firstBookableDate = room?.nextAvailableDate || today;
  const isFutureOnlyBooking = Boolean(room?.nextAvailableDate);
  const spaExperience = room ? getSpaExperience(room, t) : null;
  const selectedOverlap = useMemo(
    () => roomReservations.find((booking) => booking.checkIn < checkOut && checkIn < booking.checkOut),
    [roomReservations, checkIn, checkOut]
  );
  const canBookSelection = !selectedOverlap;
  const formatBookingDate = (value: string) => new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(new Date(value));
  const reservedDateKeys = useMemo(() => {
    const keys = new Set<string>();
    roomReservations.forEach((booking) => {
      const start = fromDateKey(booking.checkIn);
      const end = fromDateKey(booking.checkOut);

      for (let cursor = start; cursor < end; cursor = addDays(cursor, 1)) {
        keys.add(toDateKey(cursor));
      }
    });

    return keys;
  }, [roomReservations]);

  const isCheckInDisabled = (dateKey: string) => reservedDateKeys.has(dateKey);
  const isReservedDate = (dateKey: string) => reservedDateKeys.has(dateKey);
  const isCheckOutReservedForCheckIn = (dateKey: string, checkInDate: string) =>
    roomReservations.some((booking) => booking.checkIn < dateKey && checkInDate < booking.checkOut);
  const isCheckOutReserved = (dateKey: string) => isCheckOutReservedForCheckIn(dateKey, checkIn);
  const nextReservationStart = useMemo(
    () => roomReservations.find((booking) => booking.checkIn > checkIn)?.checkIn ?? null,
    [roomReservations, checkIn]
  );
  const isCheckOutDisabled = (dateKey: string) => {
    if (dateKey <= checkIn) {
      return true;
    }

    return isCheckOutReserved(dateKey);
  };
  const getNextValidCheckOut = (checkInDate: string) => {
    let candidate = addDays(fromDateKey(checkInDate), 1);

    for (let index = 0; index < MAX_CHECKOUT_SEARCH_DAYS; index += 1) {
      const candidateKey = toDateKey(candidate);
      if (!isCheckOutReservedForCheckIn(candidateKey, checkInDate)) {
        return candidateKey;
      }

      candidate = addDays(candidate, 1);
    }

    return null;
  };

  useEffect(() => {
    if (!room?.nextAvailableDate) return;

    const nextAvailable = room.nextAvailableDate;
    const defaultCheckOut = new Date(nextAvailable);
    defaultCheckOut.setDate(defaultCheckOut.getDate() + 1);

    setCheckIn(nextAvailable);
    setCheckOut(defaultCheckOut.toISOString().split('T')[0]);
    setCheckInMonth(fromDateKey(nextAvailable));
    setCheckOutMonth(fromDateKey(defaultCheckOut.toISOString().split('T')[0]));
  }, [room?.id, room?.nextAvailableDate]);

  const handleBookNow = async () => {
    if (!room) return;

    if (!isAuthenticated) {
      toast.error(t('bookingAuthRequired'));
      navigate('/login');
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error(t('bookingDatesRequired'));
      return;
    }

    if (checkOut <= checkIn) {
      toast.error(t('bookingInvalidDates'));
      return;
    }

    if (selectedOverlap) {
      toast.error(t('bookingDatesOccupied'));
      return;
    }

    const guestCount = Number(guests);
    if (!Number.isInteger(guestCount) || guestCount < 1) {
      toast.error(t('bookingInvalidGuests'));
      return;
    }

    if (guestCount > room.capacity) {
      toast.error(t('bookingTooManyGuests', { count: room.capacity }));
      return;
    }

    try {
      setIsSubmitting(true);
      await addBooking({
        roomId: Number(room.id),
        checkIn,
        checkOut,
        guests: guestCount,
      });
      navigate('/');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!room) return (
    <div className="text-center py-12">
      <p className="text-gray-500 text-lg mb-4">{t('roomNotFound')}</p>
      <Button onClick={() => navigate('/rooms')}>{t('backToRooms')}</Button>
    </div>
  );

  return (
    <div className="px-4 pb-4">
      <Button variant="ghost" onClick={() => navigate('/rooms')} className="mb-3">
        <ArrowLeft className="h-4 w-4 mr-2" />{t('backToRooms')}
      </Button>
      <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col gap-3">
          <div className="relative h-56 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:h-64">
            <img
              src={roomImages[room.type]}
              alt={`Room ${room.number}`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="space-y-1.5 text-left">
              {getRoomDescriptionLines(room, t).map((line, index) => (
                <p key={`${room.id}-detail-description-${index}`} className="text-xs leading-5 text-gray-700 dark:text-slate-300 lg:text-sm">
                  {line}
                </p>
              ))}
            </div>
          </div>
          {spaExperience && (
            <div className="overflow-hidden rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-stone-100 shadow-sm dark:border-amber-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20">
              <div className="grid gap-3 p-3 sm:grid-cols-[0.95fr_1.05fr] sm:items-center">
                <div className="overflow-hidden rounded-md">
                  <img
                    src={spaExperience.image}
                    alt={spaExperience.imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="h-40 w-full object-cover"
                  />
                </div>
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:bg-slate-900/90 dark:text-amber-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Spa inclus
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100">{spaExperience.packageName}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-300">
                    {spaExperience.tagline}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => navigate(`/rooms/${room.id}/spa`)}
                  >
                    Vezi experienta SPA
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <Badge variant={availabilityState === 'available' ? 'default' : 'secondary'} className="w-fit">
            {availabilityState === 'available-soon'
              ? t('availableFromLabel')
              : availabilityState === 'available'
                ? t('available')
                : t('notAvailable')}
          </Badge>
          <div>
            <h1 className="mb-1 text-2xl font-bold text-gray-800 dark:text-slate-100 lg:text-3xl">{t('room')} {room.number}</h1>
            <p className="text-sm text-gray-600 dark:text-slate-300 capitalize lg:text-base">{t(`roomType.${room.type}`)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-slate-300">
            <div className="flex items-center gap-2"><MapPin className="h-5 w-5" /><span>{t('floor')} {room.floor}</span></div>
            <div className="flex items-center gap-2"><Users className="h-5 w-5" /><span>{room.capacity} {room.capacity > 1 ? t('guests') : t('guest')}</span></div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-1 text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">{t('pricePerNight')}</p>
            <p className="text-2xl font-bold text-amber-600 lg:text-3xl">{formatCurrency(room.pricePerNight)}</p>
            {room.nextAvailableDate && (
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                {t('availableFromText', {
                  date: new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(new Date(room.nextAvailableDate)),
                })}
              </p>
            )}
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-slate-100">{t('reserveRoom')}</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <BookingCalendar
                label={t('checkIn')}
                value={checkIn}
                onSelect={(value) => {
                  setCheckIn(value);
                  setCheckInMonth(fromDateKey(value));
                  const nextValidCheckOut = getNextValidCheckOut(value);
                  if (nextValidCheckOut && (checkOut <= value || isCheckOutReservedForCheckIn(checkOut, value))) {
                    const safeCheckOut = nextValidCheckOut;
                    setCheckOut(safeCheckOut);
                    setCheckOutMonth(fromDateKey(safeCheckOut));
                  }
                }}
                month={checkInMonth}
                onMonthChange={setCheckInMonth}
                minDate={firstBookableDate}
                isDateDisabled={isCheckInDisabled}
                isDateReserved={isReservedDate}
                formatDisplayDate={formatBookingDate}
                locale={i18n.language}
                isOpen={openCalendar === 'checkIn'}
                onToggle={() => setOpenCalendar((current) => current === 'checkIn' ? null : 'checkIn')}
                onClose={() => setOpenCalendar(null)}
              />
              <BookingCalendar
                label={t('checkOut')}
                value={checkOut}
                onSelect={(value) => {
                  setCheckOut(value);
                  setCheckOutMonth(fromDateKey(value));
                }}
                month={checkOutMonth}
                onMonthChange={setCheckOutMonth}
                minDate={checkIn}
                isDateDisabled={isCheckOutDisabled}
                isDateReserved={isCheckOutReserved}
                formatDisplayDate={formatBookingDate}
                locale={i18n.language}
                isOpen={openCalendar === 'checkOut'}
                onToggle={() => setOpenCalendar((current) => current === 'checkOut' ? null : 'checkOut')}
                onClose={() => setOpenCalendar(null)}
                highlightedDateKey={nextReservationStart}
              />
            </div>
            {roomReservations.length > 0 && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/70">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">
                  {t('reservedPeriods')}
                </p>
                <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-slate-300">
                  {roomReservations.map((booking) => (
                    <p key={booking.id}>
                      {formatBookingDate(booking.checkIn)} - {formatBookingDate(booking.checkOut)} · {booking.guestName}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {selectedOverlap && (
              <p className="mt-2 text-xs font-medium text-red-700 dark:text-red-300">
                {t('bookingDatesOccupiedRange', {
                  checkIn: formatBookingDate(selectedOverlap.checkIn),
                  checkOut: formatBookingDate(selectedOverlap.checkOut),
                })}
              </p>
            )}
            {isFutureOnlyBooking && (
              <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">
                {t('bookingStartsFromText', {
                  date: new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(new Date(firstBookableDate)),
                })}
              </p>
            )}
            <div className="mt-2">
              <label className="mb-1 block text-xs text-gray-600 dark:text-slate-300">{t('guests')}</label>
              <Input
                type="number"
                min="1"
                max={room.capacity}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
              <p className="mt-1 text-[11px] text-gray-500 dark:text-slate-400">{t('maxGuests', { count: room.capacity })}</p>
            </div>
            <Button
              size="lg"
              className="mt-3 w-full"
              disabled={!canBookRoom || !canBookSelection || isSubmitting}
              onClick={handleBookNow}
            >
              {!canBookRoom
                ? t('currentlyUnavailable')
                : !canBookSelection
                  ? t('bookingDatesOccupiedShort')
                : isSubmitting
                  ? t('booking')
                  : t('bookNow')}
            </Button>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-slate-100">{t('amenities')}</h3>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
              {room.amenities.map((amenity) => {
                const Icon = amenityIcons[amenity] || Wifi;
                return (
                  <div key={amenity} className="flex items-center gap-2 rounded-md border border-gray-100 bg-white px-2 py-1.5 text-xs text-gray-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <div className="rounded bg-gray-100 p-1.5 dark:bg-slate-800"><Icon className="h-4 w-4 text-amber-600" /></div>
                    <span>{t(`amenity.${amenity}`, { defaultValue: amenity })}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
