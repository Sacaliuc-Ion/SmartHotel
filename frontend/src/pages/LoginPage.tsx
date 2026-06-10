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
import { PreferencesControls } from '../components/layout/PreferencesControls';
import { useTranslation } from 'react-i18next';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Register form state
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error(t('loginMissing'));
      return;
    }

    try {
      setIsLoggingIn(true);
      const response = await api.post<{ token: string; user: User }>('/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });
      
      login(response.token, response.user);
      toast.success(t('loginSuccess', { name: response.user.name }));
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || t('loginError'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!registerFirstName.trim() || !registerLastName.trim() || !registerEmail.trim() || !registerPassword.trim() || !confirmPassword.trim()) {
      toast.error(t('registerMissing'));
      return;
    }

    if (registerPassword.length < 6) {
      toast.error(t('passwordTooShort'));
      return;
    }

    if (registerPassword !== confirmPassword) {
      toast.error(t('passwordsMismatch'));
      return;
    }

    try {
      setIsRegistering(true);
      const response = await api.post<{ token: string; user: User }>('/auth/register', {
        firstName: registerFirstName,
        lastName: registerLastName,
        email: registerEmail,
        password: registerPassword,
      });
      
      login(response.token, response.user);
      toast.success(t('registerSuccess'));
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || t('registerError'));
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div
      className="login-shell relative min-h-svh overflow-x-hidden px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5"
    >
      <div className="absolute right-4 top-4 z-20">
        <PreferencesControls />
      </div>
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

      <div className="relative mx-auto flex min-h-[calc(100svh-1.5rem)] max-w-6xl items-center justify-center sm:min-h-[calc(100svh-2rem)] lg:min-h-[calc(100svh-2.5rem)]">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-white/70 bg-white/55 shadow-[0_24px_70px_rgba(15,27,53,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 lg:grid-cols-[1.08fr_0.92fr]">
          <section
            className="relative hidden flex-col justify-between p-5 lg:flex"
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
              <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
                <div className="rounded-full bg-white/15 p-2">
                  <Hotel className="h-4 w-4" />
                </div>
                {t('loginBadge')}
              </div>

              <h1 className="max-w-lg text-[2rem] font-semibold leading-tight text-white">
                {t('loginHeroTitle')}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
                {t('loginHeroDescription')}
              </p>
            </div>

            <div className="relative z-10 grid gap-2.5">
              <div className="rounded-2xl border border-white/12 bg-white/10 p-3.5 backdrop-blur-sm">
                <div className="mb-2 flex items-center gap-3 text-white">
                  <KeyRound className="h-4 w-4" />
                  <p className="font-medium">{t('loginFeatureReservationsTitle')}</p>
                </div>
                <p className="text-xs leading-5 text-white/72">
                  {t('loginFeatureReservationsDescription')}
                </p>
              </div>

              <div className="rounded-2xl border border-white/12 bg-white/10 p-3.5 backdrop-blur-sm">
                <div className="mb-2 flex items-center gap-3 text-white">
                  <Sparkles className="h-4 w-4" />
                  <p className="font-medium">{t('loginFeatureOperationsTitle')}</p>
                </div>
                <p className="text-xs leading-5 text-white/72">
                  {t('loginFeatureOperationsDescription')}
                </p>
              </div>
            </div>
          </section>

          <section className="flex items-center px-3 py-3 sm:px-7 sm:py-5 lg:px-10 lg:py-6">
            <Card className="w-full border-white/70 bg-white/82 shadow-none dark:border-white/10 dark:bg-slate-900/85">
              <CardHeader className="space-y-2.5 pb-3 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white shadow-[0_12px_28px_rgba(200,151,58,0.16)]">
                  <Hotel className="h-5 w-5" style={{ color: 'var(--hp-gold)' }} />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-[1.9rem] font-semibold leading-tight" style={{ color: 'var(--hp-text)' }}>
                    {t('loginCardTitle')}
                  </CardTitle>
                  <CardDescription className="mx-auto max-w-md text-xs leading-4.5" style={{ color: 'var(--hp-muted)' }}>
                    {t('loginCardDescription')}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-2.5">
                  <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl p-1" style={{ backgroundColor: 'var(--hp-gold-pale)' }}>
                    <TabsTrigger value="login" className="rounded-xl py-1.5 text-sm font-semibold data-[state=active]:shadow-none" style={{ color: 'var(--hp-text)' }}>
                      {t('loginTab')}
                    </TabsTrigger>
                    <TabsTrigger value="register" className="rounded-xl py-1.5 text-sm font-semibold data-[state=active]:shadow-none" style={{ color: 'var(--hp-text)' }}>
                      {t('registerTab')}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="mt-0">
                    <form onSubmit={handleLogin} className="space-y-2.5">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium" style={{ color: 'var(--hp-text)' }}>{t('email')}</label>
                        <Input
                          type="email"
                          placeholder={t('loginEmailPlaceholder')}
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          autoComplete="email"
                          className="h-9 border-[#ead7b6] bg-white/90 dark:border-white/10 dark:bg-slate-950/70"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium" style={{ color: 'var(--hp-text)' }}>{t('password')}</label>
                        <Input
                          type="password"
                          placeholder={t('loginPasswordPlaceholder')}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          autoComplete="current-password"
                          className="h-9 border-[#ead7b6] bg-white/90 dark:border-white/10 dark:bg-slate-950/70"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoggingIn || isRegistering}
                        className="h-9 w-full rounded-xl text-sm font-semibold"
                        style={{ background: 'linear-gradient(135deg, var(--hp-gold) 0%, var(--hp-gold-light) 100%)', color: 'var(--hp-navy)' }}
                      >
                        {isLoggingIn ? t('loginLoading') : t('loginButton')}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register" className="mt-0">
                    <form onSubmit={handleRegister} className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="block text-sm font-medium" style={{ color: 'var(--hp-text)' }}>{t('firstName')}</label>
                          <Input
                            type="text"
                            placeholder={t('registerFirstNamePlaceholder')}
                            value={registerFirstName}
                            onChange={(e) => setRegisterFirstName(e.target.value)}
                            className="h-9 border-[#ead7b6] bg-white/90 dark:border-white/10 dark:bg-slate-950/70"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-sm font-medium" style={{ color: 'var(--hp-text)' }}>{t('lastName')}</label>
                          <Input
                            type="text"
                            placeholder={t('registerLastNamePlaceholder')}
                            value={registerLastName}
                            onChange={(e) => setRegisterLastName(e.target.value)}
                            className="h-9 border-[#ead7b6] bg-white/90 dark:border-white/10 dark:bg-slate-950/70"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium" style={{ color: 'var(--hp-text)' }}>{t('email')}</label>
                        <Input
                          type="email"
                          placeholder={t('registerEmailPlaceholder')}
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          autoComplete="email"
                          className="h-9 border-[#ead7b6] bg-white/90 dark:border-white/10 dark:bg-slate-950/70"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium" style={{ color: 'var(--hp-text)' }}>{t('password')}</label>
                        <Input
                          type="password"
                          placeholder={t('registerPasswordPlaceholder')}
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          autoComplete="new-password"
                          className="h-9 border-[#ead7b6] bg-white/90 dark:border-white/10 dark:bg-slate-950/70"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium" style={{ color: 'var(--hp-text)' }}>{t('confirmPassword')}</label>
                        <Input
                          type="password"
                          placeholder={t('confirmPasswordPlaceholder')}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                          className="h-9 border-[#ead7b6] bg-white/90 dark:border-white/10 dark:bg-slate-950/70"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isRegistering || isLoggingIn}
                        className="h-9 w-full rounded-xl text-sm font-semibold"
                        style={{ background: 'linear-gradient(135deg, var(--hp-gold) 0%, var(--hp-gold-light) 100%)', color: 'var(--hp-navy)' }}
                      >
                        {isRegistering ? t('registerLoading') : t('registerButton')}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="mt-3 w-full text-center text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ color: 'var(--hp-muted)' }}
                >
                  {t('backHome')}
                </button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};
