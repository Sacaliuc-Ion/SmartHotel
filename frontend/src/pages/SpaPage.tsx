import { useEffect, useState } from 'react';
import { ArrowRight, CalendarRange, CheckCircle2, Clock3, Flower2, MapPin, ShieldCheck, Sparkles, Waves } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import SpaHero from '../assets/Spa/spa1.jpg';
import SpaPool from '../assets/Spa/spa2.jpg';
import SpaLounge from '../assets/Spa/spa3.jpg';

const spaIcons = [Waves, Flower2, Sparkles];

interface SpaAccessInfo {
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
    return formatted.replace(/\sÐ³\.$/, ' Ð³Ð¾Ð´Ð°');
  }

  return formatted;
};

export const SpaPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [spaAccess, setSpaAccess] = useState<SpaAccessInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSpaAccess = async () => {
      try {
        const data = await api.get<SpaAccessInfo>('/reservations/spa-access');
        if (isMounted) {
          setSpaAccess(data);
        }
      } catch {
        if (isMounted) {
          setSpaAccess(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSpaAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  const benefitItems = [
    t('spaBenefitHydro'),
    t('spaBenefitSauna'),
    t('spaBenefitLounge'),
    t('spaBenefitAtmosphere'),
  ];

  const ruleItems = [
    t('spaRuleAccess'),
    t('spaRuleSilence'),
    t('spaRuleSchedule'),
    t('spaRuleWellness'),
  ];

  const zones = [
    {
      image: SpaPool,
      title: t('spaZoneHydroTitle'),
      description: t('spaZoneHydroDescription'),
    },
    {
      image: SpaLounge,
      title: t('spaZoneSaunaTitle'),
      description: t('spaZoneSaunaDescription'),
    },
  ];

  const accessVariant = isLoading
    ? 'loading'
    : spaAccess?.hasAccess
      ? 'active'
      : spaAccess?.hasUpcomingReservation
        ? 'upcoming'
        : spaAccess?.isAuthenticated
          ? 'guestOnly'
          : 'signin';

  const accessCopy = {
    loading: {
      title: t('spaAccessLoadingTitle'),
      description: t('spaAccessLoadingDescription'),
      accent: 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
    },
    active: {
      title: t('spaAccessActiveTitle'),
      description: t('spaAccessActiveDescription'),
      accent: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200',
    },
    upcoming: {
      title: t('spaAccessUpcomingTitle'),
      description: t('spaAccessUpcomingDescription'),
      accent: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100',
    },
    guestOnly: {
      title: t('spaAccessGuestOnlyTitle'),
      description: t('spaAccessGuestOnlyDescription'),
      accent: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/35 dark:text-sky-100',
    },
    signin: {
      title: t('spaAccessSignInTitle'),
      description: t('spaAccessSignInDescription'),
      accent: 'border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/60 dark:bg-violet-950/35 dark:text-violet-100',
    },
  }[accessVariant];

  const stayDetails = spaAccess?.hasAccess
    ? t('spaAccessActiveStay', {
      room: spaAccess.roomNumber,
      checkOut: formatStayDate(spaAccess.checkOut, i18n.language),
    })
    : spaAccess?.hasUpcomingReservation
      ? t('spaAccessUpcomingStay', {
        room: spaAccess.roomNumber,
        checkIn: formatStayDate(spaAccess.checkIn, i18n.language),
      })
      : null;

  const primaryActionPath = spaAccess?.hasAccess || spaAccess?.hasUpcomingReservation ? '/profile' : '/rooms';
  const primaryActionLabel = spaAccess?.hasAccess || spaAccess?.hasUpcomingReservation
    ? t('spaSecondaryCtaProfile')
    : t('spaPrimaryCta');

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,_#eff6f7_0%,_#f8f2ea_100%)] pb-10 dark:bg-[linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]">
      <section className="mx-auto max-w-6xl px-4 pt-8 md:px-8 md:pt-12">
        <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.10)] dark:border-slate-800 dark:bg-slate-950">
          <div className="relative">
            <img
              src={SpaHero}
              alt={t('spaHeroAlt')}
              className="h-[320px] w-full object-cover md:h-[460px]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.16)_0%,rgba(15,23,42,0.44)_48%,rgba(15,23,42,0.86)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                <Waves className="h-3.5 w-3.5" />
                {t('spaIncludedBadge')}
              </div>

              <div className="mt-5 max-w-3xl">
                <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl md:leading-[1.02]">
                  {t('spaTitle')}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/84 md:text-lg">
                  {t('spaSubtitle')}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(primaryActionPath)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white/90"
                >
                  {primaryActionLabel}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate(user ? '/profile' : '/login')}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                >
                  {user ? t('spaSecondaryCtaProfile') : t('spaSecondaryCtaLogin')}
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 border-t border-slate-200 bg-white px-6 py-5 sm:grid-cols-3 md:px-8 dark:border-slate-800 dark:bg-slate-950">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <Clock3 className="mb-3 h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('spaHoursLabel')}</p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{t('spaHoursValue')}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <MapPin className="mb-3 h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('spaLocationLabel')}</p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{t('spaLocationValue')}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <ShieldCheck className="mb-3 h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('spaAccessLabel')}</p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{t('spaAccessValue')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-6xl px-4 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <div className={`rounded-[1.75rem] border p-5 shadow-sm ${accessCopy.accent}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">{t('spaAccessCardEyebrow')}</p>
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

            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-current/15 bg-white/60 px-4 py-3 text-sm dark:bg-slate-950/25">
              <CalendarRange className="h-4 w-4 shrink-0" />
              <span>{t('spaAccessModeIncluded')}</span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {zones.map((zone) => (
              <figure
                key={zone.title}
                className="overflow-hidden rounded-[1.75rem] border border-black/5 bg-white shadow-[0_22px_50px_rgba(15,23,42,0.07)] dark:border-slate-800 dark:bg-slate-950"
              >
                <img
                  src={zone.image}
                  alt={zone.title}
                  className="h-72 w-full object-cover"
                />
                <figcaption className="px-5 py-4">
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{zone.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{zone.description}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-6xl px-4 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('spaBenefitsTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('spaBenefitsSubtitle')}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {benefitItems.map((item, index) => {
                const Icon = spaIcons[index] || Sparkles;

                return (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <div className="mb-3 inline-flex rounded-xl bg-cyan-100 p-2 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p>{item}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('spaRulesTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('spaRulesSubtitle')}</p>
            <div className="mt-6 space-y-3">
              {ruleItems.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="flex items-start gap-3">
                <Flower2 className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{t('spaAccessLabel')}</p>
                  <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
                    {t('spaAccessModeIncluded')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
