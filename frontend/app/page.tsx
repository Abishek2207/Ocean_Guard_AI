'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Activity, Map, Cpu, Database, Eye, BarChart3, Anchor, Radar, Radio, MapPin, Scale, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const fadeUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const stagger: any = {
    visible: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* Subtle animated background grid */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#082f491a_1px,transparent_1px),linear-gradient(to_bottom,#082f491a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-cyan-900/10 via-slate-950 to-slate-950"></div>

      <div className="relative z-10 flex flex-col items-center">
        
        {/* HERO SECTION */}
        <section className="w-full max-w-6xl px-6 pt-32 pb-24 flex flex-col items-center text-center relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-800/50 text-xs font-semibold text-cyan-400 mb-8 backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Human Review Required • No Automated Enforcement • Possible Risk Only</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
              Ocean<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Guard AI</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-6 leading-relaxed">
              Satellite deep learning for detecting possible dark-fishing risk near protected oceans.
            </p>
            
            <p className="text-base text-slate-500 max-w-4xl mx-auto mb-10">
              OceanGuard AI combines SAR vessel detection, AIS/fishing activity intelligence, protected-area boundaries, explainable risk scoring, and human-in-the-loop AI agents to help conservation teams prioritize suspicious maritime activity.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-slate-950 bg-cyan-400 rounded-full overflow-hidden transition-all hover:bg-cyan-300 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(34,211,238,0.5)]">
                Launch Mission Dashboard
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-white bg-slate-900/50 border border-slate-700/50 rounded-full transition-all hover:bg-slate-800 backdrop-blur-sm">
                View How It Works
              </a>
            </div>
          </motion.div>
        </section>

        {/* PROBLEM SECTION */}
        <section className="w-full max-w-6xl px-6 py-24 border-t border-slate-800/50">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeUp}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">The Blind Spot in <span className="text-cyan-400">Ocean Conservation</span></h2>
              <div className="space-y-6 text-slate-400 text-lg">
                <p>
                  <strong className="text-slate-200">IUU fishing</strong> threatens marine biodiversity and local economies globally. Yet, monitoring vast oceans is near impossible.
                </p>
                <p>
                  Vessels frequently disable their <strong className="text-slate-200">AIS (Automatic Identification System)</strong> transponders to operate invisibly. These "dark vessels" exploit gaps in traditional surveillance.
                </p>
                <p>
                  <strong className="text-slate-200">Marine Protected Areas (MPAs)</strong> are particularly vulnerable, often lacking the resources to monitor their boundaries manually.
                </p>
                <p className="text-cyan-400/80 font-medium">
                  SAR (Synthetic Aperture Radar) can detect vessels day or night and through clouds—revealing what AIS misses.
                </p>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="relative">
              <div className="aspect-square md:aspect-[4/3] rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 flex items-center justify-center relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <div className="relative z-10 flex flex-col gap-4 w-full">
                  <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 p-4 rounded-xl flex items-center gap-4">
                    <Activity className="w-8 h-8 text-red-400" />
                    <div>
                      <div className="text-sm text-slate-400">AIS Signal</div>
                      <div className="font-bold text-white text-lg">Lost / Disabled</div>
                    </div>
                  </div>
                  <div className="bg-slate-900/80 backdrop-blur border border-cyan-500/30 p-4 rounded-xl flex items-center gap-4 transform translate-x-8">
                    <Radar className="w-8 h-8 text-cyan-400" />
                    <div>
                      <div className="text-sm text-cyan-400">SAR Detection</div>
                      <div className="font-bold text-white text-lg">Vessel Identified</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* SOLUTION PIPELINE SECTION */}
        <section id="how-it-works" className="w-full max-w-6xl px-6 py-24 border-t border-slate-800/50">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The Intelligence Pipeline</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">From raw satellite imagery to actionable human-reviewed intelligence.</p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-800 via-cyan-500/50 to-slate-800 transform -translate-y-1/2 z-0"></div>
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 lg:grid-cols-6 gap-6 relative z-10">
              {[
                { icon: <Eye />, title: "SAR Image", desc: "Sentinel-1 Tile" },
                { icon: <Cpu />, title: "YOLOv8", desc: "Detection" },
                { icon: <Radio />, title: "AIS Match", desc: "GFW Verification" },
                { icon: <MapPin />, title: "MPA Overlay", desc: "WDPA Bounds" },
                { icon: <BarChart3 />, title: "Risk Score", desc: "Compute Risk" },
                { icon: <UserCheck />, title: "Review", desc: "Evidence Card" }
              ].map((step, i) => (
                <motion.div key={i} variants={fadeUp} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center shadow-xl hover:border-cyan-500/30 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-cyan-950/50 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-4">
                    {step.icon}
                  </div>
                  <h3 className="font-bold text-slate-200 mb-1">{step.title}</h3>
                  <p className="text-xs text-slate-500">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* AI AGENTS SECTION */}
        <section className="w-full max-w-6xl px-6 py-24 border-t border-slate-800/50">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Multi-Agent Explanation</h2>
            <p className="text-lg text-slate-400 max-w-2xl">Advanced language models break down complex geospatial evidence into plain English for conservation officers.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Evidence Narrator", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", icon: <Radar />, desc: "Translates YOLOv8 bounding boxes and confidence scores into physical vessel descriptions." },
              { title: "Ask OceanGuard", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", icon: <Radio />, desc: "Cross-references SAR blips with live Global Fishing Watch APIs to flag 'dark' mismatches." },
              { title: "Daily Briefing", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", icon: <MapPin />, desc: "Summarizes proximity alerts based on Protected Planet boundary data." },
              { title: "Patrol Recommender", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", icon: <Scale />, desc: "Synthesizes multi-factor risk scores and suggests prioritization for human patrol dispatch." }
            ].map((agent, i) => (
              <motion.div key={i} variants={fadeUp} className={`p-6 rounded-2xl bg-slate-900/50 backdrop-blur-md border ${agent.border} flex flex-col relative overflow-hidden group hover:bg-slate-900 transition-colors`}>
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110`}></div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${agent.bg} ${agent.color}`}>
                  {agent.icon}
                </div>
                <h3 className={`font-bold mb-2 ${agent.color}`}>{agent.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{agent.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* DATA SOURCES SECTION */}
        <section className="w-full max-w-6xl px-6 py-24 border-t border-slate-800/50">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent"></div>
            <motion.div variants={fadeUp} className="relative z-10">
              <Database className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-8">Real, Source-Backed Data</h2>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {['xView3-SAR / SARFish', 'Global Fishing Watch API', 'Protected Planet / WDPA', 'OpenStreetMap', 'Sentinel-1 (Future)'].map(src => (
                  <span key={src} className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-sm font-medium text-slate-300">
                    {src}
                  </span>
                ))}
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-yellow-950/30 border border-yellow-900/50 text-sm text-yellow-400/90 max-w-2xl mx-auto text-left">
                <Activity className="w-5 h-5 shrink-0" />
                <p>
                  <strong>Transparency Guarantee:</strong> System uses Live APIs when tokens exist. Uses clearly labeled <span className="font-mono text-xs bg-yellow-900/40 px-1 rounded">CACHED_HISTORICAL</span> demo data only when tokens/APIs fail. No fabricated statistics.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* RESPONSIBLE AI & IMPACT */}
        <section className="w-full max-w-6xl px-6 py-24 border-t border-slate-800/50 grid md:grid-cols-2 gap-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-green-400" />
              Responsible AI
            </h3>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 leading-relaxed mb-4">
                OceanGuard AI is a decision-support tool. It <strong className="text-slate-200">does not prove illegal fishing</strong>.
              </p>
              <p className="text-slate-400 leading-relaxed">
                We believe AI should empower human experts, not replace them. The system flags possible dark-fishing risks and surfaces aggregated evidence for trained conservation officers to review before any enforcement action is taken.
              </p>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Anchor className="w-6 h-6 text-cyan-400" />
              Conservation Impact
            </h3>
            <ul className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2"></div>
                <p className="text-slate-400">Directly supports <strong className="text-slate-200">UN SDG 14</strong> (Life Below Water).</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2"></div>
                <p className="text-slate-400">Enables low-resource conservation teams to monitor vast areas efficiently.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2"></div>
                <p className="text-slate-400">Optimizes physical coast guard and ranger patrol deployments.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2"></div>
                <p className="text-slate-400">Brings transparency to historically invisible ocean activities.</p>
              </li>
            </ul>
          </motion.div>
        </section>

        {/* FINAL CTA */}
        <section className="w-full px-6 py-32 bg-slate-900 border-t border-slate-800 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-950/20"></div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
              Making invisible ocean activity visible for conservation review.
            </h2>
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-10 py-5 text-base font-bold text-slate-950 bg-cyan-400 rounded-full transition-all hover:bg-cyan-300 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(34,211,238,0.5)]">
              Open OceanGuard Mission Control
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </section>
        
      </div>
    </main>
  );
}
