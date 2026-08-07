import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, CheckCircle2, BookOpen, Lightbulb } from 'lucide-react';
import { problems } from '../data/problems';
import { useProblemStore } from '../store';
import { PageWrapper } from '../components/AppShell';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const TOPICS = ['All', ...new Set(problems.map(p => p.topic))];

const diffColors = {
  Easy: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  Medium: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  Hard: { bg: 'rgba(244,63,94,0.15)', color: '#f43f5e' },
};

function ProblemCard({ problem }) {
  const [expanded, setExpanded] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const { markSolved, markAttempted, isSolved, isAttempted } = useProblemStore();
  const solved = isSolved(problem.id);
  const attempted = isAttempted(problem.id);
  const { bg, color } = diffColors[problem.difficulty] || {};

  return (
    <motion.div layout className="card overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge text-xs px-2 py-0.5" style={{ background: bg, color }}>{problem.difficulty}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
              {problem.topic}
            </span>
            {solved && <span className="badge text-xs px-2 py-0.5" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>✓ Solved</span>}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {!solved && (
              <button onClick={() => { markAttempted(problem.id); }}
                className="text-xs px-2 py-1 rounded-lg transition-colors"
                style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--accent-gold)', border: '1px solid rgba(245,158,11,0.2)' }}>
                Attempt
              </button>
            )}
            <button onClick={() => markSolved(problem.id)}
              className="text-xs px-2 py-1 rounded-lg transition-colors"
              style={{ background: solved ? 'rgba(16,185,129,0.15)' : 'var(--bg-secondary)', color: solved ? '#10b981' : 'var(--text-muted)', border: '1px solid var(--border)' }}>
              {solved ? '✓ Done' : 'Mark Solved'}
            </button>
          </div>
        </div>

        <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{problem.title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{problem.problem}</p>

        <div className="flex gap-2 mt-3 flex-wrap">
          {problem.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>#{tag}</span>
          ))}
        </div>
      </div>

      {/* Expandable hints + solution */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <button onClick={() => setShowHints(!showHints)}
          className="w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors"
          style={{ color: 'var(--accent-gold)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = ''}>
          <Lightbulb size={15} />
          {showHints ? 'Hide Hints' : `Show Hints (${problem.hints.length})`}
          {showHints ? <ChevronUp size={14} className="ml-auto" /> : <ChevronDown size={14} className="ml-auto" />}
        </button>

        <AnimatePresence>
          {showHints && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}>
              <div className="px-4 pb-3 space-y-2" style={{ background: 'rgba(245,158,11,0.04)' }}>
                {problem.hints.map((h, i) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <span className="font-bold mt-0.5" style={{ color: 'var(--accent-gold)', flexShrink: 0 }}>Hint {i + 1}:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{h}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={() => setShowSolution(!showSolution)}
          className="w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors"
          style={{ borderTop: '1px solid var(--border)', color: '#3b82f6' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = ''}>
          <BookOpen size={15} />
          {showSolution ? 'Hide Solution' : 'Show Full Solution'}
          {showSolution ? <ChevronUp size={14} className="ml-auto" /> : <ChevronDown size={14} className="ml-auto" />}
        </button>

        <AnimatePresence>
          {showSolution && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}>
              <div className="px-4 pb-4" style={{ background: 'rgba(59,130,246,0.04)', borderTop: '1px solid var(--border)' }}>
                <pre className="text-sm leading-relaxed whitespace-pre-wrap mt-3 font-sans" style={{ color: 'var(--text-secondary)' }}>
                  {problem.solution}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function ProblemBank() {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [topic, setTopic] = useState('All');
  const { solved } = useProblemStore();

  const filtered = problems.filter(p => {
    const q = search.toLowerCase();
    return (
      (!q || p.title.toLowerCase().includes(q) || p.topic.toLowerCase().includes(q)) &&
      (difficulty === 'All' || p.difficulty === difficulty) &&
      (topic === 'All' || p.topic === topic)
    );
  });

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Problem Bank</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {solved.length}/{problems.length} solved · Expandable hints and step-by-step solutions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full bg-green-500" style={{ width: `${(solved.length / problems.length) * 100}%` }} />
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{Math.round((solved.length / problems.length) * 100)}%</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input className="input-field pl-9" placeholder="Search problems..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-field sm:w-36" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="input-field sm:w-48" value={topic} onChange={e => setTopic(e.target.value)}>
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Difficulty Pills */}
        <div className="flex gap-2 flex-wrap">
          {DIFFICULTIES.map(d => {
            const c = d === 'All' ? { bg: 'rgba(245,158,11,0.2)', color: 'var(--accent-gold)' } : diffColors[d] || {};
            const active = difficulty === d;
            return (
              <button key={d} onClick={() => setDifficulty(d)}
                className="badge px-3 py-1.5 cursor-pointer text-xs transition-all"
                style={{ background: active ? c.bg : 'var(--bg-card)', color: active ? c.color : 'var(--text-muted)', border: `1px solid ${active ? (c.color || 'var(--accent-gold)') + '40' : 'var(--border)'}` }}>
                {d}
              </button>
            );
          })}
        </div>

        {/* Problem List */}
        <div className="space-y-4">
          {filtered.map(p => <ProblemCard key={p.id} problem={p} />)}
          {filtered.length === 0 && (
            <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>No problems match your filters.</div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
