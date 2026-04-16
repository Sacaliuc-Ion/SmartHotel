import { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Plus, AlertCircle, Clock, Wrench, CheckCircle } from 'lucide-react';
import { TicketFormModal } from '../components/maintenance/TicketFormModal';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  'new': { label: 'New', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  'in-progress': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Wrench },
  'inprogress': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Wrench },
  'waiting-parts': { label: 'Waiting Parts', color: 'bg-orange-100 text-orange-800', icon: Clock },
  'resolved': { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  'closed': { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
};

const priorityColors: Record<string, string> = {
  'low': 'bg-gray-100 text-gray-800','medium': 'bg-blue-100 text-blue-800',
  'high': 'bg-orange-100 text-orange-800','urgent': 'bg-red-100 text-red-800',
};

export const MaintenancePage = () => {
  const { tickets, rooms } = useHotel();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | number | null>(null);

  const getRoom = (roomId: string | number) => rooms.find((r) => r.id === roomId);

  const normalizedTickets = tickets.map(t => ({
    ...t,
    status: t.status.toLowerCase().replace(' ', '-')
  }));

  const groupedTickets: Record<string, typeof normalizedTickets> = {
    'new': normalizedTickets.filter((t) => t.status === 'new'),
    'in-progress': normalizedTickets.filter((t) => t.status.includes('progress')),
    'waiting-parts': normalizedTickets.filter((t) => t.status.includes('waiting')),
    'resolved': normalizedTickets.filter((t) => t.status === 'resolved' || t.status === 'closed'),
  };

  const openTicketsCount = normalizedTickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed').length;

  return (
    <div className="p-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Maintenance</h1>
          <p className="text-gray-600">Manage maintenance tickets and work orders via live data</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}><Plus className="h-4 w-4 mr-2" />New Ticket</Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg border"><p className="text-sm text-gray-600">Open Tickets</p><p className="text-3xl font-bold text-gray-800">{openTicketsCount}</p></div>
        <div className="bg-white p-4 rounded-lg border"><p className="text-sm text-gray-600">New</p><p className="text-3xl font-bold text-blue-600">{groupedTickets['new'].length}</p></div>
        <div className="bg-white p-4 rounded-lg border"><p className="text-sm text-gray-600">In Progress</p><p className="text-3xl font-bold text-yellow-600">{groupedTickets['in-progress'].length}</p></div>
        <div className="bg-white p-4 rounded-lg border"><p className="text-sm text-gray-600">Resolved</p><p className="text-3xl font-bold text-green-600">{groupedTickets['resolved'].length}</p></div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {['new', 'in-progress', 'waiting-parts', 'resolved'].map((status) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          const statusTickets = groupedTickets[status];
          return (
            <div key={status} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Icon className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">{config.label}</h3>
                <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">{statusTickets.length}</span>
              </div>
              <div className="space-y-3">
                {statusTickets.map((ticket) => {
                  const room = getRoom(ticket.roomId);
                  const daysSince = Math.floor((Date.now() - new Date(ticket.createdAt).getTime()) / 86400000) || 0;
                  return (
                    <div key={ticket.id} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTicket(ticket.id)}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-800 text-sm">{ticket.issue}</h4>
                        <Badge className={`${priorityColors[ticket.priority.toLowerCase()] || priorityColors['low']} text-xs`}>{ticket.priority}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Room {ticket.roomNumber || room?.number}</p>
                      {ticket.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{ticket.description}</p>}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{daysSince}d ago</span>
                        {ticket.assignee && <span className="font-medium text-gray-700">{ticket.assignee.split(' ')[0]}</span>}
                      </div>
                    </div>
                  );
                })}
                {statusTickets.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No tickets</p>}
              </div>
            </div>
          );
        })}
      </div>
      {isModalOpen && <TicketFormModal onClose={() => setIsModalOpen(false)} />}
      {selectedTicket && <TicketFormModal ticketId={selectedTicket} onClose={() => setSelectedTicket(null)} />}
    </div>
  );
};
