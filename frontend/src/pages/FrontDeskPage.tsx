import { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckInOutModal } from '../components/reception/CheckInOutModal';
import { ArrowDownToLine, ArrowUpFromLine, Bed, DollarSign } from 'lucide-react';

export const FrontDeskPage = () => {
  const { bookings, rooms } = useHotel();
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'checkin' | 'checkout' | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const arrivals = bookings.filter((b) => b.checkIn === today && b.status === 'confirmed');
  const departures = bookings.filter((b) => b.checkOut === today && b.status === 'checked-in');
  const currentlyOccupied = bookings.filter((b) => b.status === 'checked-in').length;
  const occupancyRate = Math.round((currentlyOccupied / rooms.length) * 100);
  const getRoom = (roomId: string) => rooms.find((r) => r.id === roomId);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Front Desk</h1>
        <p className="text-gray-600">Manage check-ins, check-outs, and today's activities</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card><CardHeader className="pb-3"><CardDescription>Occupancy Rate</CardDescription></CardHeader><CardContent><div className="flex items-center justify-between"><div><p className="text-3xl font-bold text-gray-800">{occupancyRate}%</p><p className="text-sm text-gray-500">{currentlyOccupied} of {rooms.length} rooms</p></div><Bed className="h-10 w-10 text-blue-600" /></div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardDescription>Arrivals Today</CardDescription></CardHeader><CardContent><div className="flex items-center justify-between"><div><p className="text-3xl font-bold text-gray-800">{arrivals.length}</p><p className="text-sm text-gray-500">Expected check-ins</p></div><ArrowDownToLine className="h-10 w-10 text-green-600" /></div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardDescription>Departures Today</CardDescription></CardHeader><CardContent><div className="flex items-center justify-between"><div><p className="text-3xl font-bold text-gray-800">{departures.length}</p><p className="text-sm text-gray-500">Expected check-outs</p></div><ArrowUpFromLine className="h-10 w-10 text-orange-600" /></div></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ArrowDownToLine className="h-5 w-5 text-green-600" />Arrivals Today</CardTitle><CardDescription>Guests checking in today</CardDescription></CardHeader>
          <CardContent>
            {arrivals.length === 0 ? <p className="text-gray-500 text-center py-6">No arrivals scheduled</p> : (
              <div className="space-y-3">
                {arrivals.map((b) => {
                  const room = getRoom(b.roomId);
                  return (
                    <div key={b.id} className="p-4 border rounded-lg hover:border-green-400 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div><h4 className="font-semibold text-gray-800">{b.guestName}</h4><p className="text-sm text-gray-600">Room {room?.number} · {b.guests} guest{b.guests > 1 ? 's' : ''}</p></div>
                        <Badge variant={b.paymentStatus === 'paid' ? 'default' : 'secondary'}>{b.paymentStatus}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">Until: {new Date(b.checkOut).toLocaleDateString()}</p>
                        <Button size="sm" onClick={() => { setSelectedBooking(b.id); setModalType('checkin'); }}>Check In</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ArrowUpFromLine className="h-5 w-5 text-orange-600" />Departures Today</CardTitle><CardDescription>Guests checking out today</CardDescription></CardHeader>
          <CardContent>
            {departures.length === 0 ? <p className="text-gray-500 text-center py-6">No departures scheduled</p> : (
              <div className="space-y-3">
                {departures.map((b) => {
                  const room = getRoom(b.roomId);
                  return (
                    <div key={b.id} className="p-4 border rounded-lg hover:border-orange-400 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div><h4 className="font-semibold text-gray-800">{b.guestName}</h4><p className="text-sm text-gray-600">Room {room?.number}</p></div>
                        <div className="flex items-center gap-1 text-gray-700"><DollarSign className="h-4 w-4" /><span className="font-semibold">{b.totalAmount}</span></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant={b.paymentStatus === 'paid' ? 'default' : 'destructive'}>{b.paymentStatus}</Badge>
                        <Button size="sm" variant="outline" onClick={() => { setSelectedBooking(b.id); setModalType('checkout'); }}>Check Out</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedBooking && modalType && (
        <CheckInOutModal bookingId={selectedBooking} type={modalType} onClose={() => { setSelectedBooking(null); setModalType(null); }} />
      )}
    </div>
  );
};
