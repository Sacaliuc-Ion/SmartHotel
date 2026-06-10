import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, CalendarRange, CheckCircle2, Clock3, Dumbbell, MapPin, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import GymHero from '../assets/gym/gym-hero.png';
import GymWeights from '../assets/gym/gym-weights.png';
import GymRecovery from '../assets/gym/gym-recovery.png';

interface GymAccessInfo {
  isAuthenticated: boolean;
  hasAccess: boolean;
  hasUpcomingReservation: boolean;
  accessMode: string;
  reservationId?: number | null;
  roomNumber?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
}

const formatStayDate = (value?: string | null, locale?: string) => {
  if (!value) return '';

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const formatted = new Intl.DateTimeFormat(locale || 'en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parsed);

  if (locale === 'ru') {
    return formatted.replace(/\sг\.$/, ' года');
  }

  return formatted;
};

export const GymPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gymAccess, setGymAccess] = useState<GymAccessInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadGymAccess = async () => {
      try {
        const data = await api.get<GymAccessInfo>('/reservations/gym-access');
        if (isMounted) {
          setGymAccess(data);
        }
      } catch {
        if (isMounted) {
          setGymAccess(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadGymAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  const equipmentItems = [
    t('gymEquipmentCardio'),
    t('gymEquipmentStrength'),
    t('gymEquipmentFreeWeights'),
    t('gymEquipmentRecovery'),
  ];

  const ruleItems = [
    t('gymRuleAccess'),
    t('gymRuleTowel'),
    t('gymRuleSafety'),
    t('gymRuleHours'),
  ];

  const accessVariant = isLoading
    ? 'loading'
    : gymAccess?.hasAccess
      ? 'active'
      : gymAccess?.hasUpcomingReservation
        ? 'upcoming'
        : gymAccess?.isAuthenticated
          ? 'guestOnly'
          : 'signin';

  const accessCopy = {
    loading: {
      title: t('gymAccessLoadingTitle'),
      description: t('gymAccessLoadingDescription'),
      accent: 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
    },
    active: {
      title: t('gymAccessActiveTitle'),
      description: t('gymAccessActiveDescription'),
      accent: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200',
    },
    upcoming: {
      title: t('gymAccessUpcomingTitle'),
      description: t('gymAccessUpcomingDescription'),
      accent: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100',
    },
    guestOnly: {
      title: t('gymAccessGuestOnlyTitle'),
      description: t('gymAccessGuestOnlyDescription'),
      accent: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/35 dark:text-sky-100',
    },
    signin: {
      title: t('gymAccessSignInTitle'),
      description: t('gymAccessSignInDescription'),
      accent: 'border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/60 dark:bg-violet-950/35 dark:text-violet-100',
    },
  }[accessVariant];

  const stayDetails = gymAccess?.hasAccess
    ? t('gymAccessActiveStay', {
      room: gymAccess.roomNumber,
      checkOut: formatStayDate(gymAccess.checkOut, i18n.language),
    })
    : gymAccess?.hasUpcomingReservation
      ? t('gymAccessUpcomingStay', {
        room: gymAccess.roomNumber,
        checkIn: formatStayDate(gymAccess.checkIn, i18n.language),
      })
      : null;

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,_#f6f2ea_0%,_#edf2ec_100%)] pb-10 dark:bg-[linear-gradient(180deg,_#020617_0%,_#0b1120_100%)]">
      <section className="mx-auto max-w-6xl px-4 pt-8 md:px-8 md:pt-12">
        <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.10)] dark:border-slate-800 dark:bg-slate-950">
          <div className="relative">
            <img
              src={GymHero}
              alt="Luxury hotel gym interior"
              className="h-[320px] w-full object-cover md:h-[460px]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.12)_0%,rgba(15,23,42,0.42)_48%,rgba(15,23,42,0.86)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                <Dumbbell className="h-3.5 w-3.5" />
                {t('gymIncludedBadge')}
              </div>

              <div className="mt-5 max-w-3xl">
                <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl md:leading-[1.02]">
                  {t('gymTitle')}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/84 md:text-lg">
                  {t('gymSubtitle')}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/rooms')}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white/90"
                >
                  {t('gymPrimaryCta')}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate(user ? '/profile' : '/login')}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                >
                  {user ? t('gymSecondaryCtaProfile') : t('gymSecondaryCtaLogin')}
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 border-t border-slate-200 bg-white px-6 py-5 sm:grid-cols-3 md:px-8 dark:border-slate-800 dark:bg-slate-950">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <Clock3 className="mb-3 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('gymHoursLabel')}</p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{t('gymHoursValue')}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <MapPin className="mb-3 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('gymLocationLabel')}</p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{t('gymLocationValue')}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <ShieldCheck className="mb-3 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('gymAccessLabel')}</p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{t('gymAccessValue')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-6xl px-4 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <div className={`rounded-[1.75rem] border p-5 shadow-sm ${accessCopy.accent}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">{t('gymAccessCardEyebrow')}</p>
                <h2 className="mt-2 text-xl font-bold md:text-2xl">{accessCopy.title}</h2>
              </div>
              <CheckCircle2 className="h-7 w-7 shrink-0" />
            </div>

            <p className="mt-3 text-sm leading-6 opacity-90">{accessCopy.description}</p>

            {stayDetails && (
              <div className="mt-4 rounded-2xl border border-current/15 bg-white/70 p-4 text-sm font-medium dark:bg-slate-950/25">
                {stayDetails}
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-current/15 bg-white/50 px-4 py-3 text-sm dark:bg-slate-950/25">
              <CalendarRange className="h-4 w-4 shrink-0" />
              <span>{t('gymAccessModeIncluded')}</span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <figure className="overflow-hidden rounded-[1.75rem] border border-black/5 bg-white shadow-[0_22px_50px_rgba(15,23,42,0.07)] dark:border-slate-800 dark:bg-slate-950">
              <img
                src={GymWeights}
                alt="Strength area inside the hotel gym"
                className="h-72 w-full object-cover"
              />
              <figcaption className="px-5 py-4">
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{t('gymZoneStrengthTitle')}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('gymZoneStrengthDescription')}</p>
              </figcaption>
            </figure>

            <figure className="overflow-hidden rounded-[1.75rem] border border-black/5 bg-white shadow-[0_22px_50px_rgba(15,23,42,0.07)] dark:border-slate-800 dark:bg-slate-950">
              <img
                src={GymRecovery}
                alt="Recovery and stretching area inside the hotel gym"
                className="h-72 w-full object-cover"
              />
              <figcaption className="px-5 py-4">
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{t('gymZoneRecoveryTitle')}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('gymZoneRecoveryDescription')}</p>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-6xl px-4 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('gymEquipmentTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('gymEquipmentSubtitle')}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {equipmentItems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('gymRulesTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('gymRulesSubtitle')}</p>
            <div className="mt-6 space-y-3">
              {ruleItems.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
