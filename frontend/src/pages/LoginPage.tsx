import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Hotel, KeyRound, Sparkles } from 'lucide-react';
import { useAuth, User } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error('Completeaza email-ul si parola.');
      return;
    }

    try {
      const response = await api.post<{ token: string; user: User }>('/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });
      
      login(response.token, response.user);
      toast.success(`Bine ai revenit, ${response.user.name}!`);
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Eroare la autentificare.');
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!registerFirstName.trim() || !registerLastName.trim() || !registerEmail.trim() || !registerPassword.trim() || !confirmPassword.trim()) {
      toast.error('Completeaza toate campurile pentru inregistrare.');
      return;
    }

    if (registerPassword.length < 6) {
      toast.error('Parola trebuie sa aiba cel putin 6 caractere.');
      return;
    }

    if (registerPassword !== confirmPassword) {
      toast.error('Parolele nu coincid.');
      return;
    }

    try {
      const response = await api.post<{ token: string; user: User }>('/auth/register', {
        firstName: registerFirstName,
        lastName: registerLastName,
        email: registerEmail,
        password: registerPassword,
      });
      
      login(response.token, response.user);
      toast.success('Cont creat cu succes. Ai fost autentificat ca client.');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Eroare la inregistrare. Verifica datele introduse.');
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8"
      style={{
        background: 'linear-gradient(135deg, var(--hp-gold-pale) 0%, #fff8ee 52%, var(--hp-cream) 100%)',
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-16 top-10 h-56 w-56 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(200, 151, 58, 0.22)' }}
        />
        <div
          className="absolute bottom-8 right-0 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(15, 27, 53, 0.14)' }}
        />
        <div
          className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.55)' }}
        />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/70 bg-white/55 shadow-[0_28px_80px_rgba(15,27,53,0.14)] backdrop-blur-xl lg:grid-cols-[1.08fr_0.92fr]">
          <section
            className="relative hidden flex-col justify-between p-10 lg:flex"
            style={{
              background: 'linear-gradient(160deg, rgba(15, 27, 53, 0.98) 0%, rgba(26, 45, 82, 0.95) 56%, rgba(200, 151, 58, 0.88) 100%)',
            }}
          >
            <div className="absolute inset-0 opacity-30">
              <div className="absolute -right-8 top-10 h-40 w-40 rounded-full border border-white/30" />
              <div className="absolute left-10 top-24 h-20 w-20 rounded-full border border-white/20" />
              <div className="absolute bottom-10 left-14 h-28 w-28 rounded-full border border-white/15" />
            </div>

            <div className="relative z-10">
              <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
                <div className="rounded-full bg-white/15 p-2">
                  <Hotel className="h-4 w-4" />
                </div>
                Smart Hotel Platform
              </div>

              <h1 className="max-w-lg text-4xl font-semibold leading-tight text-white">
                Platforma digitala pentru administrarea completa a hotelului tau.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/75">
                Smart Hotel reuneste intr-un singur loc rezervarile, camerele, operatiunile zilnice si fluxurile esentiale ale echipei, intr-o aplicatie moderna gandita pentru organizare si control mai bun.
              </p>
            </div>

            <div className="relative z-10 grid gap-4">
              <div className="rounded-3xl border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-3 text-white">
                  <KeyRound className="h-5 w-5" />
                  <p className="font-medium">Rezervari si camere</p>
                </div>
                <p className="text-sm leading-6 text-white/72">
                  Ofera o imagine clara asupra camerelor disponibile, rezervarilor active si serviciilor pregatite pentru oaspeti.
                </p>
              </div>

              <div className="rounded-3xl border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-3 text-white">
                  <Sparkles className="h-5 w-5" />
                  <p className="font-medium">Operatiuni hoteliere</p>
                </div>
                <p className="text-sm leading-6 text-white/72">
                  Receptia, housekeeping-ul, mentenanta si administrarea pot lucra coordonat din acelasi sistem, cu acces rapid la informatiile importante.
                </p>
              </div>
            </div>
          </section>

          <section className="flex items-center p-5 sm:p-8 lg:p-10">
            <Card className="w-full border-white/70 bg-white/82 shadow-none">
              <CardHeader className="space-y-5 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/70 bg-white shadow-[0_14px_35px_rgba(200,151,58,0.18)]">
                  <Hotel className="h-8 w-8" style={{ color: 'var(--hp-gold)' }} />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-semibold" style={{ color: 'var(--hp-text)' }}>
                    Contul tau Smart Hotel
                  </CardTitle>
                  <CardDescription className="mx-auto max-w-md text-sm leading-6" style={{ color: 'var(--hp-muted)' }}>
                    Acceseaza platforma Smart Hotel si continua gestionarea rezervarilor, camerelor si operatiunilor hoteliere.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-5">
                  <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl p-1.5" style={{ backgroundColor: 'rgba(245, 230, 204, 0.95)' }}>
                    <TabsTrigger value="login" className="rounded-xl py-2.5 text-sm font-semibold data-[state=active]:shadow-none" style={{ color: 'var(--hp-text)' }}>
                      Autentificare
                    </TabsTrigger>
                    <TabsTrigger value="register" className="rounded-xl py-2.5 text-sm font-semibold data-[state=active]:shadow-none" style={{ color: 'var(--hp-text)' }}>
                      Inregistrare
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="mt-0">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium" style={{ color: 'var(--hp-text)' }}>Email</label>
                        <Input
                          type="email"
                          placeholder="ex: admin@smarthotel.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          autoComplete="email"
                          className="h-11 border-[#ead7b6] bg-white/90"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium" style={{ color: 'var(--hp-text)' }}>Parola</label>
                        <Input
                          type="password"
                          placeholder="Introdu parola"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          autoComplete="current-password"
                          className="h-11 border-[#ead7b6] bg-white/90"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="h-11 w-full rounded-xl text-sm font-semibold"
                        style={{ background: 'linear-gradient(135deg, var(--hp-gold) 0%, var(--hp-gold-light) 100%)', color: 'var(--hp-navy)' }}
                      >
                        Intra in cont
                      </Button>
                    </form>
                    <div className="mt-5 rounded-2xl border p-4 text-sm leading-6" style={{ borderColor: 'rgba(200, 151, 58, 0.25)', backgroundColor: 'rgba(245, 230, 204, 0.65)', color: 'var(--hp-text)' }}>
                      Introdu datele contului tau pentru a continua. Mod demonstrativ setat cu `admin@smarthotel.com` & `hotel123`.
                    </div>
                  </TabsContent>

                  <TabsContent value="register" className="mt-0">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium" style={{ color: 'var(--hp-text)' }}>Prenume</label>
                          <Input
                            type="text"
                            placeholder="ex: Maria"
                            value={registerFirstName}
                            onChange={(e) => setRegisterFirstName(e.target.value)}
                            className="h-11 border-[#ead7b6] bg-white/90"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium" style={{ color: 'var(--hp-text)' }}>Nume</label>
                          <Input
                            type="text"
                            placeholder="ex: Popescu"
                            value={registerLastName}
                            onChange={(e) => setRegisterLastName(e.target.value)}
                            className="h-11 border-[#ead7b6] bg-white/90"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium" style={{ color: 'var(--hp-text)' }}>Email</label>
                        <Input
                          type="email"
                          placeholder="maria@example.com"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          autoComplete="email"
                          className="h-11 border-[#ead7b6] bg-white/90"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium" style={{ color: 'var(--hp-text)' }}>Parola</label>
                        <Input
                          type="password"
                          placeholder="Minim 6 caractere"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          autoComplete="new-password"
                          className="h-11 border-[#ead7b6] bg-white/90"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium" style={{ color: 'var(--hp-text)' }}>Confirma parola</label>
                        <Input
                          type="password"
                          placeholder="Reintrodu parola"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                          className="h-11 border-[#ead7b6] bg-white/90"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="h-11 w-full rounded-xl text-sm font-semibold"
                        style={{ background: 'linear-gradient(135deg, var(--hp-gold) 0%, var(--hp-gold-light) 100%)', color: 'var(--hp-navy)' }}
                      >
                        Creeaza cont
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="mt-6 w-full text-center text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ color: 'var(--hp-muted)' }}
                >
                  Inapoi la pagina principala
                </button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};
