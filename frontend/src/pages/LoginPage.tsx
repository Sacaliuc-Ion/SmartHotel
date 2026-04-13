import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Hotel, KeyRound, Sparkles } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { users, type UserRole } from '../data/mockData';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const STORAGE_KEY = 'smart-hotel-registered-accounts';
const DEMO_PASSWORD = 'hotel123';

type AuthAccount = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

const builtInAccounts: AuthAccount[] = users.map((user) => ({
  ...user,
  password: DEMO_PASSWORD,
}));

const normalizeValue = (value: string) => value.trim().toLowerCase();

const getLoginAlias = (email: string) => normalizeValue(email).split('@')[0];

const buildEmailFromLogin = (loginValue: string) => {
  const normalizedLogin = normalizeValue(loginValue);
  return normalizedLogin.includes('@') ? normalizedLogin : `${normalizedLogin}@guest.smarthotel.local`;
};

const buildNameFromLogin = (loginValue: string) => {
  const baseValue = loginValue.split('@')[0].replace(/[._-]+/g, ' ').trim();
  if (!baseValue) return 'Client';

  return baseValue
    .split(/\s+/)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
};

const readStoredAccounts = (): AuthAccount[] => {
  if (typeof window === 'undefined') return [];

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) return [];

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

const saveStoredAccounts = (accounts: AuthAccount[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
};

const matchesLogin = (account: AuthAccount, loginValue: string) => {
  const normalizedLogin = normalizeValue(loginValue);
  return normalizeValue(account.email) === normalizedLogin || getLoginAlias(account.email) === normalizedLogin;
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState('login');
  const [storedAccounts, setStoredAccounts] = useState<AuthAccount[]>(() => readStoredAccounts());
  const [loginValue, setLoginValue] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerValue, setRegisterValue] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const availableAccounts = useMemo(
    () => [...builtInAccounts, ...storedAccounts],
    [storedAccounts]
  );

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!loginValue.trim() || !loginPassword.trim()) {
      toast.error('Completeaza login-ul si parola.');
      return;
    }

    const matchedAccount = availableAccounts.find((account) => matchesLogin(account, loginValue));

    if (!matchedAccount) {
      toast.error('Nu exista un cont pentru acest login.');
      return;
    }

    if (matchedAccount.password !== loginPassword) {
      toast.error('Parola introdusa nu este corecta.');
      return;
    }

    login({
      id: matchedAccount.id,
      name: matchedAccount.name,
      email: matchedAccount.email,
      role: matchedAccount.role,
    });

    toast.success(`Bine ai revenit, ${matchedAccount.name}!`);
    navigate('/');
  };

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!registerValue.trim() || !registerPassword.trim() || !confirmPassword.trim()) {
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

    const normalizedEmail = buildEmailFromLogin(registerValue);
    const normalizedAlias = getLoginAlias(normalizedEmail);
    const alreadyExists = availableAccounts.some((account) => {
      const accountEmail = normalizeValue(account.email);
      const accountAlias = getLoginAlias(account.email);
      return accountEmail === normalizedEmail || accountAlias === normalizedAlias;
    });

    if (alreadyExists) {
      toast.error('Acest login este deja folosit.');
      return;
    }

    const newAccount: AuthAccount = {
      id: `USR-${Date.now()}`,
      name: buildNameFromLogin(registerValue),
      email: normalizedEmail,
      password: registerPassword,
      role: 'client',
    };

    const nextStoredAccounts = [...storedAccounts, newAccount];
    setStoredAccounts(nextStoredAccounts);
    saveStoredAccounts(nextStoredAccounts);

    login({
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      role: newAccount.role,
    });

    toast.success('Cont creat cu succes. Ai fost autentificat ca client.');
    navigate('/');
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8"
      style={{
        background:
          'linear-gradient(135deg, var(--hp-gold-pale) 0%, #fff8ee 52%, var(--hp-cream) 100%)',
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
              background:
                'linear-gradient(160deg, rgba(15, 27, 53, 0.98) 0%, rgba(26, 45, 82, 0.95) 56%, rgba(200, 151, 58, 0.88) 100%)',
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
                Smart Hotel reuneste intr-un singur loc rezervarile, camerele, operatiunile zilnice si
                fluxurile esentiale ale echipei, intr-o aplicatie moderna gandita pentru organizare si
                control mai bun.
              </p>
            </div>

            <div className="relative z-10 grid gap-4">
              <div className="rounded-3xl border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-3 text-white">
                  <KeyRound className="h-5 w-5" />
                  <p className="font-medium">Rezervari si camere</p>
                </div>
                <p className="text-sm leading-6 text-white/72">
                  Ofera o imagine clara asupra camerelor disponibile, rezervarilor active si serviciilor
                  pregatite pentru oaspeti.
                </p>
              </div>

              <div className="rounded-3xl border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-3 text-white">
                  <Sparkles className="h-5 w-5" />
                  <p className="font-medium">Operatiuni hoteliere</p>
                </div>
                <p className="text-sm leading-6 text-white/72">
                  Receptia, housekeeping-ul, mentenanta si administrarea pot lucra coordonat din acelasi
                  sistem, cu acces rapid la informatiile importante.
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
                    Acceseaza platforma Smart Hotel si continua gestionarea rezervarilor, camerelor si
                    operatiunilor hoteliere.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-5">
                  <TabsList
                    className="grid h-auto w-full grid-cols-2 rounded-2xl p-1.5"
                    style={{ backgroundColor: 'rgba(245, 230, 204, 0.95)' }}
                  >
                    <TabsTrigger
                      value="login"
                      className="rounded-xl py-2.5 text-sm font-semibold data-[state=active]:shadow-none"
                      style={{ color: 'var(--hp-text)' }}
                    >
                      Autentificare
                    </TabsTrigger>
                    <TabsTrigger
                      value="register"
                      className="rounded-xl py-2.5 text-sm font-semibold data-[state=active]:shadow-none"
                      style={{ color: 'var(--hp-text)' }}
                    >
                      Inregistrare
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="mt-0">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium" style={{ color: 'var(--hp-text)' }}>
                          Login
                        </label>
                        <Input
                          type="text"
                          placeholder="ex: guest@example.com sau guest"
                          value={loginValue}
                          onChange={(event) => setLoginValue(event.target.value)}
                          autoComplete="username"
                          className="h-11 border-[#ead7b6] bg-white/90"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium" style={{ color: 'var(--hp-text)' }}>
                          Parola
                        </label>
                        <Input
                          type="password"
                          placeholder="Introdu parola"
                          value={loginPassword}
                          onChange={(event) => setLoginPassword(event.target.value)}
                          autoComplete="current-password"
                          className="h-11 border-[#ead7b6] bg-white/90"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="h-11 w-full rounded-xl text-sm font-semibold"
                        style={{
                          background: 'linear-gradient(135deg, var(--hp-gold) 0%, var(--hp-gold-light) 100%)',
                          color: 'var(--hp-navy)',
                        }}
                      >
                        Intra in cont
                      </Button>
                    </form>

                    <div
                      className="mt-5 rounded-2xl border p-4 text-sm leading-6"
                      style={{
                        borderColor: 'rgba(200, 151, 58, 0.25)',
                        backgroundColor: 'rgba(245, 230, 204, 0.65)',
                        color: 'var(--hp-text)',
                      }}
                    >
                      Introdu datele contului tau pentru a continua catre platforma.
                    </div>
                  </TabsContent>

                  <TabsContent value="register" className="mt-0">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium" style={{ color: 'var(--hp-text)' }}>
                          Login
                        </label>
                        <Input
                          type="text"
                          placeholder="ex: maria.popescu sau maria@example.com"
                          value={registerValue}
                          onChange={(event) => setRegisterValue(event.target.value)}
                          autoComplete="username"
                          className="h-11 border-[#ead7b6] bg-white/90"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium" style={{ color: 'var(--hp-text)' }}>
                          Parola
                        </label>
                        <Input
                          type="password"
                          placeholder="Minim 6 caractere"
                          value={registerPassword}
                          onChange={(event) => setRegisterPassword(event.target.value)}
                          autoComplete="new-password"
                          className="h-11 border-[#ead7b6] bg-white/90"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium" style={{ color: 'var(--hp-text)' }}>
                          Confirma parola
                        </label>
                        <Input
                          type="password"
                          placeholder="Reintrodu parola"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          autoComplete="new-password"
                          className="h-11 border-[#ead7b6] bg-white/90"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="h-11 w-full rounded-xl text-sm font-semibold"
                        style={{
                          background: 'linear-gradient(135deg, var(--hp-gold) 0%, var(--hp-gold-light) 100%)',
                          color: 'var(--hp-navy)',
                        }}
                      >
                        Creeaza cont
                      </Button>
                    </form>

                    <div
                      className="mt-5 rounded-2xl border p-4 text-sm leading-6"
                      style={{
                        borderColor: 'rgba(200, 151, 58, 0.25)',
                        backgroundColor: 'rgba(245, 230, 204, 0.65)',
                        color: 'var(--hp-text)',
                      }}
                    >
                      Completeaza campurile de mai sus pentru a crea rapid un cont nou.
                    </div>
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
