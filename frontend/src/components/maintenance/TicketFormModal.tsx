import { useState, useEffect } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { TicketPriority, TicketStatus } from '../../data/mockData';
import { toast } from 'sonner';

interface TicketFormModalProps { ticketId?: string; onClose: () => void; }

export const TicketFormModal = ({ ticketId, onClose }: TicketFormModalProps) => {
  const { rooms, tickets, addTicket, updateTicket, updateRoomStatus } = useHotel();
  const [roomId, setRoomId] = useState('');
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [status, setStatus] = useState<TicketStatus>('new');
  const [assignee, setAssignee] = useState('');
  const [markOutOfOrder, setMarkOutOfOrder] = useState(false);

  const existingTicket = ticketId ? tickets.find((t) => t.id === ticketId) : null;
  const isEditing = !!existingTicket;

  useEffect(() => {
    if (existingTicket) {
      setRoomId(existingTicket.roomId); setIssue(existingTicket.issue);
      setDescription(existingTicket.description); setPriority(existingTicket.priority);
      setStatus(existingTicket.status); setAssignee(existingTicket.assignee || '');
      const room = rooms.find((r) => r.id === existingTicket.roomId);
      setMarkOutOfOrder(room?.status === 'out-of-order');
    }
  }, [existingTicket, rooms]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !issue.trim()) { toast.error('Please fill in all required fields'); return; }

    if (isEditing && ticketId) {
      updateTicket(ticketId, { roomId, issue, description, priority, status, assignee: assignee || undefined, resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined });
      if (markOutOfOrder) updateRoomStatus(roomId, 'out-of-order');
      else { const room = rooms.find((r) => r.id === roomId); if (room?.status === 'out-of-order') updateRoomStatus(roomId, 'available'); }
      toast.success('Ticket updated successfully');
    } else {
      addTicket({ id: 'T' + Date.now(), roomId, issue, description, priority, status, assignee: assignee || undefined, createdAt: new Date().toISOString() });
      if (markOutOfOrder) updateRoomStatus(roomId, 'out-of-order');
      toast.success('Ticket created successfully');
    }
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Ticket' : 'New Maintenance Ticket'}</DialogTitle>
          <DialogDescription>{isEditing ? 'Update ticket details and status' : 'Create a new maintenance work order'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room *</label>
                <Select value={roomId} onValueChange={setRoomId} disabled={isEditing}>
                  <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                  <SelectContent>{rooms.map((r) => <SelectItem key={r.id} value={r.id}>Room {r.number} - {r.type}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Title *</label>
              <Input placeholder="e.g., Broken AC, Leaky faucet..." value={issue} onChange={(e) => setIssue(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Textarea placeholder="Detailed description..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            {isEditing && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem><SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="waiting-parts">Waiting Parts</SelectItem><SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
                  <Input placeholder="Technician name" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
                </div>
              </div>
            )}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div><p className="font-medium text-gray-800">Mark Room as Out of Order</p><p className="text-sm text-gray-600">Room will be unavailable for booking</p></div>
              <Switch checked={markOutOfOrder} onCheckedChange={setMarkOutOfOrder} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{isEditing ? 'Update' : 'Create'} Ticket</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
