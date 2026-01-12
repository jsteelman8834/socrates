'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen, Compass, Feather, Eye, Key, Map, Wind, ArrowRight, Flame,
  Globe, Hourglass, Atom, Music, Anchor, Scale, Scroll, Sprout, Star,
  Sparkles, GraduationCap
} from 'lucide-react';

// --- Components ---

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
    <div className="text-amber-100 font-serif text-xl tracking-widest font-bold">
      STUDIO <span className="text-amber-500">of the</span> MIND
    </div>
    <div className="hidden md:flex space-x-8 text-sm font-mono text-slate-400">
      <a href="#philosophy" className="hover:text-amber-200 transition-colors">THE PHILOSOPHY</a>
      <a href="#curriculum" className="hover:text-amber-200 transition-colors">THE CURRICULUM</a>
      <a href="#about" className="hover:text-amber-200 transition-colors">FOR PARENTS</a>
    </div>
    <button className="px-6 py-2 text-xs font-mono tracking-widest text-slate-950 bg-amber-100 hover:bg-white transition-colors uppercase">
      Begin Journey
    </button>
  </nav>
);

const Astrolabe = () => {
  // Exterior Ring (5 Icons)
  const outerDisciplines = [
    { icon: BookOpen, color: "text-amber-400" },
    { icon: Globe, color: "text-emerald-400" },
    { icon: Hourglass, color: "text-sky-400" },
    { icon: Atom, color: "text-violet-400" },
    { icon: Music, color: "text-rose-400" },
  ];

  // Interior Ring (4 Icons)
  const innerDisciplines = [
    { icon: Anchor, color: "text-indigo-300" },
    { icon: Scale, color: "text-amber-200" },
    { icon: Scroll, color: "text-cyan-300" },
    { icon: Sprout, color: "text-lime-300" },
  ];

  return (
    <div className="relative w-80 h-80 md:w-[28rem] md:h-[28rem] mb-12 flex items-center justify-center">
      {/* Glow Effect behind */}
      <div className="absolute inset-0 bg-amber-500/5 blur-3xl rounded-full"></div>

      {/* Ring 1: Outer Scale (The World) */}
      <div className="absolute inset-0 animate-[spin_60s_linear_infinite]">
        <svg className="w-full h-full text-slate-800" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M50 1 V4 M50 96 V99 M1 50 H4 M96 50 H99" stroke="currentColor" strokeWidth="1" />
          {/* Ticks */}
          {[...Array(12)].map((_, i) => (
             <line
               key={i}
               x1="50" y1="4" x2="50" y2="7"
               stroke="currentColor"
               strokeWidth="0.5"
               transform={`rotate(${i * 30} 50 50)`}
             />
          ))}
        </svg>
      </div>

      {/* Ring 2: Middle Dashed + 5 Exterior Icons */}
      <div className="absolute inset-10 md:inset-14 animate-[spin_50s_linear_infinite_reverse]">
        <svg className="w-full h-full text-slate-700" viewBox="0 0 100 100">
          {/* r=49 leaves exactly 1 unit (2%) of space from the edge, matching top-[2%] */}
          <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        </svg>
        
        {/* Exterior Icons (5) */}
        {outerDisciplines.map((item, i) => (
           <div
             key={i}
             className="absolute top-0 left-1/2 h-1/2 w-0 origin-bottom"
             style={{ transform: `rotate(${i * (360 / 5)}deg)` }}
           >
             {/* Positioned at top 2% to align with r=49 circle */}
             <div className="absolute top-[2%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
               <div 
                 style={{ transform: `rotate(-${i * (360 / 5)}deg)` }}
                 className="bg-slate-950 border border-slate-800 p-2 rounded-full shadow-lg"
               >
                  <item.icon size={20} className={`${item.color} drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]`} />
               </div>
             </div>
           </div>
        ))}
      </div>

      {/* Ring 3: Inner Constellation + 4 Interior Icons */}
      <div className="absolute inset-24 md:inset-32 animate-[spin_30s_linear_infinite]">
        <svg className="w-full h-full text-slate-600" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="0.2" />
          <polygon points="50,15 85,85 15,85" fill="none" stroke="currentColor" strokeWidth="0.2" className="opacity-20" />
        </svg>

        {/* Interior Icons (4) */}
        {innerDisciplines.map((item, i) => (
           <div
             key={i}
             className="absolute top-0 left-1/2 h-1/2 w-0 origin-bottom"
             style={{ transform: `rotate(${i * (360 / 4)}deg)` }}
           >
              {/* Positioned at top 2% to align with r=49 circle */}
              <div className="absolute top-[2%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div 
                  style={{ transform: `rotate(-${i * (360 / 4)}deg)` }}
                  className="bg-slate-950 border border-slate-800 p-2 rounded-full shadow-lg"
                >
                  <item.icon size={18} className={`${item.color} drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]`} />
                </div>
              </div>
           </div>
        ))}
      </div>

      {/* Center: The Spark (Larger) */}
      <div className="relative z-10 flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-slate-950 border border-amber-900/30 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.2)]">
        <Flame size={44} className="text-amber-500 animate-pulse drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
      </div>
    </div>
  );
};

const Hero = () => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setOffset({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <header className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-950 pt-20">
      {/* Background Abstract Grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(251, 191, 36, 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
          transform: `translate(${offset.x * -1}px, ${offset.y * -1}px)`
        }}
      />

      {/* New Astrolabe Graphic */}
      <Astrolabe />

      <div className="relative z-10 text-center max-w-4xl px-4 space-y-6">
        <h1 className="font-serif text-5xl md:text-7xl text-amber-50 leading-tight">
          Education is not something you <span className="italic text-amber-500">have</span>.
          <br />
          It is something you <span className="italic text-amber-500">are</span>.
        </h1>
        <p className="font-mono text-slate-400 text-sm md:text-base tracking-wide max-w-2xl mx-auto leading-relaxed">
          For the curious 5th, 6th, and 7th grader. <br className="hidden md:block"/>
          A Socratic academy for the modern homeschool scholar.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12">
          <button className="group relative px-8 py-4 bg-transparent border border-slate-700 text-amber-100 font-mono text-sm tracking-widest hover:border-amber-500 hover:text-white transition-all overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">
              ENTER AS SCHOLAR <Wind size={16} />
            </span>
            <div className="absolute inset-0 bg-slate-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          </button>

          <button className="group relative px-8 py-4 bg-amber-900/20 border border-amber-900/50 text-amber-100 font-mono text-sm tracking-widest hover:bg-amber-900/40 hover:border-amber-500 transition-all">
            <span className="flex items-center gap-2">
              ENTER AS PARENT <Key size={16} />
            </span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 text-slate-600 font-mono text-xs animate-bounce">
        SCROLL TO EXPLORE
      </div>
    </header>
  );
};

const AnimatedFlame = () => (
  <div className="relative flex justify-center items-center mb-6">
    {/* Outer Glow */}
    <div className="absolute w-16 h-16 bg-amber-600/20 rounded-full blur-xl animate-pulse"></div>
    {/* Secondary Flickering Layer */}
    <div className="absolute animate-[pulse_3s_ease-in-out_infinite] opacity-60">
       <Flame size={36} className="text-amber-600" fill="currentColor" />
    </div>
    {/* Main Flame */}
    <div className="relative animate-[bounce_2s_ease-in-out_infinite]">
       <Flame size={32} className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" fill="currentColor" />
    </div>
  </div>
);

const QuoteSection = () => (
  <section className="py-24 bg-slate-950 border-t border-slate-900">
    <div className="max-w-3xl mx-auto px-6 text-center space-y-8">
      <AnimatedFlame />
      <blockquote className="font-serif text-2xl md:text-3xl text-slate-300 italic leading-relaxed">
        &ldquo;Education is the kindling of a flame, not the filling of a vessel.&rdquo;
      </blockquote>
      <cite className="block font-mono text-amber-500 text-sm tracking-widest not-italic">
        — SOCRATES
      </cite>
    </div>
  </section>
);

const PreviewSection = () => (
  <section className="py-24 bg-slate-900 border-y border-slate-800">
    <div className="max-w-6xl mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center gap-12">

        {/* Left: Ben Franklin Portrait */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative">
            {/* Animated glow ring */}
            <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-2xl animate-pulse" />

            {/* Portrait frame */}
            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full border-2 border-amber-900/50 overflow-hidden bg-slate-950 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
              {/* Placeholder - replace with actual portrait */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                <span className="text-6xl md:text-7xl">🎩</span>
              </div>
            </div>

            {/* Name badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-950 border border-amber-500/50 rounded-lg shadow-lg">
              <span className="font-mono text-amber-400 text-xs tracking-widest">
                BENJAMIN FRANKLIN
              </span>
            </div>
          </div>
        </div>

        {/* Right: Text and CTA */}
        <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-amber-500">
            <Sparkles size={20} />
            <span className="font-mono text-xs tracking-widest uppercase">Free Preview</span>
          </div>

          <h2 className="font-serif text-3xl md:text-4xl text-amber-50">
            Experience It Now
          </h2>

          <p className="font-mono text-slate-400 text-sm leading-relaxed">
            Take a 15-question journey through American History with Benjamin Franklin
            as your guide. Discover your learning style and see the Socratic method in action.
          </p>

          <div className="flex flex-col gap-4">
            <Link href="/preview/american-history">
              <button className="w-full md:w-auto px-8 py-4 bg-amber-600 text-white font-mono text-sm tracking-widest hover:bg-amber-500 transition-colors flex items-center justify-center gap-3 group">
                BEGIN PREVIEW
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <p className="font-mono text-slate-600 text-xs">
              No account required. Takes about 10 minutes.
            </p>
          </div>

          {/* Feature bullets */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-mono text-xs">15 Questions</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-mono text-xs">Progressive Difficulty</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <div className="w-2 h-2 rounded-full bg-sky-500" />
              <span className="font-mono text-xs">Instant Feedback</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <div className="w-2 h-2 rounded-full bg-violet-500" />
              <span className="font-mono text-xs">Learning Profile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

interface FeatureCardProps {
  icon: React.ComponentType<{ size?: number | string; strokeWidth?: number | string }>;
  title: string;
  desc: string;
}

const FeatureCard = ({ icon: Icon, title, desc }: FeatureCardProps) => (
  <div
    className="group relative p-8 border border-slate-800 bg-slate-900/30 hover:bg-slate-900/60 hover:border-amber-900/50 transition-all duration-500"
  >
    <div className="absolute top-4 right-4 text-slate-800 group-hover:text-amber-900/40 transition-colors">
      <Icon size={48} strokeWidth={1} />
    </div>
    <div className="relative z-10 space-y-4">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-950 border border-slate-800 group-hover:border-amber-500/50 group-hover:text-amber-500 text-slate-400 transition-all">
        <Icon size={20} />
      </div>
      <h3 className="font-serif text-2xl text-slate-100">{title}</h3>
      <p className="font-mono text-sm text-slate-400 leading-relaxed">
        {desc}
      </p>
    </div>
  </div>
);

const Pillars = () => (
  <section id="philosophy" className="py-24 bg-slate-950 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-16 md:flex md:items-end justify-between border-b border-slate-800 pb-8">
        <div>
          <h2 className="font-serif text-4xl text-amber-50 mb-2">Surviving the Wilderness</h2>
          <p className="font-mono text-slate-400 text-sm">Tools for the intellectual journey.</p>
        </div>
        <div className="hidden md:block text-slate-600 font-mono text-xs">
          EST. 2026
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon={Map}
          title="The Unfamiliar Map"
          desc="We explore stories and problems from cultures different from our own. By traveling these new roads, we find truths we didn't know we were missing."
        />
        <FeatureCard
          icon={Wind}
          title="The Mist of Confusion"
          desc="Confusion isn't a bad thing; it's just the start of learning. We don't rush to clear it. Instead, we give you the compass to navigate until the path becomes clear."
        />
        <FeatureCard
          icon={BookOpen}
          title="The Conversation"
          desc="Real learning isn't just downloading facts. It's an ongoing conversation. In our seminars, you learn to speak up, disagree with respect, and think for yourself."
        />
      </div>
    </div>
  </section>
);

const InteractiveMethod = () => {
  const [activeTab, setActiveTab] = useState('scholar');

  return (
    <section className="py-24 bg-slate-900 border-y border-slate-800">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row gap-12">

        {/* Left Side: Text Controller */}
        <div className="w-full md:w-1/2 space-y-8">
          <h2 className="font-serif text-4xl text-white">
            Two Paths to Autonomy.
          </h2>

          <div className="flex space-x-6 border-b border-slate-700 pb-4">
            <button
              onClick={() => setActiveTab('scholar')}
              className={`font-mono text-sm tracking-widest pb-4 -mb-4 transition-colors ${activeTab === 'scholar' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              FOR THE SCHOLAR
            </button>
            <button
              onClick={() => setActiveTab('parent')}
              className={`font-mono text-sm tracking-widest pb-4 -mb-4 transition-colors ${activeTab === 'parent' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              FOR THE PARENT
            </button>
          </div>

          <div className="min-h-[200px]">
            {activeTab === 'scholar' ? (
              <div className="space-y-4">
                <p className="text-slate-300 text-lg leading-relaxed">
                  &ldquo;The chief threat to your intellectual freedom is not illiteracy... it is the subtler mental violence that occurs when you wrench new messages into old ideas.&rdquo;
                </p>
                <p className="font-mono text-slate-500 text-sm">
                  — Wayne C. Booth
                </p>
                <div className="pt-4">
                  <h4 className="text-amber-100 font-bold mb-2">Your Mission:</h4>
                  <ul className="space-y-2 font-mono text-sm text-slate-400">
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-amber-500 rounded-full"></div> Question everything, even the textbook.</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-amber-500 rounded-full"></div> Debate with respect, not just reaction.</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-amber-500 rounded-full"></div> Become a poet of your own reality.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-300 text-lg leading-relaxed">
                  &ldquo;There is no instrumental reason to get an education... It won&apos;t get you anything you won&apos;t get anyway. It is better because it is better.&rdquo;
                </p>
                <p className="font-mono text-slate-500 text-sm">
                  — Andrew Abbott
                </p>
                <div className="pt-4">
                  <h4 className="text-amber-100 font-bold mb-2">Our Promise:</h4>
                  <ul className="space-y-2 font-mono text-sm text-slate-400">
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-amber-500 rounded-full"></div> Depth over breadth. No busy work.</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-amber-500 rounded-full"></div> Developing the &ldquo;habit of thoughtfulness.&rdquo;</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-amber-500 rounded-full"></div> A curriculum that respects your child&apos;s mind.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <button className="flex items-center gap-3 text-amber-500 hover:text-amber-400 hover:gap-4 transition-all font-mono text-sm">
            EXPLORE THE SYLLABUS <ArrowRight size={16} />
          </button>
        </div>

        {/* Right Side: Visual Metaphor */}
        <div className="w-full md:w-1/2 min-h-[400px] bg-slate-950 border border-slate-800 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

            {/* Interactive Circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className={`relative w-48 h-48 border-2 transition-all duration-1000 ${activeTab === 'scholar' ? 'border-amber-500 rounded-full rotate-0' : 'border-emerald-500 rounded-none rotate-45'}`}>
                    <div className={`absolute inset-0 border border-white/20 transition-all duration-1000 delay-100 ${activeTab === 'scholar' ? 'scale-75 rounded-full' : 'scale-50 rotate-45'}`}></div>
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${activeTab === 'scholar' ? 'opacity-100' : 'opacity-0'}`}>
                        <Eye className="text-amber-500" size={32} />
                    </div>
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${activeTab === 'parent' ? 'opacity-100' : 'opacity-0'}`}>
                        <Compass className="text-emerald-500" size={32} />
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 right-4 font-mono text-xs text-slate-600">
                FIG 1.2: {activeTab === 'scholar' ? 'THE PUPIL' : 'THE ARCHITECT'}
            </div>
        </div>

      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-slate-950 pt-24 pb-12 border-t border-slate-900 text-center">
    <div className="max-w-4xl mx-auto px-6 space-y-12">
      <h2 className="font-serif text-3xl md:text-5xl text-amber-100">
        Start the Conversation.
      </h2>
      <p className="font-mono text-slate-400 max-w-xl mx-auto">
        Join a cohort of like-minded families. Limited spots available for the upcoming term.
      </p>

      <div className="flex flex-col md:flex-row justify-center items-center gap-4">
        <input
          type="email"
          placeholder="parent@email.com"
          className="bg-slate-900 border border-slate-800 px-6 py-3 w-full md:w-80 text-slate-200 focus:outline-none focus:border-amber-500 font-mono text-sm"
        />
        <button className="bg-amber-600 text-white px-8 py-3 font-mono text-sm tracking-widest hover:bg-amber-500 transition-colors w-full md:w-auto">
          REQUEST PROSPECTUS
        </button>
      </div>

      <div className="pt-24 flex flex-col md:flex-row justify-between items-center text-slate-600 font-mono text-xs border-t border-slate-900 mt-12">
        <div className="flex gap-6 mb-4 md:mb-0">
          <a href="#" className="hover:text-amber-500 transition-colors">Curriculum</a>
          <a href="#" className="hover:text-amber-500 transition-colors">Tuition</a>
          <a href="#" className="hover:text-amber-500 transition-colors">Manifesto</a>
        </div>
        <div>
          &copy; 2026 Studio of the Mind. All Rights Reserved.
        </div>
      </div>
    </div>
  </footer>
);

export default function HomePage() {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 selection:bg-amber-500/30">
      <Navbar />
      <Hero />
      <QuoteSection />
      <PreviewSection />
      <Pillars />
      <InteractiveMethod />
      <Footer />
    </div>
  );
}
