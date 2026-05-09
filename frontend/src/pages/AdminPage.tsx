import { useEffect, useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { api } from '../services/api';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Building, Users, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/hotelFormatting';
import { useTranslation } from 'react-i18next';

export const AdminPage = () => {
  const { rooms, refreshData } = useHotel();
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('rooms');
  
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);

  useEffect(() => {
    // Only fetch admin data when its tab is visited
    if (activeTab === 'users') {
      api.get<any[]>('/admin/users')
        .then(res => setUsers(res))
        .catch(() => toast.error(t('loadUsersError')));
    }
    if (activeTab === 'settings') {
      api.get<any[]>('/admin/settings')
        .then(res => setSettings(res))
        .catch(() => toast.error(t('loadSettingsError')));
    }
  }, [activeTab]);

  const toggleUserActive = async (userId: number) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-active`);
      toast.success(t('userStatusUpdated'));
      // Refetch locally
      const updated = await api.get<any[]>('/admin/users');
      setUsers(updated);
    } catch (e: any) {
      toast.error(e.message || t('userStatusUpdateError'));
    }
  };

  const deleteUser = async (userId: number, userName: string) => {
    if (currentUser?.id === userId) {
      toast.error(t('deleteOwnAccountError'));
      return;
    }

    if (!window.confirm(t('confirmDeleteUser', { name: userName }))) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success(t('userDeleted'));
      const updatedUsers = await api.get<any[]>('/admin/users');
      setUsers(updatedUsers);
      await refreshData();
    } catch (e: any) {
      toast.error(e.message || t('deleteUserError'));
    }
  };

  const roomTypeStats = rooms.reduce((acc, room) => {
    acc[room.type] = (acc[room.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="pb-8">
      <div className="mb-8 px-4 py-2">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('adminTitle')}</h1>
        <p className="text-gray-600">{t('adminSubtitle')}</p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 mx-4">
          <TabsTrigger value="rooms" className="flex items-center gap-2"><Building className="h-4 w-4" />{t('navRooms')}</TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2"><Users className="h-4 w-4" />{t('users')}</TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2"><Settings className="h-4 w-4" />{t('settings')}</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms">
          <div className="grid mx-4 lg:grid-cols-4 gap-4 mb-6">
            {Object.entries(roomTypeStats).map(([type, count]) => (
                <Card key={type}>
                <CardHeader className="pb-3"><CardDescription className="capitalize">{t(`roomType.${type}`)} {t('rooms')}</CardDescription></CardHeader>
                <CardContent><p className="text-3xl font-bold text-gray-800">{count}</p></CardContent>
              </Card>
            ))}
          </div>
          <Card className="mx-4">
            <CardHeader><CardTitle>{t('allRoomsTitle')}</CardTitle><CardDescription>{t('allRoomsDescription')}</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('room')}</TableHead><TableHead>{t('type')}</TableHead><TableHead>{t('floor')}</TableHead>
                    <TableHead>{t('capacity')}</TableHead><TableHead>{t('priceNight')}</TableHead><TableHead>{t('status')}</TableHead>
                    <TableHead>{t('amenities')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-semibold">{room.number}</TableCell>
                      <TableCell className="capitalize">{t(`roomType.${room.type}`)}</TableCell>
                      <TableCell>{room.floor}</TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>{formatCurrency(room.pricePerNight)}</TableCell>
                      <TableCell><Badge variant={room.status === 'Available' || room.status === 'available' ? 'default' : 'secondary'}>{t(`status.${room.status.toLowerCase()}`, { defaultValue: room.status })}</Badge></TableCell>
                      <TableCell className="text-sm text-gray-600">{(room.amenities || []).map((amenity) => t(`amenity.${amenity}`, { defaultValue: amenity })).join(', ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="mx-4">
            <CardHeader><CardTitle>{t('systemUsers')}</CardTitle><CardDescription>{t('systemUsersDescription')}</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>{t('name')}</TableHead><TableHead>{t('email')}</TableHead><TableHead>{t('role')}</TableHead><TableHead>{t('status')}</TableHead><TableHead>{t('actions')}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-semibold">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell><Badge className="capitalize">{user.role}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? t('active') : t('inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => toggleUserActive(user.id)}>
                            {user.isActive ? t('deactivate') : t('activate')}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteUser(user.id, user.name)}>
                            {t('delete')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid lg:grid-cols-2 gap-6 mx-4">
            <Card>
              <CardHeader><CardTitle>{t('generalSettings')}</CardTitle><CardDescription>{t('generalSettingsDescription')}</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {settings.length === 0 ? <p className="text-sm text-gray-500">{t('noSettings')}</p> : settings.map((s) => (
                  <div key={s.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div><p className="font-medium text-gray-800">{s.key}</p><p className="text-sm text-gray-600">{s.description}</p></div>
                    <p className="font-semibold text-gray-800">{s.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>{t('roomTypeRates')}</CardTitle><CardDescription>{t('roomTypeRatesDescription')}</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {[[t('roomType.singleRoom'), t('baseRatePerNight'), formatCurrency(89)], [t('roomType.doubleRoom'), t('baseRatePerNight'), formatCurrency(129)], [t('roomType.deluxeRoom'), t('baseRatePerNight'), formatCurrency(189)], [t('roomType.suite'), t('baseRatePerNight'), formatCurrency(249)]].map(([label, desc, val]) => (
                  <div key={label} className="flex items-center justify-between p-3 border rounded-lg">
                    <div><p className="font-medium text-gray-800">{label}</p><p className="text-sm text-gray-600">{desc}</p></div>
                    <p className="font-semibold text-gray-800">{val}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
