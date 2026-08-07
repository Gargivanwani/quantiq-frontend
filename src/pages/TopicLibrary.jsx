import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Clock, BookOpen } from 'lucide-react';
import { curriculum } from '../data/curriculum';
import { useProgressStore } from '../store';
import { PageWrapper } from '../components/AppShell';

function TopicCard({ topic, pathColor, pathId }) {
  const [open, setOpen] = useState(false);
  const { completeSubtopic, getTopicCompletion, topicProgress } = useProgressStore();
  const completed = (topicProgress[topic.id]?.completed || []);
  const pct = getTopicCompletion(topic.id, topic.subtopics.length);

  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full text-left p-4 flex items-center gap-3 hover:bg-opacity-80 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{topic.title}</h3>
            {pct === 100 && <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>✓ Complete</span>}
          </div>
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{topic.description}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: pathColor }} />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Clock size={11} />{topic.estimatedHours}h
            </span>
          </div>
        </div>
        <div className="ml-2" style={{ color: 'var(--text-muted)' }}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}>
            <div className="px-4 pb-4 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-xs pt-3 mb-3 font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Subtopics</p>
              {topic.subtopics.map(sub => {
                const done = completed.includes(sub);
                return (
                  <button key={sub} onClick={() => completeSubtopic(topic.id, sub)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors group"
                    style={{ background: done ? `${pathColor}15` : 'var(--bg-secondary)' }}
                    onMouseEnter={e => !done && (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                    onMouseLeave={e => !done && (e.currentTarget.style.background = 'var(--bg-secondary)')}>
                    {done
                      ? <CheckCircle2 size={16} style={{ color: pathColor, flexShrink: 0 }} />
                      : <Circle size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                    <span className="text-sm" style={{ color: done ? pathColor : 'var(--text-secondary)', textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.8 : 1 }}>
                      {sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TopicLibrary() {
  const [activePath, setActivePath] = useState(null);
  const displayed = activePath ? curriculum.filter(p => p.id === activePath) : curriculum;

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Topic Library</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Structured curriculum across 6 learning paths. Click subtopics to mark them complete.
          </p>
        </div>

        {/* Path Filter */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setActivePath(null)}
            className={`badge px-3 py-1.5 cursor-pointer transition-all ${!activePath ? 'ring-1 ring-offset-1' : ''}`}
            style={{ background: !activePath ? 'rgba(245,158,11,0.2)' : 'var(--bg-card)', color: !activePath ? 'var(--accent-gold)' : 'var(--text-muted)', border: '1px solid var(--border)' }}>
            All Paths
          </button>
          {curriculum.map(path => (
            <button key={path.id} onClick={() => setActivePath(path.id === activePath ? null : path.id)}
              className="badge px-3 py-1.5 cursor-pointer transition-all"
              style={{
                background: activePath === path.id ? `${path.color}20` : 'var(--bg-card)',
                color: activePath === path.id ? path.color : 'var(--text-muted)',
                border: `1px solid ${activePath === path.id ? path.color + '40' : 'var(--border)'}`,
              }}>
              {path.icon} {path.title}
            </button>
          ))}
        </div>

        {/* Learning Paths */}
        {displayed.map((path, pi) => (
          <motion.div key={path.id}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.08 }}>
            {/* Path Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: `${path.color}20`, border: `1px solid ${path.color}40` }}>
                {path.icon}
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{path.title}</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{path.description}</p>
              </div>
              <span className="ml-auto badge" style={{ background: `${path.color}20`, color: path.color }}>
                {path.topics.length} topics
              </span>
            </div>
            {/* Topics */}
            <div className="space-y-2 ml-2 pl-4" style={{ borderLeft: `2px solid ${path.color}40` }}>
              {path.topics.map(topic => (
                <TopicCard key={topic.id} topic={topic} pathColor={path.color} pathId={path.id} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  );
}
