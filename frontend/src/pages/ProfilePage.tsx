import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { CalendarDays, KeyRound, Save, Trash2, Undo2, UserRound } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { formatCurrency } from '../utils/hotelFormatting';

type Profile = {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  role: string;
  isActive: boolean;
  address?: string | null;
  country?: string | null;
  city?: string | null;
  dateOfBirth?: string | null;
  createdAt: string;
  lastLoginAt?: string | null;
};

type Reservation = {
  id: number;
  roomId: number;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  guests: number;
  review?: {
    id: number;
    rating: number;
    comment?: string | null;
    createdAt: string;
  } | null;
};

type LoginAudit = {
  id: number;
  loggedInAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

const emptyProfile: Profile = {
  id: 0,
  firstName: '',
  lastName: '',
  name: '',
  email: '',
  role: '',
  isActive: true,
  createdAt: '',
};

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Nedisponibil';
  return new Intl.DateTimeFormat('ro-RO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
};

export const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [draft, setDraft] = useState<Profile>(emptyProfile);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [logins, setLogins] = useState<LoginAudit[]>([]);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [expandedReservation, setExpandedReservation] = useState<number | null>(null);
  const [reviewForms, setReviewForms] = useState<Record<number, { rating: number; comment: string }>>({});
  const [submittingReviewId, setSubmittingReviewId] = useState<number | null>(null);
  const [ticketForms, setTicketForms] = useState<Record<number, { type: 'maintenance' | 'housekeeping'; issue: string; description: string; priority: string }>>({});
  const [submittingTicketId, setSubmittingTicketId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      try {
        const [profileData, reservationData, loginData] = await Promise.all([
          api.get<Profile>('/auth/profile'),
          api.get<Reservation[]>('/reservations/my'),
          api.get<LoginAudit[]>('/auth/recent-logins'),
        ]);
        setProfile(profileData);
        setDraft(profileData);
        setReservations(reservationData || []);
        setLogins(loginData || []);
      } catch (error: any) {
        toast.error(error.message || 'Nu am putut incarca profilul.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const groupedReservations = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      active: reservations.filter((reservation) => reservation.status === 'checked-in'),
      upcoming: reservations.filter((reservation) => reservation.status === 'confirmed' && reservation.checkIn >= today),
      history: reservations.filter((reservation) => ['checked-out', 'cancelled', 'no-show'].includes(reservation.status) || reservation.checkOut < today),
    };
  }, [reservations]);

  const updateReviewForm = (reservationId: number, field: 'rating' | 'comment', value: number | string) => {
    setReviewForms((current) => ({
      ...current,
      [reservationId]: {
        rating: current[reservationId]?.rating || 5,
        comment: current[reservationId]?.comment || '',
        [field]: value,
      },
    }));
  };

  const submitReview = async (reservationId: number) => {
    const form = reviewForms[reservationId] || { rating: 5, comment: '' };

    if (form.rating < 1 || form.rating > 5) {
      toast.error('Alege un rating intre 1 si 5.');
      return;
    }

    setSubmittingReviewId(reservationId);
    try {
      const review = await api.post<{ id: number; rating: number; comment?: string | null; createdAt: string }>(`/reservations/${reservationId}/review`, {
        rating: form.rating,
        comment: form.comment,
      });

      setReservations((current) =>
        current.map((reservation) =>
          reservation.id === reservationId
            ? { ...reservation, review }
            : reservation
        )
      );
      toast.success('Review-ul a fost adaugat.');
    } catch (error: any) {
      toast.error(error.message || 'Nu am putut salva review-ul.');
    } finally {
      setSubmittingReviewId(null);
    }
  };

  const updateTicketForm = (
    reservationId: number,
    field: 'type' | 'issue' | 'description' | 'priority',
    value: string
  ) => {
    setTicketForms((current) => ({
      ...current,
      [reservationId]: {
        type: current[reservationId]?.type || 'maintenance',
        issue: current[reservationId]?.issue || '',
        description: current[reservationId]?.description || '',
        priority: current[reservationId]?.priority || 'medium',
        [field]: value,
      },
    }));
  };

  const submitTicket = async (reservation: Reservation) => {
    const form = ticketForms[reservation.id] || {
      type: 'maintenance' as const,
      issue: '',
      description: '',
      priority: 'medium',
    };

    if (!form.issue.trim()) {
      toast.error('Completeaza subiectul cererii.');
      return;
    }

    setSubmittingTicketId(reservation.id);
    try {
      const payload = {
        roomId: reservation.roomId,
        issue: form.issue.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
      };

      if (form.type === 'maintenance') {
        await api.post('/maintenance/tickets', payload);
      } else {
        await api.post('/housekeeping/report-issue', payload);
      }

      setTicketForms((current) => ({
        ...current,
        [reservation.id]: {
          type: form.type,
          issue: '',
          description: '',
          priority: 'medium',
        },
      }));
      toast.success('Cererea a fost trimisa.');
    } catch (error: any) {
      toast.error(error.message || 'Nu am putut trimite cererea.');
    } finally {
      setSubmittingTicketId(null);
    }
  };

  const updateDraft = (field: keyof Profile, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const updated = await api.put<Profile>('/auth/profile', {
        firstName: draft.firstName,
        lastName: draft.lastName,
        phoneNumber: draft.phoneNumber,
        avatarUrl: draft.avatarUrl,
        address: draft.address,
        country: draft.country,
        city: draft.city,
        dateOfBirth: draft.dateOfBirth,
      });
      setProfile(updated);
      setDraft(updated);
      updateUser({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role as any,
        isActive: updated.isActive,
        avatarUrl: updated.avatarUrl,
      });
      toast.success('Profil salvat.');
    } catch (error: any) {
      toast.error(error.message || 'Eroare la salvarea profilului.');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!passwords.currentPassword || passwords.newPassword.length < 6) {
      toast.error('Completeaza parola curenta si o parola noua de minim 6 caractere.');
      return;
    }

    try {
      await api.post('/auth/change-password', passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      toast.success('Parola a fost schimbata.');
    } catch (error: any) {
      toast.error(error.message || 'Eroare la schimbarea parolei.');
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm('Sigur vrei sa stergi contul? Datele contului vor fi sterse din baza de date.')) return;

    try {
      await api.delete('/auth/account');
      logout();
      navigate('/');
      toast.success('Contul a fost sters.');
    } catch (error: any) {
      toast.error(error.message || 'Contul nu poate fi sters momentan.');
    }
  };

  const reservationList = (items: Reservation[]) => (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="rounded-lg border bg-white p-6 text-center text-gray-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">Nu exista rezervari in aceasta categorie.</p>
      ) : items.map((reservation) => (
        <div key={reservation.id} className="rounded-lg border bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100">Rezervare #{reservation.id}</h3>
                <Badge>{reservation.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
                Camera {reservation.roomNumber} - {reservation.checkIn} - {reservation.checkOut} - {reservation.guests} oaspeti
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setExpandedReservation(expandedReservation === reservation.id ? null : reservation.id)}>
              Detalii rezervare
            </Button>
          </div>
          {expandedReservation === reservation.id && (
            <div className="mt-4 space-y-4 border-t pt-4 dark:border-slate-700">
              <div className="grid gap-3 text-sm text-gray-600 dark:text-slate-300 sm:grid-cols-3">
                <div><span className="block text-xs uppercase text-gray-400">Plata</span>{reservation.paymentStatus}</div>
                <div><span className="block text-xs uppercase text-gray-400">Total</span>{formatCurrency(reservation.totalAmount)}</div>
                <div><span className="block text-xs uppercase text-gray-400">Camera</span>{reservation.roomNumber}</div>
              </div>

              {reservation.status !== 'cancelled' && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                  <h4 className="mb-3 font-medium text-gray-900 dark:text-slate-100">Solicita asistenta pentru camera</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs uppercase text-gray-500 dark:text-slate-400">Tip cerere</label>
                      <Select
                        value={ticketForms[reservation.id]?.type || 'maintenance'}
                        onValueChange={(value) => updateTicketForm(reservation.id, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="housekeeping">Housekeeping</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs uppercase text-gray-500 dark:text-slate-400">Prioritate</label>
                      <Select
                        value={ticketForms[reservation.id]?.priority || 'medium'}
                        onValueChange={(value) => updateTicketForm(reservation.id, 'priority', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Scazuta</SelectItem>
                          <SelectItem value="medium">Medie</SelectItem>
                          <SelectItem value="high">Ridicata</SelectItem>
                          <SelectItem value="urgent">Urgenta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="mb-1 block text-xs uppercase text-gray-500 dark:text-slate-400">Subiect</label>
                    <Input
                      value={ticketForms[reservation.id]?.issue || ''}
                      onChange={(event) => updateTicketForm(reservation.id, 'issue', event.target.value)}
                      placeholder="ex: Aer conditionat, prosoape, curatenie, baie"
                    />
                  </div>

                  <div className="mt-3">
                    <label className="mb-1 block text-xs uppercase text-gray-500 dark:text-slate-400">Detalii</label>
                    <Textarea
                      rows={3}
                      value={ticketForms[reservation.id]?.description || ''}
                      onChange={(event) => updateTicketForm(reservation.id, 'description', event.target.value)}
                      placeholder="Descrie exact ce ai nevoie in camera."
                    />
                  </div>

                  <Button className="mt-3" onClick={() => submitTicket(reservation)} disabled={submittingTicketId === reservation.id}>
                    {submittingTicketId === reservation.id ? 'Se trimite...' : 'Trimite ticket'}
                  </Button>
                </div>
              )}

              {reservation.status === 'checked-out' && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                  <h4 className="mb-3 font-medium text-gray-900 dark:text-slate-100">Review camera</h4>

                  {reservation.review ? (
                    <div className="space-y-2 text-sm text-gray-600 dark:text-slate-300">
                      <p className="font-medium text-amber-600">{'★'.repeat(reservation.review.rating)}{'☆'.repeat(5 - reservation.review.rating)}</p>
                      <p>{reservation.review.comment || 'Fara comentariu adaugat.'}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Adaugat la {formatDateTime(reservation.review.createdAt)}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs uppercase text-gray-500 dark:text-slate-400">Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => updateReviewForm(reservation.id, 'rating', value)}
                              className={`rounded-md border px-3 py-1 text-sm transition ${
                                (reviewForms[reservation.id]?.rating || 5) === value
                                  ? 'border-amber-500 bg-amber-100 text-amber-700 dark:border-amber-400 dark:bg-amber-500/20 dark:text-amber-300'
                                  : 'border-gray-200 bg-white text-gray-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                              }`}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs uppercase text-gray-500 dark:text-slate-400">Comentariu</label>
                        <Textarea
                          rows={4}
                          value={reviewForms[reservation.id]?.comment || ''}
                          onChange={(event) => updateReviewForm(reservation.id, 'comment', event.target.value)}
                          placeholder="Cum a fost experienta ta in aceasta camera?"
                        />
                      </div>

                      <Button onClick={() => submitReview(reservation.id)} disabled={submittingReviewId === reservation.id}>
                        {submittingReviewId === reservation.id ? 'Se trimite...' : 'Adauga review'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (loading) {
    return <div className="p-6 text-gray-600 dark:text-slate-300">Se incarca profilul...</div>;
  }

  return (
    <div className="min-h-full bg-background px-4 pb-8">
      <div className="mb-6 flex flex-col gap-4 py-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Profil utilizator</h1>
          <p className="text-gray-600 dark:text-slate-300">Date personale, rezervari, securitate si actiuni cont.</p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
          {draft.avatarUrl ? (
            <img src={draft.avatarUrl} alt={profile.name} className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-lg font-semibold text-amber-700">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 dark:text-slate-100">{profile.name}</p>
            <p className="text-sm capitalize text-gray-500 dark:text-slate-400">{profile.role} - {profile.isActive ? 'activ' : 'inactiv'}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile"><UserRound className="h-4 w-4" /> Profil</TabsTrigger>
          <TabsTrigger value="reservations"><CalendarDays className="h-4 w-4" /> Rezervari</TabsTrigger>
          <TabsTrigger value="security"><KeyRound className="h-4 w-4" /> Securitate</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-lg border bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Date cont</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input value={draft.firstName} onChange={(event) => updateDraft('firstName', event.target.value)} placeholder="Prenume" />
                <Input value={draft.lastName} onChange={(event) => updateDraft('lastName', event.target.value)} placeholder="Nume" />
                <Input value={draft.email} disabled placeholder="Email" />
                <Input value={draft.phoneNumber || ''} onChange={(event) => updateDraft('phoneNumber', event.target.value)} placeholder="Telefon optional" />
                <Input className="sm:col-span-2" value={draft.avatarUrl || ''} onChange={(event) => updateDraft('avatarUrl', event.target.value)} placeholder="URL poza/avatar" />
              </div>
            </section>

            <section className="rounded-lg border bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Date personale</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input className="sm:col-span-2" value={draft.address || ''} onChange={(event) => updateDraft('address', event.target.value)} placeholder="Adresa optionala" />
                <Input value={draft.country || ''} onChange={(event) => updateDraft('country', event.target.value)} placeholder="Tara optionala" />
                <Input value={draft.city || ''} onChange={(event) => updateDraft('city', event.target.value)} placeholder="Oras optional" />
                <Input type="date" value={draft.dateOfBirth || ''} onChange={(event) => updateDraft('dateOfBirth', event.target.value)} />
              </div>
            </section>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={saveProfile} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? 'Se salveaza...' : 'Salvare modificari'}</Button>
            <Button variant="outline" onClick={() => setDraft(profile)}><Undo2 className="mr-2 h-4 w-4" />Anulare modificari</Button>
          </div>
        </TabsContent>

        <TabsContent value="reservations" className="space-y-5">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-slate-100">Rezervari active</h2>
            {reservationList(groupedReservations.active)}
          </section>
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-slate-100">Rezervari viitoare</h2>
            {reservationList(groupedReservations.upcoming)}
          </section>
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-slate-100">Istoric rezervari</h2>
            {reservationList(groupedReservations.history)}
          </section>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-lg border bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Schimbare parola</h2>
              <div className="space-y-4">
                <Input type="password" value={passwords.currentPassword} onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))} placeholder="Parola curenta" />
                <Input type="password" value={passwords.newPassword} onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))} placeholder="Parola noua" />
                <Button onClick={changePassword}>Schimba parola</Button>
              </div>
            </section>

            <section className="rounded-lg border bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-100">Ultimele conectari</h2>
              <div className="space-y-3">
                {logins.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-slate-400">Nu exista conectari salvate.</p>
                ) : logins.map((login) => (
                  <div key={login.id} className="rounded-md border p-3 text-sm dark:border-slate-700">
                    <p className="font-medium text-gray-800 dark:text-slate-100">{formatDateTime(login.loggedInAt)}</p>
                    <p className="text-gray-500 dark:text-slate-400">{login.ipAddress || 'IP necunoscut'}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-lg border border-red-200 bg-white p-5 dark:border-red-900/60 dark:bg-slate-900">
            <h2 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-300">Actiuni cont</h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-slate-300">Stergerea elimina contul din baza de date. Pentru conturi operationale cu audit de check-in/check-out, sistemul poate bloca stergerea.</p>
            <Button variant="destructive" onClick={deleteAccount}><Trash2 className="mr-2 h-4 w-4" />Sterge contul</Button>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};
