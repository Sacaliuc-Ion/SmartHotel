import { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { useTranslation } from 'react-i18next';

interface DefectReportModalProps { roomId: string | number; onClose: () => void; }

export const DefectReportModal = ({ roomId, onClose }: DefectReportModalProps) => {
  const { rooms, addTicket } = useHotel();
  const { t } = useTranslation();
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('medium');
  const room = rooms.find((r) => r.id === roomId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue.trim()) return;
    await addTicket({ roomId, issue, description, priority });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="dark:border-slate-700 dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>{t('reportDefect')}</DialogTitle>
          <DialogDescription>{t('reportDefectDescription', { room: room?.number || roomId })}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">{t('issueTitle')}</label>
              <Input placeholder={t('defectIssuePlaceholder')} value={issue} onChange={(e) => setIssue(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">{t('description')}</label>
              <Textarea placeholder={t('provideMoreDetails')} value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">{t('priority')}</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t('priority.low')}</SelectItem>
                  <SelectItem value="medium">{t('priority.medium')}</SelectItem>
                  <SelectItem value="high">{t('priority.high')}</SelectItem>
                  <SelectItem value="urgent">{t('priority.urgent')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
            <Button type="submit">{t('createTicket')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
