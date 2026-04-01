import { useHotel } from '../context/HotelContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Bed, Wrench, Sparkles, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export const DashboardPage = () => {
  const { rooms, bookings, tickets } = useHotel();
  const totalRooms = rooms.length;
  const occupiedRooms = bookings.filter((b) => b.status === 'checked-in').length;
  const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);
  const outOfOrderRooms = rooms.filter((r) => r.status === 'out-of-order').length;
  const openTickets = tickets.filter((t) => t.status !== 'resolved').length;
  const dirtyRooms = rooms.filter((r) => r.status === 'dirty' || r.status === 'cleaning').length;
  const totalRevenue = bookings.filter((b) => b.status === 'checked-in' || b.status === 'checked-out').reduce((s, b) => s + b.totalAmount, 0);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), occupancy: 60 + Math.floor(Math.random() * 30) };
  });

  const roomStatusData = [
    { name: 'Available', value: rooms.filter((r) => r.status === 'available').length, color: '#10b981' },
    { name: 'Occupied', value: occupiedRooms, color: '#3b82f6' },
    { name: 'Dirty/Cleaning', value: dirtyRooms, color: '#f59e0b' },
    { name: 'Out of Order', value: outOfOrderRooms, color: '#ef4444' },
  ];

  const ticketStatusData = [
    { status: 'New', count: tickets.filter((t) => t.status === 'new').length },
    { status: 'In Progress', count: tickets.filter((t) => t.status === 'in-progress').length },
    { status: 'Waiting', count: tickets.filter((t) => t.status === 'waiting-parts').length },
    { status: 'Resolved', count: tickets.filter((t) => t.status === 'resolved').length },
  ];

  return (
    <div>
      <div className="mb-8 px-4 py-2">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Dashboard
        </h1>
          <p className="text-gray-600"
          >
            Overview of hotel operations and metrics
          </p>
      </div>

      <div className="grid mx-4 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card><CardHeader className="pb-3"><CardDescription>Occupancy Rate</CardDescription></CardHeader><CardContent><div className="flex items-center justify-between"><div><p className="text-3xl font-bold text-gray-800">{occupancyRate}%</p><p className="text-sm text-gray-500">{occupiedRooms}/{totalRooms} rooms</p></div><Bed className="h-10 w-10 text-blue-600" /></div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardDescription>Total Revenue</CardDescription></CardHeader><CardContent><div className="flex items-center justify-between"><div><p className="text-3xl font-bold text-gray-800">${totalRevenue.toLocaleString()}</p><p className="text-sm text-gray-500">This period</p></div><DollarSign className="h-10 w-10 text-green-600" /></div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardDescription>Open Tickets</CardDescription></CardHeader><CardContent><div className="flex items-center justify-between"><div><p className="text-3xl font-bold text-gray-800">{openTickets}</p><p className="text-sm text-gray-500">{outOfOrderRooms} rooms OOO</p></div><Wrench className="h-10 w-10 text-orange-600" /></div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardDescription>Housekeeping</CardDescription></CardHeader><CardContent><div className="flex items-center justify-between"><div><p className="text-3xl font-bold text-gray-800">{dirtyRooms}</p><p className="text-sm text-gray-500">Rooms pending</p></div><Sparkles className="h-10 w-10 text-purple-600" /></div></CardContent></Card>
      </div>

      <div className="grid mx-4 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle>Occupancy Trend</CardTitle><CardDescription>Last 7 days</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={last7Days}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Line type="monotone" dataKey="occupancy" stroke="#3b82f6" strokeWidth={2} /></LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Room Status Distribution</CardTitle><CardDescription>Current breakdown</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart><Pie data={roomStatusData} cx="50%" cy="50%" labelLine={false} label={(e) => `${e.name}: ${e.value}`} outerRadius={100} dataKey="value">
                {roomStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Maintenance Tickets</CardTitle><CardDescription>Status breakdown</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ticketStatusData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="status" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#3b82f6" /></BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Key Metrics</CardTitle><CardDescription>Important indicators</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"><div className="flex items-center gap-3"><TrendingUp className="h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-600">Average Daily Rate</p><p className="font-bold text-gray-800">$156</p></div></div></div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg"><div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-green-600" /><div><p className="text-sm text-gray-600">Avg. Cleaning Time</p><p className="font-bold text-gray-800">28 minutes</p></div></div></div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"><div className="flex items-center gap-3"><Wrench className="h-5 w-5 text-orange-600" /><div><p className="text-sm text-gray-600">Avg. Resolution Time</p><p className="font-bold text-gray-800">2.3 days</p></div></div></div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg"><div className="flex items-center gap-3"><AlertCircle className="h-5 w-5 text-red-600" /><div><p className="text-sm text-gray-600">Critical Issues</p><p className="font-bold text-gray-800">{tickets.filter((t) => t.priority === 'urgent').length}</p></div></div></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
