import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { curriculum } from '../data/curriculum';
import { useProgressStore, useFlashcardStore, useProblemStore } from '../store';
import { PageWrapper } from '../components/AppShell';

// GitHub-style heatmap
function ActivityHeatmap({ data }) {
  const weeks = useMemo(() => {
    const today = new Date();
    const days = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days.push({ date: key, count: data[key] || 0, day: d.getDay() });
    }
    // Group into weeks
    const weeks = [];
    let week = [];
    // Pad first week
    const firstDay = days[0].day;
    for (let i = 0; i < firstDay; i++) week.push(null);
    for (const day of days) {
      week.push(day);
      if (week.length === 7) { weeks.push(week); week = []; }
    }
    if (week.length > 0) weeks.push(week);
    return weeks;
  }, [data]);

  const getColor = (count) => {
    if (!count) return 'rgba(255,255,255,0.05)';
    if (count < 2) return 'rgba(245,158,11,0.25)';
    if (count < 4) return 'rgba(245,158,11,0.5)';
    if (count < 6) return 'rgba(245,158,11,0.75)';
    return '#f59e0b';
  };

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-1" style={{ minWidth: 700 }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              day === null
                ? <div key={di} className="heatmap-cell" style={{ background: 'transparent' }} />
                : (
                  <div key={di} className="heatmap-cell group relative"
                    style={{ background: getColor(day.count) }}
                    title={`${day.date}: ${day.count} sessions`}>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                      {day.date}: {day.count} sessions
                    </div>
                  </div>
                )
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Less</span>
        {[0, 1, 3, 5, 7].map(c => (
          <div key={c} className="heatmap-cell" style={{ background: getColor(c), transform: 'none' }} />
        ))}
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>More</span>
      </div>
    </div>
  );
}

export default function ProgressTracker() {
  const { streak, heatmapData, topicProgress, weeklyStats, dailyGoals } = useProgressStore();
  const { reviewedToday } = useFlashcardStore();
  const { solved } = useProblemStore();

  // Build radar chart data
  const radarData = curriculum.map(path => {
    const totalSubs = path.topics.reduce((s, t) => s + t.subtopics.length, 0);
    const doneSubs = path.topics.reduce((s, t) => {
      const prog = topicProgress[t.id];
      return s + (prog?.completed?.length || 0);
    }, 0);
    return { subject: path.title.split(' ')[0], value: totalSubs > 0 ? Math.round((doneSubs / totalSubs) * 100) : 0 };
  });

  // Overall completion
  const totalSubs = curriculum.flatMap(p => p.topics).reduce((s, t) => s + t.subtopics.length, 0);
  const doneSubs = Object.values(topicProgress).reduce((s, v) => s + (v?.completed?.length || 0), 0);
  const overallPct = totalSubs > 0 ? Math.round((doneSubs / totalSubs) * 100) : 0;

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Progress Tracker</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your study activity and topic completion</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Day Streak', value: streak, emoji: '🔥', color: '#f59e0b' },
            { label: 'Cards Reviewed', value: weeklyStats.cardsReviewed, emoji: '🃏', color: '#8b5cf6' },
            { label: 'Problems Solved', value: solved.length, emoji: '✅', color: '#10b981' },
            { label: 'Study Minutes', value: weeklyStats.studyMinutes, emoji: '⏱️', color: '#3b82f6' },
          ].map((stat, i) => (
            <motion.div key={stat.label} className="card p-4 text-center"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div className="text-2xl mb-1">{stat.emoji}</div>
              <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Activity Heatmap */}
        <motion.div className="card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Study Activity — Last 365 Days</h2>
          <ActivityHeatmap data={heatmapData} />
        </motion.div>

        {/* Overall + Radar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Overall Progress */}
          <motion.div className="card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Overall Completion</h2>
              <span className="text-2xl font-black gradient-text">{overallPct}%</span>
            </div>
            <div className="h-2 rounded-full mb-5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #f59e0b, #fcd34d)' }}
                initial={{ width: 0 }} animate={{ width: `${overallPct}%` }} transition={{ duration: 1.2, ease: 'easeOut' }} />
            </div>
            <div className="space-y-3">
              {curriculum.map(path => {
                const totalS = path.topics.reduce((s, t) => s + t.subtopics.length, 0);
                const doneS = path.topics.reduce((s, t) => s + (topicProgress[t.id]?.completed?.length || 0), 0);
                const pct = totalS > 0 ? Math.round((doneS / totalS) * 100) : 0;
                return (
                  <div key={path.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>{path.icon} {path.title}</span>
                      <span style={{ color: path.color }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <motion.div className="h-full rounded-full"
                        style={{ background: path.color }}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.1 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Radar Chart */}
          <motion.div className="card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Knowledge Radar</h2>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Subtopic completion by learning path</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Radar name="Progress" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                  itemStyle={{ color: '#f59e0b' }}
                  formatter={(v) => [`${v}%`, 'Completion']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Weekly Summary */}
        <motion.div className="card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h2 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Weekly Summary</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-black" style={{ color: '#8b5cf6' }}>{weeklyStats.cardsReviewed}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Flashcards reviewed</p>
            </div>
            <div>
              <p className="text-2xl font-black" style={{ color: '#10b981' }}>{weeklyStats.problemsSolved}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Problems solved</p>
            </div>
            <div>
              <p className="text-2xl font-black" style={{ color: '#3b82f6' }}>{Math.round(weeklyStats.studyMinutes / 60 * 10) / 10}h</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Study time</p>
            </div>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
