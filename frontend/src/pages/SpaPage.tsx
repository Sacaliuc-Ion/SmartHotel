import { ArrowLeft, Check, Clock3, Flower2, Sparkles, Waves } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useHotel } from '../context/HotelContext';
import { useTranslation } from 'react-i18next';
import { getSpaExperience } from '../utils/spaExperience';

const spaIcons = [Waves, Flower2, Sparkles];

export const SpaPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { rooms } = useHotel();
  const { t } = useTranslation();
  const room = rooms.find((entry) => String(entry.id) === id);

  if (!room) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="mb-4 text-lg text-gray-500 dark:text-slate-400">{t('roomNotFound')}</p>
        <Button onClick={() => navigate('/rooms')}>{t('backToRooms')}</Button>
      </div>
    );
  }

  const experience = getSpaExperience(room, t);
  const roomTypeLabel = t(`roomType.${room.type}`, { defaultValue: room.type });

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.12),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.02),_rgba(15,23,42,0.08))] px-4 pb-6">
      <Button variant="ghost" onClick={() => navigate(`/rooms/${room.id}`)} className="mb-4 mt-1">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('backToRooms')}
      </Button>

      <section className="overflow-hidden rounded-[28px] border border-white/50 bg-white shadow-xl shadow-amber-950/10 dark:border-slate-700 dark:bg-slate-900">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[320px]">
            <img src={experience.image} alt={experience.imageAlt} className="h-full w-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-br ${experience.accent} opacity-55`} />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <Badge className="mb-3 bg-white/15 text-white backdrop-blur-sm">
                Spa inclus pentru camera selectata
              </Badge>
              <h1 className="max-w-xl text-3xl font-bold md:text-4xl">{experience.packageName}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 md:text-base">
                {experience.tagline}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between p-6 md:p-8">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-600">Smart Spa</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {roomTypeLabel} • {t('room')} {room.number}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Pagina asta functioneaza bine ca o extensie a camerei alese: arata clar ce beneficii SPA sunt incluse pentru acest tip de camera, fara checkout separat si fara sa incarce fluxul de rezervare.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Acces</p>
                  <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">{experience.accessLabel}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Durata</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                    <Clock3 className="h-4 w-4 text-amber-600" />
                    {experience.durationLabel}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => navigate(`/rooms/${room.id}`)}>Revino la camera</Button>
              <Button variant="outline" onClick={() => navigate('/rooms')}>Vezi alte camere</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Ce include pentru aceasta camera</h3>
          <div className="mt-5 grid gap-3">
            {experience.highlights.map((item, index) => {
              const Icon = spaIcons[index] || Sparkles;

              return (
                <div
                  key={`${room.id}-spa-highlight-${index}`}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/50"
                >
                  <div className="rounded-xl bg-amber-100 p-2 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{item}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{experience.ritualTitle}</h3>
          <div className="mt-5 space-y-4">
            {experience.journey.map((step, index) => (
              <div key={`${room.id}-spa-step-${index}`} className="flex gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-amber-600">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              <div>
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Fara sistem de plata</p>
                <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
                  Accesul este prezentat ca beneficiu inclus al camerei. Daca vreti mai tarziu, putem adauga doar un buton de interes sau o solicitare la receptie, fara checkout online.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">{experience.note}</p>
        </div>
      </section>
    </div>
  );
};
