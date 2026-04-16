import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useHotel } from '../context/HotelContext'; // Only for total rooms count fallback if needed
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckInOutModal } from '../components/reception/CheckInOutModal';
import { ArrowDownToLine, ArrowUpFromLine, Bed, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export const FrontDeskPage = () => {
  const { refreshData } = useHotel(); // Refresh global stat later
  const [arrivals, setArrivals] = useState<any[]>([]);
  const [departures, setDepartures] = useState<any[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<any>({});
  
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [modalType, setModalType] = useState<'checkin' | 'checkout' | null>(null);

  const fetchDeskData = async () => {
    try {
      const [arr, dep, dash] = await Promise.all([
        api.get<any[]>('/reception/arrivals-today'),
        api.get<any[]>('/reception/departures-today'),
        api.get<any>('/dashboard')
      ]);
      setArrivals(arr || []);
      setDepartures(dep || []);
      setDashboardSummary(dash || {});
      // Refresh global context asynchronously
      refreshData();
    } catch (e: any) {
      toast.error(e.message || 'Eroare la preluarea datelor receptiei');
    }
  };

  useEffect(() => {
    fetchDeskData();
  }, []);

  const handleCheckIn = (booking: any) => {
    setSelectedBooking(booking);
    setModalType('checkin');
  };

  const handleCheckOut = (booking: any) => {
    setSelectedBooking(booking);
    setModalType('checkout');
  };

  const handleModalSuccess = () => {
    fetchDeskData();
  };

  return (
    <div className="pb-8">
      <div className="mb-6 px-4 py-2">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Front Desk</h1>
        <p className="text-gray-600">Manage check-ins, check-outs, and today's activities via Live API</p>
      </div>

      {/* KPIs */}
      <div className="grid mx-4 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3"><CardDescription>Occupancy Rate</CardDescription></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800">{dashboardSummary?.occupancyRate || 0}%</p>
                <p className="text-sm text-gray-500">{dashboardSummary?.occupiedRooms || 0} of {dashboardSummary?.totalRooms || 0} rooms</p>
              </div>
              <Bed className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardDescription>Arrivals Today</CardDescription></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800">{arrivals.length}</p>
                <p className="text-sm text-gray-500">Expected check-ins</p>
              </div>
              <ArrowDownToLine className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardDescription>Departures Today</CardDescription></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800">{departures.length}</p>
                <p className="text-sm text-gray-500">Expected check-outs</p>
              </div>
              <ArrowUpFromLine className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid mx-4 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownToLine className="h-5 w-5 text-green-600" /> Arrivals Today
            </CardTitle>
            <CardDescription>Guests checking in today</CardDescription>
          </CardHeader>
          <CardContent>
            {arrivals.length === 0 ? <p className="text-gray-500 text-center py-6">No arrivals scheduled for today</p> : (
              <div className="space-y-3">
                {arrivals.map((booking) => (
                  <div key={booking.id} className="p-4 border rounded-lg hover:border-green-400 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{booking.guestName}</h4>
                        <p className="text-sm text-gray-600">Room {booking.roomNumber} • {booking.guests} guest{booking.guests > 1 ? 's' : ''}</p>
                      </div>
                      <Badge variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}>{booking.paymentStatus}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">Stay: {booking.checkOut}</p>
                      <Button size="sm" onClick={() => handleCheckIn(booking)}>Check In</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpFromLine className="h-5 w-5 text-orange-600" /> Departures Today
            </CardTitle>
            <CardDescription>Guests checking out today</CardDescription>
          </CardHeader>
          <CardContent>
            {departures.length === 0 ? <p className="text-gray-500 text-center py-6">No departures scheduled for today</p> : (
              <div className="space-y-3">
                {departures.map((booking) => (
                  <div key={booking.id} className="p-4 border rounded-lg hover:border-orange-400 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{booking.guestName}</h4>
                        <p className="text-sm text-gray-600">Room {booking.roomNumber} • {booking.guests} guests</p>
                      </div>
                      <div className="flex items-center gap-1 text-gray-700">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">{booking.totalAmount}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={booking.paymentStatus === 'paid' ? 'default' : 'destructive'}>{booking.paymentStatus}</Badge>
                      <Button size="sm" variant="outline" onClick={() => handleCheckOut(booking)}>Check Out</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedBooking && modalType && (
        <CheckInOutModal booking={selectedBooking} type={modalType} onClose={() => { setSelectedBooking(null); setModalType(null); }} onSuccess={handleModalSuccess} />
      )}
    </div>
  );
};
