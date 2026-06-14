'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Waves, Eye, Radio, Navigation, Map, Cpu, Users, ShieldCheck,
  ArrowRight, Fish, AlertTriangle, Globe, Zap, Scale, Search
} from 'lucide-react';

const OceanGlobe = dynamic(() => import('./components/OceanGlobe'), { ssr: false });

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' as const } }
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  );
}

const AGENTS = [
  {
    icon: <Search className="w-6 h-6" />,
    name: 'Evidence Narrator',
    role: 'Intelligence Analyst',
    color: '#6366f1',
    desc: 'Synthesizes SAR confidence, AIS data, and MPA proximity into a plain-language intelligence summary for human analysts.',
  },
  {
    icon: <Waves className="w-6 h-6" />,
    name: 'Ask OceanGuard',
    role: 'Ocean Intelligence',
    color: '#00d4c8',
    desc: 'Answer questions about any detection. Grounded strictly in the evidence card — never speculates beyond the data.',
  },
  {
    icon: <Radio className="w-6 h-6" />,
    name: 'Daily Briefing',
    role: 'Operations Officer',
    color: '#f59e0b',
    desc: 'Generates structured situation reports across all detections, surfacing patterns across the monitoring region.',
  },
  {
    icon: <Navigation className="w-6 h-6" />,
    name: 'Patrol Recommender',
    role: 'Mission Planner',
    color: '#ef4444',
    desc: 'Ranks vessels by risk score and recommends patrol priorities. Decisions remain with human conservation officers.',
  },
];

const PIPELINE = [
  { icon: <Radio className="w-5 h-5" />, label: 'SAR Detection', sub: 'xView3 / SARFish', color: '#6366f1' },
  { icon: <Globe className="w-5 h-5" />, label: 'Georeference', sub: 'Lat / Lon mapping', color: '#818cf8' },
  { icon: <Navigation className="w-5 h-5" />, label: 'AIS Match', sub: 'Global Fishing Watch', color: '#00d4c8' },
  { icon: <Map className="w-5 h-5" />, label: 'MPA Overlay', sub: 'Protected Planet', color: '#10b981' },
  { icon: <Zap className="w-5 h-5" />, label: 'Risk Score', sub: 'Rules-based engine', color: '#f59e0b' },
  { icon: <Cpu className="w-5 h-5" />, label: 'Evidence Card', sub: 'Auditable record', color: '#f97316' },
  { icon: <Users className="w-5 h-5" />, label: 'Human Review', sub: 'Decision by officer', color: '#ef4444' },
];

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen overflow-x-hidden">

      {/* Responsible AI Banner */}
      <div className="bg-[#000f1a] border-b border-teal/10 px-6 py-2 flex items-center justify-center gap-2 text-[11px] text-ocean-muted">
        <ShieldCheck className="w-3.5 h-3.5 text-teal shrink-0" />
        <span>Responsible AI Notice: OceanGuard flags <em>possible</em> dark-fishing risk for human review. It does not prove illegal fishing or automate enforcement.</span>
      </div>

      {/* ═══════════ HERO ═══════════ */}
      <section className="hero-bg relative min-h-screen flex items-center overflow-hidden">
        <div className="depth-grid absolute inset-0 opacity-60" />

        {/* Globe right side */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-70 pointer-events-none hidden lg:block"
          style={{ right: '4%' }}>
          <OceanGlobe size={540} />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-32 w-full">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl">
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-8">
              <Waves className="w-5 h-5 text-teal" />
              <span className="text-xs font-mono text-teal tracking-[0.25em] uppercase">OceanGuard AI</span>
              <span className="w-px h-4 bg-teal/30" />
              <span className="text-xs font-mono text-ocean-muted tracking-[0.15em] uppercase">SDG 14 Conservation Intelligence</span>
            </motion.div>

            <motion.h1 variants={fadeUp}
              className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight text-gradient-ocean mb-6">
              Making invisible ocean activity visible.
            </motion.h1>

            <motion.p variants={fadeUp}
              className="text-lg text-ocean-muted leading-relaxed mb-10 max-w-lg">
              Combining SAR satellite imagery, AIS vessel intelligence, and Marine Protected Area boundaries into one auditable evidence pipeline.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link href="/dashboard"
                className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-teal text-abyss font-bold text-sm tracking-wide hover:bg-teal-dim transition-all glow-teal">
                Enter Mission Control
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/demo-checklist"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl glass text-ocean-text font-medium text-sm border border-teal/20 hover:border-teal/40 transition-all">
                System Status
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Horizon line */}
        <div className="horizon absolute bottom-0 left-0 right-0" />
      </section>

      {/* ═══════════ SECTION 1: THE OCEAN ═══════════ */}
      <Section className="py-32 px-8 bg-deep relative">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="text-xs font-mono text-teal tracking-[0.25em] uppercase mb-4">01 — The Ocean</p>
            <h2 className="text-4xl md:text-6xl font-black text-gradient-ocean leading-tight">
              71% of Earth's surface.<br />
              <span className="text-ocean-muted font-light">Mostly unmonitored.</span>
            </h2>
          </motion.div>
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-px bg-teal/5 rounded-2xl overflow-hidden border border-teal/10">
            {[
              { value: '3.5B', label: 'People depend on the ocean for food', icon: <Fish className="w-6 h-6" /> },
              { value: '26M', label: 'Tonnes of illegal fishing per year', icon: <AlertTriangle className="w-6 h-6" /> },
              { value: '18,000+', label: 'Marine Protected Areas worldwide', icon: <Map className="w-6 h-6" /> },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-deep p-10 flex flex-col items-start gap-3 hover:bg-surface transition-colors">
                <div className="text-teal">{stat.icon}</div>
                <div className="text-5xl font-black text-white">{stat.value}</div>
                <div className="text-ocean-muted text-sm leading-relaxed">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ═══════════ SECTION 2: THE PROBLEM ═══════════ */}
      <Section className="py-32 px-8 ocean-bg relative">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-20">
            <p className="text-xs font-mono text-teal tracking-[0.25em] uppercase mb-4">02 — The Problem</p>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight max-w-3xl mx-auto">
              Vessels that don't want to be seen.
            </h2>
            <p className="text-ocean-muted mt-6 text-lg max-w-xl mx-auto leading-relaxed">
              AIS transponders can be switched off. Cloud cover hides optical satellites. The ocean has blind spots.
            </p>
          </motion.div>

          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'AIS Dark Vessels',
                desc: 'Vessels deliberately disable their transponders to avoid detection near protected areas and during suspicious activity.',
                color: 'text-crimson',
                border: 'border-crimson/20',
              },
              {
                title: 'Cloud Cover',
                desc: 'Optical satellites cannot see through clouds. SAR (Synthetic Aperture Radar) can detect vessels in any weather, any time.',
                color: 'text-amber',
                border: 'border-amber/20',
              },
              {
                title: 'Scale of the Ocean',
                desc: 'Billions of square kilometers. Thousands of vessels. Human analysts cannot monitor everything simultaneously.',
                color: 'text-indigo',
                border: 'border-indigo/20',
              },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className={`glass rounded-2xl p-8 border ${item.border}`}>
                <div className={`text-4xl font-black mb-4 ${item.color}`}>{String(i + 1).padStart(2, '0')}</div>
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-ocean-muted text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ═══════════ SECTION 3: PIPELINE ═══════════ */}
      <Section className="py-32 px-8 bg-deep">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-20">
            <p className="text-xs font-mono text-teal tracking-[0.25em] uppercase mb-4">03 — The Detection Pipeline</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              From satellite to evidence card.
            </h2>
            <p className="text-ocean-muted mt-4 text-base max-w-lg mx-auto">Every step is source-backed, auditable, and human-reviewed.</p>
          </motion.div>

          <motion.div variants={stagger} className="relative">
            {/* Connector line */}
            <div className="absolute top-10 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal/20 to-transparent hidden md:block" />
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
              {PIPELINE.map((step, i) => (
                <motion.div key={i} variants={fadeUp} className="flex flex-col items-center text-center gap-3 relative">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center glass-strong relative z-10 mb-2"
                    style={{ border: `1px solid ${step.color}30`, color: step.color }}>
                    {step.icon}
                  </div>
                  <div className="text-xs font-bold text-white">{step.label}</div>
                  <div className="text-[10px] text-ocean-muted font-mono">{step.sub}</div>
                  {i < PIPELINE.length - 1 && (
                    <div className="absolute top-5 -right-2 text-teal/30 hidden md:block text-xs">→</div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════ SECTION 4: AI AGENTS ═══════════ */}
      <Section className="py-32 px-8 ocean-bg">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-20">
            <p className="text-xs font-mono text-teal tracking-[0.25em] uppercase mb-4">04 — AI Agents</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Your intelligence crew.
            </h2>
            <p className="text-ocean-muted mt-4 max-w-lg mx-auto leading-relaxed">
              Four specialized agents. Each grounded in the evidence card. None makes decisions for humans.
            </p>
          </motion.div>

          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {AGENTS.map((agent, i) => (
              <motion.div key={i} variants={fadeUp}
                className="glass rounded-2xl p-8 hover:scale-[1.01] transition-transform duration-500 group"
                style={{ borderColor: agent.color + '20' }}>
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: agent.color + '15', color: agent.color, border: `1px solid ${agent.color}30` }}>
                    {agent.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: agent.color }}>{agent.role}</div>
                    <h3 className="text-lg font-bold text-white mb-2">{agent.name}</h3>
                    <p className="text-ocean-muted text-sm leading-relaxed">{agent.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ═══════════ SECTION 5: RESPONSIBLE AI ═══════════ */}
      <Section className="py-32 px-8 bg-deep">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeUp}>
            <ShieldCheck className="w-10 h-10 text-teal mx-auto mb-8 opacity-70" />
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Built for accountability,<br />
              <span className="text-ocean-muted font-light">not automation.</span>
            </h2>
            <p className="text-ocean-muted text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
              Every flag is a question for a human — not a verdict. OceanGuard surfaces evidence. Conservation officers make decisions. Always.
            </p>
          </motion.div>

          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: <Eye className="w-5 h-5" />, label: 'Full Transparency', desc: 'Every data source is labeled: Live API or Cached Historical.' },
              { icon: <Scale className="w-5 h-5" />, label: 'Human-in-the-Loop', desc: 'No enforcement action is ever automated. Human review is mandatory.' },
              { icon: <ShieldCheck className="w-5 h-5" />, label: 'Responsible Language', desc: '"Possible dark-fishing risk" — never "illegal fishing detected."' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="glass rounded-xl p-6 text-left border border-teal/10">
                <div className="text-teal mb-3">{item.icon}</div>
                <div className="text-sm font-bold text-white mb-1">{item.label}</div>
                <div className="text-ocean-muted text-xs leading-relaxed">{item.desc}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp}>
            <Link href="/dashboard"
              className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-teal text-abyss font-bold text-base tracking-wide hover:bg-teal-dim transition-all glow-teal">
              Enter Mission Control
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-ocean-subtle/50 py-10 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Waves className="w-5 h-5 text-teal" />
            <span className="font-bold text-white text-sm">OceanGuard AI</span>
            <span className="text-ocean-muted text-xs">SDG 14 Conservation Intelligence</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] text-ocean-muted">
            <span>xView3-SAR</span>
            <span className="w-px h-3 bg-ocean-subtle" />
            <span>Global Fishing Watch</span>
            <span className="w-px h-3 bg-ocean-subtle" />
            <span>Protected Planet / WDPA</span>
            <span className="w-px h-3 bg-ocean-subtle" />
            <span>OpenStreetMap</span>
          </div>
        </div>
      </footer>

    </main>
  );
}
