import { useEffect, useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { api } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Bed, Wrench, Sparkles, Coins, TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/hotelFormatting';
import { useTranslation } from 'react-i18next';

export const DashboardPage = () => {
  const { rooms, tickets } = useHotel();
  const { t } = useTranslation();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    api.get<any>('/dashboard').then(res => setSummary(res)).catch(console.error);
  }, []);

  const totalRooms = summary?.totalRooms || rooms.length || 0;
  const occupiedRooms = summary?.occupiedRooms || 0;
  const occupancyRate = summary?.occupancyRate || 0;
  const outOfOrderRooms = summary?.outOfOrderRooms || 0;
  const openTickets = summary?.openTickets || 0;
  const dirtyRooms = summary?.dirtyRooms || 0;
  const totalRevenue = summary?.totalRevenue || 0;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), occupancy: 60 + Math.floor(Math.random() * 30) };
  });

  const availableRooms = totalRooms - occupiedRooms - dirtyRooms - outOfOrderRooms;
  
  const roomStatusData = [
    { name: t('available'), value: Math.max(0, availableRooms), color: '#10b981' },
    { name: t('occupied'), value: occupiedRooms, color: '#d97706' },
    { name: `${t('status.dirty')}/${t('status.cleaning')}`, value: dirtyRooms, color: '#f59e0b' },
    { name: t('outOfOrder'), value: outOfOrderRooms, color: '#ef4444' },
  ];

  const ticketStatusData = [
    { status: t('new'), count: tickets.filter((t) => t.status === 'new').length },
    { status: t('inProgress'), count: tickets.filter((t) => t.status === 'in progress' || t.status === 'in-progress').length },
    { status: t('waitingParts'), count: tickets.filter((t) => t.status === 'waiting parts' || t.status === 'waiting-parts').length },
    { status: t('resolved'), count: tickets.filter((t) => t.status === 'resolved').length },
  ];

  return (
    <div className="pb-8">
      <div className="mb-8 px-4 py-2">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-2">{t('dashboardTitle')}</h1>
        <p className="text-gray-600 dark:text-slate-300">{t('dashboardSubtitle')}</p>
      </div>

      <div className="grid mx-4 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card><CardHeader className="pb-3"><CardDescription>{t('occupancyRate')}</CardDescription></CardHeader><CardContent><div className="flex items-center justify-between"><div><p className="text-3xl font-bold text-gray-800 dark:text-slate-100">{occupancyRate}%</p><p className="text-sm text-gray-500 dark:text-slate-400">{t('roomsRatio', { occupied: occupiedRooms, total: totalRooms })}</p></div><Bed className="h-10 w-10 text-amber-600" /></div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardDescription>{t('totalRevenue')}</CardDescription></CardHeader><CardContent><div className="flex items-center justify-between"><div><p className="text-3xl font-bold text-gray-800 dark:text-slate-100">{formatCurrency(totalRevenue)}</p><p className="text-sm text-gray-500 dark:text-slate-400">{t('thisPeriod')}</p></div><Coins className="h-10 w-10 text-amber-600" /></div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardDescription>{t('openTickets')}</CardDescription></CardHeader><CardContent><div className="flex items-center justify-between"><div><p className="text-3xl font-bold text-gray-800 dark:text-slate-100">{openTickets}</p><p className="text-sm text-gray-500 dark:text-slate-400">{t('roomsOOO', { count: outOfOrderRooms })}</p></div><Wrench className="h-10 w-10 text-orange-600" /></div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardDescription>{t('housekeepingTitle')}</CardDescription></CardHeader><CardContent><div className="flex items-center justify-between"><div><p className="text-3xl font-bold text-gray-800 dark:text-slate-100">{dirtyRooms}</p><p className="text-sm text-gray-500 dark:text-slate-400">{t('roomsPending')}</p></div><Sparkles className="h-10 w-10 text-purple-600" /></div></CardContent></Card>
      </div>

      <div className="grid mx-4 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle>{t('occupancyTrend')}</CardTitle><CardDescription>{t('last7Days')}</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={last7Days}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Line type="monotone" dataKey="occupancy" stroke="#d97706" strokeWidth={2} /></LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t('roomStatusDistribution')}</CardTitle><CardDescription>{t('currentBreakdown')}</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart><Pie data={roomStatusData} cx="50%" cy="50%" labelLine={false} label={(e) => `${e.name}: ${e.value}`} outerRadius={100} dataKey="value">
                {roomStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid mx-4 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>{t('maintenanceTickets')}</CardTitle><CardDescription>{t('statusBreakdown')}</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ticketStatusData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="status" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#d97706" /></BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t('keyMetrics')}</CardTitle><CardDescription>{t('importantIndicators')}</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg"><div className="flex items-center gap-3"><TrendingUp className="h-5 w-5 text-amber-600" /><div><p className="text-sm text-gray-600 dark:text-slate-300">{t('averageDailyRate')}</p><p className="font-bold text-gray-800 dark:text-slate-100">{formatCurrency(156)}</p></div></div></div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-500/10 rounded-lg"><div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-green-600" /><div><p className="text-sm text-gray-600 dark:text-slate-300">{t('avgCleaningTime')}</p><p className="font-bold text-gray-800 dark:text-slate-100">{t('minutesValue', { count: 28 })}</p></div></div></div>
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-500/10 rounded-lg"><div className="flex items-center gap-3"><Wrench className="h-5 w-5 text-orange-600" /><div><p className="text-sm text-gray-600 dark:text-slate-300">{t('avgResolutionTime')}</p><p className="font-bold text-gray-800 dark:text-slate-100">{t('daysValue', { count: 2.3 })}</p></div></div></div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-500/10 rounded-lg"><div className="flex items-center gap-3"><AlertCircle className="h-5 w-5 text-red-600" /><div><p className="text-sm text-gray-600 dark:text-slate-300">{t('criticalIssues')}</p><p className="font-bold text-gray-800 dark:text-slate-100">{tickets.filter((t) => t.priority === 'urgent').length}</p></div></div></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
