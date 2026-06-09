import type { Room } from '../context/HotelContext';
import spa1 from '../assets/Spa/spa1.jpg';
import spa2 from '../assets/Spa/spa2.jpg';
import spa3 from '../assets/Spa/spa3.jpg';
import spa4 from '../assets/Spa/spa4.jpg';

type Translate = (key: string, options?: Record<string, unknown>) => string;

export type SpaExperience = {
  image: string;
  imageAlt: string;
  accent: string;
  packageName: string;
  tagline: string;
  accessLabel: string;
  durationLabel: string;
  ritualTitle: string;
  highlights: string[];
  journey: string[];
  note: string;
};

export const getSpaExperience = (room: Room, t: Translate): SpaExperience => {
  const roomTypeLabel = t(`roomType.${room.type}`, { defaultValue: room.type });

  switch (room.type) {
    case 'suite':
      return {
        image: spa3,
        imageAlt: `${roomTypeLabel} spa lounge`,
        accent: 'from-stone-900 via-amber-900 to-amber-700',
        packageName: 'Suite Private Spa',
        tagline: `${roomTypeLabel} beneficiaza de un ritual SPA privat cu jacuzzi, zona lounge si timp extins pentru relaxare.`,
        accessLabel: 'Acces inclus: zona privata SPA + jacuzzi',
        durationLabel: 'Durata recomandata: pana la 120 minute',
        ritualTitle: 'Experienta exclusiva pentru suite',
        highlights: [
          'jacuzzi privat cu zona de relaxare rezervata',
          'prosoape premium, halat si selectie de ceaiuri',
          'prioritate la intervalele de seara si la cererile speciale',
        ],
        journey: [
          'Incepi cu 20 de minute in jacuzzi pentru detensionare completa.',
          'Continui cu timp liber in lounge si hidratare in zona de relaxare.',
          'Inchei cu acces extins pentru o experienta lenta, fara graba.',
        ],
        note: 'Recomandat pentru sejururi romantice, aniversari sau oaspeti care cauta intimitate maxima.',
      };
    case 'deluxe':
      return {
        image: spa1,
        imageAlt: `${roomTypeLabel} premium spa terrace`,
        accent: 'from-amber-950 via-stone-900 to-emerald-900',
        packageName: 'Deluxe Serenity Ritual',
        tagline: `${roomTypeLabel} include o experienta SPA premium cu lounge elegant, ambient calm si acces extins la zona umeda.`,
        accessLabel: 'Acces inclus: lounge premium + zona umeda',
        durationLabel: 'Durata recomandata: 90 minute',
        ritualTitle: 'Relaxare premium pentru camere deluxe',
        highlights: [
          'sezlonguri premium intr-o zona linistita',
          'acces extins la piscina interioara si coltul de relaxare',
          'atmosfera eleganta, potrivita pentru un sejur mai rafinat',
        ],
        journey: [
          'Incepi cu timp liber in zona umeda pentru acomodare si relaxare.',
          'Treci in lounge pentru o pauza lunga cu ceai sau apa infuzata.',
          'Revii in zona SPA pentru finalul ritualului, intr-un ritm calm.',
        ],
        note: 'Se potriveste foarte bine oaspetilor care aleg confort superior si vor o experienta mai luxoasa fara rezervare suplimentara.',
      };
    case 'double':
      return {
        image: spa2,
        imageAlt: `${roomTypeLabel} warm pool spa`,
        accent: 'from-amber-900 via-orange-800 to-stone-700',
        packageName: 'Double Couple Retreat',
        tagline: `${roomTypeLabel} include o experienta SPA calda si echilibrata, gandita pentru doua persoane.`,
        accessLabel: 'Acces inclus: piscina interioara + zona de relaxare',
        durationLabel: 'Durata recomandata: 75 minute',
        ritualTitle: 'Moment de relaxare in doi',
        highlights: [
          'piscina interioara cu ambient cald si iluminare soft',
          'seating confortabil pentru pauze intre sesiunile SPA',
          'ritm relaxat, potrivit pentru cupluri sau escapade de weekend',
        ],
        journey: [
          'Incepi cu 15 minute de acomodare in zona de apa.',
          'Urmeaza o pauza de relaxare in doi, cu bauturi nealcoolice.',
          'Inchei cu o ultima sesiune in piscina si timp liber la sezlong.',
        ],
        note: 'Este alegerea cea mai naturala pentru o rezervare dubla si creeaza un plus de valoare fara a complica fluxul de booking.',
      };
    case 'single':
    default:
      return {
        image: spa4,
        imageAlt: `${roomTypeLabel} hydro spa`,
        accent: 'from-slate-900 via-cyan-900 to-stone-700',
        packageName: 'Single Reset Access',
        tagline: `${roomTypeLabel} include acces la hidroterapie, relaxare rapida si o experienta de reincarcare dupa drum sau dupa o zi lunga.`,
        accessLabel: 'Acces inclus: hidro-pool + zona calm',
        durationLabel: 'Durata recomandata: 45-60 minute',
        ritualTitle: 'Relaxare eficienta pentru sejururi solo',
        highlights: [
          'hidro-pool usor de accesat pentru recuperare si detensionare',
          'spatiu compact, linistit si usor de integrat in program',
          'ideal pentru business travel sau sejururi scurte',
        ],
        journey: [
          'Incepi cu 10 minute de acomodare in apa calda.',
          'Continui cu o pauza scurta in zona de relaxare pentru reset mental.',
          'Inchei cu o ultima sesiune de hidroterapie inainte de a reveni in camera.',
        ],
        note: 'Accesul este gandit ca un bonus usor de folosit, nu ca un program complex, ceea ce il face potrivit pentru o camera single.',
      };
  }
};
