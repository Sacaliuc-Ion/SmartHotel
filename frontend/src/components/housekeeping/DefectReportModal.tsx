import { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { TicketPriority } from '../../data/mockData';
import { toast } from 'sonner';

interface DefectReportModalProps { roomId: string; onClose: () => void; }

export const DefectReportModal = ({ roomId, onClose }: DefectReportModalProps) => {
  const { rooms, addTicket } = useHotel();
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const room = rooms.find((r) => r.id === roomId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue.trim()) { toast.error('Please enter an issue title'); return; }
    addTicket({ id: 'T' + Date.now(), roomId, issue, description, priority, status: 'new', createdAt: new Date().toISOString() });
    toast.success('Maintenance ticket created successfully');
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Defect</DialogTitle>
          <DialogDescription>Create a maintenance ticket for Room {room?.number}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Title</label>
              <Input placeholder="e.g., Leaky faucet, Broken AC..." value={issue} onChange={(e) => setIssue(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Textarea placeholder="Provide more details..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Create Ticket</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
