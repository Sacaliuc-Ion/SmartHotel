import { useState, useEffect } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface TicketFormModalProps { ticketId?: string | number; onClose: () => void; }

export const TicketFormModal = ({ ticketId, onClose }: TicketFormModalProps) => {
  const { rooms, tickets, addTicket, updateTicket, updateRoomStatus } = useHotel();
  const { t } = useTranslation();
  const [roomId, setRoomId] = useState('');
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('medium');
  const [status, setStatus] = useState<string>('new');
  const [assignee, setAssignee] = useState('');
  const [markOutOfOrder, setMarkOutOfOrder] = useState(false);

  const existingTicket = ticketId ? tickets.find((t) => t.id === ticketId) : null;
  const isEditing = !!existingTicket;

  useEffect(() => {
    if (existingTicket) {
      setRoomId(existingTicket.roomId.toString()); 
      setIssue(existingTicket.issue);
      setDescription(existingTicket.description || ''); 
      setPriority(existingTicket.priority);
      setStatus(existingTicket.status.toLowerCase()); 
      setAssignee(existingTicket.assignee || '');
      const room = rooms.find((r) => r.id.toString() === existingTicket.roomId.toString());
      setMarkOutOfOrder(room?.status.toLowerCase() === 'out-of-order' || room?.status.toLowerCase() === 'outoforder');
    }
  }, [existingTicket, rooms]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !issue.trim()) { toast.error(t('ticketRequiredFields')); return; }

    if (isEditing && ticketId) {
      updateTicket(ticketId, { roomId, issue, description, priority, status, assignee: assignee || undefined });
      if (markOutOfOrder) updateRoomStatus(roomId, 'out-of-order');
      else { 
        const room = rooms.find((r) => r.id.toString() === roomId); 
        if (room?.status.toLowerCase() === 'out-of-order' || room?.status.toLowerCase() === 'outoforder') {
          updateRoomStatus(roomId, 'available'); 
        }
      }
      toast.success(t('ticketRegistered'));
    } else {
      addTicket({ roomId, issue, description, priority });
      if (markOutOfOrder) updateRoomStatus(roomId, 'out-of-order');
      toast.success(t('maintenanceCalled'));
    }
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl dark:border-slate-700 dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('editTicket') : t('newMaintenanceTicket')}</DialogTitle>
          <DialogDescription>{isEditing ? t('updateTicketDetails') : t('createMaintenanceWorkOrder')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">{t('room')} *</label>
                <Select value={roomId} onValueChange={setRoomId} disabled={isEditing}>
                  <SelectTrigger><SelectValue placeholder={t('selectRoom')} /></SelectTrigger>
                  <SelectContent>{rooms.map((r) => <SelectItem key={r.id} value={r.id.toString()}>{t('room')} {r.number} - {t(`roomType.${r.type}`)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">{t('priority')} *</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('priority.low')}</SelectItem><SelectItem value="medium">{t('priority.medium')}</SelectItem>
                    <SelectItem value="high">{t('priority.high')}</SelectItem><SelectItem value="urgent">{t('priority.urgent')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">{t('issueTitleRequired')}</label>
              <Input placeholder={t('issuePlaceholder')} value={issue} onChange={(e) => setIssue(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">{t('description')}</label>
              <Textarea placeholder={t('detailedDescription')} value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            {isEditing && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">{t('status')}</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">{t('new')}</SelectItem><SelectItem value="in-progress">{t('inProgress')}</SelectItem>
                      <SelectItem value="resolved">{t('resolved')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">{t('assignee')}</label>
                  <Input placeholder={t('technicianName')} value={assignee} onChange={(e) => setAssignee(e.target.value)} disabled />
                </div>
              </div>
            )}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-950 rounded-lg">
              <div><p className="font-medium text-gray-800 dark:text-slate-100">{t('markRoomOutOfOrder')}</p><p className="text-sm text-gray-600 dark:text-slate-300">{t('roomUnavailableForBooking')}</p></div>
              <Switch checked={markOutOfOrder} onCheckedChange={setMarkOutOfOrder} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
            <Button type="submit">{isEditing ? t('updateTicket') : t('createTicket')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
