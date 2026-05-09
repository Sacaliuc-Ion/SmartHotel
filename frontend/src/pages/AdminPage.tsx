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
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/hotelFormatting';
import { useTranslation } from 'react-i18next';

const editableSettingKeys = ['Currency', 'CheckInTime', 'CheckOutTime'] as const;
const currencyOptions = ['MDL', 'EUR', 'USD', 'RON'] as const;
const roleOptions = ['client', 'reception', 'housekeeping', 'maintenance', 'manager', 'admin'] as const;

export const AdminPage = () => {
  const { rooms, refreshData } = useHotel();
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('rooms');
  
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [settingDrafts, setSettingDrafts] = useState<Record<string, string>>({});
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [savingSetting, setSavingSetting] = useState<string | null>(null);
  const [savingRoomType, setSavingRoomType] = useState<string | null>(null);
  const [savingUserRoleId, setSavingUserRoleId] = useState<number | null>(null);

  useEffect(() => {
    // Only fetch admin data when its tab is visited
    if (activeTab === 'users') {
      api.get<any[]>('/admin/users')
        .then(res => setUsers(res))
        .catch(() => toast.error(t('loadUsersError')));
    }
    if (activeTab === 'settings') {
      api.get<any[]>('/admin/settings')
        .then(res => {
          setSettings(res);
          setSettingDrafts(Object.fromEntries(res.map((setting) => [setting.key, setting.value])));
          const currency = res.find((setting) => setting.key === 'Currency')?.value;
          if (currency) localStorage.setItem('smart-hotel-currency', currency);
        })
        .catch(() => toast.error(t('loadSettingsError')));
    }
  }, [activeTab]);

  useEffect(() => {
    const typePrices = Object.fromEntries(
      Object.entries(
        rooms.reduce((acc, room) => {
          if (!acc[room.type]) acc[room.type] = room.pricePerNight;
          return acc;
        }, {} as Record<string, number>)
      ).map(([type, price]) => [type, String(price)])
    );
    setPriceDrafts(typePrices);
  }, [rooms]);

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

  const updateUserRole = async (userId: number, role: string) => {
    if (currentUser?.id === userId) {
      toast.error(t('changeOwnRoleError'));
      return;
    }

    try {
      setSavingUserRoleId(userId);
      await api.patch(`/admin/users/${userId}/role`, { role });
      toast.success(t('userRoleUpdated'));
      const updatedUsers = await api.get<any[]>('/admin/users');
      setUsers(updatedUsers);
    } catch (e: any) {
      toast.error(e.message || t('userRoleUpdateError'));
    } finally {
      setSavingUserRoleId(null);
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

  const currency = settingDrafts.Currency || localStorage.getItem('smart-hotel-currency') || 'MDL';

  const getSettingLabel = (key: string) => {
    if (key === 'Currency') return t('currency');
    if (key === 'CheckInTime') return t('standardCheckInTime');
    if (key === 'CheckOutTime') return t('standardCheckOutTime');
    return key;
  };

  const getSettingDescription = (key: string, fallback?: string) => {
    if (key === 'Currency') return t('currencySettingDescription');
    if (key === 'CheckInTime') return t('checkInTimeDescription');
    if (key === 'CheckOutTime') return t('checkOutTimeDescription');
    return fallback || '';
  };

  const saveSetting = async (key: string) => {
    const value = settingDrafts[key]?.trim();
    if (!value) {
      toast.error(t('settingValueRequired'));
      return;
    }

    try {
      setSavingSetting(key);
      await api.put(`/admin/settings/${key}`, { value });
      setSettings((prev) => prev.map((setting) => setting.key === key ? { ...setting, value } : setting));
      if (key === 'Currency') localStorage.setItem('smart-hotel-currency', value);
      toast.success(t('settingUpdated'));
    } catch (e: any) {
      toast.error(e.message || t('settingUpdateError'));
    } finally {
      setSavingSetting(null);
    }
  };

  const saveRoomTypePrice = async (roomType: string) => {
    const draft = priceDrafts[roomType];
    const pricePerNight = Number(draft);

    if (!Number.isFinite(pricePerNight) || pricePerNight <= 0) {
      toast.error(t('roomPriceInvalid'));
      return;
    }

    try {
      setSavingRoomType(roomType);
      await api.patch(`/rooms/types/${roomType}/price`, { pricePerNight });
      toast.success(t('roomPriceUpdated'));
      await refreshData();
    } catch (e: any) {
      toast.error(e.message || t('roomPriceUpdateError'));
    } finally {
      setSavingRoomType(null);
    }
  };

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
                      <TableCell>{formatCurrency(room.pricePerNight, currency)}</TableCell>
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
                      <TableCell className="min-w-44">
                        <Select
                          value={user.role}
                          onValueChange={(role) => updateUserRole(user.id, role)}
                          disabled={currentUser?.id === user.id || savingUserRoleId === user.id}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map((role) => (
                              <SelectItem key={role} value={role}>{t(`role.${role}`)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {currentUser?.id === user.id && (
                          <p className="mt-1 text-xs text-muted-foreground">{t('ownRoleLocked')}</p>
                        )}
                      </TableCell>
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
                {settings.length === 0 ? <p className="text-sm text-gray-500">{t('noSettings')}</p> : settings
                  .filter((setting) => editableSettingKeys.includes(setting.key))
                  .map((setting) => (
                  <div key={setting.key} className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_220px_auto] md:items-center">
                    <div>
                      <p className="font-medium text-gray-800">{getSettingLabel(setting.key)}</p>
                      <p className="text-sm text-gray-600">{getSettingDescription(setting.key, setting.description)}</p>
                    </div>
                    {setting.key === 'Currency' ? (
                      <Select
                        value={settingDrafts[setting.key] || setting.value}
                        onValueChange={(value) => setSettingDrafts((prev) => ({ ...prev, [setting.key]: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencyOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type="time"
                        value={settingDrafts[setting.key] || setting.value}
                        onChange={(event) => setSettingDrafts((prev) => ({ ...prev, [setting.key]: event.target.value }))}
                      />
                    )}
                    <Button
                      variant="outline"
                      onClick={() => saveSetting(setting.key)}
                      disabled={savingSetting === setting.key || (settingDrafts[setting.key] || setting.value) === setting.value}
                    >
                      {savingSetting === setting.key ? t('saving') : t('save')}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>{t('roomTypeRates')}</CardTitle><CardDescription>{t('roomTypeRatesDescription')}</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(roomTypeStats).map(([type]) => {
                  const prices = rooms.filter((room) => room.type === type).map((room) => room.pricePerNight);
                  const min = Math.min(...prices);
                  const max = Math.max(...prices);
                  const currentPrice = min === max ? min : Number(priceDrafts[type] || min);
                  return (
                  <div key={type} className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_220px_auto] md:items-center">
                    <div>
                      <p className="font-medium text-gray-800">{t(`roomType.${type}`)}</p>
                      <p className="text-sm text-gray-600">{t('appliesToAllRoomsOfType', { count: roomTypeStats[type] })}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={priceDrafts[type] ?? currentPrice}
                          onChange={(event) => setPriceDrafts((prev) => ({ ...prev, [type]: event.target.value }))}
                        />
                        <span className="text-xs text-muted-foreground">{currency}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{formatCurrency(Number(priceDrafts[type] || currentPrice), currency)}</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => saveRoomTypePrice(type)}
                      disabled={savingRoomType === type || String(priceDrafts[type] ?? currentPrice) === String(currentPrice)}
                    >
                      {savingRoomType === type ? t('saving') : t('save')}
                    </Button>
                  </div>
                )})}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
