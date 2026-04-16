import { useEffect, useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { api } from '../services/api';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Building, Users, Settings } from 'lucide-react';
import { Switch } from '../components/ui/switch';

export const AdminPage = () => {
  const { rooms } = useHotel();
  const [activeTab, setActiveTab] = useState('rooms');
  
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);

  useEffect(() => {
    // Only fetch admin data when its tab is visited
    if (activeTab === 'users') {
      api.get<any[]>('/admin/users')
        .then(res => setUsers(res))
        .catch(() => toast.error('Eroare incarcare utilizatori'));
    }
    if (activeTab === 'settings') {
      api.get<any[]>('/admin/settings')
        .then(res => setSettings(res))
        .catch(() => toast.error('Eroare incarcare setari'));
    }
  }, [activeTab]);

  const toggleUserActive = async (userId: number) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-active`);
      toast.success('Status utilizator actualizat');
      // Refetch locally
      const updated = await api.get<any[]>('/admin/users');
      setUsers(updated);
    } catch (e: any) {
      toast.error(e.message || 'Eroare la actualizarea statusului');
    }
  };

  const roomTypeStats = rooms.reduce((acc, room) => {
    acc[room.type] = (acc[room.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="pb-8">
      <div className="mb-8 px-4 py-2">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Settings</h1>
        <p className="text-gray-600">Manage system configuration and data</p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 mx-4">
          <TabsTrigger value="rooms" className="flex items-center gap-2"><Building className="h-4 w-4" />Rooms</TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2"><Users className="h-4 w-4" />Users</TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2"><Settings className="h-4 w-4" />Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms">
          <div className="grid mx-4 lg:grid-cols-4 gap-4 mb-6">
            {Object.entries(roomTypeStats).map(([type, count]) => (
              <Card key={type}>
                <CardHeader className="pb-3"><CardDescription className="capitalize">{type} Rooms</CardDescription></CardHeader>
                <CardContent><p className="text-3xl font-bold text-gray-800">{count}</p></CardContent>
              </Card>
            ))}
          </div>
          <Card className="mx-4">
            <CardHeader><CardTitle>All Rooms</CardTitle><CardDescription>Manage hotel rooms and their configurations</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead><TableHead>Type</TableHead><TableHead>Floor</TableHead>
                    <TableHead>Capacity</TableHead><TableHead>Price/Night</TableHead><TableHead>Status</TableHead>
                    <TableHead>Amenities</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-semibold">{room.number}</TableCell>
                      <TableCell className="capitalize">{room.type}</TableCell>
                      <TableCell>{room.floor}</TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>${room.pricePerNight}</TableCell>
                      <TableCell><Badge variant={room.status === 'Available' || room.status === 'available' ? 'default' : 'secondary'}>{room.status}</Badge></TableCell>
                      <TableCell className="text-sm text-gray-600">{(room.amenities || []).join(', ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="mx-4">
            <CardHeader><CardTitle>System Users</CardTitle><CardDescription>Manage user accounts and roles</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status Toggle</TableHead></TableRow></TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-semibold">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell><Badge className="capitalize">{user.role}</Badge></TableCell>
                      <TableCell onClick={() => toggleUserActive(user.id)} className="cursor-pointer">
                        <Badge variant="default" className="hover:bg-gray-800">Toggle</Badge>
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
              <CardHeader><CardTitle>General Settings</CardTitle><CardDescription>System configuration options from API</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {settings.length === 0 ? <p className="text-sm text-gray-500">No settings found.</p> : settings.map((s) => (
                  <div key={s.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div><p className="font-medium text-gray-800">{s.key}</p><p className="text-sm text-gray-600">{s.description}</p></div>
                    <p className="font-semibold text-gray-800">{s.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Room Type Rates</CardTitle><CardDescription>Default pricing per room type</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {[['Single Room','Base rate per night','$89'],['Double Room','Base rate per night','$129'],['Deluxe Room','Base rate per night','$189'],['Suite','Base rate per night','$249']].map(([label, desc, val]) => (
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
