import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Flame, Target, BookOpen, FlaskConical, CreditCard, Calculator, BookMarked, TrendingUp, ChevronRight, Clock, Zap } from 'lucide-react';
import { useProgressStore, useFlashcardStore } from '../store';
import { PageWrapper } from '../components/AppShell';

function GoalRing({ label, done, target, color }) {
  const pct = Math.min(done / target, 1);
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-18 h-18">
        <svg width="72" height="72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
          <motion.circle
            cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round" strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold" style={{ color }}>{Math.round(pct * 100)}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{done}/{target}</p>
      </div>
    </div>
  );
}

const quickCards = [
  { to: '/topics', icon: BookOpen, label: 'Topics', desc: 'Structured curriculum', color: '#3b82f6', glow: 'rgba(59,130,246,0.2)' },
  { to: '/formulas', icon: FlaskConical, label: 'Formulas', desc: 'LaTeX formula sheet', color: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
  { to: '/flashcards', icon: CreditCard, label: 'Flashcards', desc: 'Spaced repetition', color: '#8b5cf6', glow: 'rgba(139,92,246,0.2)' },
  { to: '/problems', icon: Calculator, label: 'Problems', desc: 'Practice bank', color: '#f43f5e', glow: 'rgba(244,63,94,0.2)' },
  { to: '/resources', icon: BookMarked, label: 'Resources', desc: 'Books & courses', color: '#10b981', glow: 'rgba(16,185,129,0.2)' },
  { to: '/progress', icon: TrendingUp, label: 'Progress', desc: 'Your analytics', color: '#14b8a6', glow: 'rgba(20,184,166,0.2)' },
];

const todayTopics = [
  { title: "Itô's Lemma — key derivation", time: '15 min', tag: 'Stochastic Calculus' },
  { title: 'Black-Scholes Greeks review', time: '10 min', tag: 'Options Pricing' },
  { title: 'GARCH(1,1) parameter estimation', time: '20 min', tag: 'Econometrics' },
];

export default function Dashboard() {
  const { streak, dailyGoals, weeklyStats } = useProgressStore();
  const { getTotalDueCount } = useFlashcardStore();
  const dueCards = getTotalDueCount();

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
              Good {getGreeting()}, <span className="gradient-text">Quant</span> 👋
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {dueCards > 0 && (
            <Link to="/flashcards" className="btn-primary flex items-center gap-2">
              <Zap size={16} />
              {dueCards} Due
            </Link>
          )}
        </div>

        {/* Streak + Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Streak Card */}
          <motion.div className="card p-5 card-glow-gold"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                🔥
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Current Streak</p>
                <p className="text-4xl font-black gradient-text">{streak}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>days in a row</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>This Week</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{weeklyStats.cardsReviewed} cards</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{weeklyStats.problemsSolved} problems</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{weeklyStats.studyMinutes} min</p>
              </div>
            </div>
          </motion.div>

          {/* Daily Goals */}
          <motion.div className="card p-5"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <p className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Target size={16} style={{ color: 'var(--accent-gold)' }} />
              Today's Goals
            </p>
            <div className="flex justify-around">
              <GoalRing label="Flashcards" done={dailyGoals.flashcards.done} target={dailyGoals.flashcards.target} color="#f59e0b" />
              <GoalRing label="Problems" done={dailyGoals.problems.done} target={dailyGoals.problems.target} color="#8b5cf6" />
              <GoalRing label="Reading (min)" done={dailyGoals.reading.done} target={dailyGoals.reading.target} color="#3b82f6" />
            </div>
          </motion.div>
        </div>

        {/* Quick Access */}
        <div>
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickCards.map(({ to, icon: Icon, label, desc, color, glow }, i) => (
              <motion.div key={to}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                <Link to={to} className="card p-4 block group cursor-pointer"
                  style={{ '--glow': glow }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 24px ${glow}`}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                      <Icon size={20} style={{ color }} />
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} className="group-hover:translate-x-1 transition-transform mt-1" />
                  </div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Today's Study Plan */}
        <motion.div className="card p-5"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Clock size={16} style={{ color: 'var(--accent-gold)' }} />
            Suggested for Today
          </h2>
          <div className="space-y-2">
            {todayTopics.map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer"
                style={{ background: 'var(--bg-secondary)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                  style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--accent-gold)' }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{t.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.tag}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--accent-gold)' }}>
                  {t.time}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
