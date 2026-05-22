import { useEffect, useState } from 'react';
import { useHotel, RoomStatus } from '../context/HotelContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { DefectReportModal } from '../components/housekeeping/DefectReportModal';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';

type ClientHousekeepingRequest = {
  id: number;
  roomId: number;
  roomNumber: string;
  issue: string;
  description?: string;
  priority: string;
  status: string;
  reportedBy?: string;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  'dirty': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-200 dark:border-red-900',
  'cleaning': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-200 dark:border-yellow-900',
  'clean': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-900',
  'ready': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-200 dark:border-green-900',
  'available': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  'occupied': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-200 dark:border-purple-900',
  'out-of-order': 'bg-gray-400 text-white border-gray-400 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600',
  'outoforder': 'bg-gray-400 text-white border-gray-400 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600', // C# fallback enum literal
};

const statusFlow: Record<string, string | null> = {
  'dirty': 'cleaning','cleaning': 'clean','clean': 'ready','ready': 'available',
  'available': null,'occupied': null,'out-of-order': null, 'outoforder': null
};

const housekeepingStatusOrder: Record<string, number> = {
  'dirty': 0,
  'cleaning': 1,
  'clean': 2,
  'ready': 3,
  'inspected': 4,
  'available': 5,
  'occupied': 6,
  'out-of-order': 7,
  'outoforder': 7,
  'out-of-service': 8,
};

export const HousekeepingPage = () => {
  const { rooms, updateRoomStatus, bookings } = useHotel();
  const { t } = useTranslation();
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState<string | number | null>(null);
  const [clientRequests, setClientRequests] = useState<ClientHousekeepingRequest[]>([]);
  const [resolvingRequestId, setResolvingRequestId] = useState<number | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const todaysArrivals = bookings.filter((b) => b.checkIn === today && b.status === 'confirmed');
  const filteredRooms = rooms
    .filter((r) => filterStatus === 'all' || r.status.toLowerCase() === filterStatus.toLowerCase())
    .sort((left, right) => {
      const leftStatus = left.status.toLowerCase();
      const rightStatus = right.status.toLowerCase();
      const leftOrder = housekeepingStatusOrder[leftStatus] ?? 99;
      const rightOrder = housekeepingStatusOrder[rightStatus] ?? 99;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.number.localeCompare(right.number, undefined, { numeric: true });
    });

  const handleStatusChange = (roomId: string | number, current: string) => {
    const next = statusFlow[current.toLowerCase()];
    if (next) {
      updateRoomStatus(roomId, next);
    }
  };

  const priorityRooms = filteredRooms.filter((room) =>
    todaysArrivals.some((b) => b.roomId === room.id) &&
    room.status.toLowerCase() !== 'ready' && room.status.toLowerCase() !== 'available'
  );

  useEffect(() => {
    api.get<ClientHousekeepingRequest[]>('/housekeeping/client-requests')
      .then((data) => setClientRequests(data || []))
      .catch(() => setClientRequests([]));
  }, []);

  const resolveClientRequest = async (requestId: number) => {
    try {
      setResolvingRequestId(requestId);
      await api.patch(`/housekeeping/client-requests/${requestId}/resolve`);
      setClientRequests((current) => current.filter((request) => request.id !== requestId));
    } finally {
      setResolvingRequestId(null);
    }
  };

  return (
    <div className="min-h-full bg-background p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-2">{t('housekeepingTitle')}</h1>
        <p className="text-gray-600 dark:text-slate-300">{t('housekeepingSubtitle')}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border dark:border-slate-700 mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-200">{t('filterByStatus')}</label>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allRooms')}</SelectItem>
            <SelectItem value="dirty">{t('status.dirty')}</SelectItem>
            <SelectItem value="cleaning">{t('status.cleaning')}</SelectItem>
            <SelectItem value="clean">{t('status.clean')}</SelectItem>
            <SelectItem value="ready">{t('status.ready')}</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
          <Sparkles className="h-4 w-4" /><span>{filteredRooms.length} {t('rooms')}</span>
        </div>
      </div>

      {priorityRooms.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-1">{t('priorityRooms')}</h3>
            <p className="text-sm text-orange-800 dark:text-orange-300">{t('priorityRoomsDescription', { count: priorityRooms.length, plural: priorityRooms.length > 1 ? 'e' : '' })}</p>
          </div>
        </div>
      )}

      <div className="mb-6 rounded-lg border bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">{t('guestRequestsTitle')}</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('guestRequestsDescription')}</p>
          </div>
          <Badge className="border bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {clientRequests.length}
          </Badge>
        </div>

        {clientRequests.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-slate-400">{t('guestRequestsEmpty')}</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {clientRequests.map((request) => (
              <div key={request.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-slate-100">{request.issue}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{t('room')} {request.roomNumber}</p>
                  </div>
                  <Badge className="border bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                    {t(`status.${request.status.toLowerCase()}`, { defaultValue: request.status })}
                  </Badge>
                </div>
                {request.description && (
                  <p className="mb-3 text-sm text-gray-600 dark:text-slate-300">{request.description}</p>
                )}
                <div className="space-y-1 text-xs text-gray-500 dark:text-slate-400">
                  <p>{t('guestRequestPriority', { priority: t(`priority.${request.priority.toLowerCase()}`, { defaultValue: request.priority }) })}</p>
                  <p>{t('guestRequestReportedBy', { reporter: request.reportedBy || t('role.client') })}</p>
                </div>
                <Button size="sm" className="mt-3" onClick={() => resolveClientRequest(request.id)} disabled={resolvingRequestId === request.id}>
                  {resolvingRequestId === request.id ? t('resolving') : t('markResolved')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => {
          const isPriority = priorityRooms.some((r) => r.id === room.id);
          const currentStatus = room.status.toLowerCase();
          const nextStatus = statusFlow[currentStatus];
          return (
            <div key={room.id} className={`bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700 p-5 ${isPriority ? 'border-orange-400 dark:border-orange-500 shadow-md dark:shadow-black/30' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">{t('room')} {room.number}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 capitalize">{t(`roomType.${room.type}`)} · {t('floor')} {room.floor}</p>
                </div>
                {isPriority && (
                  <div className="flex items-center gap-1 text-orange-600 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40 px-2 py-1 rounded text-xs font-medium">
                    <AlertTriangle className="h-3 w-3" />{t('priorityLabel')}
                  </div>
                )}
              </div>
              <div className="mb-4">
                <Badge className={`${statusColors[currentStatus] || 'bg-gray-100'} border`}>{t(`status.${currentStatus}`, { defaultValue: currentStatus.replace('-', ' ') })}</Badge>
              </div>
              <div className="flex gap-2">
                {nextStatus && (
                  <Button size="sm" className="flex-1" onClick={() => handleStatusChange(room.id, currentStatus)}>
                    {t('markAs', { status: t(`status.${nextStatus}`, { defaultValue: nextStatus.replace('-', ' ') }) })}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setSelectedRoom(room.id)}>{t('reportIssue')}</Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12"><p className="text-gray-500 dark:text-slate-400">{t('noRoomsMatch')}</p></div>
      )}

      {selectedRoom && (
        <DefectReportModal roomId={selectedRoom} onClose={() => setSelectedRoom(null)} />
      )}
    </div>
  );
};
