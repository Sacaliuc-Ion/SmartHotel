import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type Language = 'ro' | 'en' | 'ru';
export type ThemeMode = 'light' | 'dark';

type TranslationValue = string | ((params?: Record<string, string>) => string);

const translations = {
  ro: {
    languageLabel: 'Limba',
    themeLabel: 'Tema',
    lightMode: 'Mod luminos',
    darkMode: 'Mod intunecat',
    signIn: 'Autentificare',
    logout: 'Deconectare',
    toggleSidebar: 'Comuta meniul',
    navHome: 'Acasa',
    navRooms: 'Camere',
    navFrontDesk: 'Receptie',
    navRoomBoard: 'Panou camere',
    navHousekeeping: 'Housekeeping',
    navMaintenance: 'Mentenanta',
    navDashboard: 'Dashboard',
    navAdmin: 'Admin',
    loginBadge: 'Platforma Smart Hotel',
    loginHeroTitle: 'Platforma digitala pentru administrarea completa a hotelului tau.',
    loginHeroDescription:
      'Smart Hotel reuneste intr-un singur loc rezervarile, camerele, operatiunile zilnice si fluxurile esentiale ale echipei, intr-o aplicatie moderna gandita pentru organizare si control mai bun.',
    loginFeatureReservationsTitle: 'Rezervari si camere',
    loginFeatureReservationsDescription:
      'Ofera o imagine clara asupra camerelor disponibile, rezervarilor active si serviciilor pregatite pentru oaspeti.',
    loginFeatureOperationsTitle: 'Operatiuni hoteliere',
    loginFeatureOperationsDescription:
      'Receptia, housekeeping-ul, mentenanta si administrarea pot lucra coordonat din acelasi sistem, cu acces rapid la informatiile importante.',
    loginCardTitle: 'Contul tau Smart Hotel',
    loginCardDescription:
      'Acceseaza platforma Smart Hotel si continua gestionarea rezervarilor, camerelor si operatiunilor hoteliere.',
    loginTab: 'Autentificare',
    registerTab: 'Inregistrare',
    email: 'Email',
    password: 'Parola',
    firstName: 'Prenume',
    lastName: 'Nume',
    confirmPassword: 'Confirma parola',
    loginEmailPlaceholder: 'ex: admin@smarthotel.com',
    loginPasswordPlaceholder: 'Introdu parola',
    registerFirstNamePlaceholder: 'ex: Maria',
    registerLastNamePlaceholder: 'ex: Popescu',
    registerEmailPlaceholder: 'maria@example.com',
    registerPasswordPlaceholder: 'Minim 6 caractere',
    confirmPasswordPlaceholder: 'Reintrodu parola',
    loginButton: 'Intra in cont',
    loginLoading: 'Se autentifica...',
    registerButton: 'Creeaza cont',
    registerLoading: 'Se creeaza contul...',
    backHome: 'Inapoi la pagina principala',
    loginMissing: 'Completeaza email-ul si parola.',
    registerMissing: 'Completeaza toate campurile pentru inregistrare.',
    passwordTooShort: 'Parola trebuie sa aiba cel putin 6 caractere.',
    passwordsMismatch: 'Parolele nu coincid.',
    loginSuccess: ({ name } = {}) => `Bine ai revenit, ${name ?? ''}!`,
    loginError: 'Eroare la autentificare.',
    registerSuccess: 'Cont creat cu succes. Ai fost autentificat ca client.',
    registerError: 'Eroare la inregistrare. Verifica datele introduse.',
    homeRating: 'hotel de lux de 5 stele',
    homeWelcome: 'Bine ai revenit,',
    homeGuestPrefix: 'Traieste',
    homeGuestAccent: 'Luxul',
    homeLoggedDescription: ({ role } = {}) =>
      `Esti autentificat ca ${role ?? ''}. Acceseaza instrumentele tale si fa ziua de azi mai buna.`,
    homeGuestDescription:
      'Fiecare detaliu este creat pentru confortul tau. Descopera camerele, experientele culinare si facilitatile noastre premium.',
    exploreRooms: 'Exploreaza camerele',
    quickActions: 'Actiuni rapide',
    quickActionsSub: 'Mergi direct la modulele folosite cel mai des',
    open: 'Deschide',
    aboutLabel: 'Despre hotel',
    aboutTitleA: 'Un refugiu de',
    aboutTitleB: 'eleganta si confort',
    aboutDescription:
      'Asezat in inima orasului, Grand Hotel imbina arhitectura atemporala cu luxul modern. Fiecare camera este gandita pentru un sejur memorabil, de la lenjeria premium pana la privelistile panoramice.',
    viewRooms: 'Vezi camerele',
    whyLabel: 'De ce noi',
    whyTitle: 'Creat pentru excelenta',
    ctaTitle: 'Gata sa iti rezervi sejurul?',
    ctaDescription: 'Autentifica-te pentru a vedea disponibilitatea, a face o rezervare si a gestiona rezervarile de oriunde.',
    ctaButton: 'Autentifica-te pentru rezervare',
    amenityWifi: 'Wi-Fi gratuit',
    amenityBreakfast: 'Mic dejun',
    amenityParking: 'Parcare valet',
    amenitySpa: 'Spa si piscina',
    statRooms: 'Camere si suite',
    statRating: 'Rating oaspeti',
    statConcierge: 'Concierge',
    statYears: 'Ani de excelenta',
    actionFrontDeskDesc: 'Gestioneaza check-in, check-out si rezervari',
    actionRoomBoardDesc: 'Privire live asupra statusului tuturor camerelor',
    actionHousekeepingDesc: 'Urmareste si gestioneaza sarcinile de curatenie',
    actionMaintenanceDesc: 'Vezi si rezolva tichetele de mentenanta',
    actionDashboardDesc: 'Analitice, KPI-uri si overview hotel',
    actionAdminDesc: 'Gestioneaza utilizatori, camere si setari',
    actionBrowseRoomsDesc: 'Exploreaza selectia noastra de camere premium',
    whyLuxuryTitle: 'Camere luxoase',
    whyLuxuryDesc: 'De la camere duble confortabile la suite generoase, fiecare spatiu este amenajat pentru confortul tau.',
    whyServiceTitle: 'Servicii impecabile',
    whyServiceDesc: 'Echipele de housekeeping si mentenanta lucreaza continuu pentru ca fiecare detaliu sa fie perfect.',
    whyCheckinTitle: 'Check-in fara efort',
    whyCheckinDesc: 'Sosesti si te relaxezi: receptia face ca sosirile si plecarile sa fie simple.',
  },
  en: {
    languageLabel: 'Language',
    themeLabel: 'Theme',
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    signIn: 'Sign in',
    logout: 'Logout',
    toggleSidebar: 'Toggle sidebar',
    navHome: 'Home',
    navRooms: 'Rooms',
    navFrontDesk: 'Front desk',
    navRoomBoard: 'Room board',
    navHousekeeping: 'Housekeeping',
    navMaintenance: 'Maintenance',
    navDashboard: 'Dashboard',
    navAdmin: 'Admin',
    loginBadge: 'Smart Hotel Platform',
    loginHeroTitle: 'A digital platform for complete hotel management.',
    loginHeroDescription:
      'Smart Hotel brings reservations, rooms, daily operations and essential team workflows into one modern application built for better organization and control.',
    loginFeatureReservationsTitle: 'Reservations and rooms',
    loginFeatureReservationsDescription:
      'Get a clear view of available rooms, active reservations and guest-ready services.',
    loginFeatureOperationsTitle: 'Hotel operations',
    loginFeatureOperationsDescription:
      'Reception, housekeeping, maintenance and administration can work together in the same system with quick access to important information.',
    loginCardTitle: 'Your Smart Hotel account',
    loginCardDescription:
      'Access Smart Hotel and keep managing reservations, rooms and hotel operations.',
    loginTab: 'Sign in',
    registerTab: 'Register',
    email: 'Email',
    password: 'Password',
    firstName: 'First name',
    lastName: 'Last name',
    confirmPassword: 'Confirm password',
    loginEmailPlaceholder: 'e.g. admin@smarthotel.com',
    loginPasswordPlaceholder: 'Enter password',
    registerFirstNamePlaceholder: 'e.g. Maria',
    registerLastNamePlaceholder: 'e.g. Smith',
    registerEmailPlaceholder: 'maria@example.com',
    registerPasswordPlaceholder: 'At least 6 characters',
    confirmPasswordPlaceholder: 'Re-enter password',
    loginButton: 'Enter account',
    loginLoading: 'Signing in...',
    registerButton: 'Create account',
    registerLoading: 'Creating account...',
    backHome: 'Back to homepage',
    loginMissing: 'Enter your email and password.',
    registerMissing: 'Complete all registration fields.',
    passwordTooShort: 'Password must contain at least 6 characters.',
    passwordsMismatch: 'Passwords do not match.',
    loginSuccess: ({ name } = {}) => `Welcome back, ${name ?? ''}!`,
    loginError: 'Authentication failed.',
    registerSuccess: 'Account created successfully. You are signed in as a client.',
    registerError: 'Registration failed. Check the entered data.',
    homeRating: '5-star luxury hotel',
    homeWelcome: 'Welcome back,',
    homeGuestPrefix: 'Experience True',
    homeGuestAccent: 'Luxury',
    homeLoggedDescription: ({ role } = {}) =>
      `You're logged in as ${role ?? ''}. Access your tools below and make today exceptional.`,
    homeGuestDescription:
      'Where every detail is crafted for your comfort. Discover our rooms, exceptional dining, and world-class amenities.',
    exploreRooms: 'Explore rooms',
    quickActions: 'Quick actions',
    quickActionsSub: 'Jump straight to your most-used modules',
    open: 'Open',
    aboutLabel: 'About the hotel',
    aboutTitleA: 'A sanctuary of',
    aboutTitleB: 'elegance & comfort',
    aboutDescription:
      'Nestled in the heart of the city, Grand Hotel blends timeless architecture with modern luxury. Every room is thoughtfully designed to make your stay unforgettable, from the plush bedding to the panoramic city views.',
    viewRooms: 'View our rooms',
    whyLabel: 'Why us',
    whyTitle: 'Crafted for excellence',
    ctaTitle: 'Ready to book your stay?',
    ctaDescription: 'Sign in to view availability, make a reservation, and manage your bookings from anywhere.',
    ctaButton: 'Sign in to book',
    amenityWifi: 'Free Wi-Fi',
    amenityBreakfast: 'Breakfast',
    amenityParking: 'Valet Parking',
    amenitySpa: 'Spa & Pool',
    statRooms: 'Rooms & Suites',
    statRating: 'Guest Rating',
    statConcierge: 'Concierge',
    statYears: 'Years of Excellence',
    actionFrontDeskDesc: 'Manage check-ins, check-outs and reservations',
    actionRoomBoardDesc: 'Live overview of all room statuses',
    actionHousekeepingDesc: 'Track and manage room cleaning tasks',
    actionMaintenanceDesc: 'View and resolve maintenance tickets',
    actionDashboardDesc: 'Analytics, KPIs and hotel overview',
    actionAdminDesc: 'Manage users, rooms and settings',
    actionBrowseRoomsDesc: 'Explore our selection of luxury rooms',
    whyLuxuryTitle: 'Luxury rooms',
    whyLuxuryDesc: 'From cozy doubles to sprawling suites, every space is meticulously appointed for your comfort.',
    whyServiceTitle: 'Pristine service',
    whyServiceDesc: 'Our housekeeping and maintenance teams work around the clock to ensure every detail is perfect.',
    whyCheckinTitle: 'Seamless check-in',
    whyCheckinDesc: 'Arrive and relax: our front desk team makes arrivals and departures effortless.',
  },
  ru: {
    languageLabel: 'Язык',
    themeLabel: 'Тема',
    lightMode: 'Светлая тема',
    darkMode: 'Темная тема',
    signIn: 'Войти',
    logout: 'Выйти',
    toggleSidebar: 'Переключить меню',
    navHome: 'Главная',
    navRooms: 'Номера',
    navFrontDesk: 'Ресепшен',
    navRoomBoard: 'Панель номеров',
    navHousekeeping: 'Хаускипинг',
    navMaintenance: 'Обслуживание',
    navDashboard: 'Дашборд',
    navAdmin: 'Админ',
    loginBadge: 'Платформа Smart Hotel',
    loginHeroTitle: 'Цифровая платформа для полного управления отелем.',
    loginHeroDescription:
      'Smart Hotel объединяет бронирования, номера, ежедневные операции и ключевые процессы команды в одном современном приложении.',
    loginFeatureReservationsTitle: 'Бронирования и номера',
    loginFeatureReservationsDescription:
      'Получайте понятную картину доступных номеров, активных бронирований и услуг для гостей.',
    loginFeatureOperationsTitle: 'Операции отеля',
    loginFeatureOperationsDescription:
      'Ресепшен, хаускипинг, обслуживание и администрация работают в одной системе с быстрым доступом к важной информации.',
    loginCardTitle: 'Ваш аккаунт Smart Hotel',
    loginCardDescription:
      'Войдите в Smart Hotel и продолжайте управлять бронированиями, номерами и операциями отеля.',
    loginTab: 'Вход',
    registerTab: 'Регистрация',
    email: 'Email',
    password: 'Пароль',
    firstName: 'Имя',
    lastName: 'Фамилия',
    confirmPassword: 'Подтвердите пароль',
    loginEmailPlaceholder: 'например: admin@smarthotel.com',
    loginPasswordPlaceholder: 'Введите пароль',
    registerFirstNamePlaceholder: 'например: Мария',
    registerLastNamePlaceholder: 'например: Иванова',
    registerEmailPlaceholder: 'maria@example.com',
    registerPasswordPlaceholder: 'Минимум 6 символов',
    confirmPasswordPlaceholder: 'Введите пароль еще раз',
    loginButton: 'Войти в аккаунт',
    loginLoading: 'Выполняется вход...',
    registerButton: 'Создать аккаунт',
    registerLoading: 'Создаем аккаунт...',
    backHome: 'Назад на главную',
    loginMissing: 'Введите email и пароль.',
    registerMissing: 'Заполните все поля регистрации.',
    passwordTooShort: 'Пароль должен содержать минимум 6 символов.',
    passwordsMismatch: 'Пароли не совпадают.',
    loginSuccess: ({ name } = {}) => `С возвращением, ${name ?? ''}!`,
    loginError: 'Ошибка входа.',
    registerSuccess: 'Аккаунт успешно создан. Вы вошли как клиент.',
    registerError: 'Ошибка регистрации. Проверьте введенные данные.',
    homeRating: '5-звездочный люкс-отель',
    homeWelcome: 'С возвращением,',
    homeGuestPrefix: 'Ощутите настоящий',
    homeGuestAccent: 'люкс',
    homeLoggedDescription: ({ role } = {}) =>
      `Вы вошли как ${role ?? ''}. Откройте свои инструменты и сделайте день успешным.`,
    homeGuestDescription:
      'Каждая деталь создана для вашего комфорта. Откройте для себя наши номера, изысканную кухню и удобства мирового уровня.',
    exploreRooms: 'Смотреть номера',
    quickActions: 'Быстрые действия',
    quickActionsSub: 'Переходите сразу к самым нужным модулям',
    open: 'Открыть',
    aboutLabel: 'Об отеле',
    aboutTitleA: 'Пространство',
    aboutTitleB: 'элегантности и комфорта',
    aboutDescription:
      'Grand Hotel в центре города сочетает вечную архитектуру и современную роскошь. Каждый номер продуман для незабываемого пребывания, от мягкого белья до панорамных видов.',
    viewRooms: 'Посмотреть номера',
    whyLabel: 'Почему мы',
    whyTitle: 'Создано для превосходства',
    ctaTitle: 'Готовы забронировать проживание?',
    ctaDescription: 'Войдите, чтобы увидеть доступность, сделать бронирование и управлять им из любого места.',
    ctaButton: 'Войти для бронирования',
    amenityWifi: 'Бесплатный Wi-Fi',
    amenityBreakfast: 'Завтрак',
    amenityParking: 'Валет-парковка',
    amenitySpa: 'Спа и бассейн',
    statRooms: 'Номера и люксы',
    statRating: 'Рейтинг гостей',
    statConcierge: 'Консьерж',
    statYears: 'Лет превосходства',
    actionFrontDeskDesc: 'Управляйте заселениями, выездами и бронированиями',
    actionRoomBoardDesc: 'Живой обзор статусов всех номеров',
    actionHousekeepingDesc: 'Отслеживайте и управляйте уборкой номеров',
    actionMaintenanceDesc: 'Просматривайте и закрывайте заявки обслуживания',
    actionDashboardDesc: 'Аналитика, KPI и обзор отеля',
    actionAdminDesc: 'Управляйте пользователями, номерами и настройками',
    actionBrowseRoomsDesc: 'Изучите подборку наших премиальных номеров',
    whyLuxuryTitle: 'Роскошные номера',
    whyLuxuryDesc: 'От уютных двухместных номеров до просторных люксов, каждое пространство создано для вашего комфорта.',
    whyServiceTitle: 'Безупречный сервис',
    whyServiceDesc: 'Команды хаускипинга и обслуживания работают постоянно, чтобы каждая деталь была идеальной.',
    whyCheckinTitle: 'Легкий check-in',
    whyCheckinDesc: 'Приезжайте и отдыхайте: ресепшен делает прибытие и выезд простыми.',
  },
} satisfies Record<Language, Record<string, TranslationValue>>;

export type TranslationKey = keyof typeof translations.ro;

interface PreferencesContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

const getStoredLanguage = (): Language => {
  const stored = localStorage.getItem('smart-hotel-language');
  return stored === 'en' || stored === 'ru' || stored === 'ro' ? stored : 'ro';
};

const getStoredTheme = (): ThemeMode => {
  const stored = localStorage.getItem('smart-hotel-theme');
  return stored === 'dark' || stored === 'light' ? stored : 'light';
};

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);
  const [theme, setThemeState] = useState<ThemeMode>(getStoredTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('smart-hotel-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('smart-hotel-language', language);
  }, [language]);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      language,
      setLanguage: setLanguageState,
      theme,
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((current) => (current === 'dark' ? 'light' : 'dark')),
      t: (key, params) => {
        const value = translations[language][key] ?? translations.ro[key];
        return typeof value === 'function' ? value(params) : value;
      },
    }),
    [language, theme]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
};
