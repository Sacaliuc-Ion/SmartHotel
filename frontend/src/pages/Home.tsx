import { useNavigate } from 'react-router-dom';
import {
  Building,
  ArrowRight,
  Star,
  Wifi,
  Coffee,
  Car,
  Sparkles,
  DoorOpen,
} from 'lucide-react';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1766164027844-fe28a6993029?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGV4dGVyaW9yJTIwbmlnaHQlMjBsaWdodHN8ZW58MXx8fHwxNzcyNDAwNTI2fDA&ixlib=rb-4.1.0&q=80&w=1080';
const LOBBY_IMAGE = 'https://images.unsplash.com/photo-1768419089481-05d1a68208a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGxvYmJ5JTIwZWxlZ2FudCUyMGludGVyaW9yJTIwY2hhbmRlbGllcnxlbnwxfHx8fDE3NzI0MDA1Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080';
const POOL_IMAGE = 'https://images.unsplash.com/photo-1758448756167-88dc934c58e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHBvb2wlMjB0ZXJyYWNlJTIwc3Vuc2V0JTIwdmlld3xlbnwxfHx8fDE3NzI0MDA1Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080';

export const HomePage = () => {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-full bg-gray-50">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative h-[calc(100vh-4rem)] min-h-[520px] flex items-end">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        {/* Amenity badges – top right */}
        <div className="absolute top-8 right-8 hidden md:flex gap-2">
          {amenities.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs px-3 py-1.5 rounded-full"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </div>
          ))}
        </div>

        {/* Hero copy */}
        <div className="relative z-10 w-full px-8 md:px-16 pb-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-white/80 text-sm ml-1">5-Star Luxury Hotel</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight tracking-tight">
              Experience True<br />
              <span className="text-blue-300">Luxury</span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl leading-relaxed">
              Where every detail is crafted for your comfort. Discover our rooms, exceptional dining, and world-class amenities.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/rooms')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-900/30"
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
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20">
          <div className="max-w-6xl mx-auto px-8 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────── */}
      {/* Gallery strip */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">About the hotel</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4 leading-snug">
              A sanctuary of <br />
              <span className="text-blue-600">elegance & comfort</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Nestled in the heart of the city, Grand Hotel blends timeless architecture with
              modern luxury. Every room is thoughtfully designed to make your stay unforgettable —
              from the plush bedding to the panoramic city views.
            </p>
            <button
              onClick={() => navigate('/rooms')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all text-sm shadow-md"
            >
              View Our Rooms
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <img
              src={LOBBY_IMAGE}
              alt="Hotel lobby"
              className="rounded-2xl object-cover h-48 w-full shadow-md"
            />
            <img
              src={POOL_IMAGE}
              alt="Hotel pool"
              className="rounded-2xl object-cover h-48 w-full shadow-md mt-6"
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white border-y py-16">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Why Us</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">Crafted for excellence</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Building, title: 'Luxury Rooms', desc: 'From cozy doubles to sprawling penthouse suites, every space is meticulously appointed for your comfort.' },
              { icon: Sparkles, title: 'Pristine Service', desc: 'Our housekeeping and maintenance teams work around the clock to ensure every detail is perfect.' },
              { icon: DoorOpen, title: 'Seamless Check-in', desc: 'Arrive and relax — our front desk team makes arrivals and departures effortless.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center group">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <Icon className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section
        className="relative py-24 bg-cover bg-center"
        style={{ backgroundImage: `url(${LOBBY_IMAGE})` }}
      >
        <div className="absolute inset-0 bg-blue-900/75" />
        <div className="relative text-center text-white max-w-2xl mx-auto px-8">
          <h2 className="text-4xl font-bold mb-4">Ready to book your stay?</h2>
          <p className="text-blue-200 mb-8 leading-relaxed">
            Sign in to view availability, make a reservation, and manage your bookings from anywhere.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold transition-all shadow-xl text-base"
          >
            Sign In to Book
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
};
