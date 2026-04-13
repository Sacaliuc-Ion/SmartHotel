import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import {
  DoorOpen,
  Calendar,
  Sparkles,
  Wrench,
  BarChart3,
  Settings,
  Building,
  ArrowRight,
  Star,
  Wifi,
  Coffee,
  Car,
} from 'lucide-react';

import Herro from '../assets/home/HeroIMG.jpg';
import Lobby from '../assets/home/LobbyIMG.jpg';
import Pool from '../assets//home/PoolIMG.jpg';

/* ─── tiny intersection-observer hook for scroll-in animations ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('hp-revealed');
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const roleActions = {
    reception: [
      { label: 'Front Desk', description: 'Manage check-ins, check-outs & reservations', path: '/front-desk', icon: DoorOpen, color: 'from-sky-500 to-blue-600' },
      { label: 'Room Board', description: 'Live overview of all room statuses', path: '/room-board', icon: Calendar, color: 'from-violet-500 to-purple-600' },
    ],
    housekeeping: [
      { label: 'Housekeeping', description: 'Track and manage room cleaning tasks', path: '/housekeeping', icon: Sparkles, color: 'from-emerald-500 to-teal-600' },
    ],
    maintenance: [
      { label: 'Maintenance', description: 'View and resolve maintenance tickets', path: '/maintenance', icon: Wrench, color: 'from-orange-500 to-amber-600' },
    ],
    admin: [
      { label: 'Dashboard', description: 'Analytics, KPIs and hotel overview', path: '/dashboard', icon: BarChart3, color: 'from-blue-500 to-indigo-600' },
      { label: 'Admin Settings', description: 'Manage users, rooms and settings', path: '/admin', icon: Settings, color: 'from-slate-500 to-gray-700' },
      { label: 'Front Desk', description: 'Manage check-ins, check-outs & reservations', path: '/front-desk', icon: DoorOpen, color: 'from-sky-500 to-blue-600' },
      { label: 'Room Board', description: 'Live overview of all room statuses', path: '/room-board', icon: Calendar, color: 'from-violet-500 to-purple-600' },
    ],
    manager: [
      { label: 'Dashboard', description: 'Analytics, KPIs and hotel overview', path: '/dashboard', icon: BarChart3, color: 'from-blue-500 to-indigo-600' },
      { label: 'Front Desk', description: 'Manage check-ins, check-outs & reservations', path: '/front-desk', icon: DoorOpen, color: 'from-sky-500 to-blue-600' },
      { label: 'Room Board', description: 'Live overview of all room statuses', path: '/room-board', icon: Calendar, color: 'from-violet-500 to-purple-600' },
    ],
    client: [
      { label: 'Browse Rooms', description: 'Explore our selection of luxury rooms', path: '/rooms', icon: Building, color: 'from-blue-500 to-indigo-600' },
    ],
  };

  const actions = user ? roleActions[user.role as keyof typeof roleActions] || [] : roleActions.client;

  const amenities = [
    { icon: Wifi, label: 'Free Wi-Fi' },
    { icon: Coffee, label: 'Breakfast' },
    { icon: Car, label: 'Valet Parking' },
    { icon: Sparkles, label: 'Spa & Pool' },
  ];

  const stats = [
    { value: '120+', label: 'Rooms & Suites' },
    { value: '4.9', label: 'Guest Rating' },
    { value: '24/7', label: 'Concierge' },
    { value: '15+', label: 'Years of Excellence' },
  ];

  const aboutRef  = useReveal();
  const whyRef    = useReveal();
  const ctaRef    = useReveal();
  const actionsRef = useReveal();

  return (
    <div className="min-h-full hp-bg overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative h-[calc(100vh-4rem)] min-h-[520px] flex items-end overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center hp-hero-img"
          style={{ backgroundImage: `url(${Herro})` }}
        />
        {/* Layered gradient overlay — deep navy at bottom */}
        <div className="absolute inset-0 hp-hero-overlay" />

        {/* Floating particle orbs (pure CSS, decorative) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <span className="hp-orb hp-orb-1" />
          <span className="hp-orb hp-orb-2" />
          <span className="hp-orb hp-orb-3" />
        </div>

        {/* Amenity badges – top right */}
        <div className="absolute top-8 right-8 hidden md:flex gap-2">
          {amenities.map(({ icon: Icon, label }, i) => (
            <div
              key={label}
              className="hp-badge"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </div>
          ))}
        </div>

        {/* Hero copy */}
        <div className="relative z-10 w-full px-8 md:px-16 pb-24">
          <div className="max-w-3xl hp-hero-copy">
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 hp-star"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
              <span className="text-white/80 text-sm ml-1">5-Star Luxury Hotel</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight tracking-tight">
              {user ? `Welcome back,` : 'Experience True'}<br />
              <span className="hp-accent-text">
                {user ? user.name.split(' ')[0] : 'Luxury'}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 mb-5 max-w-xl leading-relaxed">
              {user
                ? `You're logged in as ${user.role}. Access your tools below and make today exceptional.`
                : 'Where every detail is crafted for your comfort. Discover our rooms, exceptional dining, and world-class amenities.'}
            </p>

            {!user ? (
              <div className="flex flex-wrap gap-4 mb-1">
                <button
                  onClick={() => navigate('/rooms')}
                  className="hp-btn-primary flex items-center gap-2"
                >
                  Explore Rooms
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white px-8 py-3.5 rounded-xl font-medium transition-all"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {actions.slice(0, 2).map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.path}
                      onClick={() => navigate(action.path)}
                      className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all text-sm"
                    >
                      <Icon className="h-4 w-4" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 hp-stats-bar">
          <div className="max-w-6xl mx-auto px-8 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-white hp-stat-value">{value}</p>
                <p className="text-xs text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUICK ACTIONS (logged-in) ─────────────────────── */}
      {user && (
        <section className="max-w-6xl mx-auto px-8 py-16">
          <div ref={actionsRef} className="hp-reveal">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold hp-section-title">Quick Actions</h2>
                <p className="hp-section-sub mt-1">Jump straight to your most-used modules</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {actions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className="hp-action-card group relative overflow-hidden rounded-2xl border text-left p-6"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    {/* gradient stripe */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${action.color}`} />
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.color} mb-4 shadow-md`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold hp-card-title mb-1 group-hover:text-amber-600 transition-colors">
                      {action.label}
                    </h3>
                    <p className="text-sm hp-card-sub leading-relaxed">{action.description}</p>
                    <div className="mt-4 flex items-center text-amber-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Open <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURES (guest / not logged in) ─────────────── */}
      {!user && (
        <>
          {/* Gallery strip */}
          <section className="max-w-6xl mx-auto px-8 py-16">
            <div ref={aboutRef} className="hp-reveal grid md:grid-cols-2 gap-6 items-center">
              <div>
                <span className="hp-label">About the hotel</span>
                <h2 className="text-4xl font-bold hp-section-title mt-2 mb-4 leading-snug">
                  A sanctuary of <br />
                  <span className="hp-accent-text">elegance & comfort</span>
                </h2>
                <p className="hp-section-sub leading-relaxed mb-6">
                  Nestled in the heart of the city, Grand Hotel blends timeless architecture with
                  modern luxury. Every room is thoughtfully designed to make your stay unforgettable —
                  from the plush bedding to the panoramic city views.
                </p>
                <button
                  onClick={() => navigate('/rooms')}
                  className="hp-btn-primary inline-flex items-center gap-2 text-sm"
                >
                  View Our Rooms
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <img
                  src={Lobby}
                  alt="Hotel lobby"
                  className="rounded-2xl object-cover h-48 w-full shadow-md hp-img"
                />
                <img
                  src={Pool}
                  alt="Hotel pool"
                  className="rounded-2xl object-cover h-48 w-full shadow-md mt-6 hp-img"
                />
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="hp-why-section border-y py-16">
            <div className="max-w-6xl mx-auto px-8">
              <div ref={whyRef} className="hp-reveal">
                <div className="text-center mb-12">
                  <span className="hp-label">Why Us</span>
                  <h2 className="text-4xl font-bold hp-section-title mt-2">Crafted for excellence</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { icon: Building, title: 'Luxury Rooms', desc: 'From cozy doubles to sprawling penthouse suites, every space is meticulously appointed for your comfort.', color: 'hp-why-icon-navy' },
                    { icon: Sparkles, title: 'Pristine Service', desc: 'Our housekeeping and maintenance teams work around the clock to ensure every detail is perfect.', color: 'hp-why-icon-gold' },
                    { icon: DoorOpen, title: 'Seamless Check-in', desc: 'Arrive and relax — our front desk team makes arrivals and departures effortless.', color: 'hp-why-icon-rose' },
                  ].map(({ icon: Icon, title, desc, color }, i) => (
                    <div key={title} className="text-center group hp-why-card" style={{ animationDelay: `${i * 0.12}s` }}>
                      <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-xl font-semibold hp-card-title mb-3">{title}</h3>
                      <p className="hp-card-sub leading-relaxed text-sm">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA banner */}
          <section
            className="relative py-24 bg-cover bg-center"
            style={{ backgroundImage: `url(${Herro})` }}
          >
            <div className="absolute inset-0 hp-cta-overlay" />
            <div ref={ctaRef} className="hp-reveal relative text-center text-white max-w-2xl mx-auto px-8">
              <h2 className="text-4xl font-bold mb-4">Ready to book your stay?</h2>
              <p className="hp-cta-sub mb-8 leading-relaxed">
                Sign in to view availability, make a reservation, and manage your bookings from anywhere.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="hp-btn-cta inline-flex items-center gap-2"
              >
                Sign In to Book
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
